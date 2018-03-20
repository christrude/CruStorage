'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var LocationSchema = new Schema({
	slug: {type: String, unique: true, required: true, lowercase: true},
	dispName: {type: String, required: true, uppercase: true},
	components: {
		street: { type: String, uppercase: true },
		state: { type: String, uppercase: true },
		zip: String,
		city: { type: String, uppercase: true },
		county: { type: String, uppercase: true },
		school: { type: String, lowercase: true }
	},
	type: { type: String, lowercase: true },
	schools: {
  	ed_level: String,
  	score: Number,
    school: String
	},
	viewport: {
		northeast: {
			latitude: Number,
			longitude: Number
		},
		southwest: {
			latitude: Number,
			longitude: Number
		}
	},
	boundaryFile: String,
	count: Number
});

LocationSchema.index({ 'dispName': 1 });
LocationSchema.index({ 'slug': 1 });
LocationSchema.index({ 'type': 1, 'components.state': 1, 'viewport.northeast.latitude': 1, 'viewport.northeast.longitude': 1, 'viewport.southwest.latitude': 1, 'viewport.southwest.longitude': 1 });
module.exports = mongoose.model('Location', LocationSchema);