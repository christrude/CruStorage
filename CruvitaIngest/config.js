module.exports = {
  // MongoDB connection options process.env.NODE_ENV
  development: {
  	errorFileLocation: 'data/',
    siteMapLocation: './data/sitemap/',
  	mongoUrl: 'mongodb://localhost/lsa',
		forceHomeUpdate: false,
    homes: {
      parallelProcesses: 1
    }
  },
  staging: {
    errorFileLocation: 'data/',
    mongoUrl: 'mongodb://localhost/lsa-staging'
  },
  production: {
  	errorFileLocation: '/home/listhub/',
    siteMapLocation: '/opt/CruvitaApp/dist/server/sitemap/',
  	mongoUrl: 'mongodb://cruvita:community1809!@localhost/lsa',
		forceHomeUpdate: true,
    homes: {
      parallelProcesses: 1
    }
  }
};
