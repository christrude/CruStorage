var filename = 'autocompleteTime.txt';
var rimraf = require('rimraf');
var fs = require('graceful-fs');
var async = require('async');
var _ = require('lodash');
_.mixin(require("lodash-deep"));
var Home = require('./schema');
var AutocompleteHome = require('./autocomplete');

var ingested = 0;
var completed = 0;
var finished = false;
var stream;

function createNGrams(home, callback) {
	var dispName = home.listing.address.fullstreetaddress + ' ' + home.listing.address.city + ', ' + home.listing.address.stateorprovince + ' ' + home.listing.address.postalcode;
	var nGrams = [];
	for(var i = 3; i <= dispName.length; i++) {
		nGrams.push(dispName.substring(0, i));
	}
	async.each(nGrams, function(nGram, ngramCallback) {
		AutocompleteHome.findOne({nGram: nGram}, function(err, autocomplete) {
			if (autocomplete) {
				if (autocomplete.homes.map((home) => home.slug).indexOf(home.slug) === -1) {
					autocomplete.homes.push({
						dispName,
						slug: home.slug
					});
					autocomplete.save(function() {
						ngramCallback();
					});
				} else {
					ngramCallback();
				}
			} else {
				AutocompleteHome.create({
					nGram: nGram,
					homes: [{
						dispName,
						slug: home.slug
					}]
				}, function() {
					ngramCallback();
				});
			}
		});
	}, function() {
		callback();
	});
}

function checkIfDone(startTime) {
	console.log('Autocompleted ' + completed + ' Homes');
	if(ingested === completed && finished) {
		process.exit();
	}
	else {
		setTimeout(function() {
			checkIfDone(startTime);
		}, 10000);
	}
}

function homeFinished() {
	completed++;
	if(ingested <= (completed + 100)) {
		stream.resume();
	}
}

exports.ingest = function() {
	var startTime = 0;
	fs.readFile(filename, function (err, data) {
		startTime = err ? 0 : parseInt(data.toString());
		fs.writeFileSync(filename, new Date().getTime());
		stream = Home.find({ingestDate:{"$gt": startTime}}).stream();
		checkIfDone(startTime);
		
		stream.on('data', function(home) {
			ingested++;
			if(ingested > (completed + 100)) {
				stream.pause();
			}
			createNGrams(home, homeFinished);
		});
		
		stream.on('end', function() {
			finished = true;
		});
	});
}
