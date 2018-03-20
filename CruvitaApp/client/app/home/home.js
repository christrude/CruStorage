'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        parent: 'site',
        url: '/',
        views: {
          'content@': {
            templateUrl: 'app/home/home.html',
            controller: 'HomeCtrl'
          }
        }
      });
  });
