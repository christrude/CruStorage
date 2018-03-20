var imagesFolder = 'images/';
var filename = 'startTime.txt';
var rimraf = require('rimraf');
var fs = require('graceful-fs');
var async = require('async');
var _ = require('lodash');
_.mixin(require("lodash-deep"));
var Home = require('./schema');

var ingested = 0;
var completed = 0;
var finished = false;
var stream;

function checkIfRemovalDone(startTime) {
	console.log('Removed ' + completed + ' Homes');
	if(ingested === completed && finished) {
		Home.update({ingestDate:{"$lt": startTime}, status:{"$ne":"inactive"}}, {status:'inactive', 'listing.photos': null}, {multi: true}, function() {
			console.log('Home Removal Finished.');
			process.exit();
		});
	}
	else {
		setTimeout(function() {
			checkIfRemovalDone(startTime);
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
	fs.readFile(filename, function (err, data) {
  	if (err) throw err;
		var startTime = parseInt(data.toString()) || 0;
		stream = Home.find({ingestDate:{"$lt": startTime}, status:{"$ne":"inactive"}}).stream();
		checkIfRemovalDone(startTime);
		
		stream.on('data', function(home) {
			ingested++;
			if(ingested > (completed + 100)) {
				stream.pause();
			}
			var homePhotos = _.get(home, 'listing.photos.0.photo');
			if(homePhotos) {
				async.each(homePhotos, function(photo, photoCallback) {
					rimraf(imagesFolder + (photo.mediaurl[0].slice(-4)).toString() + '/' + photo.mediaurl[0].replace(/[<>:"\/\\|?*]+/g, '' ).toString(), function(err) {
						photoCallback();
					});
				}, function() {
					homeFinished();
				});
			}
			else {
				homeFinished();
			}
		});
		
		stream.on('end', function() {
			finished = true;
		});
	});
}
