'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('results', {
        parent: 'site',
        url: '/results?location&myhome&tab&NELAT&NELONG&SWLAT&SWLONG&zoom&anchor&edLevel&score&updatedDate',
        views: {
          'content@': {
            templateUrl: 'app/main/main.html',
            controller: 'MainCtrl'
          }
        }
      });;
  });