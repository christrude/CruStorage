'use strict';

angular.module('cruvitaApp')
  .service('HomeModel', function (Config, $rootScope, Homes, MapModel, FilterModel, Autocomplete, Page, $stateParams, $state, Activity) {
		var service = {};

		/* Initialize home filters based on url params */
    service.homeFilterInit = function() {
	    FilterModel.homeFilters = angular.copy(FilterModel.defaultHomeFilters);
      _.each($stateParams, function(value, key) {
        var found;
        if (value) {
          var filterValue = value.toString().substring(3);
          /* Bind to proper value in filters*/
          if(Config.advancedHomeFilters[key]){
            found = _.find(Config.advancedHomeFilters[key].options, function(val){
              return val.value === filterValue.toString() || val.value === parseFloat(filterValue);
            });
          }
          switch(value.toString().substring(0,3)) {
            case 'hr:':
              var minMax = filterValue.split('-');
              Config.advancedHomeRangeFilters[key].min = minMax[0];
              Config.advancedHomeRangeFilters[key].max = minMax[1];
              FilterModel.homeFilters[key] = found || {type: 'range', key: Autocomplete.homesComponentMap[key], min: minMax[0], max: minMax[1]};
              break;
            case 'hm:':
              FilterModel.homeFilters[key] = found || {type: 'min', key: Autocomplete.homesComponentMap[key], value: filterValue, label: filterValue};
              break;
            case 'hx:':
              FilterModel.homeFilters[key] = found || {type: 'max', key: Autocomplete.homesComponentMap[key], value: filterValue, label: filterValue};
              break;
            case 'he:':
              FilterModel.homeFilters[key] = found || {type: 'equals', key: Autocomplete.homesComponentMap[key], value: filterValue};
              break;
            case 'ho:':
              var orValues = filterValue.split(',');
              FilterModel.homeFilters[key] = {type: 'or', key: Autocomplete.homesComponentMap[key], value: orValues};
              angular.forEach(orValues, function(orValue) {
                FilterModel.orFilters[key][orValue] = true;
              });
              break;
            default:
              break;
          }
        }
      });
      if(MapModel.locationSlug) {
        if(MapModel.locationType !== 'school') {
          FilterModel.homeFilters.location = {type: 'equals', key: Autocomplete.homesComponentMap['location' + MapModel.locationType], value: MapModel.locationSlug, caseSensitive: true};
        }
      }
			else {
				FilterModel.homeFilters.location = null;
			}
    };

		/* Callback for homes */
    service.homesCallback = function(homes) {
      service.homes = homes;
			MapModel.map.ready = true;
			if(MapModel.currentLocation) {
        Page.setTitle(MapModel.currentLocation.dispName + ' Homes for Sale | Cruvita');
	      Page.setDescription('Search ' + MapModel.currentLocation.dispName + ' homes for sale today! At Cruvita, we not only want to help find your next home, but also find the ideal school for your children!');
			}
			var lkeys = [];
      $( '.gm-style-iw' ).next().remove();
      angular.forEach(service.homes.results, function(home) {
        home.coordinates = {
          latitude: home.listing.location.latitude,
          longitude: home.listing.location.longitude
        };
        //Send Metrics to LH
        var lkey = { lkey: home.listing.listingkey};
        lkeys.push(lkey);

        home.icon = 'assets/images/houseicon.png';
        home.markerShape = {coords: [0, 0, 400], type: "circle"};
        home.offHover = function () {
				  MapModel.homeWindow.showWindow = false;
          MapModel.homeWindow.showMultiWindow = false;
        };

        home.onHover = function ()  {
          MapModel.schoolWindow.showWindow = false;
					if(MapModel.map.bounds && MapModel.map.bounds.northeast) {
						var topLeft;
          	if(home.multiple.children.length > 1) {
            	MapModel.homeWindow.showMultiWindow = true;
            	topLeft = MapModel.getMarkerLocation(home.listing.location.latitude, home.listing.location.longitude, document.getElementById('multiHomePopoverWindow').clientHeight, document.getElementById('multiHomePopoverWindow').clientWidth, 15)
         	 	}
						else {
           	  MapModel.homeWindow.showWindow = true;
            	topLeft = MapModel.getMarkerLocation(home.listing.location.latitude, home.listing.location.longitude, document.getElementById('homePopoverWindow').clientHeight, document.getElementById('homePopoverWindow').clientWidth, 15)
          	}

          	MapModel.homeWindow.top = topLeft.top;
          	MapModel.homeWindow.left = topLeft.left;
          	MapModel.homeWindow.arrow = topLeft.arrow;
          	MapModel.homeWindow.model = home;
					}
        };

        home.click = function() {
          $stateParams = {};
          $state.go('listing', {'homeId': home.slug});
        };

        var indexesToRemove = [];
        angular.forEach(home.multiple.children, function(child) {
          angular.forEach(FilterModel.homeFilters, function(filter, filterKey) {
            if(filter && (filter.value || filterKey === 'type')) {
              var value = _.deepGet(child, filter.key);
              if(!angular.isArray(value)) {
                value = [value];
              }
              switch(filter.type) {
                case 'equals':
                  if(value[0] !== filter.value) {
                    indexesToRemove.push(child);
                  }
                  break;
                case 'type':
                  var isRental = value[0] === "Rental";
                  if((!isRental && filter.rental) || (isRental && filter.forSale)) {
                    indexesToRemove.push(child);
                  }
                  break;
                case 'min':
                  if(filter.value >= value[0]) {
                    indexesToRemove.push(child);
                  }
                  break;
                case 'max':
                  if(filter.value <= value[0]) {
                    indexesToRemove.push(child);
                  }
                  break;
                case 'or':
                  if(value.indexOf(filter.value) === -1) {
                    indexesToRemove.push(child);
                  }
                  break;
                default:
                  break;
              }
            }
          })
        });
        angular.forEach(indexesToRemove, function(index) {
          home.multiple.children.splice(home.multiple.children.indexOf(index), 1);
        });
      });

      lh('submit', 'SEARCH_DISPLAY', lkeys);
    };

    service.buildQueries = function(filters) {
      var queries = MapModel.getParams(Autocomplete.homesComponentMap);
      angular.forEach(filters, function(val, key) {
        if(val && (!angular.isArray(val.value) || val.value.length > 0) && (val.value || val.type === 'type' || (angular.isDefined(val.min) && angular.isDefined(val.max)))) {
          queries.push(val);
        }
      });

      if(MapModel.locationType === 'school') {
        var edLevel;
        switch((_.invert(Config.schoolTypes))[MapModel.locationSuffix]) {
          case '1':
            edLevel = 'elementary';
            break;
          case '2':
            edLevel = 'middle';
            break;
          case '3':
            edLevel = 'high';
            break;
          default:
            edLevel = 'elementary';
            break;
        }
        queries.push({type: 'equals', key: 'schools.' + edLevel, value: MapModel.locationSlug, caseSensitive: true});
      }
      return queries;
    }

    service.updateHomes = function() {
			if(document.getElementById('homeList')) {
				document.getElementById('homeList').scrollTop = 0;
			}
      var filters = angular.copy(FilterModel.homeFilters);
      angular.forEach(filters, function(filter, key) {
        if(filter && filter.value && (!angular.isArray(filter.value) || filter.value.length > 0) && key !== 'location' && (!FilterModel.defaultHomeFilters[key] || filter.value !== FilterModel.defaultHomeFilters[key].value)) {
         	var param = {};
					switch(filter.type) {
            case 'equals':
              param[key] = 'he:' + filter.value;
              break;
            case 'range':
              param[key] = 'hr:' + filter.min + '-' + filter.max;
              break;
            case 'min':
              param[key] = 'hm:' + filter.value;
              break;
            case 'max':
              param[key] = 'hx:' + filter.value;
              break;
            case 'or':
              param[key] = 'ho:' + filter.value;
              break;
            default:
              break;
          }
          $state.go('results', param, {inherit: true});
        }
        else if(key !== 'location') {
          delete $stateParams[key];
        }
      });

      var queries = this.buildQueries(filters);

      //Cru Tracking Code
      var zip = "",
          city = "",
          state = "";

      _.each(queries, function(q){
        if (q.key === 'locations.city' || q.key === 'locations.county' || q.key === 'locations.state' || q.key === 'locations.zip'){
          service.target = q.value;
          service.targetArray = service.target.split("-");
        }
        if (q.key === 'locations.state') {
          var state = _.chain(q.value.split("-")).join(" ");
        }
        if (q.key === 'locations.zip') {
          var zip = _.head(q.value.split("-"));

          var city = _.join(_.drop(_.dropRight(q.value.split("-"))), " ");
        }
      })


      if (!state){
        var state = _.join(_.takeRight(service.targetArray));
      }

      if (!zip) {
        var city = _.join(_.dropRight(service.targetArray), " ");
      }

      var record = {
        time: new Date(),
        slug: service.target,
        origination: 'results',
        action:
        {
          type: 'search',
          target: 'homes'
        },
        state: state
      }

      if (zip) {
        record.zip = zip;
      }

      var params = {};
      params.sortField = service.homeSortField.field;
      params.sortDir = service.homeSortField.direction;
      params.page = service.homes ? service.homes.current : 1;

      Activity.create(record);
      service.homePromise = Homes.retrieve(params, {queries: queries}, function(response) {
        service.homesCallback(response.homes);
        service.agent = response.agents[0];
      }).$promise;
    };

    service.homeSortField = _.find(Config.homeSortFields, {selected: true});

		return service;
  });
