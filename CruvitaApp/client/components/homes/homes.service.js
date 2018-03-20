'use strict';

angular.module('cruvitaApp')
  .service('Homes', function Homes($resource) {

    var homes = $resource('/api/homes/:homeId', {}, {
    	retrieve: {method: 'POST', isArray:false},
			schools: {method: 'GET', url: '/api/homes/schools'},
			blankHome: {method: 'POST', url: '/api/homes/blankHome', isArray:false},
    });

    return homes;
    // AngularJS will instantiate a singleton by calling 'new' on this function
  });
