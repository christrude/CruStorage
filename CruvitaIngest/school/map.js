/* Dependencies */
var async = require('async');
var _ = require('lodash');
var fs = require('graceful-fs');
var readline = require('readline');
var stream = require('stream');
var jf = require('jsonfile');
var School = require('./schema');
var mkdirp = require('mkdirp');
var Util = require('../util/util');
var Autocomplete = require('../autocomplete/ingest');
var parser = require('wellknown');
var locked_env = require('../app');

/* Globals */
var schoolTemp = 'tmp';
var currentFile;
var ingested = 0;
var registered = 0;
var finished = false;
var nationElemRanks = [];
var nationMiddleRanks = [];
var nationHighRanks = [];
var stateElemRanks = {};
var stateMiddleRanks = {};
var stateHighRanks = {};
var countyElemRanks = {};
var countyMiddleRanks = {};
var countyHighRanks = {};
var csvs = [{
	filename: './data/boundary/maponics_publicschools_wkt.txt',
	model: [
		{index:2, key: 'nces_schid'},
		{index:16, key: 'coordinates.latitude'},
		{index:17, key: 'coordinates.longitude'}
	],
	tempFile: 'coordinates',
	delimiter: '|'
},{
	filename: './data/education/2016.csv',
	model: [
		{index:0, key: 'nces_schid'},
		{index:1, key: 'score.overall'},
		{index:4, key: 'medianSaleValue'},
		{index:7, key: 'medianIncome.district'},
		{index:11, key: 'schoolDistrict'},
		{index:12, key: 'sch_name'},
		{index:13, key: 'phone'},
		{index:19, key: 'address.street'},
		{index:20, key: 'address.city'},
		{index:21, key: 'address.state'},
		{index:22, key: 'address.zip'},
		{index:24, key: 'schoolType.schoolType'},
		{index:30, key: 'address.county'},
		{index:32, key: 'fullTimeTeachers'},
		{index:33, key: 'gradeLow'},
		{index:34, key: 'gradeHigh'},
		{index:35, key: 'ed_level'},
		{index:36, key: 'titleOne'},
		{index:39, key: 'schoolType.magnet'},
		{index:40, key: 'schoolType.charter'},
		{index:41, key: 'schoolType.shared'},
		{index:42, key: 'schoolType.bies'},
		{index:43, key: 'freeLunch'},
		{index:44, key: 'redLunch'},
		{index:46, key: 'freeLunchP'},
		{index:44, key: 'redLunch'},
		{index:273, key: 'member'},
		{index:274, key: 'schoolDiversity.numAmInd'},
		{index:277, key: 'schoolDiversity.numAsian'},
		{index:280, key: 'schoolDiversity.numHisp'},
		{index:283, key: 'schoolDiversity.numBlack'},
		{index:286, key: 'schoolDiversity.numWhite'},
		{index:289, key: 'schoolDiversity.numPacific'},
		{index:292, key: 'schoolDiversity.numMulti'},
		{index:296, key: 'stRatio'},
		{index:298, key: 'website'},
		{index:299, key: 'langAch'},
		{index:300, key: 'mathAch'},
		{index:301, key: 'schoolGenders.male'},
		{index:302, key: 'schoolGenders.female'}
	],
	tempFile: 'universal',
	delimiter: ','
},{
	filename: './data/boundary/maponics_attendancezones_wkt.txt',
	model: [
		{index:1, key: 'nces_disid'},
		{index:2, key: 'nces_schid'},
		{index:7, type: 'boundary'}
	],
	tempFile: 'boundary',
	delimiter: '|'
}];

/* Logic */
function checkIfDone() {
	console.log(currentFile + ' : ' + ingested);
	setTimeout(function() {
		if(ingested === registered && finished) {
			if(currentFile === 'universal') {
				console.log("Calculating Ranks...");
				rankSchools();
			}
			else {
				process.exit();
			}
		}
		else {
			registered = ingested;
			checkIfDone();
		}
	}, 10000);
}

function pushRank(object) {
	var countyRanks, stateRanks, nationRanks;
	var rankObject = {nces_schid: object.nces_schid, score: parseFloat(object.score.overall)};
	switch(object.ed_level) {
		case '1':
			countyRanks = countyElemRanks;
			stateRanks = stateElemRanks;
			nationRanks = nationElemRanks;
			break;
		case '2':
			countyRanks = countyMiddleRanks;
			stateRanks = stateMiddleRanks;
			nationRanks = nationMiddleRanks;
			break;
		case '3':
			countyRanks = countyHighRanks;
			stateRanks = stateHighRanks;
			nationRanks = nationHighRanks;
			break;
		default:
			nationRanks = false;
			break;
	}

	if(nationRanks) {
		nationRanks.push(rankObject);
		if(!stateRanks[object.address.state]) {
			stateRanks[object.address.state] = [];
		}
		stateRanks[object.address.state].push(rankObject);
		if(!countyRanks[object.address.county]) {
			countyRanks[object.address.county] = [];
		}
		countyRanks[object.address.county].push(rankObject);
	}
}

