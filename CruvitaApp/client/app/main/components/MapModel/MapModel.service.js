'use strict';

angular.module('cruvitaApp')
  .service('MapModel', function (Config, Location, $stateParams, $timeout, FilterModel, deviceDetector) {
		var service = {};
		/* Marker location logic shared among home and schools */
		service.getMarkerLocation = function(lat, long, elementHeight, elementWidth, offset) {
			elementHeight = 85;
  		elementWidth = 220;
      var mapWidth = document.getElementById('googleMap').clientWidth;
      if (service.map.bounds.northeast) {
        var longRatio = (service.map.bounds.northeast.longitude - long) / (service.map.bounds.northeast.longitude - service.map.bounds.southwest.longitude);
      }
      var locationLeft = mapWidth - (mapWidth * longRatio) - (elementWidth/2);
      var arrowPosition = 'bot';

      var mapHeight = document.getElementById('googleMap').clientHeight;
      var latRatio = (service.map.bounds.northeast.latitude - lat) / (service.map.bounds.northeast.latitude - service.map.bounds.southwest.latitude);
      var locationTop = (mapHeight * latRatio) - elementHeight - offset;

      if(locationLeft < (elementWidth/2)) {
        locationLeft = mapWidth - (mapWidth * longRatio);
        arrowPosition = 'left';
      }
      else if(locationLeft + 100 > (mapWidth - (elementWidth/2))) {
        locationLeft = mapWidth - elementWidth - (mapWidth * longRatio);
        arrowPosition = 'right';
      }
      if((mapHeight * latRatio) < (elementHeight + offset)) {
        locationTop = mapHeight * latRatio;
        arrowPosition = 'top';
      }
      return {left: locationLeft, top: locationTop, arrow: arrowPosition};
    }

		/* Maintain location information on the model */
		service.initMap = function(location) {
	    service.homeWindow = {
	      showWindow: false,
	      showMultiWindow: false
	    };

	    service.schoolWindow = {
	      showWindow: false
	    };

			if(location) {
				service.locationSuffix = location.substring(location.length-1);
				service.locationType = Config.locationTypes[service.locationSuffix];
				service.locationSlug = location.substring(0, location.length-2);
			}
			else {
				service.locationSuffix = null;
				service.locationType = null;
				service.locationSlug = null;
			}
			// service.homesActive = ($stateParams.tab === 'homes') || service.homesActive || service.locationType === 'school';
// 			service.schoolsActive = ($stateParams.tab === 'schools') || service.schoolsActive;
// 			service.mapActive = ($stateParams.tab === 'map') || service.mapActive;
		}

		service.clearLocations = function() {
			delete FilterModel.schoolFilters.location;
			delete service.locationType;
			delete service.locationSlug;
		}

    service.getParams = function(map) {
      var params = [];
      if(service.map.bounds.southwest && (!deviceDetector.isMobile() || (service.schoolsActive))) {
        params.push({type:'range', key: map.latitude, min: service.map.bounds.southwest.latitude, max: service.map.bounds.northeast.latitude});
        params.push({type:'range', key: map.longitude, min: service.map.bounds.southwest.longitude, max: service.map.bounds.northeast.longitude});
      }
      else if($stateParams.NELAT) {
        params.push({type:'range', key: map.latitude, min: $stateParams.SWLAT, max: $stateParams.NELAT});
        params.push({type:'range', key: map.longitude, min: $stateParams.SWLONG, max: $stateParams.NELONG});
      }
      return params;
    };

		service.locationInit = function() {
			service.map.ready = false;
		  Location.get({dispName:service.locationSlug, type: service.locationType}, function(location) {
		 		service.currentLocation = location;
				service.setMap(service.currentLocation.viewport);
				if(service.currentLocation.boundaries) {
					service.setBoundaries(service.currentLocation.boundaries);
				}
				service.map.ready = true;
		 	});
 		};

    service.setMap = function(viewport) {
      if(!$stateParams.zoom) {
        setZoom([[parseFloat(viewport.northeast.latitude), parseFloat(viewport.northeast.longitude)], [parseFloat(viewport.southwest.latitude), parseFloat(viewport.southwest.longitude)]]);
      }
      else {
        service.map.zoom = parseInt($stateParams.zoom);
      }
      service.map.center = {
        latitude: (parseFloat(viewport.northeast.latitude) + parseFloat(viewport.southwest.latitude))/2,
        longitude: (parseFloat(viewport.northeast.longitude) + parseFloat(viewport.southwest.longitude))/2
      }
    }

    service.setBoundaries = function(boundaries) {
      service.map.polylines = [];
      angular.forEach(boundaries, function(boundary, index) {
        service.map.polylines.push({path:boundary.boundary, selected: true, _id: index + 1});
      });
    }

		/* Create hover windows for both schools and homes */
    service.schoolWindow = {};

		/* Initialize Map */
    var zoomAreaMap = function(area) {
      var zoom = 12;
      var found = false;
      angular.forEach(Config.zoomAreaMap, function(element) {
        if(area >= element.min && !found) {
          found = true;
          zoom = element.zoom;
        }
      });
      return zoom;
    };

    var setZoom = function(poly) {
      if(poly.length > 0) {
        var polyLatMin = _.min(poly, function(point) {
          return point[0];
        })[0];
        var polyLatMax = _.max(poly, function(point) {
          return point[0];
        })[0];
        var polyLongMin = _.min(poly, function(point) {
          return point[1];
        })[1];
        var polyLongMax = _.max(poly, function(point) {
          return point[1];
        })[1];
        service.map.center = {
          latitude: (parseFloat(polyLatMin) + parseFloat(polyLatMax))/2,
          longitude: (parseFloat(polyLongMin) + parseFloat(polyLongMax))/2
        };
        var area = Math.pow(_.max([polyLongMax - polyLongMin, (polyLatMax - polyLatMin)*2]), 2);
        service.map.zoom = zoomAreaMap(area);
      }
    }

		return service;
  });
