/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var fs = require('fs');
var config = require('./environment');
var User = require('../api/user/user.model');
var Token = require('../api/token/token.model');

User.create({
    role: 'admin',
    name: 'Admin',
    email: 'admin@cruvita.com',
    password: 'community1809',
    customSearches: [{
      label: 'My Virginia Search',
      queries: [{
        key: 'locations.city',
				must: true,
        values: [{
					level: 1,
					value: 'virginia-beach-va'
				},{
					level: 1,
					value: 'norfolk-va'
				}],
        queryType: 'or'
      },{
        key: 'listing.propertysubtype.0',
        values: [{
					level: 3,
					value: 'SINGLE FAMILY DETACHED'
				}],
        queryType: 'equals'
      },{
        key: 'listing.bedrooms.0',
        values: [{
					level: 2,
					value: 11
				}],
        queryType: 'gt'
      }]
    }]
  }, function() {
    console.log('finished populating users');
});


// Advertisement.find({}).remove(function() {
//   Advertisement.create({
//     company: 'Buy our stuff Inc.',
//     url:'http://www.buyourstuff.com',
//     paidInterests: {
//       zips: [22032, 22030]
//     }
//   }, function(err, doc) {
//     fs.readFile('server/images/advertisement.png', function (err, data) {
//       var code = doc._id.toString().hashCode();
//       if (err) throw err;
//       if(!fs.existsSync(config.imageLocation + (code % 10000).toString())) {
//         fs.mkdirSync(config.imageLocation + (code % 10000).toString());
//         fs.writeFile(config.imageLocation + (code % 10000).toString() + '/' + code.toString() + '.png', data);
//       }
//       else {
//         fs.writeFile(config.imageLocation + (code % 10000).toString() + '/' + code.toString() + '.png', data);
//       }
//     });
//   });
// });

Token.find({}).remove(function() {
  Token.create({
      expire: new Date(),
      refresh:'4k6us8i0odbso9aa7jkf2jd47',
      access:'2npqqwq6ym1x1q3ms1uvvsh7t'
    });
});