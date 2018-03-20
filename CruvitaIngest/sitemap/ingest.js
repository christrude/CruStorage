var Home = require('../home/schema');
var School = require('../school/schema');
var Location = require('../location/schema');
var rimraf = require('rimraf');
var fs = require('graceful-fs');
var _ = require('lodash');
var async = require('async');
var config = require('../config');
var locked_env = require('../app');

function writeFile(object) {
	if(!object.processing) {
		object.stream.pause();
		object.processing = true;
		fs.writeFile(config.siteMapLocation + object.type + '_sitemap_' + object.fileCount.toString() + '.xml' , object.urlString, function(err) {
	 		if(!object.finished) {
				object.stream.resume();
				object.urlString = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
				object.urlCount = 0;
				object.processing = false;
				object.fileCount++;
			}
			else {
				console.log(object.type + ' site map created');
				object.callback();
			}
		});	
	}
}

function urlBuilder(type, doc) {
	var url = '<url>\n<loc>';
	switch(type) {
		case 'school':
			url += 'https://www.cruvita.com/school/' + doc.slug;
			break;
		case 'home':
			url += 'https://www.cruvita.com/listing/' + doc.slug;
			break;
		case 'location':
			var suffix = '';
			switch(doc.type) {
				case 'school':
					switch(doc.schools.ed_level) {
						case '1':
							suffix = '-e';
							break;
						case '2':
							suffix = '-m';
							break;
						case '3':
							suffix = '-h';
							break;
						default:
							suffix = '-e';
							break;
					}
					break;
				case 'state':
					suffix = '-s';
					break;
				case 'county':
					suffix = '-y';
					break;
				case 'city':
					suffix = '-c';
					break;
				case 'zip':
					suffix = '-z';
					break;
			}
			url += 'https://www.cruvita.com/results?location=' + doc.slug + suffix;
			break;
	}
	return url + '</loc>\n<lastmod>' + formatDate() + '</lastmod>\n<changefreq>monthly</changefreq>\n<priority>' + (type === 'location' ? 0.5 : 1.0) + '</priority>\n</url>';
}

function formatDate() {
  var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function streamData(model, type, filters, callback) {
	var object = {
		stream: model.find(filters).stream(),
		urlString: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n',
		urlCount: 0,
		fileCount: 0,
		finished: false,
		type: type,
		callback: callback
	};
	object.stream.on('data', function (doc) {
		object.urlString += urlBuilder(object.type, doc) + '\n';
		object.urlCount++;
		if(object.urlCount >= 30) {
			object.urlString += '</urlset>';
			writeFile(object);
		}	
	}).on('error', function (err) {
	  console.log(err);
	}).on('close', function () {
		console.log(type + " site map stream ended");
		object.finished = true;
		object.urlString += '</urlset>';
		setTimeout(function() {
			writeFile(object);
		}, 10000);
	});
}

exports.ingest = function() {
	console.log('Beginning Sitemap Ingest');
	config = config[locked_env.app];
	rimraf(config.siteMapLocation, function() {
		fs.mkdirSync(config.siteMapLocation);
		async.parallel([function(homeCallback) {
        streamData(Home, 'home', {}, homeCallback);
  		}, function(schoolCallback) {
        streamData(School, 'school', {}, schoolCallback);
  		}, function(locationCallback) {
        streamData(Location, 'location', {type: {'$ne':'school'}}, locationCallback);
		}], function() {
			var xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
			var files = fs.readdirSync(config.siteMapLocation);
			_.each(files, function(file) {
				xmlString += '<sitemap>\n<loc>https://www.cruvita.com/sitemaps/' + file + '</loc>\n<lastmod>' + new Date().toISOString() + '</lastmod>\n</sitemap>\n';
			});
			xmlString += '</sitemapindex>';
			fs.writeFile(config.siteMapLocation + 'sitemap.xml', xmlString, function(err) {
				process.exit()
			});				
		})
	});
}