'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('learn', {
        parent: 'site',
        url: '/learn',
        views: {
          'content@': {
            templateUrl: 'app/about/about.html',
            controller: 'AboutCtrl'
          }
        }
      })
  });
