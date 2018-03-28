'use strict';

angular.module('cruvitaApp')
  .directive('schools', function () {
    return {
      templateUrl: 'components/schools/schools.html',
      restrict: 'EA',
      scope: {
      	schools: '=',
        ranking: '=',
        map: '@',
        selectSchool: '&',
        unselectSchool: '&',
        updateSchools: '&'
      },
      controller: function ($scope, RankClasses, deviceDetector) {
        $scope.deviceDetector = deviceDetector;

        $scope.setScoreRanks = function(school){
          return RankClasses.scoreClasses(school);
        };

        $scope.setCountyRank = function(school){
          return RankClasses.rankClasses(school, 'county');
        };

        $scope.setStateRank = function(school){
          return RankClasses.rankClasses(school, 'state');
        };

        $scope.setNationRank = function(school){
          return RankClasses.rankClasses(school, 'nation');
        };

        $scope.scoreExists = function(score){
          if (score < 999999999){
            return true;
          }
        };
      }
    };
  });