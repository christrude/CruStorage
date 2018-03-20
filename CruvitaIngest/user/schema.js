'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: { type: String, lowercase: true},
  phone: [String],
	slug: String,
  website: String,
  licenseNumber: String,
  state: String,
  email: { type: String, lowercase: true, unique : true },
  agentType: {
    type: String,
    enum: ['realtor', 'mortgage']
  },
  realtyName: String,
  resetPassword: String,
	apiKey: {
		schoolFinder: {
			key: String,
			version: Number
		}
	},
  paidInterests: {
    zips: [
      {
        zip: String,
        amount: String,
        paidThrough: String,
        searchImpressions: {
          total: Number,
          impressions: [{
            date: Date
          }]
        },
        directImpressions: {
          total: Number,
          impressions: [{
            date: Date
          }]
        },
        leads: {
          total: Number,
          impressions: [{
            date: Date
          }]
        }
      }
    ]
  },
  social: {
    facebook: String,
    linkedin: String,
    google: String,
    twitter: String,
    remarketing: [String]
  },
  customSearches: [{
    label: String,
    queries: [{
      key: String,
			must: Boolean,
      values: [{
				value: {type: String},
				level: {
					type: Number,
					enum: [1,2,3,4]
				},
			}],
      queryType: String
    }],
    results: [ {
      homeId: { type: Schema.Types.ObjectId, ref: 'Home' },
      dateFound: Date,
      score: Number
    } ]
  }],
  role: {
    type: String,
    default: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive']
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  pictureType: String,
  pictureLocation: String
});

module.exports = mongoose.model('User', UserSchema);
