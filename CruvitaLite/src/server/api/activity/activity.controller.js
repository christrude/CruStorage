'use strict';

var _ = require('lodash');
var Activity = require('./activity.model');
var url = require('url');

// Get list of activitys
exports.index = function(req, res) {
	var activityQuery = Activity.find();

  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var sortObject = {};
  sortObject[query.sortField || 'time'] = query.sortDir || -1;
	
  _.each(req.body.queries, function(query) {
		if(query.value || query.min) {
	    switch(query.type) {
	      case 'equals':
	        activityQuery.where(query.key).equals(query.value);
	        break;
	      case 'not':
	        activityQuery.where(query.key).ne(query.value);
	        break;
	      case 'range':
					query.min = isNaN(query.min) ? query.min : parseFloat(query.min);
					query.max = isNaN(query.max) ? query.max : parseFloat(query.max);
	        activityQuery.where(query.key).gte(query.min).lte(query.max);
	        break;
	      case 'min':
					query.value = isNaN(query.value) ? query.value : parseFloat(query.value);
	        activityQuery.where(query.key).gte(query.value)
	        break;
	      case 'max':
					query.value = isNaN(query.value) ? query.value : parseFloat(query.value);
	        activityQuery.where(query.key).lte(query.value)
	        break;
	      case 'or':
	        var orArray = [];
	        _.each(query.value, function(value) {
	          var orFilter = {};
	          orFilter[query.key] = value;
	          orArray.push(orFilter);
	        });
	        activityQuery.or(orArray);
	        break;
	    }
		}
  });
  activityQuery.sort(sortObject).exec(function(err, activities){
    if(err) { return handleError(res, err); }
    return res.json(200, activities);
  })
};

// Get a single activity
exports.show = function(req, res) {
  Activity.findById(req.params.id, function (err, activity) {
    if(err) { return handleError(res, err); }
    if(!activity) { return res.send(404); }
    return res.json(activity);
  });
};

// Creates a new activity in the DB.
exports.create = function(req, res) {
  Activity.create(req.body, function(err, activity) {
    if(err) { return handleError(res, err); }
    return res.json(201, activity);
  });
};

// Updates an existing activity in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Activity.findById(req.params.id, function (err, activity) {
    if (err) { return handleError(res, err); }
    if(!activity) { return res.send(404); }
    var updated = _.merge(activity, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, activity);
    });
  });
};

// Deletes a activity from the DB.
exports.destroy = function(req, res) {
  Activity.findById(req.params.id, function (err, activity) {
    if(err) { return handleError(res, err); }
    if(!activity) { return res.send(404); }
    activity.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}