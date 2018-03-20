'use strict';

angular.module('cruvitaApp')
  .service('Activity', function (Config, $rootScope, $resource) {

    var activityResource = $resource('/api/activity/:id', {}, {
      retrieve: {method: 'GET', isArray:false},
      search: {method: 'POST', url: '/api/activity/search', isArray:true},
      create: {method: 'POST', isArray:false},
    });

		return activityResource;
  });
