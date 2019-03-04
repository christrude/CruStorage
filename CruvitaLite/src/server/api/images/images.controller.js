'use strict';

var _ = require('lodash');
var Images = require('./images.model');
var url = require('url');
var fs = require('fs');
var config = require('../../config/environment');
var request = require('request');
var gm = require('gm');
var mkdirp = require('mkdirp');
var imageRequest = request.defaults({
  encoding: null, pool: {maxSockets: Infinity}, timeout: 20000
});

function getPhotoAndCache(path, firstIndex, url, callback) {
	imageRequest({url:url}, function (error, response, body) {
   	if (!error && response.statusCode === 200) {
			var extension = '';
			switch(response.headers['content-type']) {
				case 'image/jpeg':
				  extension = '.jpeg';
				  break;
			 	case 'image/png':
				  extension = '.png';
					break;
			 	case 'image/gif':
				  extension = '.gif';
					break;
				default:
				  extension = '.jpeg';
					break;
			}
			callback(body, true, extension);
      body = new Buffer(body, 'binary');
			
		  mkdirp(path, function (err) {
        fs.writeFile(path + '/original' + extension, body, function (err) {
					if(firstIndex) {
						gm(path + '/original' + extension).resize(300, 300).write(path + '/thumbnail' + extension, function (err) {});
					}
				});
			});
	  }
	  else {
			callback(null, false);
	  }
	});
}

// Get list of images
exports.index = function(req, res) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var code = query.hashed === 'true' ? query.url : query.url.replace( /[<>:"\/\\|?*]+/g, '' ).toString().trim();
  var type = query.contentType || 'jpeg';
  var extension = query.thumbnail ? '/thumbnail.' + type :  '/original.' + type;
	extension = query.userImage ? '.' + type : extension;
  var imageLocation = query.userImage ? config.userImageLocation : config.imageLocation;
	var path = imageLocation + (code.slice(-4)).toString() + '/' + code.toString();
  fs.readFile(path + extension, function(err,img) {
    if(err) {
			getPhotoAndCache(path, query.index === '0', query.url, function(newImage, success) {
				if(!success) {
		      fs.readFile("src/assets/images/homes_placeholder_small.png", function(err, defaultImg) {
		        res.writeHead(200, {'Content-Type': 'image/' + type });
		        res.end(defaultImg, 'binary');
		      })
				}
				else {
		      res.writeHead(200, {'Content-Type': 'image/' + type });
		      res.end(newImage, 'binary');
				}
			});
    }
    else {
      res.writeHead(200, {'Content-Type': 'image/' + type });
      res.end(img, 'binary');
    }
  });
};

// Get a single images
exports.show = function(req, res) {
  Images.findById(req.params.id, function (err, images) {
    if(err) { return handleError(res, err); }
    if(!images) { return res.send(404); }
    return res.json(images);
  });
};

// Creates a new images in the DB.
exports.create = function(req, res) {
  Images.create(req.body, function(err, images) {
    if(err) { return handleError(res, err); }
    return res.json(201, images);
  });
};

// Updates an existing images in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Images.findById(req.params.id, function (err, images) {
    if (err) { return handleError(res, err); }
    if(!images) { return res.send(404); }
    var updated = _.merge(images, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, images);
    });
  });
};

// Deletes a images from the DB.
exports.destroy = function(req, res) {
  Images.findById(req.params.id, function (err, images) {
    if(err) { return handleError(res, err); }
    if(!images) { return res.send(404); }
    images.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
