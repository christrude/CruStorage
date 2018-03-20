'use strict';

var _ = require('lodash');
var SavedSearch = require('./savedSearch.model');

// Get list of savedSearchs
exports.index = function(req, res) {
  SavedSearch.find(function (err, savedSearchs) {
    if(err) { return handleError(res, err); }
    return res.json(200, savedSearchs);
  });
};

// Get a single savedSearch
exports.show = function(req, res) {
  SavedSearch.findById(req.params.id, function (err, savedSearch) {
    if(err) { return handleError(res, err); }
    if(!savedSearch) { return res.send(404); }
    return res.json(savedSearch);
  });
};

// Creates a new savedSearch in the DB.
exports.create = function(req, res) {
  SavedSearch.create(req.body, function(err, savedSearch) {
    if(err) { return handleError(res, err); }
    return res.json(201, savedSearch);
  });
};

// Updates an existing savedSearch in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  SavedSearch.findById(req.params.id, function (err, savedSearch) {
    if (err) { return handleError(res, err); }
    if(!savedSearch) { return res.send(404); }
    var updated = _.merge(savedSearch, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, savedSearch);
    });
  });
};

// Deletes a savedSearch from the DB.
exports.destroy = function(req, res) {
  SavedSearch.findById(req.params.id, function (err, savedSearch) {
    if(err) { return handleError(res, err); }
    if(!savedSearch) { return res.send(404); }
    savedSearch.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}