var async = require('async');
var Util = require('../util/util');
var Location = require('./schema');

exports.ingest = function() {
	console.log("Ingesting Locations...");
	async.series([
		function(cleanCallback) {
			Location.remove({}, function() {
				cleanCallback();
			});
		},
		function(callback) {
			Util.launchProcess('boundaryKml', callback);
		}, function(callback) {
			Util.launchProcess('boundary', callback);
		}
	], function() {
		console.log("Location Ingestion Complete");
		process.exit();
	});                                                                                   
}	