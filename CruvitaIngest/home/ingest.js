require("node-nice-console")(console);

var parseString = require('xml2js').parseString;
var _ = require('lodash');
_.mixin(require("lodash-deep"));
var fs = require('graceful-fs');
var async = require('async');
var mkdirp = require('mkdirp');
var zlib = require('zlib');
var request = require('request');

var Home = require('./schema');
var integrate = require('./integrate');
var Multiple = require('./multiple');
var config = require('../config');
var Post = require('./post');
var Util = require('../util/util');
var locked_env = require('../app');

var inserted = 0;
var started = 0;
var finishedHomes = 0;
var finished = false;
var csvString = 'ListingKey,Status,URL,Message,Timestamp\n';
var startDate, stream;
var filename = 'startTime.txt';
var downloadedFile = 'downloadedHomes.xml';

function compressedRequest(options, outStream) {
  var req = request(options);

  req.on('response', function (res) {
    if (res.statusCode !== 200) {
    	throw new Error('Status not 200');
    }
   	res.pipe(zlib.createGunzip()).pipe(outStream);
  });

  req.on('error', function(err) {
    console.log(err);
		console.log("Home Stream Errored Out. Killing ingest now.");
		process.exit();
  });

  req.on('end', function() {
  	console.log("Home Stream Finished");
  });
};

function handleFragment(fragment, inputFile) {
	fs.writeFileSync('fragments/' + (inserted === 0 ? 'last' : 'first') + inputFile, fragment);
}

function streamXml(inputFile) {
	var saxStream = require("sax").createStream(false, {lowercasetags:true, trim:true});
	saxStream.on("error", function (e) {
	  console.error("error!", e);
	  this._parser.error = null;
	  this._parser.resume();
	});

	var listing = null;
	var useAttribute = false;
	saxStream.on("opentag", function (tag) {
		if(tag.name === 'propertysubtype') {
			useAttribute = true;
		}
		else {
			useAttribute = false;
		}
		if (tag.name !== "listing" && !listing) {
			return;
		}
		if(tag.name === "listing") {
			if(listing) {
				started++;
				manageStream();
		  	parseString(listing, function (err, result) {
					if(err || (locked_env.app === 'development' && !(result && result.listing.address[0].postalcode)) || (locked_env.app === 'development' && result.listing.address[0].postalcode[0] !== '27587')) {
						// listhubCSV('ERROR',listing, err);
						// console.log(err);
						// handleFragment(listing, inputFile);
						inserted++;
						manageStream();
						listing = '';
					}
					else {
						storeJSON(result);
					}
				});
		  }
			listing = '';
		}
		listing += '<' + escape(tag.name.replace(/commons:/g,'').replace(/-/g,'')) + '>';
	});
	
	saxStream.on("text", function (text) {
		if(!useAttribute || text !== 'Other') {
		  listing += text.replace(/[\n\r]/g, '\\n').replace(/&/g,"&amp;").replace(/-/g,"&#45;").replace(/</g,'&lt;').replace(/>/g,'&gt;');
		}
	});

	saxStream.on("attribute", function(attr) {
		if(useAttribute) {
			listing += attr.value.replace(/[\n\r]/g, '\\n').replace(/&/g,"&amp;").replace(/-/g,"&#45;").replace(/</g,'&lt;').replace(/>/g,'&gt;');
		}
	})

	saxStream.on("error", function(err) {
		// handleFragment(listing, inputFile);
	});

	saxStream.on("closetag", function (tagName) {
	  listing += '</' + escape(tagName.replace(/commons:/g,'').replace(/-/g,'')) + '>';
	});
	
	stream = fs.createReadStream(inputFile)
	stream.pipe(saxStream);
	stream.on('end', function() {
		finished = true;
	});
}

