'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('cruvitaSchoolFinder', {
        parent: 'site',
        url: '/Cruvita-school-finder',
        views: {
          'content@': {
            templateUrl: 'app/cruvitaSchoolFinder/cruvitaSchoolFinder.html',
            controller: 'CruvitaSchoolFinderCtrl'
          }
        }
      })
      .state('csf', {
        parent: 'site',
        url: '/csf',
        views: {
          'content@': {
            templateUrl: 'app/cruvitaSchoolFinder/csf.html',
            controller: 'CruvitaSchoolFinderCtrl'
          }
        }
      });
  });
