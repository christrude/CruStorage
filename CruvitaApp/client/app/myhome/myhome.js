'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('myhome', {
        parent: 'site',
        url: '/myhome',
        views: {
          'content@': {
            templateUrl: 'app/myhome/myhome.html',
            controller: 'MyhomeCtrl'
          }
        },
        reloadOnSearch: false
      });
  });
