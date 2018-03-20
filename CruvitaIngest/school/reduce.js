var jf = require('jsonfile');
var _ = require('lodash');
var async = require('async');
var fs = require('graceful-fs');
var Location = require('../location/schema');
var Boundary = require('../location/boundary');
var Util = require('../util/util');
var Autocomplete = require('../autocomplete/ingest');
var SchoolIntegrate = require('./integrate');
var School = require('./schema');
var rimraf = require('rimraf');

var schoolTemp = 'tmp';
var completed = 0;

function slugify(input) {
  return input.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
}

function checkIfDone() {
	setTimeout(function() {
		console.log('Schools created: ' + completed);
		checkIfDone()
	}, 10000);
}

function buildSchool(folder, schoolObject, callback) {
	fs.readdir(folder, function(err, files) {
		async.each(files, function(file, fileCallback) {
			var data;
			try {
				jf.readFile(folder + '/' + file, function(err, data) {
					schoolObject = _.merge(schoolObject, data);
					fileCallback();
				});
			}
			catch(err) {
				console.log(file);
				console.log(err);
				fileCallback();
			}
		}, function() {
			callback();
		})
	});
}

function storeLocation(schoolLocation, locationCreate) {
	delete schoolLocation.boundaries;
	Location.findOne({slug: schoolLocation.slug}, function(err, foundLocation) {
		if(err) {
			console.log(err)
		}
		var autocompleteCallback = function(input) {
			if(input && input.dispName && input.dispName.trim().length >= 3) {
				Autocomplete.createNGrams({slug: input.slug, dispName: Util.fileLegible(input.dispName.trim()), count: input.count}, locationCreate);
			}
			else {
				locationCreate();
			}
		}
		if(foundLocation) {
			Location.update({_id: foundLocation._id}, schoolLocation, { multi: false }, function(err) {
				if(err) {
					console.log(err);
				}
				schoolLocation.id = foundLocation._id;
				autocompleteCallback(schoolLocation);
			});
		}
		else {
			Location.create(schoolLocation, function(err, newLocation) {
				if(err) {
					console.log(err);
				}
				autocompleteCallback(newLocation);
			});
		}
	})
}

function storeSchool(schoolObject, callback) {
	if(!schoolObject.score || (isNaN(parseInt(schoolObject.score.overall)))) {
		schoolObject.score = {
			overall: 999999999
		}
	}
	if(schoolObject.address) {
		schoolObject.slug = slugify(schoolObject.sch_name + ' ' + schoolObject.address.city + ' ' + schoolObject.address.state);
		var schoolLocation = {
			slug: schoolObject.slug,
			dispName: schoolObject.sch_name + ' ' + schoolObject.address.city + ', ' + schoolObject.address.state,
			components: {
				street: schoolObject.address.street,
				state: schoolObject.address.state,
				zip: schoolObject.address.zip,
				city: schoolObject.address.city,
				county: schoolObject.address.county,
				school: schoolObject.slug
			},
			schools: {
				school: schoolObject.slug,
				score: schoolObject.score.overall,
				ed_level: schoolObject.ed_level
			},
			type: 'school',
			centroid: {
				latitude: _.get(schoolObject,'coordinates.latitude'),
				longitude: _.get(schoolObject,'coordinates.longitude')
			},
			boundaries: schoolObject.wkt,
			count: 1
		};
		
		schoolObject.hasBoundaries = (schoolLocation.boundaries && schoolLocation.boundaries.length > 0);
		schoolObject.location = schoolLocation.slug;
		schoolObject.locations = {
			state: Util.createSlug('state', schoolObject.address)
		};
		
		Util.calculateViewport(schoolLocation);
		schoolObject.locations.city = schoolObject.locations.city || Util.createSlug('city', schoolObject.address);
		schoolObject.locations.county = schoolObject.locations.county || Util.createSlug('county', schoolObject.address);
		schoolObject.locations.zip = schoolObject.locations.zip || Util.createSlug('zip', schoolObject.address);
		async.parallel([
			function(schoolCreate) {
				School.update({nces_schid: schoolObject.nces_schid}, schoolObject, {upsert: true}, function(err, numberAffected) {
					if(err) {
						console.log(err)
					}
					schoolCreate();
				});
			}, 
			function(locationCreate) {
				if(schoolLocation.boundaries && schoolLocation.boundaries.length > 0) {
					Boundary.writeBoundary(schoolLocation, function() {
						storeLocation(schoolLocation, locationCreate);
					});
				}
				else {
					storeLocation(schoolLocation, locationCreate);
				}
			}
		], function() {
			callback();
		});
	}
	else {
		callback();
	}
}

exports.ingest = function(folder) {
	var rootFolder = schoolTemp + '/' + folder;
	var folders = fs.readdirSync(rootFolder);
	checkIfDone();
  async.eachLimit(folders, 3, function(school, schoolComplete) {
  	var schoolObject = {};
  	async.series([
  		function(callback) {
  			buildSchool(rootFolder + '/' + school, schoolObject, callback);
  		},
  		function(callback) {
  			storeSchool(schoolObject, callback);
  		}
		], function() {
			rimraf(rootFolder + '/' + school, function() {
				completed++;
				schoolComplete();
			});
		});
	}, function() {
		rimraf(rootFolder, function() {
			process.exit();	
		})
	});
}