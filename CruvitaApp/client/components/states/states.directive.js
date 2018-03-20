'use strict';

angular.module('cruvitaApp')
  .directive('states', function () {
    return {
      templateUrl: 'components/states/states.html',
      restrict: 'EA',
      scope: true,
      controller: [ '$scope', 'States', function ($scope, States) {
        $scope.selectedState = '';
        $scope.states = States;

    }]
    };
  });