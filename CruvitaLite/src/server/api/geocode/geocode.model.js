'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GeocodeSchema = new Schema({
  address: { type: String, unique: true, index: {unique: true, dropDups: true} },
	lat: Number,
	lng: Number
});

module.exports = mongoose.model('Geocode', GeocodeSchema);