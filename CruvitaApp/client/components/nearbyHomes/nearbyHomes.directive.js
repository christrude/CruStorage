'use strict';

angular.module('cruvitaApp')
  .directive('nearbyHomes', function () {
    return {
      templateUrl: 'components/nearbyHomes/nearbyHomes.html',
      restrict: 'EA',
      scope: {
        list: "=",
        link: "=",
        school: "=",
        homepage: "="
      },
      link: function (scope, element, attrs) {
      },
      controller: function($scope) {
      }
    };
  });