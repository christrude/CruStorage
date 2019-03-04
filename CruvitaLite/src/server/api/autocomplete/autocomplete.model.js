'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AutocompleteSchema = new Schema({
  nGram: { type: String, uppercase: true, unique: true },
  locations: [{ type: String }]  
});

// AutocompleteSchema.index({ 'nGram': 1 });
module.exports = mongoose.model('Autocomplete', AutocompleteSchema);