function rankSchools() {
	var sortMap = {};
	/* BRUTE FORCE */
	var sorted = false;
	var sortFunction = function(objects) {
		objects = _.reject(objects, function(obj) {
			return obj.score === undefined || isNaN(obj.score);
		});
		objects.sort(function(a, b) {
			return a.score - b.score;
		});
		return objects;
	}

	var rankFunction = function(ranks, type) {
		ranks = sortFunction(ranks);
		_.each(ranks, function(rank, index) {
			_.set(sortMap, rank.nces_schid + '.rank.' + type + '.rank', index + 1);
			_.set(sortMap, rank.nces_schid + '.rank.' + type + '.total', ranks.length);
		});
	}

	/* County Ranks */
	_.each(countyElemRanks, function(countyObjects, county) {
		rankFunction(countyObjects, 'county');
	});
	_.each(countyMiddleRanks, function(countyObjects, county) {
		rankFunction(countyObjects, 'county');
	});
	_.each(countyHighRanks, function(countyObjects, county) {
		rankFunction(countyObjects, 'county');
	});

	/* State Ranks */
	_.each(stateElemRanks, function(stateObjects, state) {
		rankFunction(stateObjects, 'state');
	});
	_.each(stateMiddleRanks, function(stateObjects, state) {
		rankFunction(stateObjects, 'state');
	});
	_.each(stateHighRanks, function(stateObjects, state) {
		rankFunction(stateObjects, 'state');
	});

	/* Nation Ranks */
	rankFunction(nationElemRanks, 'nation');
	rankFunction(nationMiddleRanks, 'nation');
	rankFunction(nationHighRanks, 'nation');

	var keys = Object.keys(sortMap);
	async.eachLimit(keys, 20, function(nces_schid, callback) {
  	var writeObject = _.assign({nces_schid: nces_schid}, sortMap[nces_schid]);
		writeData(writeObject, 'rank', callback);
	}, function() {
		process.exit();
	})
}

function writeData(object, tempFile, callback) {
	if(object['nces_schid'] && (locked_env.app === 'production' || object['nces_schid'].substring(0,2) === '10')) {
		var ncesIdFolder = schoolTemp + '/chunk_' + (parseInt(object['nces_schid']) % 1) + '/' + object['nces_schid'].trim();
		mkdirp(ncesIdFolder, function(err) {
			if(!fs.existsSync(ncesIdFolder + '/' + tempFile + '.json')) {
				jf.writeFile(ncesIdFolder + '/' + tempFile + '.json', object, function() {
					if(tempFile === 'universal') {
						pushRank(object);
					}
					callback();
				});
			}
			else {
				callback();
			}
		});
	}
	else {
		callback();
	}
}

function boundaryParser(object, column) {
	object.wkt = [];
	var boundaries;
	try {
		boundaries = parser.parse(column).coordinates;
	} 
	catch(err) {
		boundaries = null;
	}
	if(boundaries) {
		_.forEach(boundaries, function(boundary) {
			var boundaryObject = {};
			boundaryObject.boundary = [];
			_.forEach(boundary, function(coord) {
				if(coord[0] instanceof Array) {
					_.forEach(coord, function(multiCoord){
						boundaryObject.boundary.push({latitude: multiCoord[1], longitude: multiCoord[0]});
					});
				}
				else {
					boundaryObject.boundary.push({latitude: coord[1], longitude: coord[0]});
				}
			});
			object.wkt.push(boundaryObject);
		});
	}
}

function lineReader(line, csv) {
	var object = {};
	var columns = line.split(csv.delimiter);
	_.each(csv.model, function(item) {
		if(item.type === 'boundary') {
			if(locked_env.app === 'production' || (object['nces_schid'] && object['nces_schid'].substring(0,2) === '10')) {
				boundaryParser(object, columns[item.index]);
			}
		}
		else {
			_.set(object, item.key, columns[item.index]);
		}
	});
	writeData(object, csv.tempFile, function() {
		ingested++;
	});
}

exports.ingest = function(file) {
	currentFile = file;
	checkIfDone();
	var csv = _.find(csvs, {tempFile: file});
	var firstLine = true;
	var instream = fs.createReadStream(csv.filename);
	var outstream = new stream();
	var rl = readline.createInterface(instream, outstream);
	rl.on('line', function(line) {
		if(!firstLine) {
			lineReader(line, csv);
		}
		else {
			firstLine = false;
		}
	})

	rl.on('close', function() {
		finished = true;
	})
}
