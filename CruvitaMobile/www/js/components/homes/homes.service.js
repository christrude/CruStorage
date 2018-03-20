'use strict';

angular.module('Cruvitamobile')
  .service('Homes', function Homes($resource) {

    var homes = $resource('http://localhost:9000/api/homes/:homeId', {}, {
    	retrieve: {method: 'POST', isArray:false}
    });

    return homes;
    // AngularJS will instantiate a singleton by calling "new" on this function
  });
