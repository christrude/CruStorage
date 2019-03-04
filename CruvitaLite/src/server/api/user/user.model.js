'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');

var authTypes = ['github', 'twitter', 'facebook', 'google'];

var UserSchema = new Schema({
  name: String,
  bio: String,
  phone: [ String ],
	slug: String,
  website: String,
  licenseNumber: String,
  state: String,
  email: { type: String, lowercase: true, unique : true },
  agentType: {
    type: String,
    enum: ['realtor', 'mortgage']
  },
  realtyName: String,
  resetPassword: String,
	apiKey: {
		schoolFinder: {
			key: String,
			version: Number
		}
	},
  paidInterests: {
    zips: [
      {
        zip: String,
        amount: String,
        paidThrough: String,
        searchImpressions: {
          total: Number,
          impressions: [{
            date: Date
          }]
        },
        directImpressions: {
          total: Number,
          impressions: [{
            date: Date
          }]
        },
        leads: {
          total: Number,
          impressions: [{
            date: Date
          }]
        }
      }
    ]
  },
  social: {
    facebook: String,
    linkedin: String,
    google: String,
    twitter: String,
    remarketing: [String]
  },
  customSearches: [{ type: Schema.Types.ObjectId, ref: 'Myhome' }],
  role: {
    type: String,
    default: 'user'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive']
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  pictureType: String,
  pictureLocation: String
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      '_id': this._id,
      'name': this.name,
      'bio': this.bio,
      'phone': this.phone,
      'website': this.website,
      'state': this.state,
      'licenseNumber': this.licenseNumber,
      'agentType': this.agentType,
      'email': this.email,
      'realtyName': this.realtyName,
      'status': this.status,
      'paidInterests': this.paidInterests,
      'pictureType': this.pictureType,
      'pictureLocation': this.pictureLocation,
      'social': this.social
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

UserSchema.index({ 'slug': 1 });
module.exports = mongoose.model('User', UserSchema);
