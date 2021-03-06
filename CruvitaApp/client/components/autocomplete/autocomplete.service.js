'use strict';

angular.module('cruvitaApp')
  .service('Autocomplete', function ($rootScope, $http, Config, $state, $route, $resource, Homes, $timeout, $stateParams) {
  	String.prototype.capitalize = function() {
  		var returnString = '';
  		var split = this.split(' ');
  		angular.forEach(split, function(word, index) {
  			if(index !== 0) {
  				returnString += ' ';
  			}
  			word = word.toLowerCase();
  			returnString += word.charAt(0).toUpperCase() + word.slice(1);
  		});
	    return returnString;
		}

  	var service = {
  		search: function() {
  			if(angular.isArray(service.lastSelected)) {
  				service.getResults();
  			}
  			else {
  				service.autocomplete(service.locationSelected, service.getResults);
  			}
  		},
  		locationSelected: '',
    	autocomplete: function(val, callback) {
	      return $http.get('/api/autocomplete', {
	        params: {
	          nGram: val
	        }
	      }).then(function(res) {
	        var addresses = [];
	        service.lastRequested = val;
	        service.lastSelected = res.data;
	        angular.forEach(res.data, function(item) {
	          addresses.push( 
							'<div class="autocomplete-item">' +
							'<div><i>' + item.type.capitalize() + (item.type === 'home' ? '' : (' in ' + item.components.state)) + '</i></div>' +
							'<h4>' + item.dispName.capitalize() + '</h4>' + 
							'</div>'
						);
	        });
	        if(angular.isDefined(callback)) {
	        	callback();
	        }
	        return addresses;
	      });
	    },
	    resource: $resource('/api/autocomplete'),
	    lastSelected: {},
	    getRequest: function() {
	    	return _.filter(service.lastSelected, function(location){
	    		return location.dispName.toUpperCase() === service.locationSelected.toUpperCase();
	    	})[0] || service.lastSelected[0];
	    },
	    getResults: function() {
				_.each(service.lastSelected, function(item) {
					if(service.locationSelected.toString().indexOf(item.dispName.capitalize()) !== -1) {
						service.locationSelected = item.dispName;
					}	
				});
	    	var requestObject = service.getRequest();
	    	service.lastSelected = null;
	    	if(requestObject && requestObject.type === 'home') {
		    	$state.go('listing', {'homeId': requestObject.slug});
	    	}
	    	else if(requestObject && requestObject.type === 'school') {
					var typeSuffix = (_.invert(Config.locationTypes))[requestObject.type];
		    		$state.go('school', {'id': requestObject.slug})
		    	}
	    	else if (requestObject) {
					service.searching = true;
					var typeSuffix = (_.invert(Config.locationTypes))[requestObject.type];
      		var slugObject = requestObject.slug + '-' + typeSuffix;
      		$state.go('results', {'location': slugObject, 'NELAT': undefined, 'NELONG': undefined, 'SWLAT': undefined, 'SWLONG': undefined, 'zoom': undefined, 'anchor': undefined});
	    	}
	    	else {
	    		Homes.blankHome({address: service.locationSelected}, {}, function(response) {
		        if (response.slug) {
		    			$state.go('listing', {'homeId': response.slug});
		        } else {
		        	$state.go('results', {'location': slugObject, 'NELAT': undefined, 'NELONG': undefined, 'SWLAT': undefined, 'SWLONG': undefined, 'zoom': undefined, 'anchor': undefined});
							if($state.current.name === 'results') {
			      		$state.reload();
			      	}
		        }
		      });
	    	}
    	},
    	schoolsComponentMap: {
	  		city: 'supported.city',
	  		state: 'supported.state',
	  		county: 'address.county',
	  		zip: 'supported.zip',
	  		school: 'location',
	  		score: 'score.overall',
	  		locationcity: 'locations.city',
	  		locationstate: 'locations.state',
	  		locationcounty: 'locations.county',
	  		locationzip: 'locations.zip',
	  		latitude: 'coordinates.latitude',
	  		longitude: 'coordinates.longitude',
	  		edLevel: 'ed_level'
	  	},
	  	homesComponentMap: {
	  		elementary: 'schools.elementary',
	  		elementaryScore: 'schools.elementaryScore',
	  		middle: 'schools.middle',
	  		middleScore: 'schools.middleScore',
	  		high: 'schools.high',
	  		highScore: 'schools.highScore',
	  		city: 'listing.address.city',
	  		locationcity: 'locations.city',
	  		locationstate: 'locations.state',
	  		locationcounty: 'locations.county',
	  		locationzip: 'locations.zip',
	  		state: 'listing.address.stateorprovince',
	  		county: 'listing.location.county',
	  		zip: 'listing.address.postalcode',
	  		latitude: 'listing.location.latitude',
	  		longitude: 'listing.location.longitude',
    		rentPriceMin: 'listing.listprice',
    		rentPriceMax: 'listing.listprice',
    		priceMin: 'listing.listprice',
    		priceMax: 'listing.listprice',
    		bathMin: 'listing.bathrooms',
    		bedMin: 'listing.bedrooms',
    		sqFtMin: 'listing.livingarea',
    		sqFtMax: 'listing.livingarea',
    		lotMin: 'listing.lotsize',
    		lotMax: 'listing.lotsize',
    		yearMin: 'listing.yearbuilt',
    		yearMax: 'listing.yearbuilt',
    		listingDate: 'listing.listingdate',
    		updatedDate: 'listing.modificationtimestamp',
    		propertysubtype: 'listing.propertysubtype',
    		listingCategory: 'listing.listingcategory'
	  	}
    };
    return service;
  });
