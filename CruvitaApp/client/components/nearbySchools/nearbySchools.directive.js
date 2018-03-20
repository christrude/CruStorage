'use strict';

angular.module('cruvitaApp')
  .directive('nearbySchools', function () {
    return {
      templateUrl: 'components/nearbySchools/nearbySchools.html',
      restrict: 'EA',
      scope: {
        list: "=",
        homepage: "="
      },
      link: function (scope, element, attrs) {
      },
      controller: function($scope) {
        $scope.schoolpage = true;
      }
    };
  });