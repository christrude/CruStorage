var async = require('async');
var Util = require('./util/util');

console.log("One time ingest beginning");

async.series([
	function(seriesCallback) {
		async.series([
			function(callback) {
			  Util.launchProcess('location', callback);
			},
			function(callback) {
			  Util.launchProcess('schools', callback);
			}
		],
		function() {
			seriesCallback();
		});
	},
	function(callback) {
	  Util.launchProcess('autocomplete', callback);
	}], 
	function() {
		console.log("One time ingest complete");
		process.exit();
	}
);

/* 
	EXPORT
	1. Remove old collections, old folders (tempAutocomplete, tmp)
  2. NODE_ENV=production node ingest.js
	3. sh exportDB.sh
	4. scp dump.zip and boundaries.zip to production environment

	IMPORT
  1. Remove <collection_name>-old from mongoDB. Open up Mongo Terminal:
		db["autocompletes-old"].remove({}) && db["locations-old"].remove({}) && db["schools-old"].remove({}) && db["autocompletes-old"].drop() && db["locations-old"].drop() && db["schools-old"].drop()
	3. sh importDB.sh
	4. Rename current collections to  <collection_name>-old. Open up Mongo Terminal:
		a. db.autocompletes.renameCollection("autocompletes-old") && db.locations.renameCollection("locations-old") && db.schools.renameCollection("schools-old") && db["autocompletes-new"].renameCollection("autocompletes") && db["locations-new"].renameCollection("locations") && db["locations-new"].renameCollection("locations") && db["schools-new"].renameCollection("schools")

*/
