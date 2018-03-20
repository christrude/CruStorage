var _ = require('lodash');

var fileLegible = function(input) {
  return input.replace(/[\|&;\$%@"<>\(\)\+]/g, "");
}

exports.fileLegible = fileLegible;
exports.launchProcess = function(ingestion, callback, options) {
  if(ingestion) {
    var spawn = require('child_process').spawn;
    var inputs = ['app.js', '--max-old-space-size=2048', 'ingest=' + ingestion];
    if(options) {
      inputs = inputs.concat(options);
    }
    var ls  = spawn('node', inputs);

    ls.stdout.on('data', function (data) {
      console.log(data.toString());
    });

    ls.stderr.on('data', function (data) {
      console.log('stderr: ' + data.toString());
    });

    ls.on('close', function (code) {
      console.log('Finished ' + ingestion + ': Code ' + code);
      ls.kill();
			if(code == null || code == 1) {
				process.exit();
			}
			else {
      	callback();
			}
    });
  }
}

function slugify(input) {
  return input ? fileLegible(input.toLowerCase().replace(/-/g,' ').replace(/[^\w ]+/g,'').replace(/ +/g,'-')) : null;
}

exports.createSlug = function(type, location) {
	var slug = null;
	switch(type) {
		case 'state':
			slug = slugify(stateMap[location.state]);
			break;
		case 'county':
			if(location.county) {
				var countyLabel = location.county.toLowerCase().indexOf('county') !== -1 ? '' : 'county';
				slug = slugify(location.county + ' ' + countyLabel + ' ' + location.state);
			}
			break;
		case 'zip':
      if(location.zip) {
  			slug = slugify(location.zip.substring(0,5) + ' ' + location.state);
      }
			break;
		case 'town':
		case 'city':
			slug = slugify(location.city + ' ' + location.state);
			break;
		case 'school':
			slugify(location.sch_name + ' ' + location.city + ' ' + location.state);
			break;
	}
	return slug;
}

exports.calculateViewport = function(object) {
  var northeastLat = [];
  var northeastLong = [];
  var southwestLat = [];
  var southwestLong = [];

  _.each(object.boundaries, function(boundary) {
    northeastLat.push(parseFloat(_.max(boundary.boundary.map((b) => parseFloat(b.latitude)))));
    northeastLong.push(parseFloat(_.max(boundary.boundary.map((b) => parseFloat(b.longitude)))));
    southwestLat.push(parseFloat(_.min(boundary.boundary.map((b) => parseFloat(b.latitude)))));
    southwestLong.push(parseFloat(_.min(boundary.boundary.map((b) => parseFloat(b.longitude)))));
  });

  object.viewport = {
    northeast: {
      latitude: northeastLat.length > 0 ? _.max(northeastLat) : null,
      longitude: northeastLong.length > 0 ? _.max(northeastLong) : null
    },
    southwest: {
      latitude: southwestLat.length > 0 ? _.min(southwestLat) : null,
      longitude: southwestLong.length > 0 ? _.min(southwestLong) : null
    }
  };
}

exports.launchScript = function(script, callback) {
  var spawn = require('child_process').spawn,
  ls  = spawn('sh',[script]);

  ls.stdout.on('data', function (data) {
    console.log(data.toString());
  });

  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  ls.on('close', function (code) {
    ls.kill();
    callback();
  });
}

var stateMap = {
  "AL": "Alabama",
  "AK": "Alaska",
  "AZ": "Arizona",
  "AR": "Arkansas",
  "CA": "California",
  "CO": "Colorado",
  "CT": "Connecticut",
  "DC": "Washington DC",
  "DE": "Delaware",
  "FL": "Florida",
  "GA": "Georgia",
  "HI": "Hawaii",
  "ID": "Idaho",
  "IL": "Illinois",
  "IN": "Indiana",
  "IA": "Iowa",
  "KS": "Kansas",
  "KY": "Kentucky",
  "LA": "Louisiana",
  "ME": "Maine",
  "MD": "Maryland",
  "MA": "Massachusetts",
  "MI": "Michigan",
  "MN": "Minnesota",
  "MS": "Mississippi",
  "MO": "Missouri",
  "MT": "Montana",
  "NE": "Nebraska",
  "NH": "New Hampshire",
  "NJ": "New Jersey",
  "NM": "New Mexico",
  "NY": "New York",
  "NC": "North Carolina",
  "ND": "North Dakota",
  "OH": "Ohio",
  "OK": "Oklahoma",
  "OR": "Oregon",
  "PA": "Pennsylvania",
  "RI": "Rhode Island",
  "SC": "South Carolina",
  "SD": "South Dakota",
  "TN": "Tennessee",
  "TX": "Texas",
  "UT": "Utah",
  "VT": "Vermont",
  "VA": "Virginia",
  "WA": "Washington",
  "WV": "West Virginia",
  "WI": "Wisconsin",
  "WY": "Wyoming"
};

exports.stateMap = stateMap;