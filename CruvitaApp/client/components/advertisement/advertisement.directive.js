'use strict';

angular.module('cruvitaApp')
  .directive('advertisement', function ($http) {
    return {
      templateUrl: 'components/advertisement/advertisement.html',
      restrict: 'EA',
      scope: {
      	advertisements: '='
      },
      controller: ['$scope', function ($scope) {
      }]
    };
  });