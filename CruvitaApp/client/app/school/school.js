'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('school', {
        parent: 'site',
        url: '/school/:id',
        views: {
          'content@': {
            templateUrl: 'app/school/school.html',
            controller: 'SchoolCtrl'
          }
        }
      })
  });
