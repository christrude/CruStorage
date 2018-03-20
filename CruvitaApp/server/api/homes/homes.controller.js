'use strict';

var _ = require('lodash');
_.mixin(require("lodash-deep"));
var Homes = require('./homes.model');
var Geocode = require('../geocode/geocode.model');
var School = require('../school/school.model');
var Location = require('../location/location.model');
var User = require('../user/user.model');
var Users = require('../user/user.controller');
var url = require('url');
var async = require('async');
var parser = require('parse-address');
var objectMerge = require('object-merge');
var inside = require('point-in-polygon');
var request = require('request');
var jf = require('jsonfile');
var config = require('../../config/environment');
require('mongoose-query-paginate');

var gradeScale = [
	{
		low: 0,
		value: 'A+',
		icon: '/assets/images/ic-school-a.png',
		color: 'rgba(0, 179, 0, 1)'
	},
	{
		low: 102,
		value: 'A',
		icon: '/assets/images/ic-school-a.png',
		color: 'rgba(0, 179, 0, 1)'
	},
	{
		low: 476,
		value: 'A-',
		icon: '/assets/images/ic-school-a.png',
		color: 'rgba(0, 179, 0, 1)'
	},
	{
		low: 1245,
		value: 'B+',
		icon: '/assets/images/ic-school-b.png',
		color: 'rgba(134, 179, 0, 1)'
	},
	{
		low: 2470,
		value: 'B',
		icon: '/assets/images/ic-school-b.png',
		color: 'rgba(134, 179, 0, 1)'
	},
	{
		low: 4287,
		value: 'B-',
		icon: '/assets/images/ic-school-b.png',
		color: 'rgba(134, 179, 0, 1)'
	},
	{
		low: 6746,
		value: 'C+',
		icon: '/assets/images/ic-school-c.png',
		color: 'rgba(253, 219, 82, 1)'
	},
	{
		low: 17900,
		value: 'C',
		icon: '/assets/images/ic-school-c.png',
		color: 'rgba(253, 219, 82, 1)'
	},
	{
		low: 40870,
		value: 'C-',
		icon: '/assets/images/ic-school-c.png',
		color: 'rgba(253, 219, 82, 1)'
	},
	{
		low: 93996,
		value: 'D+',
		icon: '/assets/images/ic-school-d.png',
		color: 'rgba(216, 143, 78, 1)'
	},
	{
		low: 130257,
		value: 'D',
		icon: '/assets/images/ic-school-d.png',
		color: 'rgba(216, 143, 78, 1)'
	},
	{
		low: 179260,
		value: 'D-',
		icon: '/assets/images/ic-school-d.png',
		color: 'rgba(216, 143, 78, 1)'
	},
	{
		low: 259755,
		value: 'F',
		icon: '/assets/images/ic-school-f.png',
		color: 'rgba(197, 0, 0, 1)'
	}
];

