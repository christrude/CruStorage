/**
 * Main application routes
 */

'use strict';
var errors = require('./components/errors');
var User = require('./api/user/user.model');
var uuid = require('node-uuid');

var sendEmail = function(template, email, app, res) {
  app.mailer.send(template, email, function (err) {
    if (err) {
      // handle error
      console.log(err);
      res.send('There was an error sending the email');
      return;
    }
    res.send('Email Sent');
  });
}

module.exports = function(app) {

  // Insert routes below
  app.use('/api/savedSearch', require('./api/savedSearch'));
  app.use('/api/comments', require('./api/comment'));
  app.use('/sitemaps', require('./api/sitemap'));
  app.use('/api/locations', require('./api/location'));
  app.use('/api/autocomplete', require('./api/autocomplete'));
  app.use('/api/images', require('./api/images'));
  app.use('/api/schools', require('./api/school'));
  app.use('/api/tokens', require('./api/token'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/activity', require('./api/activity'));

  app.use('/auth', require('./auth'));

  /* Email API */
  app.post('/api/email', function (req, res, next) {
    var email = req.body;
    var template = email.type || 'email';
    if(template === 'resetPassword') {
      User.findOne({email: email.email}, function(err, user) {
        if(user) {
          user.resetPassword = uuid.v4();
          user.save(function(err,saved) {
            console.log(err);
            console.log(saved);
          });
          email.to = email.email;
          email.resetPassword = user.resetPassword;
          sendEmail(template, email, app, res);
        }
        else {

        }
      })
    }
    else {
      sendEmail(template, email, app, res);
    }
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function(req, res) {
      res.sendfile(app.get('appPath') + '/index.html');
    });
};