function listhubCSV(status, home, message) {
	var listingkey = _.get(home, 'listing.listingkey') || home.substring(home.lastIndexOf("<listingkey>")+1,home.lastIndexOf("</listingkey>")).replace('listingkey>', '');
	fs.appendFile(getListhubFileName(), listingkey + ',' + status + ',' + 'www.cruvita.com/listing/' + home.slug + ',' + message.replace(/(\r\n|\n|\r)/gm,"") + ',' + new Date().toISOString() + '\n');
}

function reformat(home) {
	if(home.listing.listingkey) {
		home.listing.listingkey = home.listing.listingkey[0];
	}
	if(home.listing.listingcategory) {
		home.listing.listingcategory = home.listing.listingcategory[0].toUpperCase();
	}
	if(home.listing.address) {
		home.listing.address = home.listing.address[0];
		home.listing.address.city = home.listing.address.city ? home.listing.address.city[0] : undefined;
		home.listing.address.stateorprovince = home.listing.address.stateorprovince ? home.listing.address.stateorprovince[0] : undefined;
		home.listing.address.postalcode = home.listing.address.postalcode ? home.listing.address.postalcode[0].substring(0,5) : undefined;
		home.listing.address.fullstreetaddress = home.listing.address.fullstreetaddress ? home.listing.address.fullstreetaddress[0] : undefined;
		var components = {
			state: home.listing.address.stateorprovince,
			city: home.listing.address.city,
			zip: home.listing.address.postalcode
		}
		home.locations = {
			state: Util.createSlug('state', components),
			zip: Util.createSlug('zip', components),
			city: Util.createSlug('city', components)
		};
	}
	if(home.listing.location) {
		home.listing.location = home.listing.location[0];
		home.listing.location.county = _.get(home.listing.location, 'county.0');
		home.locations.county = Util.createSlug('county', {county: home.listing.location.county, state: home.listing.address.stateorprovince})
		home.listing.location.latitude = home.listing.location.latitude ? parseFloat(home.listing.location.latitude[0]) : undefined;
		home.listing.location.longitude = home.listing.location.longitude ? parseFloat(home.listing.location.longitude[0]) : undefined;
	}
	if(home.listing.listingdate && home.listing.listingdate[0]) {
		//Do Nothing
	}
	else if(home.listing.modificationtimestamp && home.listing.modificationtimestamp[0]) {
		home.listing.listingdate = home.listing.modificationtimestamp;
	}
	else {
		home.listing.listingdate = [new Date()];
	}
}

function storeJSON(result) {
	reformat(result);
	result.slug = result.listing.address.fullstreetaddress + ' ' + result.listing.address.city + ' ' + result.listing.address.stateorprovince + ' ' + result.listing.address.postalcode;
	result.slug = slugify(result.listing.address.unitnumber && result.listing.address.unitnumber[0] ? result.slug + ' unit ' + result.listing.address.unitnumber[0] : result.slug);
	Home.findOne({slug: result.slug}).exec(function(err, foundHome) {
		if(foundHome) {
			result._id = foundHome._id;
			result.status = 'active';
			foundHome.status = 'active';
		}
		result.ingestDate = new Date().getTime();
		if(!foundHome || (new Date(result.listing.modificationtimestamp[0]).getTime() > new Date(foundHome.listing.modificationtimestamp[0]).getTime()) || config.forceHomeUpdate) {
			listhubCSV('SUCCESS', result, 'Create/Updated this record');
			result.cruvitaDate = foundHome ? foundHome.cruvitaDate : new Date();
			processHome(result);
		}
		else if(foundHome) {
			foundHome.ingestDate = result.ingestDate;
			foundHome.listing.listingcategory = foundHome.listing.listingcategory.toUpperCase();
			foundHome.save(function() {
				inserted++;
				manageStream();
			});
		}
	});
}

function checkIfDone(inputFolder) {
	console.log('Homes Ingested: ' + inserted.toString());
	setTimeout(function() {
		if(finished && finishedHomes === inserted) {
			fs.unlink(inputFolder, function() {
				console.log(inputFolder + ' has finished processing');
				process.exit();
			});
		}
		else {
			finishedHomes = inserted;
			checkIfDone(inputFolder);
		}
	}, 10000);
}

