'use strict';

var _ = require('lodash');
var School = require('./school.model');
var Homes = require('../homes/homes.model');
var User = require('../user/user.model');
var Users = require('../user/user.controller');
var ObjectId = require('mongoose').Types.ObjectId;
var url = require('url');
var async = require('async');
var inside = require('point-in-polygon');
require('mongoose-query-paginate');

var edLevelMap = {
	'1': 'elementary',
	'2': 'middle',
	'3': 'high'
}

// Get list of schools
exports.index = function(req, res) {
  School.find(function (err, schools) {
    if(err) { return handleError(res, err); }
    return res.json(200, schools);
  });
};

// Get a single school
exports.show = function(req, res) {
  var foundSchool, gradeLevel;
  async.series({
    school: function(callback) {
			async.series({
				school: function(schoolCallback) {
		      var query = {_id: req.params.id};
		      try {
		        var validator = new ObjectId(req.params.id);
		      }
		      catch(err) {
		        query = {slug: req.params.id};
		      }
		      School.findOne(query).exec(function (err, school) {
						if(school) {
			        foundSchool = school;
							gradeLevel = edLevelMap[school.ed_level.toString()] || 'elementary';
						}
						else {
							res.send(404);
						}
		        schoolCallback(null, school);
		      });
				},
				homes: function(homeCallback) {
					var homeQuery = {'listing.listingcategory':'PURCHASE', 'status':{$ne:'inactive'}};
					if(foundSchool) {
						if(foundSchool.hasBoundaries) {
							homeQuery['schools.' + gradeLevel] = req.params.id
						}
						else {
							homeQuery["listing.location.coordinates"] = {$near:[foundSchool.coordinates.latitude, foundSchool.coordinates.longitude],$maxDistance:2};
						}
			      Homes.find(homeQuery).sort({'cruvitaDate': -1}).limit(5).exec(function (err, nearHomes) {
			        homeCallback(null, nearHomes);
			      });
			    } else {
			    	homeCallback(null, []);
			    }
				}
			}, function(err, results) {
				callback(null, results);
			})
    },
    agents: function(agentCallback) {
      var userQuery = User.find({'paidInterests.zips.zip': foundSchool.address.zip})
      .select('email name bio phone website licenseNumber agentType realtyName pictureType pictureLocation paidInterests.zips social slug')
      .exec(function(err, agents) {
        agentCallback(null, agents);
      });
    }
  }, function(err, results) {
		try {
			if(results.agents && results.agents.length > 0) {
				_.each(results.agents, function(agent) {
					if(agent.agentType === 'mortgage') {
						results.mortgage = agent;
					}
					else if(agent.agentType === 'realtor') {
						results.agent = agent;
					}
				})
			}
			delete results.agents;
      return res.send(200, results);
		}
		catch(err) {
			return res.send(500, 'Something went wrong');
		}
  });
};

exports.create = function(req, res) {
  var url_parts = url.parse(req.url, true);
  var userQuery = User.find({});
	var userParams = [];

	var pageOptions = {
	  perPage: 20,
	  delta  : 3,
	  page   : 1
	};
  var query = url_parts.query;
  pageOptions.page = query.page || 1;
  // {"ed_level": new RegExp(query.gradeLevel)}
  var schoolQuery = School.find().lean().limit(20).sort({'score.overall': 1})
  // .populate('location', 'boundary');
  _.each(req.body.queries, function(query) {
    switch(query.type) {
      case 'equals':
        if(!query.caseSensitive) {
          query.value = query.value.toString().toUpperCase();
        }
				if(query.value) {
	        schoolQuery.where(query.key).equals(query.value);
				}
        break;
      case 'range':
        schoolQuery.where(query.key).gt(parseFloat(query.min)).lt(parseFloat(query.max));
        break;
      case 'min':
        schoolQuery.where(query.key).gt(parseFloat(query.value))
        break;
      case 'max':
        schoolQuery.where(query.key).lt(parseFloat(query.value))
        break;
      case 'or':
        var orArray = [];
        _.each(query.value, function(value) {
          var orFilter = {};
          orFilter[query.key] = value;
          orArray.push(orFilter);
        });
        schoolQuery.or(orArray);
        break;
      default:
        break;
    }
  });

  function getSchools() {
		async.parallel({
			schoolsAgents: function(schoolsAgentsCallback) {
				async.series({
					schools: function(callback) {
					  schoolQuery.paginate(pageOptions, function (err, schools) {
					    if(err) { return handleError(res, err); }
					    var filteredSchools = [];
					    var polygonsPresent = req.body.polygons && req.body.polygons.length > 0;
					    if(polygonsPresent) {
					      _.each(req.body.polygons, function(poly) {
					        _.each(schools, function(school) {
					          if(inside([school.coordinates.latitude, school.coordinates.longitude], poly)) {
					            filteredSchools.push(school);
					          }
					        });
					      });
					    }
							var postalcodes = _.map(schools.results, 'address.zip');
							if(postalcodes.length > 0) {
								userParams.push({'paidInterests.zips.zip':postalcodes[0]});
							}
					    callback(null, polygonsPresent ? filteredSchools : schools);
					  });
					},
					agents: function(callback) {
		        Users.adAgentsCallback(callback, userParams, userQuery);
					}
				}, function(err, results) {
		    	schoolsAgentsCallback(err, results);
		  	});
			},
			homes: function(homeCallback) {
				if(query.nearbyHomes) {
					/* Not ideal, but easier for client to do this */
					var locationQuery = req.body.queries.filter((o) => o.key.indexOf('locations.') !== -1)[0];
					if(locationQuery) {
						var homeQuery = {'listing.listingcategory':'PURCHASE', 'status':{$ne:'inactive'}};
						homeQuery[locationQuery.key] = locationQuery.value;
			      Homes.find(homeQuery).sort({'listing.listingdate': -1}).limit(10).exec(function (err, nearHomes) {
			        homeCallback(null, nearHomes);
			      });
			    } else {
			    	homeCallback(null, []);
			    }
				}
				else {
					homeCallback(null, []);
				}
			}
		}, function(err, results) {
			results.schools = results.schoolsAgents.schools;
			results.agents = results.schoolsAgents.agents;
			delete(results.schoolsAgents);
      return res.send(200, results);
		})
  };

  getSchools();
};

function handleError(res, err) {
  return res.send(500, err);
}