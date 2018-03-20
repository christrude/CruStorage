/**
 * Main application file
 */
require("node-nice-console")(console);

'use strict';
var School = require('./school/ingest');
var SchoolMapper = require('./school/map');
var SchoolReducer = require('./school/reduce');
var SavedSearch = require('./savedsearch/ingest');
var MyHome = require('./myhome/ingest');
var Home = require('./home/ingest');
var HomeRemoval = require('./home/removal');
var ReportHomesPerZip = require('./reports/homesPerZip');
var Multiple = require('./home/multiple');
var PostHome = require('./home/post');
var Autocomplete = require('./autocomplete/ingest');
var Location = require('./location/ingest');
var Boundary = require('./location/boundary');
var BoundaryKML = require('./location/kml');
var LocationPrefix = require('./location/prefix');
var HomeIntegration = require('./home/integrate');
var SchoolIntegration = require('./school/integrate');
var SiteMap = require('./sitemap/ingest');
var UserSearch = require('./user/ingest');
var AutocompleteHomes = require('./home/autocompleteIngest');
// var SchoolIntegration = require('./location/kml');
var async = require('async');
var mongoose = require('mongoose');
var config = require('./config');

// Set default node environment to development
// Store the node env as a global variable, the ENV can't change during the process

var locked_env = process.env.NODE_ENV || 'development';
exports.app = locked_env;

// require('longjohn');

var args = {};
// Command line arguments
process.argv.forEach(function (val) {
  var argSplit = val.split('=');
  if(argSplit.length > 1) {
      args[argSplit[0]] = argSplit[1];
  }
});

mongoose.connect(config[locked_env].mongoUrl);
mongoose.connection.on('error', function(err) {
    console.error('MongoDB error: %s', err);
});
process.on('SIGINT', function() {
	mongoose.connection.close(function() {
		process.exit(0);
	})
})
// mongoose.set('debug', true);
if(args.ingest === 'schools') {
  School.ingest();
}
else if(args.ingest === 'schoolMapper') {
  if(args.file) {
    SchoolMapper.ingest(args.file);
  }
}
else if(args.ingest === 'schoolReducer') {
  if(args.folder) {
    SchoolReducer.ingest(args.folder);
  }
}
else if(args.ingest === 'homes') {
  Home.ingest();
}
else if(args.ingest === 'homesReducer') {
  if(args.folder) {
    Home.reducer(args.folder);
  }
}
else if(args.ingest === 'myhome') {
  if(args.myhome) {
    MyHome.readOneDocument(args.myhome);
  }
}
else if(args.ingest === 'homesRemoval') {
  HomeRemoval.ingest();
}
else if(args.ingest === 'autocompleteHomes') {
  AutocompleteHomes.ingest();
}
else if(args.ingest === 'postHome') {
  PostHome.ingest();
}
else if(args.ingest === 'multiple') {
  Multiple.ingest();
}
else if(args.ingest === 'autocomplete') {
  Autocomplete.ingest();
}
else if(args.ingest === 'location') {
  Location.ingest();
}
else if(args.ingest === 'boundary') {
  Boundary.ingest();
}
else if(args.ingest === 'boundaryKml') {
  BoundaryKML.ingest();
}
else if(args.ingest === 'locationPrefix') {
  LocationPrefix.ingest();
}
else if(args.ingest === 'homeIntegration') {
  HomeIntegration.ingest();
}
else if(args.ingest === 'schoolIntegration') {
  SchoolIntegration.ingest();
}
else if(args.ingest === 'siteMap') {
  SiteMap.ingest();
}  
else if(args.ingest === 'userSearch') {
  UserSearch.ingest();
} 
else if(args.ingest === 'savedSearch') {
  SavedSearch.ingest();
}
else if(args.ingest === 'reportHomesPerZip') {
  ReportHomesPerZip.ingest();
}
// else if(args.ingest === 'schoolIntegration') {
//     SchoolIntegration.ingest();
// }
// 64.23.56.86
// MP3RAaIzbnQVy
// listhub : listhub123
