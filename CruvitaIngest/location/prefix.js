var Location = require('./schema');
var Autocomplete = require('../autocomplete/ingest');

var ingested = 0;
var completed = 0;
var finished = false;
var stream;
var prefixes = [
	[
		{regex: /SAINT/i, word: 'SAINT'}, 
		{regex: /ST\./i, word: 'ST.'}, 
		{regex: /ST\s/i, word: 'ST '}
	]
];

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

String.prototype.titleize = function() {
    var string_array = this.split(' ');
    string_array = string_array.map(function(str) {
       return str.capitalize(); 
    });
    
    return string_array.join(' ');
}

function checkIfDone() {
	console.log('Added ' + completed + ' Prefixes');
	if(ingested === completed && finished) {
		console.log('Prefixes Finished.');
		process.exit();
	}
	else {
		setTimeout(function() {
			checkIfDone();
		}, 10000);
	}
}

function prefixFinished() {
	completed++;
	if(ingested <= (completed + 100)) {
		stream.resume();
	}
}

exports.ingest = function() {
	checkIfDone();
	_.each(prefixes, function(prefixList) {
		_.each(prefixList, function(prefix) {
			stream = Location.find({ dispName: {$regex: prefix.regex}}).stream();
			checkIfDone();
	
			stream.on('data', function(location) {
				_.each(prefixList, function(replaceWord) {
					if(replaceWord.word !== prefix.word) {
						ingested++;
						var newDispName = location.dispName.toUpperCase().replace(prefix.word, replaceWord.word).toLowerCase().titleize();
						Autocomplete.createNGrams({slug: location.slug, dispName: newDispName, count: location.count}, function() {
							prefixFinished();
						});
					}
				})
			});
	
			stream.on('end', function() {
				finished = true;
			});
		});
	});
}
