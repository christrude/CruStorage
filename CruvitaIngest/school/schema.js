'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var SchoolSchema = new Schema({
  address: {
    street: { type: String, uppercase: true },
    state: { type: String, uppercase: true },
    city: { type: String, uppercase: true },
    county: { type: String, uppercase: true },
    zip: String
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  ed_level: String,
  freeLunch: String,
  freeLunchP: String,
  fullTimeTeachers: String,
  gradeLow: String,
  gradeHigh: String,
  langAch: String,
  location: String,
  locations: {
    city: { type : String, lowercase: true },
    state: { type : String, lowercase: true },
    county: { type : String, lowercase: true },
    zip: { type : String, lowercase: true }
  },
  mathAch: String,
  medianIncome: {
    district: String,
    zip: String,
    county: String
  },
  member: Number,
  nces_schid: String,
  phone: String,
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
  redLunch: String,
  sch_name: { type: String, uppercase: true },
  schoolDistrict: String,
  schoolDiversity: {
    numAmInd: String,
    numAsian: String,
    numHisp: String,
    numBlack: String,
    numWhite: String,
    numPacific: String,
    numMulti: String
  },
  schoolGenders: {
    male: String,
    female: String
  },
  score: {
    overall: Number
  },
  slug: { type: String, lowercase: true },
  stRatio: Number,
  titleOne: String,
  website: String,
//in reduce but not in data
  hasBoundaries: Boolean,
//In map but not in data
  nces_disid: String,
  medianSaleValue: String, //Just added this, so needs to be updated before proven
  schoolType: {
    schoolType: String,
    magnet: String,
    charter: String,
    shared: String,
    bies: String
  },
//in neither
  sch_name_maponics: { type: String, uppercase: true },
  mx_id: String,
  allMath: String,
  allReading: String,
  color: String,
  income: Number,
  relver: String
});

SchoolSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
SchoolSchema.index({ 'nces_schid': 1 });
SchoolSchema.index({'slug': 1 });
SchoolSchema.index({ 'address.zip': 1 });
SchoolSchema.index({ 'locations.city': 1 });
SchoolSchema.index({ 'locations.zip': 1 });
SchoolSchema.index({ 'locations.state': 1 });
SchoolSchema.index({ 'locations.county': 1 });
module.exports = mongoose.model('School', SchoolSchema);