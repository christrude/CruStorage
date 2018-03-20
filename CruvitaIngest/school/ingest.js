var async = require('async');
var Util = require('../util/util');
var School = require('./schema');

exports.ingest = function() {
	console.log("Ingesting Schools...");
	async.series([
		function(cleanCallback) {
			School.remove({}, function() {
				cleanCallback();
			});
		},
		function(mapCallback) {
			var files = ['coordinates','universal','boundary'];
			async.each(files, function(file, callback) {
				Util.launchProcess('schoolMapper', callback, 'file='+file);
			}, function() {
				mapCallback();
			});
		},
		function(reduceCallback) {
			var folders = [0];
			async.each(folders, function(folder, callback) {
				Util.launchProcess('schoolReducer', callback, 'folder=chunk_'+folder);
			}, function() {
				reduceCallback();
			})
		}], function() {
		console.log("School Ingestion Complete");
		process.exit();
	});                                                                                   
}	