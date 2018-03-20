'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('rankings', {
        parent: 'site',
        url: '/rankings',
        views: {
          'content@': {
            templateUrl: 'app/rankings/rankings.html',
            controller: 'RankingsCtrl'
          }
        },
        reloadOnSearch: false
      })
  });
