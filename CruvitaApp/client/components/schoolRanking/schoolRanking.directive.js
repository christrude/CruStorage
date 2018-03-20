'use strict';

angular.module('cruvitaApp')
  .directive('schoolRanking', function () {
    return {
      templateUrl: 'components/schoolRanking/schoolRanking.html',
      restrict: 'EA',
      scope: {
      	school: '=',
      	type: '@'
      },
      controller: function($scope, RankClasses, Page) {

		    $scope.showPopover = function(){
		      angular.element('.popover.' + $scope.type).css('display', 'block');
		    };
		    $scope.hidePopover = function(){
		      angular.element('.popover.' + $scope.type).css('display', 'none');
		    };
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
      },
      link: function (scope, element, attrs) {
      }
    };
  });