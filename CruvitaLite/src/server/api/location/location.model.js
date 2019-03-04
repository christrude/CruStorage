'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

		var LocationSchema = new Schema({
			slug: {type: String, unique: true, required: true, lowercase: true},
			dispName: {type: String, unique: true, required: true, uppercase: true},
			components: {
				street: { type: String, uppercase: true },
				state: { type: String, uppercase: true },
				zip: String,
				city: { type: String, uppercase: true },
				county: { type: String, uppercase: true },
				school: { type: String, uppercase: true }
			},
			type: { type: String, lowercase: true },
			schools: {
		  	ed_level: String,
		  	score: Number,
		    school: String
			},
			centroid: {
				latitude: Number,
				longitude: Number
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
			boundaries: [{
				boundary: [{
					latitude: Number,
					longitude: Number
				}]
			}],
			count: Number
		});

// SchoolSchema.index({ 'address.state': 1, 'address.city': 1 });
module.exports = mongoose.model('Location', LocationSchema);