var Homes = require("../home/schema");
var User = require('../user/schema');
var async = require("async");
var dateFormat = require('dateformat');

var nodemailer = require('nodemailer');
 
// create reusable transporter object using the default SMTP transport 
var transporter = nodemailer.createTransport({
    host: 'smtp.cruvita.com', 
    port:587,
		auth: {
      user: 'info@cruvita.com',
      pass: 'Community1809!!'
    },            
    secure:false,
    tls: {rejectUnauthorized: false},
    debug:true
});

var data = 'Zip Code,Active,Inactive,Agent\n';

exports.ingest = function() {
	Homes.find().distinct("listing.address.postalcode", function(error, zips) {
		async.eachLimit(zips, 20, function(zip, zipCallback) {
			 async.parallel([
			 	 function(callback) {
					 Homes.count({"listing.address.postalcode": zip, status: {$ne: 'inactive'}}, function(err, count) {
						 callback(null, count);
				   })
			 	 },
			 	 function(callback) {
					 Homes.count({"listing.address.postalcode": zip, status: 'inactive'}, function(err, count) {
						 callback(null, count);
				   })
			 	 },
			 	 function(callback) {
					 User.findOne({"paidInterests.zips.zip": zip}, function(err, agent) {
					   callback(null, agent ? agent.email : '');
				   })
			 	 }
			 ], function(err, args) {
			   data += zip + ',' + args[0] + ',' + args[1] + ',' + args[2] + '\n';
				 zipCallback();
			 })
		 }, function(err) {
			 console.log('Finished processing zip codes');
			 if(err) {
			 	console.log(err)
			 }
	 
			// setup e-mail data with unicode symbols 
			var mailOptions = {
			    from: 'info@cruvita.com', // sender address 
			    to: 'ariel@cruvita.com', // list of receivers 
			    subject: 'Zip Code Snapshot For ' + dateFormat(new Date(), "mmmm dS, yyyy"), // Subject line 
	        attachments: [{'filename': 'attachment.csv', 'content': data}]
			};

			// send mail with defined transport object 
			transporter.sendMail(mailOptions, function(error, info){
			    if(error){
			        return console.log(error);
			    }
			    console.log('Message sent: ' + info.response);
			    process.exit();
			});
		 });
	});
}