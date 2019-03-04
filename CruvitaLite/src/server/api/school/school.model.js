'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

		var SchoolSchema = new Schema({
		  slug: { type: String, lowercase: true },
		  mx_id: String,
		  nces_disid: String,
		  nces_schid: String,
		  medianIncome: {
		    district: String,
		    zip: String,
		    county: String
		  },
		  sch_name: { type: String, uppercase: true },
		  sch_name_maponics: { type: String, uppercase: true },
		  ed_level: String,
		  phone: String,
		  website: String,
		  color: String,
		  freeLunch: String,
		  freeLunchP: String,
		  redLunch: String,
		  member: Number,
		  income: Number,
		  titleOne: String,
		  stRatio: Number,
		  schoolDistrict: String,
		  score: {
		    realEstate: Number,
		    school: Number,
		    overall: Number
		  },
		  gradeLow: String,
		  gradeHigh: String,
		  schoolGenders: {
		    male: String,
		    female: String
		  },
		  schoolDiversity: {
		    numAmInd: String,
		    numAsian: String,
		    numHisp: String,
		    numBlack: String,
		    numWhite: String,
		    numPacific: String,
		    numMulti: String
		  },
		  relver: String,
		  allReading: String,
		  mathAch: String,
		  langAch: String,
		  medianListing: Number,
		  location: String,
		  hasBoundaries: Boolean,
		  allMath: String,
		  locations: {
		    city: { type : String, lowercase: true },
		    state: { type : String, lowercase: true },
		    county: { type : String, lowercase: true },
		    zip: { type : String, lowercase: true }
		  },
		  coordinates: {
		    latitude: Number,
		    longitude: Number
		  },
		  address: {
		    street: { type: String, uppercase: true },
		    state: { type: String, uppercase: true },
		    city: { type: String, uppercase: true },
		    county: { type: String, uppercase: true },
		    zip: String
		  },
		  rank: {
		    county: {
		      rank: Number,
		      total: Number
		    },
		    state: {
		      rank: Number,
		      total: Number
		    },
		    nation: {
		      rank: Number,
		      total: Number
		    }
		  },
		  schoolType: {
		    schoolType: String,
		    magnet: String,
		    charter: String,
		    shared: String,
		    bies: String
		  },
		  fullTimeTeachers: String
		});

// SchoolSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
// SchoolSchema.index({ 'address.state': 1, 'address.city': 1 });
module.exports = mongoose.model('School', SchoolSchema);