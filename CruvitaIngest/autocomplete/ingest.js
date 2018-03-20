var Location = require('../location/schema');
var Autocomplete = require('./schema');
var _ = require('lodash');
var async = require('async');
var fs = require('graceful-fs');
var jf = require('jsonfile');
var rimraf = require('rimraf');
var util = require('../util/util');
var autocompleteFolder = 'tempAutocomplete';
var mkdirp = require('mkdirp');

var cache = [];
var written = 0;
var statesComplete = 0;
var stream;

function sortLocations(nGram) {
	nGram.locations.sort(function(a, b) {
		return b.count - a.count;
	});
	if(nGram.locations.length > 5) {
		nGram.locations.splice(5, nGram.locations.length - 5);
	}
	nGram.locations = nGram.locations.map((l) => l.slug);
}

function checkIfDone() {
	console.log('Autocompletes Processed: ' + written.toString());
	setTimeout(function() {
		checkIfDone(); 
	}, 10000);
}

function recursiveFileReader(nGram, files, object, nGramComplete, root) {
	var directory = autocompleteFolder + '/' + root.folder + '/' + nGram + '/' + files[0];
	var data;
	if(!fs.lstatSync(directory).isDirectory()) {
		try {
			data = jf.readFileSync(directory);
		}
		catch(err) {
			console.log(directory);
			console.log(err);
		}
		if(data) {
			object.locations.push(data);
		}
		files.splice(0,1);
		if(files.length > 0) {
			recursiveFileReader(nGram, files, object, nGramComplete, root);
		}
		else {
			sortLocations(object);
			Autocomplete.update({nGram: object.nGram}, object, {upsert: true}, function(err, created) {
				finishNGram(root, nGramComplete);
			});
		}
	}
	else {
		finishNGram(root, nGramComplete);
	}
}

function finishNGram(root, callback) {
	// rimraf(autocompleteFolder + '/' + root.folder, function() {
		written++;
		callback();
		root.counter++;
		if(root.nGrams.length <= root.counter) {
			root.complete();
		}
	// });
}

exports.ingest = function() {
	checkIfDone();
	var folders = fs.readdirSync(autocompleteFolder);
	Autocomplete.remove({}, function() {
		async.eachLimit(folders, 1, function(folder, complete) {
			var rootFolder = {
				counter: 0,
				folder: folder,
				nGrams: fs.readdirSync(autocompleteFolder + '/' + folder),
				complete: complete
			};
			if(rootFolder.nGrams.length > 0) {
			  async.eachLimit(rootFolder.nGrams, 1, function(nGram, nGramComplete) {
					try {
						if(fs.lstatSync(autocompleteFolder + '/' + folder + '/' + nGram).isDirectory()) {
							var files = fs.readdirSync(autocompleteFolder + '/' + folder + '/' + nGram);
							var object = {
								nGram: nGram,
								locations: []
							};
							if(files.length > 0) {
								recursiveFileReader(nGram, files, object, nGramComplete, rootFolder); 
							}
							else {
								finishNGram(rootFolder, nGramComplete);
							}
						}
						else {
							finishNGram(rootFolder, nGramComplete);
						}
					}
					catch(err) {
						finishNGram(rootFolder, nGramComplete);
					}
				});
			}
			else {
				rootFolder.complete();
			}
		}, function() {
			// rimraf(autocompleteFolder, function() {
				console.log("Autocomplete Finished");
				process.exit();
			// });
		});
	});
}

exports.createNGrams = function(location, callback) {
	var terms = {
		total: location.dispName.length
	};
	var dispName = location.dispName.replace(/[\/]/g," ").toUpperCase().trim();
	var rootFolder = autocompleteFolder + '/' + dispName.substring(0,3);
	mkdirp(rootFolder, function(err) { 
		var indices = [];
		for(var i = 3; i <= location.dispName.length; i++) {
			indices.push(i);
		}
		async.each(indices, function(index, indexCallback) {
			var nGramFolder = util.fileLegible(rootFolder + '/' + dispName.substring(0,index));
			try {
				mkdirp(nGramFolder, function(err) {
					var autocompleteFile = nGramFolder + '/' + util.fileLegible(location.dispName) + '.json';
					if(!fs.existsSync(autocompleteFile)) {
						jf.writeFile(autocompleteFile, location, function() {
							indexCallback();
					  });
					}
					else {
						indexCallback();
					}
				});
			}
			catch(err) {
				indexCallback();
			}
		}, function() {
			if(callback) {
				callback();
			}
		})
	});
}
