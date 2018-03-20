var async = require('async');
var _ = require('lodash');
var fs = require('graceful-fs');
var mkdirp = require('mkdirp');
var jf = require('jsonfile');
var readline = require('readline');
var stream = require('stream');
var parser = require('wellknown');
var Location = require('./schema');
var Autocomplete = require('../autocomplete/ingest');
var Util = require('../util/util');
var locked_env = require('../app');

var boundaryFolder = 'boundaries';
var written = 0;
var registered = 0;
var finished = false;

var boundaryFiles = [{
	keyMap: {
		'0': 'components.zip',
		'1': 'components.city',
		'3': 'components.state',
		'6': 'components.county',
		'8': 'centroid.latitude',
		'9': 'centroid.longitude'
	},
	boundaryKey: 18,
	stateKey: 3,
	type: 'zip',
	fileName: './data/boundary/zip_boundaries_wkt.txt'
},{
	keyMap: {
		'1': 'components.state',
		'5': 'components.county'
	},
	boundaryKey: 14,
	stateKey: 1,
	type: 'county',
	fileName: './data/boundary/maponics_counties_us_wkt.txt'
},{
	keyMap: {
		'7': 'components.city',
		'1': 'components.state'
	},
	boundaryKey: 16,
	stateKey: 1,
	type: 'city',
	fileName: './data/boundary/maponics_mcds_us_wkt.txt'
},{
	keyMap: {
		'1': 'components.state',
		'5': 'components.city'
	},
	boundaryKey: 13,
	stateKey: 1,
	type: 'city',
	fileName: './data/boundary/maponics_places_us_wkt.txt'
}];

function checkIfDone() {
	// console.log('Boundaries Processed: ' + written.toString());
	if((written === registered) && finished) {
		console.log("Boundaries Finished");
		process.exit();
	}
	else {
		registered = written;
		console.log(written, 'boundaries have been ingested');
		setTimeout(checkIfDone, 15000);
	}
}

function createNGrams(newBound) {
	Autocomplete.createNGrams({slug: newBound.slug, dispName: newBound.dispName, count: newBound.count}, function() {
		written++;
	});
}

function storeLocation(object) {
	delete object.boundaries;
	Location.findOne({slug: object.slug}, function(err, foundLocation) {
		if(err) {
			written++;
		}
		else if(foundLocation) {
			object._id = foundLocation._id;
			object.count = foundLocation.count || 1;
			Location.update({_id: object._id}, object, {}, function() {
				createNGrams(object);
			});
		}
		else {
			Location.create(object, function(err, newLocation) {
				if(err) {
					console.log(err);
					console.log(object);
				}
				else {
					createNGrams(newLocation);
				}
			});
		}
	});
}

function writeBoundary(object, callback) {
	var directory = boundaryFolder + '/' + Math.floor(Math.random() * 10000);
	var boundaryFile = directory + '/' + object.slug + '.json';
	mkdirp(directory, function() {
		jf.writeFile(boundaryFile, object.boundaries, function() {
			object.boundaryFile = boundaryFile;
			callback();
		});
	});
}
exports.writeBoundary = writeBoundary;

function boundaryParser(line, file) {
	var object = {
		type: file.type
	};
	var output = line.split('|');
	if(output[file.stateKey] === 'TX' || locked_env.app == 'production') {
		_.each(output, function(row, i) {
			if(i === file.boundaryKey) {
				object.boundaries = [];
				var boundaries = parser.parse(row).coordinates;
				_.forEach(boundaries, function(boundary) {
					var boundaryObject = {};
					boundaryObject.boundary = [];
					_.forEach(boundary, function(coord) {
						if(coord[0] instanceof Array) {
							_.forEach(coord, function(multiCoord){
								boundaryObject.boundary.push({latitude: parseFloat(multiCoord[1]), longitude: parseFloat(multiCoord[0])});
							});
						}
						else {
							boundaryObject.boundary.push({latitude: parseFloat(coord[1]), longitude: parseFloat(coord[0])});
						}
					});
					object.boundaries.push(boundaryObject);
				});
			}
			else if(Object.keys(file.keyMap).indexOf(i.toString()) !== -1) {
				_.set(object, file.keyMap[i.toString()], output[i]);
			}
		});
		object.count = 1;
		switch(file.type) {
			case 'zip':
				object.dispName = object.components.zip + ', ' + object.components.state;
				break;
			case 'city':
				object.dispName = object.components.city + ', ' + object.components.state;
				break;
			case 'county':
	  		var label = object.components.county.toLowerCase().indexOf('county') ? 'County' : '';
	  		object.dispName = object.components.county + ' ' + label + ', ' + object.components.state;
				break;
			case 'state':
				object.dispName = Util.stateMap[boundaryObject.components.state];
				break;
		}
		Util.calculateViewport(object);
		object.slug = Util.createSlug(object.type, object.components);
		if(object.boundaries.length > 0) {
			writeBoundary(object, function() {
				storeLocation(object);
			});
		}
		else {
			storeLocation(object);
		}
	}
	else {
		written++;
	}
}

exports.ingest = function() {
	checkIfDone(); 
	console.log("Boundaries Ingest Beginning");
	async.eachLimit(boundaryFiles, 1, function(file, callback) {
		var instream = fs.createReadStream(file.fileName);
		var outstream = new stream();
		var rl = readline.createInterface(instream, outstream);
		var firstLine = true;
		rl.on('line', function(line) {
			if(firstLine) {
				firstLine = false;
			}
			else {
				boundaryParser(line, file);
			}
		});
		rl.on('close', function() {
			finished = true;
			callback();
		})
	}, function() {
		
	})
}