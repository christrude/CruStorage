var Home = require('./schema');
var _ = require('lodash');
var async = require('async');
_.mixin(require("lodash-deep"));

function updateChildren(multiple, callback) {
	async.each(multiple.multiple.children, function(child, childCallback) {
		Home.findOneAndUpdate({_id: child}, {multiple: {isChild: true, parent: multiple._id}}, function(err, home) {
		  if (err) {
		    console.log(err);
		  }
		  childCallback();
		});
	}, function() {
		callback();
	})
}

function updateParent(multipleListing, children) {
	multipleListing.ingestDate = _.max(_.map(children, 'ingestDate'));
	multipleListing.multiple = {
    children: _.map(children, '_id')
  };
	multipleListing.listing.listprice = _.uniq(_.map(children, 'listing.listprice.0'));
	multipleListing.listing.listingcategory = _.uniq(_.map(children, 'listing.listingcategory.0'));
	multipleListing.listing.propertysubtype = _.uniq(_.map(children, 'listing.propertysubtype.0'));
	multipleListing.listing.bedrooms = _.uniq(_.map(children, 'listing.bedrooms.0'));
	multipleListing.listing.bathrooms = _.uniq(_.map(children, 'listing.bathrooms.0'));
	multipleListing.listing.livingarea = _.uniq(_.map(children, 'listing.livingarea.0'));
	multipleListing.listing.lotsize = _.uniq(_.map(children, 'listing.lotsize.0'));
	multipleListing.listing.yearbuilt = _.uniq(_.map(children, 'listing.yearbuilt.0'));
	multipleListing.listing.listingdate = '';
}

exports.checkMultiples = function(home, callback) {
	//Figure out what to do with previous runs multiple listings
	if(_.get(home, 'listing.address.unitnumber.0') && _.get(home, 'listing.address.fullstreetaddress')) {
		Home.find().where('listing.address.stateorprovince').equals(home.listing.address.stateorprovince.toUpperCase())
			.where('listing.address.city').equals(home.listing.address.city.toUpperCase())
			.where('listing.address.postalcode').equals(home.listing.address.postalcode)
			.where('listing.address.fullstreetaddress').equals(home.listing.address.fullstreetaddress.toUpperCase())
			.where('slug').ne(home.slug)
			.exec(function(err, results) {
			if(results.length >= 1) {
				/* MULTIPLE FOUND */
				var multipleListing = {
					listing: {
						address: {}
					}
				};
			
				_.each(results, function(result) {
					if(_.get(result, 'multiple.children.0')) {
						/* Multiple Listing exists */
						multipleListing = result;
					}
				});
				
				updateParent(multipleListing, _.reject(results, {'_id': multipleListing._id}).concat([home]));
			
				if(multipleListing._id) {
					home.multiple = {
		        isChild: true,
		        parent: multipleListing._id
			    };
					multipleListing.save(function() {
						callback();
					});
				}
				else {
					multipleListing.listing.address = home.listing.address;
					Home.create(multipleListing, function (err, multiple) {
						if(err) {
							console.log(JSON.stringify(multipleListing));
							console.log(err);
						}
						updateChildren(multiple, callback);
	        });
				}
			}
			else {
				callback();
			}
		})
	}
	else {
		callback();
	}
}