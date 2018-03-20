'use strict';

var _ = require('lodash');
var Myhome = require('./myhome.model');
var config = require('../../config/environment');
var Homes = require('../homes/homes.model');

var launchProcess = function(ingestion, callback, options) {
  if(ingestion) {
    var spawn = require('child_process').spawn;
    var inputs = [config.boundaryLocation + 'app.js', '--max-old-space-size=2048', 'ingest=' + ingestion];
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

// Get list of myhomes
exports.index = function(req, res) {
  Myhome.find(function (err, myhomes) {
    if(err) { return handleError(res, err); }
    return res.json(200, myhomes);
  });
};

// Get a single myhome
exports.show = function(req, res) {
  Myhome.findById(req.params.id, function (err, myhome) {
    if(err) { return handleError(res, err); }
    if(!myhome) { return res.send(404); }
		Homes.find({'slug': {'$in': myhome.results.homes.map((home) => home.slug)}}).lean().exec(function(err, homes) {
			homes.forEach(function(home, index) {
				home.score = myhome.results.homes[index].score;
			});
    	return res.json({
    		homes: {
    			count: homes.length,
					current: 1,
					options: {
						perPage: 100
					},
					results: homes
    		},
				viewport: myhome.results.viewport
    	});
		});
  });
};

// Creates a new myhome in the DB.
exports.create = function(req, res) {
  Myhome.create(req.body, function(err, myhome) {
		if(err) { return handleError(res, err); }
		var callback = function() {
	    if(!myhome) { return res.send(404); }
	    return res.json(myhome);
		}
    launchProcess('myhome', callback, 'myhome='+myhome._id);
  });
};

// Updates an existing myhome in the DB.
exports.update = function(req, res) {
  if(req.body._id) { delete req.body._id; }
  Myhome.findById(req.params.id, function (err, myhome) {
    if (err) { return handleError(res, err); }
    if(!myhome) { return res.send(404); }
    var updated = _.merge(myhome, req.body);
    updated.save(function (err) {
      if (err) { return handleError(res, err); }
      return res.json(200, myhome);
    });
  });
};

// Deletes a myhome from the DB.
exports.destroy = function(req, res) {
  Myhome.findById(req.params.id, function (err, myhome) {
    if(err) { return handleError(res, err); }
    if(!myhome) { return res.send(404); }
    myhome.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
};

function handleError(res, err) {
	console.log(err);
  return res.send(500, err);
}