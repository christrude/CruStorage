/**
 * Main application file
 */

'use strict';

//App, Server monitoring tools
// require('newrelic');
if(process.env.NODE_ENV === 'production') {
  require('newrelic');
}
process.on('uncaughtException', function (error) {
   console.log(error.stack);
});

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('express');
var mailer = require('express-mailer');
var mongoose = require('mongoose');
var config = require('./config/environment');
var html2canvas = require("html2canvas");

// var memwatch = require('memwatch');

// Authentication module.
var auth = require('http-auth');
var basic = auth.basic({
    realm: "Cruvita"
  }, function (username, password, callback) {
    callback(username === "cruvita" && password === "community1809");
  }
);
var cluster = require('cluster');
var http = require('http');
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
  // var heapDiffFn = function() {
  // var hd = new memwatch.HeapDiff();
  // setTimeout(function() {
  //     var diff = hd.end();
  //     console.log(JSON.stringify(diff));
  //     heapDiffFn();
  //   }, 20000);
  // }
  // heapDiffFn();
  // Workers can share any TCP connection
  // In this case its a HTTP server
  // Connect to database
	var cors = require('cors');

  mongoose.connect(config.mongo.uri, config.mongo.options);
  // memwatch.on('leak', function(info) {
  //   console.log(info);
  // });

  // Populate DB with sample data
  if(config.seedDB) { require('./config/seed'); }

  // Setup server
  var app = express();

  //Had to comment this out because it's not installing, and it errors here. Same with memwatch
  // var toobusy = require('toobusy');

  // app.use(function(req, res, next) {
  //   if (toobusy()) res.send(503, "I'm busy right now, sorry.");
  //   else next();
  // });
  //Express auth piece
  if(!config.noAuth) {
    app.use(auth.connect(basic));
  }
  if(app.get('env') === 'development' || 'test') {
		app.use(cors());
    mongoose.set('debug', true);
  }

  app.use(require('prerender-node'));
  //.set('prerenderToken ', '4Qi9VFVVJLAqGgj9XG76'));
  //app.use(require('prerender-node').set('prerenderServiceUrl', 'http://service.prerender.io'));

  // app.get('/', function(req,res) {
  //   res.send("Hello from express - " + req.user + "!" );
  // });
  // app.use(auth.connect(basic));

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

