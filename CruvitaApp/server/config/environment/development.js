'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://cruvita:community1809!@locahost:27017/lsa',
    //uri: 'mongodb://localhost:27017/lsa',
		options: {}
  },
  boundaryLocation: '../CruvitaIngest/',
  noAuth: true
};

//169.55.72.214 - Prod
//45.37.164.152:27017 - Testing
