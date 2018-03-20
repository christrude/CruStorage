
var _ = require('lodash');
_.mixin(require("lodash-deep"));
var jf = require('jsonfile');
var async = require('async');
var mongoose = require('mongoose');

var MyHome = require('./schema');
var Home = require('../home/schema');
var Location = require('../location/schema');
var Util = require('../util/util');

var inputted = 0;
var completed = 0;
var finished = false;
var maxPriceCushion = 0.7;

function checkIfDone() {
	if(inputted == completed && finished) {
		process.exit();
	}
	else {
		setTimeout(function(){
			checkIfDone();
		}, 5000);
	}
}

var printOnce = false;
function maximumScore(queries) {
	var maximumScore = 0;
	_.each(queries, function(query) {
		maximumScore += query.weight;
	});
	return maximumScore;
}

function checkIfQueryApplies(type, value, home) {
	var applies = false;
	var keyValue = _.get(home, value.key);
	switch(type) {
		case 'equals':
		case 'or':
			if(value.value.toString().toUpperCase() === keyValue.toString().toUpperCase()) {
				applies = true;
			}
			break;
		case 'min':
			if(parseFloat(keyValue) >= parseFloat(value.value)) {
				applies = true;
			}
			break;
		case 'max':
			if(parseFloat(keyValue) <= parseFloat(value.value)) {
				applies = true;
			}
			break;
		case 'rangeMin':
		case 'rangeMax':
		case 'range':
			if(parseFloat(keyValue) <= parseFloat(value.max) && parseFloat(keyValue) >= parseFloat(value.min)) {
				applies = true;
			}
			break;
		default:
			break;
	}
	return applies;
}

function getScale(index, total) {
	return (total-index)/total;
}

function homeScore(queries, home, maxScore) {
	var score = 0;
	_.each(queries, function(query) {
		var found = false;
		_.each(query.values, function(value, index) {
			if(checkIfQueryApplies(query.type, value, home) && !found) {
				score += query.weight * getScale(index, query.values.length)
				found = true;
			}
		});
	});
	return score / maxScore;
}

function appendQuery(homeQuery, must) {
	switch(must.type) {
		case 'or':
			var orArray = [];
      _.each(must.values, function(value) {
        var orFilter = {};
        orFilter[value.key] = value.value;
        orArray.push(orFilter);
      });
      homeQuery.or(orArray);
      break;
		case 'equals':
      _.each(must.values, function(value) {
        homeQuery.where(value.key).equals(value.value);
      });
			break;
		case 'min':
      _.each(must.values, function(value) {
        homeQuery.where(value.key).gte(value.value);
      });
			break;
		case 'max':
      _.each(must.values, function(value) {
        homeQuery.where(value.key).lte(value.value);
      });
			break;
		case 'rangeMin':
		case 'rangeMax':
		case 'range':
      _.each(must.values, function(value) {
        homeQuery.where(value.key.replace('.0','')).lte(value.max);
        homeQuery.where(value.key.replace('.0','')).gte(value.min);
      });
			break;
		default: 
			break;
	}
}

function calculateViewport(customSearch, callback) {
	var locations = _.map(_.filter(customSearch.queries, {label: 'location'})[0].values, 'value');
	Location.find({slug: {'$in': locations}}, function(err, locations) {
		locations.forEach(function(location) {
			customSearch.results.viewport = {
				northeast: {
					latitude: (customSearch.results.viewport && customSearch.results.viewport.northeast.latitude >= location.viewport.northeast.latitude) ? customSearch.results.viewport.northeast.latitude : location.viewport.northeast.latitude,
					longitude: (customSearch.results.viewport && customSearch.results.viewport.northeast.longitude >= location.viewport.northeast.longitude) ? customSearch.results.viewport.northeast.longitude : location.viewport.northeast.longitude
				},
				southwest: {
					latitude: (customSearch.results.viewport && customSearch.results.viewport.southwest.latitude <= location.viewport.southwest.latitude) ? customSearch.results.viewport.southwest.latitude : location.viewport.southwest.latitude,
					longitude: (customSearch.results.viewport && customSearch.results.viewport.southwest.longitude <= location.viewport.southwest.longitude) ? customSearch.results.viewport.southwest.longitude : location.viewport.southwest.longitude
				}
			};
		});
		callback();
	});
}

function rangeScale(score, queries, home, maxScore) {
	var factor = 1;
	queries.forEach(function(query) {
		var value = _.get(home, query.values[0].key);
		switch(query.type) {
			case 'rangeMin':
				value = value || query.values[0].max;
				factor = factor * (1 - (((value - query.values[0].min) / (query.values[0].max - query.values[0].min)) * (query.weight / maxScore)));
				break;
			default:
				break;
		}
	});
	return score * factor;
}

function populateHomes(myhome) {
	var homeQuery = Home.find({}).where('status').ne('inactive');
	var mustQueries = _.filter(myhome.queries, function(query) {
		return query.must;
	});
	_.each(mustQueries, function(must) {
		appendQuery(homeQuery, must);
	});
	var homeStream = homeQuery.stream();
	streamHomes(homeStream, myhome, function() {
		myhome.save(function(err) {
			if(err) {
				console.log(err);
			}
			console.log('Populated Homes');
			process.exit();	
		})
	});
}

function streamHomes(homeStream, customSearch, callback) {
	// checkIfDone();
	mongoose.set('debug', true);
	customSearch.results = {
		homes: []
	};
	var maxScore = maximumScore(customSearch.queries);
	homeStream.on("data", function(home) {
		customSearch.results.homes.push({
			slug: home.slug,
      dateFound: new Date(),
			score: rangeScale(homeScore(customSearch.queries, home, maxScore), customSearch.queries, home, maxScore)
		});
	}).on('error', function (err) {
	  console.log(err);
	}).on('close', function () {
		customSearch.results.homes.sort(function(a, b) {
			return b.score - a.score;
		});
		customSearch.results.homes = customSearch.results.homes.slice(0, 100);
		calculateViewport(customSearch, callback);
	});
}

exports.readOneDocument = function(id) {
	MyHome.findOne({_id: id}, function(err, myhome) {
		if(err || !myhome) {
			console.log(err);
			process.exit();
		}
		else {
			console.log('Scoring homes for ' + id);
			populateHomes(myhome);
		}
	});
}