function manageStream() {
	if((started - inserted) >= 1) {
		stream.pause();
	}
	else {
		process.nextTick(function() {
			stream.resume();
		});
	}
}

function reduce() {
	var folders = ['aa','ab','ac','ad','ae','af','ag','ah','ai','aj'];
	async.each(folders.slice(0, config.homes.parallelProcesses), function(folder, callback) {
		Util.launchProcess('homesReducer', callback, 'folder=split'+folder);
	}, function() {
		if(locked_env.app === 'development') {
			console.log("Homes Ingest Complete");
			process.exit();
		}
		else {
			fs.unlink(downloadedFile, function() {
				fs.writeFileSync(filename, startDate.getTime());
				console.log("Homes Ingest Complete");
				process.exit();
			});
		}
	})
}

function createHome(result, callback) {
	if(result.listing.location && result.listing.location.latitude && result.listing.location.longitude) {
		result.listing.location.coordinates = [result.listing.location.latitude,result.listing.location.longitude];
	}
	if(result._id) {
		Home.findOneAndUpdate({_id:result._id}, result, { runValidators: true }, function() {
			callback();
		});
	}
	else {
		Home.create(result, function (err, home) {
			if(err) {
				console.log(err);
			}
		  callback();
	  });
	}
}

function processHome(home) {
	async.series([
		function(callback) {
			Post.ingest(home, callback);
		},
		function(callback) {
			integrate.ingest(home, callback);
		},
		function(callback) {
			createHome(home, callback);
		}
		// function(callback) {
// 			Multiple.checkMultiples(createdHome, callback);
// 		}
	], function() {
		home = null;
		inserted++;
		manageStream();
	});
}

function getListhubFileName() {
	var d = new Date();
	var curr_day = d.getDate();
	var curr_month = d.getMonth();
	curr_month = (curr_month + 1).toString();
  	if (curr_month <= 9){
		curr_month = '0' + curr_month;
	}
	if (curr_day <= 9){
		curr_day = '0' + curr_day;
	}
	var curr_year = d.getFullYear();
	return config.errorFileLocation + "listing_status_" + curr_year + "-" + curr_month + "-" + curr_day + ".csv";
}

function createListhubFile() {
	fs.exists(getListhubFileName(), function (exists) {
    if(exists) {
			fs.writeFile(getListhubFileName(), csvString);
		}
	});
}

exports.reducer = function(inputFolder) {
	config = config[locked_env.app];
	streamXml(inputFolder);
	checkIfDone(inputFolder);
	manageStream();
}

function slugify(input) {
  return Util.fileLegible(input.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-'));
}

function splitDownload() {
	var spawn = require('child_process').spawn;
  var ls  = spawn('split', ['-b', Math.ceil(fs.statSync(downloadedFile)["size"]/config.homes.parallelProcesses), downloadedFile, 'split']);

  ls.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  ls.on('close', function (code) {
		console.log('Download Split!');
    reduce();
  });
}

exports.ingest = function(doneFunction) {
	config = config[locked_env.app];
	startDate = new Date();
	console.log('Ingesting Homes...');
	var options = {
	  url : "https://feeds.listhub.com/pickup/cruvita/cruvita.xml.gz",
	  auth: {
	  	user: 'cruvita',
	  	pass: 'UbV92it'
	  },
	  headers: {
		  "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
		  "accept-language" : "en-US,en;q=0.8",
		  "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
		  "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
		  "accept-encoding" : "gzip,deflate",
		}
	};
	
	createListhubFile();
	var downloadWriteStream = fs.createWriteStream(downloadedFile);
	downloadWriteStream.on('finish', function() {
		console.log('Download Finished');
		splitDownload();
	});

	compressedRequest(options, downloadWriteStream);
};
