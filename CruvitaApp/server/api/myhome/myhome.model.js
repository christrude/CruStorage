'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var MyhomeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User'},
  label: String,
  queries: [{
		must: Boolean,
    type: {
			type: String, 
			enum: ['or','range','rangeMin','rangeMax','max','min','equals']
		},
    label: String, 
    weight: Number,
    values: [{
	    key: String,
	    value: String,
	    min: Number,
	    max: Number,
	    level: {
				type: Number, 
				enum: [1,2,3,4] 
			}
	  }]
	}],
  results: {
  	homes: [{
	    dateFound: Date, 
	    score: Number, 
	    slug: String 
	  }],
		viewport: {
			northeast: {
				latitude: Number,
				longitude: Number
			},
			southwest: {
				latitude: Number,
				longitude: Number
			}
		}
	}	
});

module.exports = mongoose.model('Myhome', MyhomeSchema);