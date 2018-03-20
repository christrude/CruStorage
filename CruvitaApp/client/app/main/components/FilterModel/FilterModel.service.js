'use strict';

angular.module('cruvitaApp')
  .service('FilterModel', function (Config) {
		var service = {};
		
    service.defaultHomeFilters = {
      sqFtMin: {value: null, type: 'min', key: 'listing.livingarea'},
      sqFtMax: {value: null, type: 'max', key: 'listing.livingarea'},
      lotMin: {value: null, type: 'min', key: 'listing.lotsize'},
      lotMax: {value: null, type: 'max', key: 'listing.lotsize'},
      yearMin: {value: null, type: 'min', key: 'listing.yearbuilt'},
      yearMax: {value: null, type: 'max', key: 'listing.yearbuilt'},
      propertysubtype: {value: null, type: 'or', key: 'listing.propertysubtype'},
      listingCategory: Config.advancedHomeFilters.listingCategory.options[0]
    };
		
		/* Create default filters so the url does not need to maintain state of all of them */
    service.defaultSchoolFilters = {
      edLevel: Config.advancedSchoolFilters.edLevel.options[0]
    };
		
		/* Or Filters must be handled separately */
    service.orFilters = {
      propertysubtype: {}
    };
		
		return service;
  });
