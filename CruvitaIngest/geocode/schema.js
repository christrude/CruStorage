'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var GeocodeSchema = new Schema({
  address: { type: String, unique: true },
	lat: Number,
	lng: Number
});

GeocodeSchema.index({'address': 1 });
module.exports = mongoose.model('Geocode', GeocodeSchema);