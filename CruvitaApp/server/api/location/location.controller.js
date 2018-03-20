'use strict';

var _ = require('lodash');
var url = require('url');
var jf = require('jsonfile');
var Location = require('./location.model');
var config = require('../../config/environment');

// Get list of locations
exports.index = function(req, res) {
  Location.find(function (err, locations) {
    if(err) { return handleError(res, err); }
    return res.json(200, locations);
  });
};

// Get a single location
exports.show = function(req, res) {
  Location.findOne({slug: req.params.id}).lean().exec(function (err, location) {
    if(err) { return handleError(res, err); }
    if(!location) { return res.send(404); }
		if(location.boundaryFile && location.type === 'school') {
			jf.readFile(config.boundaryLocation + location.boundaryFile, function(err, boundaries) {
				location.boundaries = boundaries;
	    	return res.json(location);
			});
		}
		else {
    	return res.json(location);
		}
  });
};

function handleError(res, err) {
  return res.send(500, err);
}