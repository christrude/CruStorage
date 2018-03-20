'use strict';

angular.module('cruvitaApp')
  .directive('schoolResults', function () {
    return {
      templateUrl: 'app/main/components/schoolResults/schoolResults.html',
      restrict: 'EA',
			controller: function($scope, $location, Config, MapModel, HomeModel, SchoolModel, FilterModel, $filter) {
        $scope.protocol = $location.protocol();
        $scope.schoolsUrl = $location.absUrl();
        // $scope.schoolsUrl = $filter('encodeURIComponent')($scope.schoolsUrl);
        $scope.schoolShare = {
            Url: $scope.schoolsUrl,
            Name: $scope.searchLocation,
            ImageUrl: $scope.protocol + '://www.cruvita.com/assets/images/cruvita_logo_325x250.png'
        };

        $scope.setSchool = function(school) {
					MapModel.clearLocations();
					MapModel.active = 1;
					var schoolLocation = school.location + '-' + Config.schoolTypes[school.ed_level];
					if(!school.hasBoundaries) {
						schoolLocation = school.locations.county + '-y';
					}
          $location.search('location', schoolLocation);
					$location.search('tab', 'homes');
					/* Initialize location/map */
					MapModel.initMap(schoolLocation);
			    /* Initial Load */
		      MapModel.locationInit();
					HomeModel.updateHomes();
					SchoolModel.updateSchools();
		    };
			}
    };
  });