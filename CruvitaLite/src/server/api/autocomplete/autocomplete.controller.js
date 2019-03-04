'use strict';

var _ = require('lodash');
var async = require('async');
var Autocomplete = require('./autocomplete.model');
var AutocompleteHomes = require('./autocompleteHomes.model');
var Location = require('../location/location.model');
var url = require('url');

// Get list of autocompletes
exports.index = function(req, res) {
  Autocomplete.find(function (err, autocompletes) {
    if(err) { return handleError(res, err); }
    return res.json(200, autocompletes);
  });
};

// Get a single autocomplete
exports.show = function(req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var returnValues = [];
  if (query.nGram) {
    Autocomplete.findOne({nGram: query.nGram.toUpperCase()}).exec(function (err, autocomplete) {
			if(autocomplete && autocomplete.locations) {
        var orArray = [];
        _.each(autocomplete.locations, function(value) {
          orArray.push({slug: value});
        });
				if(orArray.length > 0) {
					Location.find({}).or(orArray).lean().select('slug dispName type count components').exec(function(err, locations) {
			      if(err) { return handleError(res, err); }
			      if(!locations) { return res.json([]); }
						locations.sort(function(a, b) {
							return b.count - a.count;
						});
			      return res.json(locations);
					});
				}
				else {
					return res.json([]);
				}
			}
			else {
    		AutocompleteHomes.findOne({nGram: query.nGram.toUpperCase()}).lean().exec(function (err, autocompleteHome) {
    			if (autocompleteHome && autocompleteHome.homes) {
    				var response = [];
    				_.each(autocompleteHome.homes, function(home) {
    					response.push(Object.assign({}, home, {type: 'home'}));
		        });
    				return res.json(response);
    			} else {
    				return res.json([]);
    			}
    		});
			}
    });
  }
};

function handleError(res, err) {
  return res.send(500, err);
}