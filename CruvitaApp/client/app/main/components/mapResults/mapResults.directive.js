'use strict';

angular.module('cruvitaApp')
  .directive('mapResults', function () {
    return {
      templateUrl: 'app/main/components/mapResults/mapResults.html',
      restrict: 'EA',
			controller: function($scope, Config, $timeout, $location, Location, MapModel, FilterModel, HomeModel, SchoolModel) {
				/* Initialize map options */
		    $scope.mapOptions = Config.mapOptions;
				var schoolTimeout, homeTimeout;
		    $scope.homeEvents = {
		      mouseover: function(marker,event,model,args) {
		        $timeout.cancel(homeTimeout);
		        model.onHover();
		      },
		      mouseout: function(marker,event,model,args) {
		        homeTimeout = $timeout(function() {
		          model.offHover();
		        }, 200);
		      }
		    };
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