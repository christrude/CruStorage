'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            2356,

  // MongoDB connection options
  mongo: {
    uri:    process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
            'mongodb://cruvita:community1809!@localhost/lsa'
  },
  imageLocation: '../../CruvitaIngest/images/',
  userImageLocation: '../../CruvitaIngest/user-images/',
  boundaryLocation: '../../CruvitaIngest/',
  noAuth: true,
  seedDB: false
};
