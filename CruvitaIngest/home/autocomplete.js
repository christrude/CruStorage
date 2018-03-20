'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AutocompleteHomeSchema = new Schema({
  nGram: { type: String, uppercase: true, unique: true },
  homes: [{ 
  	dispName: String,
  	slug: String 
  }]  
});

AutocompleteHomeSchema.index({ 'nGram': 1 });
module.exports = mongoose.model('AutocompleteHomes', AutocompleteHomeSchema);