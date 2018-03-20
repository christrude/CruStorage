'use strict';

angular.module('cruvitaApp')
  .service('Location', function ($resource) {
  	var location = $resource('/api/locations/:dispName', {}, {});

    return location;
  });
