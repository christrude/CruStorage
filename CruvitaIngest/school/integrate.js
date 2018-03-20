var _ = require('lodash');
var async = require('async');
var fs = require('graceful-fs');
var inside = require('point-in-polygon');
var mongoose = require('mongoose');
var Location = require('../location/schema');

exports.ingest = function(school, finished) {
	var finishedIntegrate = false;
	setTimeout(function() {
		if(!finishedIntegrate) {
			finished();
		}
	}, 15000)
	if(school.coordinates && school.coordinates.latitude && school.coordinates.longitude) {
		Location.find({type:{'$nin': ['school','state']}})
		.where('viewport.northeast.latitude').gte(school.coordinates.latitude)
		.where('viewport.northeast.longitude').gte(school.coordinates.longitude)
		.where('viewport.southwest.latitude').lte(school.coordinates.latitude)
		.where('viewport.southwest.longitude').lte(school.coordinates.longitude)
		.lean()
		.exec(function(err,locations) {
			if(err) {
				console.log(err);
			}
			if(locations && locations.length > 0) {
				async.each(locations, function(location, locationCallback) {
					if(location.boundaries && location.boundaries.length > 0) {
						async.each(location.boundaries, function(boundary, boundaryCallback) {
							var wkt = [];
							_.each(boundary.boundary, function(element) {
								wkt.push([element.latitude, element.longitude]);
							});
							var alreadyInside = false;
							if(inside([school.coordinates.latitude, school.coordinates.longitude], wkt) && !alreadyInside) {
								alreadyInside = true;
								if(!school.locations) {
									school.locations = {};
								}
								school.locations[location.type] = location.slug;
								boundaryCallback();
							}
							else {
								boundaryCallback();
							}
						}, function() {
							locationCallback();
						})
					}
					else {
						locationCallback();
					}
				}, function() {
					finishedIntegrate = true;
					finished();
				})
			}
			else {
				finishedIntegrate = true;
				finished();
			}
		})
	}
	else {
		finishedIntegrate = true;
		finished();
	}
};
