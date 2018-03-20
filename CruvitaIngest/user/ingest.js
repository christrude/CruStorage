var finished = false;
var User = require('./schema');
var Home = require('../home/schema');
var _ = require('lodash');
var async = require('async');

var inputted = 0;
var completed = 0;
var levelMap = {
	'1': 1,
	'2': 0.5,
	'3': 0.25,
	'4': 0.1
};

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

function maximumScore(queries) {
	var maximumScore = 0;
	_.each(queries, function(query) {
		var maxLevel = _.max(query.values, 'level').level;
		maximumScore += levelMap[maxLevel.toString()];	
	})
	return maximumScore;
}

function checkIfQueryApplies(query, value, home) {
	var applies = false;
	var keyValue = _.deepGet(home, query.key);
	switch(query.queryType) {
		case 'equals':
			if(value.toString().toUpperCase() === keyValue.toString().toUpperCase()) {
				applies = true;
			}
			break;
		case 'or':
			if(value.toString().toUpperCase() === keyValue.toString().toUpperCase()) {
				applies = true;
			}
			break;
		case 'gt':
			if(parseFloat(keyValue) >= parseFloat(value)) {
				applies = true;
			}
			break;
	}
	return applies;
}

function homeScore(queries, home, maxScore) {
	var score = 0;
	_.each(queries, function(query) {
		var found = false;
		query.values = _.sortByOrder(query.values, ['level'], ['desc']);
		_.each(query.values, function(value) {
			if(checkIfQueryApplies(query, value.value, home) && !found) {
				score += levelMap[value.level.toString()];
				found = true;
			}
		})
	})
	return score / maxScore;
}

function streamHomes(homeStream, customSearch, callback) {
	customSearch.results = [];
	var maxScore = maximumScore(customSearch.queries);
	homeStream.on("data", function(home) {
		customSearch.results.push({
			homeId: home._id,
      dateFound: new Date(),
			score: homeScore(customSearch.queries, home, maxScore)
		});
	}).on('error', function (err) {
	  console.log(err);
	}).on('close', function () {
		customSearch.results.sort(function(a, b) {
			return b.score - a.score;
		});
		customSearch.results = customSearch.results.slice(0,3);
		/* Update User and flow control */
		callback();
	});
}

function appendQuery(homeQuery, must) {
	switch(must.queryType) {
		case 'or':
			var orArray = [];
      _.each(must.values, function(value) {
        var orFilter = {};
        orFilter[must.key] = value.value;
        orArray.push(orFilter);
      });
      homeQuery.or(orArray);
      break;
	}
	
}

exports.ingest = function() {
	checkIfDone();
	var stream = User.find({'customSearches.queries.0':{$exists:true}}).stream();
	stream.on('data', function (doc) {
		inputted++;
		async.each(doc.customSearches, function(customSearch, callback) {
			var homeQuery = Home.find({});
			var mustQueries = _.filter(customSearch.queries, function(query) {
				return query.must;
			});
			_.each(mustQueries, function(must) {
				appendQuery(homeQuery, must);
			});
			var homeStream = homeQuery.stream();
			streamHomes(homeStream, customSearch, callback);
		}, function() {
			doc.save(function() {
				completed++;
			});
		});
	}).on('error', function (err) {
	  console.log(err);
	}).on('close', function () {
		console.log("User Stream Ended");
		finished = true;
	});
}