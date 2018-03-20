var mongoose = require('mongoose');
var args = {};
// Command line arguments
process.argv.forEach(function (val) {
  var argSplit = val.split('=');
  if(argSplit.length > 1) {
      args[argSplit[0]] = argSplit[1];
  }
});

mongoose.connect('mongodb://localhost/lsa');
mongoose.connection.on('error', function(err) {
    console.error('MongoDB error: %s', err);
});

var streamed = 0;
var finished = 0;
var done = false;

function checkIfDone() {
	console.log(finished + " " + args.model + " items massaged")
	if((streamed === finished) && done) {
		console.log(args.model + " stream ended");
		process.exit();
	}
	else {
		setTimeout(checkIfDone, 5000);
	}
}

function ingest(model, query, callback) {
	console.log("Started " + args.model + " Massage")
	checkIfDone();
	var stream = model.find(query).stream();
	stream.on('data', function (item) {
		streamed++;
		callback(item);
		item.save(function() {
			finished++;
		});
	}).on('error', function (err) {
	  console.log(err);
	}).on('close', function () {
		done = true;
	});	
}

if(args.model === 'activity') {
  ingest(require('./activity/schema'), {}, function(activity) {
		if(activity.zip) {
	  	activity.zip = activity.zip.substring(0,5);
		}
  });
}
else {
	console.log('Not a valid model');
	process.exit();
}