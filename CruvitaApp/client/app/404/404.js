'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('404', {
        parent: 'site',
        url: '/404',
        views: {
          'content@': {
            templateUrl: 'app/404/404.html',
            controller: '404Ctrl'
          }
        }
      })
  });
