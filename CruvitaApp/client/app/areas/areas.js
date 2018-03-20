'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('areas', {
        parent: 'site',
        url: '/areas',
        views: {
          'content@': {
            templateUrl: 'app/areas/areas.html',
            controller: 'AreasCtrl'
          }
        }
      })
  });