String.prototype.capitalize = function() {
    return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

// Get a single home
exports.show = function(req, res) {
  var userQuery = User.find({})
  .select('email name bio phone website licenseNumber agentType realtyName pictureType pictureLocation paidInterests.zips social slug');
  var userParams = [];
	var foundHome;
  async.series({
    home: function(callback){
      var url_parts = url.parse(req.url, true);
      var urlParts = url_parts.query;
      var query = Homes.findOne({slug: req.params.id});
      if(urlParts.unit) {
        query.where('listing.address.unitnumber').equals(urlParts.unit);
      }

      query.lean().exec(function (err, home) {
				// db.homes.find({"listing.location.coordinates":{$near:[27.270331,-80.437042],$maxDistance:5}},{"listing.location.coordinates":1})
        //Had to add this caveat in, because if a person searches for a slug not in the system, the server crashes.
        if (home) {
					var schools = [];
					(home.schools && home.schools.elementary) ? schools.push(home.schools.elementary) : null;
					(home.schools && home.schools.middle) ? schools.push(home.schools.middle) : null;
					(home.schools && home.schools.high) ? schools.push(home.schools.high) : null;
					School.find({'slug': {'$in': schools}}).lean().exec(function(err, schools) {
						var schoolObject = {
							schools: {
								elementary: {},
								middle: {},
								high: {}
							}
						};
						_.each(schools, function(school) {
							switch(school.ed_level) {
								case '1':
									home.schools.elementary = school;
									break;
								case '2':
									home.schools.middle = school;
									break;
								case '3':
									home.schools.high = school;
									break;
								default:
									break;
							}
						});
						foundHome = home;
            var zip = home.listing.address.postalcode.split('-');
	          userParams.push({'paidInterests.zips.zip': zip[0]});
	          callback(null, home);
					})
        }
				else {
					res.send(404);
				}
      });
    },
		metadata: function(metaCallback) {
			async.parallel({
				agents: function(callback){
		      userQuery.or(userParams).exec(function (err, users) {
		        callback(null, users);
		      });
		    },
				nearHomes: function(callback){
					var coordinates = _.get(foundHome, 'listing.location.coordinates');
					var listPrice = parseInt(_.get(foundHome, 'listing.listprice.0'));
					if(coordinates) {
			      Homes.find({"status": {$ne:"inactive"}, "slug": {$ne: foundHome.slug}, "listing.location.coordinates":{$near:coordinates,$maxDistance:2}, "listing.listprice":{$gt:(listPrice*0.9),$lt:(listPrice*1.1)}}).limit(25).exec(function (err, nearHomes) {
			        callback(null, nearHomes);
			      });
					}
					else {
						callback(null, []);
					}
		    }
			}, function(err, metadata) {
				if(metadata.agents && metadata.agents.length > 0) {
					_.each(metadata.agents, function(agent) {
						if(agent.agentType === 'mortgage') {
							metadata.mortgage = agent;
						}
						else if(agent.agentType === 'realtor') {
							metadata.agent = agent;
						}
					})
				}
				delete metadata.agents;
				metaCallback(err, metadata);
			})
		}
  },
  function(err, results) {
    return res.send(200, results);
  });
};

var isDate = function(date) {
	var newDate = new Date(date);
  return (newDate !== "Invalid Date" && newDate.getYear() > 71);
}

var queryBuilder = function(queries, homeQuery) {
	_.each(queries, function(query) {
		if(query.value || query.min) {
			if(isDate(query.value)) {
				query.value = new Date(query.value);
			} else if(!isNaN(query.value)) {
				query.value = parseFloat(query.value);
			}

	    switch(query.type) {
	      case 'equals':
	        if(!query.caseSensitive && query.value) {
	          query.value = query.value.toUpperCase();
	        }
	        homeQuery.where(query.key).equals(query.value);
	        break;
	      case 'range':
	        homeQuery.where(query.key).gte(parseFloat(query.min)).lte(parseFloat(query.max));
	        break;
	      case 'min':
	        homeQuery.where(query.key).gte(query.value);
	        break;
	      case 'max':
	        homeQuery.where(query.key).lte(query.value);
	        break;
	      case 'or':
	        var orArray = [];
	        _.each(query.value, function(value) {
	          var orFilter = {};
	          orFilter[query.key] = value;
	          orArray.push(orFilter);
	        });
	        homeQuery.or(orArray);
	        break;
	      case 'address':
	        var parsed = parser.parseLocation(query.value);
	        var address = '';
	        var streetComponents = ['number', 'prefix', 'street', 'type'];
	        _.each(streetComponents, function(component) {
	          if(parsed[component]) {
	            if(address !== '') {
	              address += ' ';
	            }
	            address += parsed[component];
	          }
	        });
	        homeQuery.where('listing.address.fullstreetaddress').equals(address.toUpperCase().replace(' CT',' COURT').replace(' DR',' DRIVE').replace(' RD',' ROAD').replace(' SQ',' SQUARE').replace(' ST',' STREET'));
	        if(parsed.city) {
	          homeQuery.where('listing.address.city').equals(parsed.city.toUpperCase());
	        }
	        if(parsed.state) {
	          homeQuery.where('listing.address.stateorprovince').equals(parsed.state.toUpperCase());
	        }
	        if(parsed.zip) {
	          homeQuery.where('listing.address.postalcode').equals(parsed.zip);
	        }
	        break;
	      default:
	        break;
	    }
		}
  });
}

exports.queryBuilder = queryBuilder;
// Get list of homes
exports.create = function(req, res) {
  var userQuery = User.find({})
  .where('agentType').equals('realtor')
  .select('email name bio phone website licenseNumber agentType realtyName pictureType pictureLocation paidInterests.zips social slug');

  var url_parts = url.parse(req.url, true);

	var pageOptions = {
	  perPage: 50,
	  delta  : 3,
	  page   : 1
	};
  var query = url_parts.query;
  pageOptions.page = query.page || 1;
  var sortObject = {};
  sortObject[query.sortField || 'cruvitaDate'] = query.sortDir || -1;
  var homeQuery = Homes.find()
  // .where('multiple.isChild').ne(true)
  .lean()
  .sort(sortObject)
  .populate('multiple.children', 'slug schools listing.photos.photo listing.listprice listing.listingdate listing.listingkey listing.listingcategory listing.listingstatus listing.score listing.address listing.bedrooms listing.bathrooms listing.livingarea listing.propertytype listing.propertysubtype listing.location.latitude listing.location.longitude listing.listingparticipants')
  .select('slug schools cruvitaDate multiple listing.photos.photo listing.listprice listing.listingkey listing.listingdate listing.listingcategory listing.listingstatus listing.score listing.address listing.bedrooms listing.bathrooms listing.livingarea listing.propertysubtype listing.location.latitude listing.location.longitude listing.listingparticipants');

  if(!query.allListings) {
  	homeQuery.where('status').ne('inactive');
  	homeQuery.where('listing.listingstatus.0').ne('Pending');
  }

  queryBuilder(req.body.queries, homeQuery);

  function homesCallback(err, homes, callback) {
    if(err) { return handleError(res, err); }
    callback(null, homes);
  }

  function completeRequest(err, results) {
    results.agents = results.adAgents;
    delete results.adAgents;
    return res.send(200, results);
  }

  var postalcodes = _.filter(req.body.queries, { 'key': 'listing.address.postalcode' });
  var userParams = [];
  if(postalcodes.length === 0) {
    async.series({
      homes: function(callback){
        homeQuery.paginate(pageOptions, function (err, homes) {
          _.each(_.map(homes.results, 'listing.address.postalcode'), function(postalcode) {
            if(_.filter(userParams, { 'paidInterests.zips.zip':postalcode }).length === 0) {
              userParams.push({'paidInterests.zips.zip':postalcode});
            }
          });
          homesCallback(err, homes, callback);
        });
      },
      adAgents: function(callback){
        Users.adAgentsCallback(callback, userParams, userQuery);
      }
    }, completeRequest);
  }
  else {
    userParams.push({'paidInterests.zips.zip':postalcodes[0].value});
    async.parallel({
      adAgents: function(callback){
        Users.adAgentsCallback(callback,userParams, userQuery);
      },
      homes: function(callback){
        homeQuery.paginate(pageOptions, function (err, homes) {
          homesCallback(err, homes, callback);
        });
      }
    }, completeRequest);
  }
};

// Get schools for an address
exports.schools = function(req, res) {
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	return res.send(200, populateSchools(query.address))
}

var populateSchools = function(address, callback) {
	// var validAPIKeyCheck = function(key, success, failure) {
	// 	User.findOne({'apiKey.schoolFinder.key': key}, function(err, user) {
	// 		if(user && key) {
	// 			success();
	// 		}
	// 		else {
	// 			failure();
	// 		}
	// 	})
	// }
	var coordinates = {};

	var checkCache = function(address, callback) {
		Geocode.findOne({address: address}, function(err, geocode) {
			if(geocode) {
				coordinates = geocode;
			}
			callback();
		})
	}

	var storeGeocode = function(address) {
		Geocode.create({address: address, lat: coordinates.lat, lng: coordinates.lng }, function (err, geocode) {
			if(err) {
				console.log(err);
			}
	  });
	}

	var googleGeocode = function(address, callback) {
		var url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyC2kNnCsCpbfG_4h0sreZ9Mxk8CMCXv2gQ';
		request(url, function (error, response, body) {
		  if (!error && response.statusCode == 200) {
		  	var json = _.get(JSON.parse(body), 'results.0');
		  	if(json) {
					coordinates = json.geometry.location;
					storeGeocode(address);
		    	callback(null, json.geometry.location);
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

	var normalizeSchoolName = function(school) {
		return school.sch_name.toLowerCase().replace(/\belem\b/gi,'elementary').trim().capitalize();
	}

	var getGrade = function(schoolObject, key) {
		_.each(gradeScale, function(grade, index) {
			if(schoolObject[key + 'Score'] >= grade.low && (index === gradeScale.length - 1 || schoolObject[key + 'Score'] < gradeScale[index+1].low)) {
				schoolObject[key + 'Grade'] = grade.value;
				schoolObject[key + 'Color'] = grade.color;
			}
		})
	}
	// Retrieve schools that contain input coordinates
	var getSchools = function(coordinates, callback) {
		var schools = {};
		if(coordinates) {
			Location.find()
			.where('type').equals('school')
			.where('viewport.northeast.latitude').gte(coordinates.lat)
			.where('viewport.northeast.longitude').gte(coordinates.lng)
			.where('viewport.southwest.latitude').lte(coordinates.lat)
			.where('viewport.southwest.longitude').lte(coordinates.lng)
			.lean()
			.exec(function(err,locations) {
				if(locations && locations.length > 0) {
					async.each(locations, function(location, locationCallback) {
						if(location && location.boundaryFile) {
							jf.readFile(config.boundaryLocation + location.boundaryFile, function(err, boundaries) {
								if(boundaries && boundaries.length > 0) {
									async.each(boundaries, function(boundary, boundaryCallback) {
										var wkt = [];
										_.each(boundary.boundary, function(element) {
											wkt.push([element.latitude, element.longitude]);
										});
										var alreadyInside = false;
										if(inside([coordinates.lat, coordinates.lng], wkt) && !alreadyInside) {
											alreadyInside = true;
											if(location.type === 'school') {
												School.findOne().where('slug').equals(location.schools.school).lean().exec(function(err, school) {
													switch(school.ed_level) {
														case '1':
															schools.elementary = normalizeSchoolName(school);
															schools.elementaryScore = school.score.overall;
															schools.elementarySlug = school.slug;
															schools.elementarySchool = school;
															getGrade(schools, 'elementary');
															break;
														case '2':
															schools.middle = normalizeSchoolName(school);
															schools.middleScore = school.score.overall;
															schools.middleSlug = school.slug;
															schools.middleSchool = school;
															getGrade(schools, 'middle');
															break;
														case '3':
															schools.high = normalizeSchoolName(school);
															schools.highScore = school.score.overall;
															schools.highSlug = school.slug;
															schools.highSchool = school;
															getGrade(schools, 'high');
															break;
													}
													boundaryCallback();
												})
											}
										}
										else {
											boundaryCallback();
										}
									}, function() {
										locationCallback();
									});
								}
								else {
									locationCallback();
								}
							});
						}
						else {
							locationCallback();
						}
					}, function() {
						callback(null, schools);
					})
				}
				else {
					callback(null, []);
				}
			})
		}
		else {
			callback(null, []);
		}
	}
  // Commented out for now - Trude 12/15
	// validAPIKeyCheck(query.key, function() {
		async.series([
			function(callback) {
				checkCache(address, callback)
			},
			function(callback) {
				if(!coordinates.lat) {
					googleGeocode(address, callback)
				}
				else {
					callback()
			 	}
			},
			function(callback) {
				getSchools(coordinates, callback)
			}
		], function(err, results) {
			callback(results[2]);
		})
	// }, function() {
	// 	return res.send(401, 'Need Valid API Key');
	// });
}

exports.blankHome = function(req, res) {
	var coordinates = {};
	var url_parts = url.parse(req.url, true);
	var query = url_parts.query;
	var parsedAddress = parser.parseLocation(query.address);
	if (parsedAddress.number && parsedAddress.street) {
		var address = {
	    fullstreetaddress: `${parsedAddress.number}${parsedAddress.prefix ? (' ' + parsedAddress.prefix) : ''} ${parsedAddress.street} ${parsedAddress.type}`,
	    city: parsedAddress.city,
	    stateorprovince: parsedAddress.state,
	    postalcode: parsedAddress.zip
	  };
		var input = `${address.fullstreetaddress} ${address.city} ${address.stateorprovince} ${address.postalcode}`
	  var slug = input.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
	  Homes.findOne({slug: slug}, (err, home) => {
	  	if (home) {
				return res.send(200, home);
	  	} else {
				populateSchools(query.address, (result) => {
					var parsedAddress = parser.parseLocation(query.address);
					var newHome = {};
					newHome.listing = {
			      address: address
			    }
			    newHome.slug = slug;
			    newHome.schools = {
			      elementary: result.elementarySlug,
			      middle: result.middleSlug,
			      high: result.highSlug,
			      elementaryScore: result.elementaryScore,
			      middleScore: result.middleScore,
			      highScore: result.highScore
			    };
			    newHome.status = "inactive";
			    newHome.ingestDate = new Date().getTime();
					Homes.create(newHome, function(err, home) {
						if (err) {
							console.log(err)
							handleError(res, err);
						}
						return res.send(200, home);
					});
				});
			}
	  });
	} else {
		res.send(200, {});
	}
}

function handleError(res, err) {
  return res.send(500, err);
}