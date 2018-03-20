'use strict';

angular.module('cruvitaApp')
  .service('School', function School($resource) {
  	var school = $resource('/api/schools/:id', {}, {
    	retrieve: {method: 'POST', isArray: false}
    });

    return school;
  });
