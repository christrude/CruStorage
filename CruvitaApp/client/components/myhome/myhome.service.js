'use strict';

angular.module('cruvitaApp')
  .service('Myhome', function ($resource) {
		var myhome = $resource('/api/myhomes/:id', {}, {
    	create: {method: 'POST', isArray:false, headers:{'Content-Type':'application/json', 'Accept':'application/json' } }
		});

    return myhome;
    // AngularJS will instantiate a singleton by calling 'new' on this function
  });
