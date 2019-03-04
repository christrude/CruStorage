'use strict';

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  // Server port
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  port:     9000,

  mongo: {
    uri: 'mongodb://localhost/lsa-staging'
  },
  imageLocation: '../../Staging/CruvitaIngest/images/',
  noAuth: true
};