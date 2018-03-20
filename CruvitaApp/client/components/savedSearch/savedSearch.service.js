'use strict';

angular.module('cruvitaApp')
  .service('SavedSearch', function Homes($resource) {

    var savedSearch = $resource('/api/savedSearch/:savedSearchId', {}, {});

    return savedSearch;
    // AngularJS will instantiate a singleton by calling 'new' on this function
  });
