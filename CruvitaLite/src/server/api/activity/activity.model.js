'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var ActivitySchema = new Schema({
  time: Date,
  slug: String,
  origination: {
    type: String,
    enum: ['school', 'listing', 'results', 'ranking', 'profile', 'mobile-school', 'mobile-listing', 'mobile-results', 'mobile-ranking', 'mobile-profile']
  },
  action: {
    type: {
      type: String,
      enum: ['view', 'click', 'search', 'contact']
    },
    target: String
  },
  zip: String,
  city: String,
  state: String,
  agentID: String,
  agentName: String
});

module.exports = mongoose.model('Activity', ActivitySchema);