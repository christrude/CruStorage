'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('profile', {
        parent: 'site',
        url: '/profile/:slug',
        views: {
          'content@': {
            templateUrl: 'app/profile/profile.html',
            controller: 'ProfileCtrl'
          }
        }
      })
  });
