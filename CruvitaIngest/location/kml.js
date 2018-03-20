var fs = require('graceful-fs');
var parseString = require('xml2js').parseString;
var async = require('async');
var _ = require('lodash');
var Location = require('./schema');
var Boundary = require('./boundary');
var Autocomplete = require('../autocomplete/ingest');
var Util = require('../util/util');
var locked_env = require('../app');

var written = 0;
var inserted = 0;
var finished = false;
var currentType = '';
var keyMap = [
	{key: 'name', index: 2},
	{key: 'components.state', index: 5},
	{key: 'centroid.latitude', index: 8},
	{key: 'centroid.longitude', index: 9},
	{key: 'count', index: 27}
];

function checkIfDone(callback) {
	setTimeout(function() {
		// console.log('KML  Boundaries Processed: ' + inserted.toString() + ' : ' + written.toString());
		if((written >= inserted) && finished) {
			console.log("Finished a file");
			written = 0;
			inserted = 0;
			finished = false;
			callback();
		}
		else {
			setTimeout(function() {
				checkIfDone(callback);
			}, 10000);
		}
	}, 10);
}

function createNGrams(newBound) {
	if(newBound) {
		Autocomplete.createNGrams({slug: newBound.slug, dispName: newBound.dispName, count: newBound.count}, function() {
			written++;
		});
	}
	else {
		written++;
	}
}

function storeLocation(boundaryObject) {
	delete boundaryObject.boundaries;
	Location.findOne({slug: boundaryObject.slug}, function(err, foundLocation) {
		if(err) {
			written++;
		}
		else if(foundLocation && currentType === 'state') {
			boundaryObject._id = foundLocation._id;
			Location.update({_id: boundaryObject._id}, boundaryObject, { multi: false }, function() {
				if(boundaryObject.type === 'state') {
					createNGrams(boundaryObject, written);
				}
				else {
					written++;
				}
			});
		}
		else if(foundLocation) {
			foundLocation.count = boundaryObject.count;
			foundLocation.save(function() {
				written++;
			});
		}
		else {
			Location.create(boundaryObject, function(err, newLocation) {
				if(boundaryObject.type === 'state') {
					createNGrams(newLocation, written);
				}
				else {
					written++;
				}
			});
		}
	});
}

exports.ingest = function() {
	if(!fs.existsSync('tempAutocomplete')) {
		fs.mkdirSync('tempAutocomplete');
	}
	var saxStream = require("sax").createStream(false, {lowercasetags:true, trim:true});
	var boundary = '';
	saxStream.on("opentag", function (tag) {
		if (tag.name !== "placemark" && !boundary) {
			return;
		}
		
		var nameAttribute = tag.attributes.name ? ' name=\"' + tag.attributes.name + '\"' : '';
		boundary += '<' + escape(tag.name.replace(/commons:/g,'').replace(/-/g,'')) + nameAttribute + '>';
	})

	saxStream.on("text", function (text) {
		if (!boundary) {
			return;
		}
	  boundary += text.replace(/[\n\r]/g, '\\n').replace(/&/g,"&amp;").replace(/-/g,"&#45;").replace(/</g,'&lt;').replace(/>/g,'&gt;');
	});

	saxStream.on("error", function(err) {
		console.log(err);
	});

	saxStream.on("closetag", function (tagName) {
		if (tagName !== "placemark" && !boundary) {
			return;
		}
	  boundary += '</' + escape(tagName.replace(/commons:/g,'').replace(/-/g,'')) + '>';
		if(tagName === "placemark") {
			if(boundary) {
				parseString(boundary, function (err, result) {
					if(err) {
						console.log(err);
					}
					if(result) {
						inserted++;
						var kmlObject = {};
						_.each(result.placemark.extendeddata[0].schemadata[0].simpledata, function(element) {
							kmlObject[element['$'].name] = element['_'];
						});
						var boundaryObject = {
							components: {
								state: kmlObject.stusps
							},
							type: currentType,
							centroid: {
								latitude: kmlObject.intptlat,
								longitude: kmlObject.intptlon
							},
							boundaries: [],
							count: kmlObject['hu10']
						};
						boundaryObject.components[currentType] = kmlObject.name2;
						switch(currentType) {
					  	case 'city':
					  		boundaryObject.dispName = boundaryObject.components.city + ', ' + boundaryObject.components.state;
					  		break;
					  	case 'county':
					  		var label = kmlObject.typelabel ? kmlObject.typelabel.charAt(0).toUpperCase() + kmlObject.typelabel.slice(1) : '';
					  		boundaryObject.dispName = boundaryObject.components.county + ' ' + label + ', ' + boundaryObject.components.state;
					  		break;
					  	case 'state':
					  		boundaryObject.components.state = kmlObject.stusps;
					  		boundaryObject.dispName = Util.stateMap[boundaryObject.components.state];
					  		break;
				  	}
						if(currentType === 'state') {
					  	var polygons = _.get(result, 'placemark.multigeometry.0.polygon') || _.get(result, 'placemark.polygon');
					  	_.each(polygons, function(polygon) {
					  		var polygonObject = {
					  			boundary: []
					  		};
								var points = _.get(polygon, 'outerboundaryis.0.linearring.0.coordinates.0');
								if(points) {
									points = points.split(' ');
								}
								_.each(points, function(point) {
									var splitPoint = point.split(',');
									polygonObject.boundary.push({latitude:parseFloat(splitPoint[1]), longitude:parseFloat(splitPoint[0])});
								});
								boundaryObject.boundaries.push(polygonObject);
							})
							Util.calculateViewport(boundaryObject);
						}
						boundaryObject.type = currentType;
						boundaryObject.slug = Util.createSlug(boundaryObject.type, boundaryObject.components);
						if((currentType !== 'county' || kmlObject.typelabel !== 'city') && boundaryObject.slug) {
							if(currentType === 'state') {
								Boundary.writeBoundary(boundaryObject, function() {
									storeLocation(boundaryObject);
								});
							}
							else {
								storeLocation(boundaryObject);
							}
						}
						else {
							written++;
						}
					}
				});
			}
			boundary = '';
		}
	});

	saxStream.on("end", function() {
		finished = true;
	});

	function iterateBoundaryFolder(folderName, complete, type) {
		var files = fs.readdirSync(folderName);
		async.eachLimit(files, 1, function(file, callback) {
			if(file.indexOf('boundaries') !== -1 && ((locked_env.app === 'production') || (file.indexOf('TX') !== -1))) {
				console.log(file);
				checkIfDone(callback);
				currentType = type;
				fs.createReadStream(folderName + '/' + file).pipe(saxStream);
			}
			else {
				callback();
			}
		}, function() {
			complete();
		});
	}

	async.series([
		function(complete) {
			iterateBoundaryFolder('./data/boundary/mt_2014a_kml_us_state', complete, 'state');
		},
		function(complete) {
			iterateBoundaryFolder('./data/boundary/mt_2014a_kml_us_county', complete, 'county');
		},function(complete) {
			iterateBoundaryFolder('./data/boundary/mt_2014a_kml_us_place', complete, 'city');
		}
	], function() {
		console.log("KML Boundaries Finished");
		process.exit();
	})
}