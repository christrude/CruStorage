'use strict';

angular.module('cruvitaApp')
  .directive('cruGallery', function () {
    return {
      templateUrl: 'components/cruGallery/cruGallery.html',
      restrict: 'EA',
      replace: true,
      controller: ['$scope', function ($scope) {
        $scope.selected = 0;

        $scope.advanceLeft = function(index, first) {
          angular.element('.active.image img').animate({right: '-200'}, 150);

          if (!first){
            $scope.selected = (index - 1);
          }
          var x = angular.element('.thumbswrapper').scrollLeft();
          var y = angular.element('.thumb.active').width();

          angular.element('.active.image img').animate({right: '0'}, 0);
          angular.element('.thumbswrapper').animate({scrollLeft: x - y }, 250)
        };

        $scope.advanceRight = function(index, last) {
          angular.element('.active.image img').animate({right: '+200'}, 150);


          if (!last) {
            $scope.selected = (index + 1);
	          var x = angular.element('.thumbswrapper').scrollLeft();
	          var y = angular.element('.thumb.active').width();

	          angular.element('.active.image img').animate({right: '0'}, 0);
	          angular.element('.thumbswrapper').animate({scrollLeft: x + y }, 250)
          }
					else {
						$scope.selected = 0;
	          angular.element('.active.image img').animate({left: '0'}, 0);
	          angular.element('.thumbswrapper').animate({scrollLeft: 0 }, 250)
					}
        };

        $scope.selectImage = function(ind) {
          $scope.selected = ind;
        };

        $scope.isSelected = function(index){
          if (index === $scope.selected) {
            return true;
          }
        };
      }]
    };
  });