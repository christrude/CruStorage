'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('sales', {
        parent: 'site',
        url: '/sales',
        views: {
          'content@': {
            templateUrl: 'app/sales/sales.html',
            controller: 'SalesCtrl'
          }
        }
      })
  });
