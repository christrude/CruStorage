var Homes = require('../home/schema');
var SavedSearch = require('./schema');

var _ = require('lodash');
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

var started = 0;
var completed = 0;
var finished = false;
var checkIfDone = function() {
  if(started == completed && finished) {
    process.exit();
  }
  else {
    setTimeout(function(){
      checkIfDone();
    }, 5000);
  }
}

var queryBuilder = function(queries, homeQuery) {
  _.each(queries, function(query) {
    if(query.value || query.min) {
      switch(query.type) {
        case 'equals':
          if(!query.caseSensitive && query.value) {
            query.value = query.value.toUpperCase();
          }
          homeQuery.where(query.key).equals(query.value);
          break;
        case 'range':
          homeQuery.where(query.key).gte(parseFloat(query.min)).lte(parseFloat(query.max));
          break;
        case 'min':
          homeQuery.where(query.key).gte(parseFloat(query.value))
          break;
        case 'max':
          homeQuery.where(query.key).lte(parseFloat(query.value))
          break;
        case 'or':
          var orArray = [];
          _.each(query.value, function(value) {
            var orFilter = {};
            orFilter[query.key] = value;
            orArray.push(orFilter);
          });
          homeQuery.or(orArray);
          break;
        case 'address':
          var parsed = parser.parseLocation(query.value);
          var address = '';
          var streetComponents = ['number', 'prefix', 'street', 'type'];
          _.each(streetComponents, function(component) {
            if(parsed[component]) {
              if(address !== '') {
                address += ' ';
              }
              address += parsed[component];
            }
          });
          homeQuery.where('listing.address.fullstreetaddress').equals(address.toUpperCase().replace(' CT',' COURT').replace(' DR',' DRIVE').replace(' RD',' ROAD').replace(' SQ',' SQUARE').replace(' ST',' STREET'));
          if(parsed.city) {
            homeQuery.where('listing.address.city').equals(parsed.city.toUpperCase());
          }
          if(parsed.state) {
            homeQuery.where('listing.address.stateorprovince').equals(parsed.state.toUpperCase());
          }
          if(parsed.zip) {
            homeQuery.where('listing.address.postalcode').equals(parsed.zip);
          }
          break;
        default:
          break;
      }
    }
  });
}

exports.ingest = function() {
  var savedSearchStream = SavedSearch.find({}).stream();
  checkIfDone();
  savedSearchStream.on("data", function(savedSearch) {
    started++;
    if(savedSearch.queries) {
      var lastRanDate = savedSearch.lastRanDate || new Date(0);
      var homeQuery = Homes.find().where('listing.listingdate').gt(savedSearch.lastRanDate || new Date(0));
      queryBuilder(savedSearch.queries, homeQuery);
      homeQuery.limit(10).exec(function(err, homes) {
        /* Email homes to savedSearch.email */
        if(homes.length > 0) {

          // setup e-mail data with unicode symbols 
          var mailOptions = {
            from: 'info@cruvita.com', 
            to: savedSearch.email,
            subject: "Your saved search from cruvita",
            html: 'www.cruvita.com' + savedSearch.url + (savedSearch.lastRanDate ? ('&listingDate=hm:' + lastRanDate.toISOString()) : '') + '<br><br>' + homes.map((home) => 'www.cruvita.com/listing/' + home.slug).join('<br>'),
          };

          // send mail with defined transport object 
          transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
            var lastRanDate = new Date();
            if(savedSearch.frequency) {
              lastRanDate.setDate(lastRanDate.getDate() + savedSearch.frequency);
            }
            savedSearch.lastRanDate = lastRanDate;
            savedSearch.save(function() {
              completed++;
            });
          });
        }
        else {
          completed++;
        }
      });
    } else {
      completed++;
    }
  }).on('error', function (err) {
    console.log(err);
  }).on('close', function () {
    finished = true;
  });
};
