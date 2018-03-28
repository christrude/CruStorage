'use strict';

angular.module('cruvitaApp')
  .controller('IndexCtrl', function ($rootScope, $scope, $location, Page, Analytics, Config, $window) {
    $scope.maint = Config.maintenance;

    $rootScope.showHelp = false;

    $scope.Page = Page;

    $scope.$on('$stateChangeSuccess', function (){
      $scope.location = $location.path();
      $scope.location = $scope.location.split("/");
      $scope.location = $scope.location[1];

      if ($scope.location === '') {
        $scope.location = 'home';
      } else if ($scope.location === 'school'){
        $scope.location = $location.path();
      }

      Analytics.trackPage($scope.location);
    })

    $scope.$on('$viewContentLoaded', function (){
      $scope.navclass = false;
      $scope.url = $location.absUrl();

      $window.prerenderReady = true;

      if ($scope.location === 'results') {
        $scope.navclass = true;
      } else {
        $scope.navclass = false;
      }
    });

		$scope.getOverflow = function() {
			return $location.path() === '/results' ? 'hidden' : 'auto'
		}
  });
