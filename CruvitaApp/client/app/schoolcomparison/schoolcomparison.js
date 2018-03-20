'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('schoolcomparison', {
        parent: 'site',
        url: '/schoolcomparison?address',
        views: {
          'content@': {
            templateUrl: 'app/schoolcomparison/schoolcomparison.html',
            controller: 'SchoolcomparisonCtrl'
          }
        },
        reloadOnSearch: false
      });;
  });