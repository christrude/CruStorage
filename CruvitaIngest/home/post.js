var Geocode = require('../geocode/schema');
var request = require('request');
var async = require('async');
var _ = require('lodash');
_.mixin(require("lodash-deep"));
var locked_env = require('../app');

function createStringAddress(result) {
	return result.listing.address.fullstreetaddress + ' ' + result.listing.address.city + ', ' + result.listing.address.stateorprovince + ' ' + result.listing.address.postalcode;
}

function checkCache(result, callback) {
	Geocode.findOne({address: createStringAddress(result)}, function(err, geocode) {
		if(err){
			console.log(err);
		}
		if(geocode) {
			result.listing.location.latitude = geocode.lat;
			result.listing.location.longitude = geocode.lng;
		}
		callback();
	})
}

function storeGeocode(home) {
	Geocode.create({address: createStringAddress(home), lat: home.listing.location.latitude, lng: home.listing.location.longitude }, function (err, geocode) {
		if(err) {
			console.log(err);
		}
  });
}

function googleGeocode(home, callback){
	var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + createStringAddress(home) + '&key=AIzaSyC2kNnCsCpbfG_4h0sreZ9Mxk8CMCXv2gQ';
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	var json = _.get(JSON.parse(body), 'results.0');
	  	if(json) {
		  	var typesArray = [];
		  	_.each(_.map(json.address_components, 'types'), function(types) {
		  		_.each(types, function(type) {
		  			typesArray.push(type);
		  		})
		  	})
		  	if(_.includes(typesArray, 'route')) {
		    	home.listing.location.latitude = parseFloat(json.geometry.location.lat);
		    	home.listing.location.longitude = parseFloat(json.geometry.location.lng);
					storeGeocode(home);
		    	callback();
		    }
		    else {
		    	callback();
		    }
		  }
		  else {
		  	callback();
		  }
	  }
	  else {
	  	callback();
	  }
	});
}

exports.ingest = function(result, finished) {
	if((!_.get(result, 'listing.location.latitude') || !_.get(result, 'listing.location.longitude')) && _.get(result, 'listing.address.fullstreetaddress') && _.get(result, 'listing.address.city') && _.get(result, 'listing.address.stateorprovince') && _.get(result, 'listing.address.postalcode')) {
		async.series([
			function(callback) {
				checkCache(result, callback);
			}, 
			function(callback) {
				if(result.listing.location.latitude && result.listing.location.longitude) {
					callback();
				}
				else {
					googleGeocode(result, callback);
				}
			}
		], function() {
			finished();
		});
	}
	else {
		finished();
	}
}