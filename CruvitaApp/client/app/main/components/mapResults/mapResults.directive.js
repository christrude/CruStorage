'use strict';

angular.module('cruvitaApp')
  .directive('mapResults', function () {
    return {
      templateUrl: 'app/main/components/mapResults/mapResults.html',
      restrict: 'EA',
			controller: function($scope, Config, $timeout, $location, Location, MapModel, FilterModel, SchoolModel) {
				/* Initialize map options */
		    $scope.mapOptions = Config.mapOptions;
				var schoolTimeout, homeTimeout;

		    $scope.schoolEvents = {
		      mouseover: function(marker,event,model,args) {
		        $timeout.cancel(schoolTimeout);
		        model.onHover();
		      },
		      mouseout: function(marker,event,model,args) {
		        schoolTimeout = $timeout(function() {
		          model.offHover();
		        }, 200);
		      }
		    };
			}
    };
  });