'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('tos', {
        parent: 'site',
        url: '/tos',
        views: {
          'content@': {
            templateUrl: 'app/tos/tos.html',
            controller: 'TosCtrl'
          }
        }
      })
  });
