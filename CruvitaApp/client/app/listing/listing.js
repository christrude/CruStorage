'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('listing', {
        parent: 'site',
        url: '/listing/:homeId?unit',
        views: {
          'content@': {
            templateUrl: 'app/listing/listing.html',
            controller: 'ListingCtrl'
          }
        },
        reloadOnSearch: false
      });
  });
