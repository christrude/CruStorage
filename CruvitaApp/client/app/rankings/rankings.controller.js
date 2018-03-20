'use strict';

angular.module('cruvitaApp')
  .controller('RankingsCtrl', function ($scope, Location, School, $location, Page, Autocomplete, Activity) {
    Page.setTitle('Cruvita School Score Rankings');

    Page.setDescription("Find the Right Home on Cruvita.com, We have ranked over 80,000 Public schools to help you, the homebuyer, make the best decision for your family");

    $scope.getLocation = Autocomplete.autocomplete;
		var queries = {};
    $scope.viewable = false;
    $scope.currentEdLevel = $location.$$search['edLevel'] || 4;
    $scope.tabs = [{
      active: $scope.currentEdLevel == 4,
      heading: 'All',
      edLevel: 4
    },{
      active: $scope.currentEdLevel == 1,
      heading: 'Elementary',
      edLevel: 1
    },{
      active: $scope.currentEdLevel == 2,
      heading: 'Middle',
      edLevel: 2
    },{
      active: $scope.currentEdLevel == 3,
      heading: 'High',
      edLevel: 3
    }];

    var getSchools = function() {
     	$location.search('edLevel', $scope.currentEdLevel);
      if($scope.currentEdLevel != 4) {
        queries.edLevel = {key: 'ed_level', type: 'equals', value: $scope.currentEdLevel};
      }
			else {
				delete queries.edLevel;
			}
			if(Object.keys(queries).length > 0) {
	      var currentPage = $scope.schools ? $scope.schools.current : 1;
				var requestQueries = [];
				var service = {};
        var zip;

        _.each(queries, function(value, key) {
					requestQueries.push(value);
				})

        _.each(queries, function(q){
          if (q.key === 'locations.city' || q.key === 'locations.county' || q.key === 'locations.state' || q.key === 'locations.zip'){
            service.target = q.value;
          }
          if (q.key === 'locations.state') {
            var state = _.join(q.value.split("-"), " ");
          }
          if (q.key === 'locations.zip') {
            var zip = _.join(_.take(q.value.split("-")), " ");

            var city = _.join(_.drop(_.dropRight(q.value.split("-"))), " ");
          }
        })

        if (service && service.target){
          var targetArray = service.target.split("-");
        }

        if (!state){
          var state = _.join(_.takeRight(targetArray));
        }

        if (!zip) {
          var city = _.join(_.dropRight(targetArray), " ");
        }

        var record = {
          time: new Date(),
          slug: service.target,
          origination: 'rankings',
          action:
          {
            type: 'search',
            target: service.target
          },
          state: state
        }

        if (zip) {
          record.zip = zip;
        }

        if (service.target){
          Activity.create(record);
        }
	      $scope.schoolPromise = School.retrieve({page: currentPage, nearbyHomes: true}, {queries: requestQueries}, function(response) {
	        $scope.schools = response.schools;
					$scope.nearbyHomes = response.homes;
          $scope.link = 'results?location=' + $location.$$search.location;

          if ($location.$$search.type === "county") {
            $scope.link = $scope.link + '-y';
          } else if ($location.$$search.type === "city") {
            $scope.link = $scope.link + '-c';
          }

	      }).$promise;
			}
			Autocomplete.lastSelected = null;
    };

		$scope.setArea = function() {
			_.each(Autocomplete.lastSelected, function(item) {
				if($scope.locationSelected.toString().indexOf(item.dispName.capitalize()) !== -1) {
					$scope.locationSelected = item.dispName;
				}
			});
      var selected =  _.filter(Autocomplete.lastSelected, function(location){
        return location.dispName.toUpperCase() === $scope.locationSelected.toUpperCase();
      }) || Autocomplete.lastSelected;

			if(selected && selected[0])  {
        $location.search('location', selected[0].slug);
        $location.search('type', selected[0].type);
				if(selected[0].type === 'school') {
					queries.location = {type:'equals', value: selected[0].slug, key: 'location', caseSensitive: true}
				}
				else {
        	queries.location = {type:'equals', value: selected[0].slug, key: 'locations.' + selected[0].type, caseSensitive: true};
				}
			}
			$scope.getRankings()
		}

    $scope.getRankings = function() {
      var query = null;
			if($scope.schools) {
				$scope.schools.results = null;
			}
			var searchKeys = Object.keys($location.$$search);
			if($location.$$search.location && $location.$$search.type) {
				var key = ($location.$$search.type !== 'school') ? 'locations.' + $location.$$search.type : 'location';
				queries.location = {type:'equals', value: $location.$$search.location, key: key, caseSensitive: true};
			}

			if(searchKeys.length > 0) {
				_.each($location.$$search, function(value, key) {
					if(key !== 'page' && key !== 'edLevel') {
						query = {type:'equals', value: value, key: Autocomplete.schoolsComponentMap[key], caseSensitive: true};
					}
				})
			}
			getSchools();
    };

    $scope.setEdLevel = function(edLevel) {
      $scope.currentEdLevel = edLevel;
			$scope.schools = null;
      $scope.getRankings();
    }
  });
