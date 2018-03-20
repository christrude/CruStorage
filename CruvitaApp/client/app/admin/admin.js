'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        parent: 'site',
        url: '/admin',
        views: {
          'content@': {
            templateUrl: 'app/admin/admin.html',
            controller: 'AdminCtrl'
          }
        }
      })
  });