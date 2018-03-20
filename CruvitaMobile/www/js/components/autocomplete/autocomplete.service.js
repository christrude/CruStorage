'use strict';

angular.module('Cruvitamobile')
  .service('Autocomplete', function Homes($resource) {

    var service = {};
		
		service.input = '';
		service.resource = $resource('http://localhost:9000/api/autocomplete', {}, {
    	retrieve: {method: 'GET', isArray:true}
		});

    return service;
  });
