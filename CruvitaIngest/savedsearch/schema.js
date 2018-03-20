'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SavedSearchSchema = new Schema({
  email: String,
  queries: [{
  	type: {
  		type: String
  	},
  	min: Number,
  	max: Number,
  	value: Schema.Types.Mixed,
  	key: String,
  	caseSensitive: Boolean
  }],
  lastRanDate: Date,
  frequency: Number,
  url: String
});

module.exports = mongoose.model('SavedSearch', SavedSearchSchema);