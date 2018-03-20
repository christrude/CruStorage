var User = require('./schema');
var mongoose = require('mongoose');

mongoose.connect('mongodb://45.37.164.152/lsa');
mongoose.connection.on('error', function(err) {
    console.error('MongoDB error: %s', err);
});

var streamed = 0;
var finished = 0;
var done = false;

var checkIfDone = function() {
	if((streamed === finished) && done) {
		console.log("User Stream Ended");
		process.exit();
	}
	else {
		setTimeout(checkIfDone, 5000);
	}
}

checkIfDone();
var stream = User.find({'phone':{$exists:true}}).stream();
stream.on('data', function (user) {
	streamed++;
	user.phone = [user.phone];
	user.slug = (user.name.split(' ').join('-') + '-' + user.licenseNumber).toLowerCase();
	user.save(function() {
		finished++;
	});
}).on('error', function (err) {
  console.log(err);
}).on('close', function () {
	done = true;
});