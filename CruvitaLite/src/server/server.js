/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const express = require('express');
const mailer = require('express-mailer');
const mongoose = require('mongoose');
const html2canvas = require('html2canvas');
const auth = require('http-auth');
const cluster = require('cluster');
const http = require('http');
const cors = require('cors');
const webpack = require('webpack');
const config = require('./config/environment');
const webpackconfig = require('./config/webpack.dev');


'use strict';

//App, Server monitoring tools

process.on('uncaughtException', function (error) {
   console.log(error.stack);
});



// var memwatch = require('memwatch');

// Authentication module.
var basic = auth.basic({
    realm: "Cruvita"
  }, function (username, password, callback) {
    callback(username === "cruvita" && password === "community1809");
  }
);
var numCPUs = require('os').cpus().length;
numCPUs = numCPUs > 8 ? 8 : numCPUs;
if (cluster.isMaster && process.env.NODE_ENV !== 'development') {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', function(worker, code, signal) {
    console.log('workers ' + worker.process.pid + ' died');
  });
} else {
  mongoose.connect(config.mongo.uri, config.mongo.options);
  // memwatch.on('leak', function(info) {
  //   console.log(info);
  // });

  // Populate DB with sample data
  if(config.seedDB) { require('./config/seed'); }

  // Setup server
  const port = 3000;
  const app = express();
  const compiler = webpack(webpackconfig);

  //Express auth piece
  if(!config.noAuth) {
    app.use(auth.connect(basic));
  }
  if(app.get('env') === 'development' || 'test') {
    app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: true,
      publicPath: webpackconfig.output.publicPath
    }))
		app.use(cors());
    mongoose.set('debug', true);
  }

  // app.use(require('prerender-node'));


  var server = require('http').createServer(app);
  require('./config/express')(app);
  require('./routes')(app);

  // Start server
  server.listen(config.port, config.ip, function () {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });

  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  // Configure express-mail and setup default mail data.
  mailer.extend(app, {
    from: 'info@cruvita.com',
    host: 'smtp.cruvita.com', // hostname
    secureConnection: false, // use SSL
    port: 587, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
      user: 'info@cruvita.com',
      pass: 'Community1809!!'
    }
  });

  // Expose app
  exports = module.exports = app;
}

