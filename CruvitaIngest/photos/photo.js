var fs = require('fs'),
    request = require('request'),
    async = require('async'),
    gm = require('gm'),
		mkdirp = require('mkdirp'),
    Common = require('../node_modules/CruvitaServerCommon/index');
		_ = require('lodash'),
    imageRequest = request.defaults({
		  encoding: null, pool: {maxSockets: Infinity}, timeout: 20000
		});

_.mixin(require("lodash-deep"));


function storeTimestamp(directory) {
	fs.writeFile(directory + '/' + (new Date()).getTime().toString() + '.txt', '', function() {});
}
exports.ingest = function(result, retries, callback) {
	if(_.deepGet(result, 'listing.photos.0.photo.0.mediaurl.0')) {
		Common.photo.getPhoto(result.listing.photos[0].photo[0].mediaurl[0], true, retries, 'images/', function(photo, success, type) {
			if(success) {
				photo.type = type.substring(1);
			}
			callback();
		}, result);
	}
	else {
		callback();
	}
}

exports.updateTimestamps = function(home) {
	if(_.deepGet(home, 'listing.photos.0.photo')) {
		_.each(home.listing.photos[0].photo, function(photo, photoCallback) {
			var hashCode = photo.mediaurl[0].replace( /[<>:"\/\\|?*]+/g, '' );
			var directory = 'images/' + (hashCode.slice(-4)).toString() + '/' + (hashCode.toString());
			mkdirp(directory, function(err) { 
				fs.readdir(directory, function(err,files) {
					var timestampFiles = _.filter(files, function(file) {
				  	return file.indexOf('.txt') !== -1;
					});
					if(timestampFiles.length > 0) {
						fs.unlink(directory + '/' + timestampFiles[0], function(){
							storeTimestamp(directory);
						})
					}
					else {
						storeTimestamp(directory);
					}
				});
			})
		})	
	}
}