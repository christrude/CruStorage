'use strict';

angular.module('cruvitaApp')
  .directive('schoolGrade', function () {
    return {
      templateUrl: 'components/schoolGrade/schoolGrade.html',
      restrict: 'AE',
			scope: {
				school: '='
			},
			controller: function($scope, Config, $timeout) {
				_.each(Config.gradeScale, function(grade, index) {
		      if(_.isPlainObject($scope.school)) {
            if ($scope.school.score && $scope.school.score.overall >= grade.low && (index === Config.gradeScale.length - 1 || $scope.school.score.overall < Config.gradeScale[index+1].low)) {
                $scope.school.icon = grade.icon;
                $scope.school.grade = grade.value;
                $scope.school.color = grade.color;
            }
		      } else {
            if($scope.school >= grade.low && (index === Config.gradeScale.length - 1 || $scope.school < Config.gradeScale[index+1].low)) {
              var tempScore = $scope.school;
              $scope.school = {};
              $scope.school.score = {};
              $scope.school.score.overall = tempScore;
              $scope.school.icon = grade.icon;
              $scope.school.grade = grade.value;
              $scope.school.color = grade.color;
            }
		      }
				});

				$scope.scoreExists = function(score) {
					if (score < 999999999){
						return true;
					}
				};
			}
    };
  });