var Home = require('../home/schema');
var jf = require('jsonfile');
var _ = require('lodash');
_.mixin(require("lodash-deep"));
var async = require('async');
var fs = require('graceful-fs');
var inside = require('point-in-polygon');
var mongoose = require('mongoose');
var config = require('../config');
var Location = require('../location/schema');

var locked_env = require('../app');

exports.ingest = function(home, finished) {
	var finishedIntegrate = false;
	setTimeout(function() {
		if(!finishedIntegrate) {
			finished();
		}
	}, 15000)
	if(home.listing.location.latitude && home.listing.location.longitude && home.listing.address.stateorprovince) {
		home.schools = {};
		Location.find()
		.where('type').equals('school')
		.where('schoolType.charter').ne('1')
		.where('schoolType.magnet').ne('1')
		.where('schoolType.bies').ne('1')
		.where('schoolType.shared').ne('1')
		.where('components.state').equals(home.listing.address.stateorprovince.toUpperCase())
		.where('viewport.northeast.latitude').gte(home.listing.location.latitude)
		.where('viewport.northeast.longitude').gte(home.listing.location.longitude)
		.where('viewport.southwest.latitude').lte(home.listing.location.latitude)
		.where('viewport.southwest.longitude').lte(home.listing.location.longitude)
		.lean()
		.exec(function(err,locations) {
			if(err) {
				console.log(err);
			}
			if(locations && locations.length > 0) {
				async.each(locations, function(location, locationCallback) {
					jf.readFile(location.boundaryFile, function(err, boundaries) {
						if(boundaries && boundaries.length > 0) {
							async.each(boundaries, function(boundary, boundaryCallback) {
								var wkt = [];
								_.each(boundary.boundary, function(element) {
									wkt.push([element.latitude, element.longitude]);
								});
								var alreadyInside = false;
								if(inside([home.listing.location.latitude, home.listing.location.longitude], wkt) && !alreadyInside) {
									alreadyInside = true;
									if(!home.locations) {
										home.locations = {};
									}
									if(location.type === 'school') {
										switch(location.schools.ed_level) {
											case '1':
												home.schools.elementary = location.schools.school;
												home.schools.elementaryScore = location.schools.score;
												break;
											case '2':
												home.schools.middle = location.schools.school;
												home.schools.middleScore = location.schools.score;
												break;
											case '3':
												home.schools.high = location.schools.school;
												home.schools.highScore = location.schools.score;
												break;
										}
									}
									else {
										home.locations[location.type] = location.dispName;
									}
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
					})
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
