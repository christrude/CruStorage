'use strict';

angular.module('cruvitaApp')
  .service('FilterModel', function (Config) {
		var service = {};

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
