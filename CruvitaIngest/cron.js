var CronJob = require('cron').CronJob;
var async = require('async');
var Util = require('./util/util');

var homesDaily= new CronJob({
  cronTime: '00 0 1,8,16 * * *',
  onTick: function() {
    // Runs every day at 1:30:00 AM EST.
    console.log("Daily Ingest beginning...");
    console.log(new Date());
    async.series([function(homesCallback) {
      Util.launchProcess('homes', homesCallback);
    },function(removalCallback) {
      Util.launchProcess('homesRemoval', removalCallback);
    },function(siteMapCallback) {
      Util.launchProcess('autocompleteHomes', siteMapCallback);
    }], function() {
      console.log("Daily Ingest Complete");
    })
  },
  start: true,
  timeZone: "America/New_York"
});

var jobWeekly= new CronJob({
  cronTime: '00 0 1 * * 1',
  onTick: function() {
    // Runs every day at 1:30:00 AM EST.
    console.log("Daily Ingest beginning...");
    console.log(new Date());
    async.series([function(homesCallback) {
      Util.launchProcess('siteMap', homesCallback);
    }, function(reportCallback) {
      Util.launchProcess('reportHomesPerZip', reportCallback);
    }], function() {
      console.log("Daily Ingest Complete");
    })
  },
  start: true,
  timeZone: "America/New_York"
});

homesDaily.start();
jobWeekly.start();
