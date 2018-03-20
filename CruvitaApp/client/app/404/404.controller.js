'use strict';

angular.module('cruvitaApp')
  .controller('404Ctrl', function ($scope, $location) {
    $scope.protocol = $location.protocol();
    $scope.rankUrl = $scope.protocol + '://www.cruvita.com/rankings';


    $scope.goRank = function() {
      $location.url('/rankings');
    }
  });
