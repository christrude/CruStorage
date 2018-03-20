var inside = require('point-in-polygon');
var _ = require('lodash');
var School = require('../school/schema');

exports.checkInside = function(inputSlug, inputPoint) {
	School.findOne({slug: inputSlug}, function(err, school) {
		var wkt = [];
		_.each(school.wkt, function(element) {
				wkt.push([element.latitude, element.longitude]);
		});
		if(inside([inputPoint.latitude, inputPoint.longitude], wkt)) {
			console.log(inputSlug + " : true");
    }
    else {
    	console.log(inputSlug + " : false");
    }
	})
}