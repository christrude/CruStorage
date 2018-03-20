'use strict';

angular.module('cruvitaApp')
  .service('SchoolModel', function ($rootScope, $state, $stateParams, School, FilterModel, MapModel, Autocomplete, Config, SchoolUtil, Page, Activity) {
		var service = {};
    service.schoolFilterInit = function() {
	    FilterModel.schoolFilters = angular.copy(FilterModel.defaultSchoolFilters);
      _.each($stateParams, function(value, key) {
        if(value) {
          var filterValue = value.toString().substring(3);
          var found;
          /* Bind to proper value in filters*/
          if(Config.advancedSchoolFilters[key]){
            found = _.find(Config.advancedSchoolFilters[key].options, function(val){
              return val.value === filterValue.toString() || val.value === parseFloat(filterValue);
            });
          }
          switch(value.toString().substring(0, 3)) {
            case 'sr:':
              var minMax = value.replace('sr:','').split('-');
              FilterModel.schoolFilters[key] = {type: 'range', key: Autocomplete.schoolsComponentMap[key], min: minMax[0], max: minMax[1]};
              break;
            case 'se:':
            case 'sm:':
            case 'sx:':
              FilterModel.schoolFilters[key] = found;
              break;
            default:
              break;
          }
        }
      });
      if(MapModel.locationSlug) {
        FilterModel.schoolFilters.location = {type: 'equals', key: Autocomplete.schoolsComponentMap['location' + MapModel.locationType], value: MapModel.locationSlug, caseSensitive: true};
      }
			else {
				FilterModel.schoolFilters.location = null;
			}
    };

	  service.initSchool = function(school) {
	    school.icon = 'favicon.png';
			SchoolUtil.getGrade(school);
	    school.offHover = function () {
	      MapModel.schoolWindow.showWindow = false;
	    };

	    school.onHover = function ()  {
	      MapModel.homeWindow.showWindow = false;
	      MapModel.homeWindow.showMultiWindow = false;
	      MapModel.schoolWindow.showWindow = true;
	      var topLeft = MapModel.getMarkerLocation(school.coordinates.latitude, school.coordinates.longitude, angular.element('#schoolPopoverWindow').height(), angular.element('#schoolPopoverWindow').width(), 25);
	      MapModel.schoolWindow.top = topLeft.top - 15;
	      MapModel.schoolWindow.left = topLeft.left - 5;
	      MapModel.schoolWindow.arrow = topLeft.arrow;
	      MapModel.schoolWindow.model = school;
	    };

	    school.click = function() {
	      $stateParams = {};
	      $state.go('school', {'id': school.slug});
	    };

	    school.selected = MapModel.locationType === 'school' && school.location === MapModel.locationSlug;
	  };

	  service.schoolCallback = function(schools) {
			if(MapModel.currentLocation) {
        Page.setTitle(MapModel.currentLocation.dispName + ' Homes for Sale by School District | Cruvita');
				Page.setDescription('Let Cruvita find ' + MapModel.currentLocation.dispName + ' homes for sale by school district & not only find your dream home but also the best schools for your children!');
	    }
			service.schools = schools;
			MapModel.map.ready = true;
	    _.each(service.schools.results, function (school) {
	      service.initSchool(school);
	    });
	  };

	  service.updateSchools = function() {
			if(document.getElementById('schoolList')) {
				document.getElementById('schoolList').scrollTop = 0;
			}
	    var filters = angular.copy(FilterModel.schoolFilters);
	    angular.forEach(filters, function(filter, key) {
	      if(filter && (filter.value) && key !== 'location' && filter.value !== (!FilterModel.defaultSchoolFilters[key] || FilterModel.defaultSchoolFilters[key].value)) {
         	var param = {};
	        switch(filter.type) {
	          case 'equals':
	            param[key] = 'se:' + filter.value;
	            break;
	          case 'range':
	            param[key] = 'sr:'+filter.min + '-' + filter.max;
	            break;
	          case 'min':
	            param[key] = 'sm:'+filter.value
	            break;
	          case 'max':
	            param[key] = 'sx:'+filter.value;
	            break;
	          default:
	            break;
	        }
          $state.go('results', param, {inherit: true});
	      }
	      else if (key === 'location') {

	      }
	      else {
	        delete $stateParams[key];
	      }
	    });

	    var queries = MapModel.getParams(Autocomplete.schoolsComponentMap);

	    if(MapModel.locationType === 'school') {
	      queries.push({type: 'equals', key: 'location', value: MapModel.locationSlug, caseSensitive: true});
	    }
	    else {
	      angular.forEach(filters, function(val, key) {
	        if(val && (val.value || val.type === 'type' || (val.min && val.max)) && !(val.value === 'all' && key === 'edLevel')) {
	          queries.push(val);
	        }
	      });
	    }

	    var currentPage = service.schools ? service.schools.current : 1;


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
          var state = _.join(q.value.split("-"), " ");
        }
        if (q.key === 'locations.zip') {
          var zip = _.join(_.take(q.value.split("-")), " ");

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
          target: 'schools'
        },
        state: state
      }

      if (zip) {
        record.zip = zip;
      }

      Activity.create(record);

	    service.schoolPromise = School.retrieve({page:currentPage}, {queries: queries}, function(response) {
	      service.schoolCallback(response.schools);
        service.agent = response.agents[0];
	    }).$promise;
	  };

    $rootScope.$on('updateSchools', function(){
      service.updateSchools();
    })
		return service;
});
