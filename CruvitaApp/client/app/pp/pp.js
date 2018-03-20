'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('pp', {
        parent: 'site',
        url: '/pp',
        views: {
          'content@': {
            templateUrl: 'app/pp/pp.html',
            controller: 'PpCtrl'
          }
        }
      })
  });
