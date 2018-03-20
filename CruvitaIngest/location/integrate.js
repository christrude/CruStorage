var Home = require('../home/schema');
var jf = require('jsonfile');
var _ = require('lodash');
var async = require('async');
var fs = require('graceful-fs');
var inside = require('point-in-polygon');
var mongoose = require('mongoose');
var config = require('../config');
var Location = require('../location/schema');

var locked_env = require('../app');

exports.find = function(coordinates, finished) {
	Location.find()
	.where('viewport.northeast.latitude').gte(coordinates.latitude)
	.where('viewport.northeast.longitude').gte(coordinates.longitude)
	.where('viewport.southwest.latitude').lte(coordinates.latitude)
	.where('viewport.southwest.longitude').lte(coordinates.longitude)
	.lean()
	.exec(function(err,locations) {
		var foundLocations = [];
		if(locations && locations.length > 0) {
			async.each(locations, function(location, locationCallback) {
				jf.readFile(location.boundaryFile, function(err, boundaries) {
					async.each(boundaries, function(boundary, boundaryCallback) {
						var wkt = [];
						_.each(boundary.boundary, function(element) {
							wkt.push([element.latitude, element.longitude]);
						});
						var alreadyInside = false;
						if(inside([coordinates.latitude, coordinates.longitude], wkt) && !alreadyInside) {
							alreadyInside = true;
							foundLocations.push(location);
							boundaryCallback();
						}
						else {
							boundaryCallback();
						}
					}, function() {
						locationCallback();
					});
				});
			}, function() {
				finished(foundLocations);
			});
		}
		else {
			finished(foundLocations);
		}
	});
};
