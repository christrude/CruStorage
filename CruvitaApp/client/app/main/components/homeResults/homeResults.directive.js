'use strict';

angular.module('cruvitaApp')
  .directive('homeResults', function () {
    return {
      templateUrl: 'app/main/components/homeResults/homeResults.html',
      restrict: 'EA',
			controller: function($scope, $location, $window, $filter, $stateParams, $state, deviceDetector) {
        $scope.protocol = $location.protocol();
        $scope.homesUrl = $location.absUrl();
        $scope.deviceDetector = deviceDetector;
        // $scope.homesUrl = $filter('encodeURIComponent')($scope.homesUrl);

        $scope.homeShare = {
            Url: $scope.homesUrl,
            Name: $scope.searchLocation,
            ImageUrl: $scope.protocol + '://www.cruvita.com/assets/images/cruvita_logo_325x250.png'
        };

        $scope.isRental = function () {
          if ($scope.home.listing.listingcategory === 'rent' || 'rental') {
            return true;
          }
        }

        $scope.goToListing = function (home) {
          $state.go('listing', {homeId: home.slug});
        };

        $scope.goToListingNewWindow = function (home){
          var newPath = '/listing/' + home.slug + (home.listing.address.unitnumber[0] ? ('?unit=' + home.listing.address.unitnumber[0]) : '');
          $window.open(newPath);
        }

        $scope.goToMultipleListing = function (path) {
          $state.go('listing', {homeId: path});
        };

        $scope.scoreExists = function(score){
          if (score < 999999999){
            return true;
          }
        };

        //What is this for? causes much hash duplication.
				if($stateParams.anchor) {
					$location.hash('anchor' + $location.$$search.anchor);
				}
			}
    };
  });