'use strict';

angular.module('cruvitaApp')
  .controller('MainCtrl', function ($scope, $location, $state, $stateParams, Config, MapModel, HomeModel, SchoolModel, FilterModel, $timeout, deviceDetector, Myhome) {
  	// $location['$$url']
    MapModel.showAll = false;
    $scope.config = Config;
		$scope.mapModel = MapModel;
		$scope.homeModel = HomeModel;
		$scope.schoolModel = SchoolModel;
		$scope.filterModel = FilterModel;
    $scope.deviceDetector = deviceDetector;
    $scope.markerList = [];
		var keyPromise;
		MapModel.map = angular.copy(Config.mapDefaults);
    $scope.goToListing = function (path) {
      $state.go('listing', {'homeId': path});
    };

    $scope.goToMultipleListing = function (path, unit) {
      $state.go('listing', {'homeId': path, 'unit': unit});
    };

    $scope.scoreExists = function(score){
      if (score < 999999999){
        return true;
      }
    };

    $scope.$watch('mapModel.map.bounds.southwest.latitude', function(newVal, oldVal) {
      if(oldVal && newVal && newVal !== oldVal && (MapModel.active === 2 || !deviceDetector.isMobile())) {
      	boundChange();
      }
    }, true);

		$scope.removeLocation = function() {
			$scope.boundsOnly(function() {
				HomeModel.updateHomes();
				SchoolModel.updateSchools();
			});
		};

		$scope.boundsOnly = function(callback) {
			MapModel.clearLocations();
      MapModel.showAll = true;
      MapModel.map.polylines = [];
      delete FilterModel.schoolFilters.location;
      delete FilterModel.homeFilters.location;
      boundUpdate(callback);
    };

		$scope.switchTab = function(tab) {
      $state.go('results', {'tab': tab})
			MapModel.active = 0;
      if (tab === 'schools' || MapModel.locationType === 'school') {
				MapModel.active = 0;
        SchoolModel.updateSchools();
      }
			if (tab === 'homes') {
				MapModel.active = 1;
				HomeModel.updateHomes();
			}
			if (tab === 'map') {
				MapModel.map.ready = false;
				MapModel.active = 2;
				HomeModel.updateHomes();
        SchoolModel.updateSchools();
        MapModel.initMap($ .location);
      }
		};

		var boundChange = function() {
      MapModel.homeWindow.showWindow = false;
      MapModel.homeWindow.showMultiWindow = false;
      MapModel.schoolWindow.showWindow = false;
      // $location.$$compose();
      boundUpdate(function() {
				HomeModel.updateHomes();
				SchoolModel.updateSchools();
			});
		};

		var boundUpdate = function(callback) {
      if(keyPromise) {
        $timeout.cancel(keyPromise);
      }
      keyPromise = $timeout(function() {
        boundGrid();
				callback();
      }, 100);
    };

    var boundGrid = function() {
      if(MapModel.map.bounds.northeast || MapModel.showAll) {
        $state.go('results', {'NELAT': MapModel.map.bounds.northeast.latitude, 'NELONG': MapModel.map.bounds.northeast.longitude, 'SWLAT': MapModel.map.bounds.southwest.latitude, 'SWLONG': MapModel.map.bounds.southwest.longitude, 'zoom': MapModel.map.zoom}, {notify: false});
      } else {
        $state.go('results', {'zoom': MapModel.map.zoom}, {notify: false});
      }
      // $location.search('zoom', MapModel.map.zoom);
    };

		/* Initialize location/map */
		MapModel.initMap($stateParams.location);

		/* Initialize Filters */
		HomeModel.homeFilterInit();
		SchoolModel.schoolFilterInit();

		/* Initialize Models */
		SchoolModel.schools = null;
		HomeModel.homes = null;
		var initialTab = $stateParams.tab || 'schools';

    /* Initial Load */
		if($stateParams.location) {
      MapModel.locationInit();
			$scope.switchTab(initialTab);
		}
		else if($stateParams.myhome) {
			$scope.myhomes = true;
			initialTab = 'homes';
			HomeModel.homePromise = Myhome.get({id: $stateParams.myhome}, function(response) {
				MapModel.setMap(response.viewport);
				MapModel.map.ready = true;
				HomeModel.homesCallback(response.homes);
			});
		}
		else if($stateParams.SWLAT) {
			MapModel.map.ready = true;
			MapModel.showAll = true;
			MapModel.setMap({
				northeast: {
					latitude: $stateParams.NELAT,
					longitude: $stateParams.NELONG
				},
				southwest: {
					latitude: $stateParams.SWLAT,
					longitude: $stateParams.SWLONG
				}
			});
			MapModel.setBoundaries(null);
			$scope.switchTab(initialTab);
		}


    $scope.showIframe = function() {
      angular.element('.ddIframe').css('display', 'block');
    };
    $scope.hideIframe = function() {
      angular.element('.ddIframe').css('display', 'none');
    };

  });
