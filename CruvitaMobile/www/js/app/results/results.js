'use strict';

angular.module('myAppApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/results', {
        templateUrl: '../www/js/app/results/results.html',
        controller: 'ResultsCtrl'
      });
  });
