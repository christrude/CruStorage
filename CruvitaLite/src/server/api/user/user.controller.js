'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');
var multiparty = require('multiparty');
var _ = require('lodash');
var fs = require('fs');
var url = require('url');
var uuid = require('node-uuid');
var Immutable = require('immutable');

var validationError = function(res, err) {
  return res.status(422).json(err);
};

/**
 * Search users
 * restriction: 'admin'
 */
exports.search = function(req, res) {
	var userQuery = {};
	_.each(req.body.queries, function(query) {
		if(query.partial) {
			userQuery[query.key] = {'$regex': new RegExp(query.value, 'i')};
		}
		else {
			userQuery[query.key] = query.value;
		}
	})
  User.find(userQuery, '-salt -hashedPassword', function (err, users) {
    if(err) return res.sendStatus(500, err);
    res.status(200).json(users);
  });
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.sendStatus(500, err);
    res.status(200).json(users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
	createSlug(newUser);
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var query = {_id: req.params.id};
  try {
    var validator = new ObjectId(req.params.id);
  }
  catch(err) {
    query = {slug: req.params.id};
  }
  User.findOne(query, function (err, user) {
    if (err) return next(err);
    if (!user) return res.sendStatus(401);
    res.json(user.profile);
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.sendStatus(500, err);
    return res.sendStatus(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(403);
    }
  });
};

var createSlug = function(user) {
	if(user.licenseNumber && user.name) {
		user.slug = user.name.split(' ').join('-') + '-' + user.licenseNumber;
	}
}

var addAPIKey = function(newUser) {
	var apiKeyObject = {};
	if(newUser.addAPIKey) {
		apiKeyObject.apiKey = {};
		_.each(newUser.addAPIKey, function(value, key) {
			apiKeyObject.apiKey[key] = {}
			apiKeyObject.apiKey[key].key = uuid.v4();
			apiKeyObject.apiKey[key].version = parseInt(value.version);
		})
	}
	return _.merge(newUser, apiKeyObject);
}

var updateUser = function(id, user, res) {
	user = addAPIKey(user);
	createSlug(user);
  User.findOneAndUpdate({_id:id}, user, {new:true}, function (err, doc) {
    if (err) { console.log('Update user', err); }
    if(!doc) { return res.sendStatus(404); }
    return res.status(200).json(doc);
  });
}

exports.update = function(req, res) {
  if(req.body.user && req.body.user._id) { delete req.body.user._id; }
  var form = new multiparty.Form();

  if(req.headers['content-type'].indexOf('multipart/form-data') !== -1) {
    form.parse(req, function(err, fields, files) {
			delete(fields['__v']);
      var userObject = fields;
      if (files.file) {
        var extension = files.file[0].headers['content-type'].split('/')[1];

        fs.readFile(files.file[0].path, function (err, data) {
          var code = Math.floor((Math.random() * 999999999999999) + 1);
          userObject.pictureLocation = code;
          userObject.pictureType = extension;
          if (err) throw err;
          if(!fs.existsSync(config.userImageLocation + (code % 10000).toString())) {
            fs.mkdir(config.userImageLocation + (code % 10000).toString(), function() {
              fs.writeFile(config.userImageLocation + (code % 10000).toString() + '/' + code.toString() + '.' + extension, data, function() {
                updateUser(req.params.id, userObject, res);
              });
            });
          }
          else {
            fs.writeFile(config.userImageLocation + (code % 10000).toString() + '/' + code.toString() + '.' + extension, data, function() {
              updateUser(req.params.id, userObject, res);
            });
          }
        });
      }
      else {
        updateUser(req.params.id, userObject, res);
      }
    });
  }
  else {
    updateUser(req.params.id, req.body.user, res);
  }
};

exports.validPassword = function(req, res, next) {
  var url_parts = url.parse(req.url, true);
  User.findOne({
    resetPassword: url_parts.query.resetPassword
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

exports.restorePassword = function(req, res, next) {
  var url_parts = url.parse(req.url, true);
  User.findOne({
    resetPassword: url_parts.query.resetPassword
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if(err) {
      return res.json(err);
    }
    else {
      user.resetPassword = null;
      user.password = url_parts.query.password;
      user.save(function(err, savedUser) {
        if (err) return next(err);
        if (!user) return res.json(401);
        res.json(user);
      })
    }
  });
}

exports.adAgentsCallback = function(callback, userParams, query) {
  if(userParams.length === 0) {
    userParams.push({'paidInterests.zips.zip':'99999999'});
  }
  query.or(userParams).exec(function (err, users) {
    callback(null, users);
  });
}
/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};
