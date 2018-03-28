'use strict';

angular.module('cruvitaApp')
  .controller('SchoolCtrl', function ($scope, School, $stateParams, $state, $location, Activity, Config, RankClasses, Page, $filter, $window, Location, $q, $timeout, States) {
  	$scope.map = { zoom: 13 };
    $scope.options = { icon: 'favicon.png' };
    $scope.mapOptions = Config.mapOptions;
    $scope.fill = {color: 'rgb(0, 46, 92)', opacity: .2};
    $scope.stroke = {color: 'rgb(0, 46, 120)', weight: 2, opacity: .8};
    $scope.ethnicData = [];
    $scope.ethnicDataLabels = ['American Indian', 'Asian', 'Hispanic', 'Black', 'White', 'Pacific Islander', 'Multi-Ethnic'];
    $scope.ethnicDataLabelsTrue = [];
    $scope.genderData = [];
    $scope.genderDataLabels = [];
    $scope.hidePen = false;
    $scope.protocol = $location.protocol();

    $scope.goBack = function() {
      $window.history.back();
    }

    $scope.goToState = function(state) {
      if (state){
        var searchableState = state.toLowerCase();
        return searchableState + '-s';
      } else {
        return
      }
    }

    $scope.goToCity = function(city, state) {
      var newCity = '';
      if (city){
        city = city.split(' ');


        if (city.length > 1) {
            _.each(city, function(c){
              c = c.split('.')[0];
              if (!newCity) {
                  newCity = c.toLowerCase();
              } else {
                  newCity = newCity + "-" + c.toLowerCase();
              }
            })
        } else {
            newCity = city[0].toLowerCase();
        }
        var searchableCityState = newCity + '-' + state.toLowerCase() + '-c';
      } else {
        return
      }

      return searchableCityState;
      // $state.go('results', {'location': searchableCityState, 'tab': 'schools'});
    }


		$q.all([Location.get({dispName:$stateParams.id, type: 'school'}).$promise, School.get({id: $stateParams.id}).$promise]).then(function(responses) {
      $scope.school = responses[1].school.school;

      if ($scope.school.website === "#N/A") {
        delete $scope.school.website;
      }
      $scope.agent = _.deepGet(responses[1], 'agent');
      $scope.broker = _.deepGet(responses[1], 'mortgage');
      $scope.map.center = {
        latitude: $scope.school.coordinates.latitude,
        longitude: $scope.school.coordinates.longitude
      };

      if(responses[0].boundaries) {
        $scope.school.boundaries = _.map(responses[0].boundaries, function(boundary, index) {
          return {
            boundary: boundary.boundary,
            id: index
          };
        });
      }

      switch($scope.school.ed_level) {
        case '1':
          $scope.educationLevel = 'elementary';
					$scope.schoolSuffix = 'e';
          break;
        case '2':
          $scope.educationLevel = 'middle';
					$scope.schoolSuffix = 'm';
          break;
        case '3':
          $scope.educationLevel = 'high';
					$scope.schoolSuffix = 'h';
          break;
				default:
          $scope.educationLevel = 'magnet';
					$scope.schoolSuffix = 'd';
          break;
      }

      Page.setTitle('Another great School ' + $scope.school.sch_name + ' | Cruvita');
      Page.setDescription('Want to learn more about ' + $scope.school.sch_name + '? Not only will we help you find the the best school for your children, but help you find your dream home too!');

      $timeout(function(){
         $scope.share = {
            Url: $scope.protocol + '://www.cruvita.com/school/' + $scope.school.slug,
            Name: $scope.school.sch_name,
            ImageUrl: $scope.protocol + '://www.cruvita.com/assets/images/cruvita_logo_325x250.png'
        };
      })


    	if ($scope.school.coordinates){
        var schoolCoordinates = [parseFloat($scope.school.coordinates.latitude), parseFloat($scope.school.coordinates.longitude)];
      }

      _.forEach($scope.school.schoolDiversity, function(k, v) {
        k = k / $scope.school.member;
        k = k * 100;
        k = $filter('number')(k, 0);
        $scope.ethnicData.push(k);
      });
      _.forEach($scope.school.schoolGenders, function(k, v) {
        v = $filter('titleCase')(v);
        $scope.genderDataLabels.push(v);
        $scope.genderData.push(k);
      });

      if ($scope.school.schoolType){
        _.forEach($scope.school.schoolType, function(v,k){
          if (v == "1" && k !== 'schoolType') {
            $scope.schoolType = k;
          }
        });
      }

      var cityArray = $scope.school.address.city.split(" ");

      if(cityArray.length > 1) {
        _.each(cityArray, function(c) {
          c = c.toLowerCase();
          if ($scope.cityFixed) {
            $scope.cityFixed = $scope.cityFixed + '-' + c;
          } else {
            $scope.cityFixed = c;
          }
        })
      } else {
        $scope.cityFixed = $scope.school.address.city.toLowerCase();
      }
      var zip = $scope.school.address.zip;
      zip = zip.split("-");
      zip = zip[0];
      //Cru Tracking Code
      var record = {
          time: new Date(),
          slug: $scope.school.slug,
          origination: 'school',
          action:
          {
            type: 'view',
            target: 'school'
          },
          zip: zip,
          city: $scope.school.address.city,
          state: $scope.school.address.state,
      }

      if($scope.agent){
          record.agentID = $scope.agent._id;
          record.agentName = $scope.agent.name;
      }
      Activity.create(record);

      var brokerRecord = {
        time: new Date(),
        slug: $scope.slug,
        origination: 'school',
        action:
        {
          type: 'view',
          target: 'school'
        },
        zip: zip,
        city: $scope.school.address.city,
        state: $scope.school.address.stateorprovince
      }

      if($scope.broker){
          record.agentID = $scope.broker._id;
          record.agentName = $scope.broker.name;
      }
      Activity.create(brokerRecord);

		}, function(err){
      $state.go('404');
    });

    $scope.specialtySchool = function(school){
      return RankClasses.specialtySchool(school);
    }

    $scope.setScoreRanks = function(school){
      return RankClasses.scoreClasses(school);
    };
    $scope.setCountyRank = function(school){
      return RankClasses.rankClasses(school, 'county', 'med');
    };
    $scope.setStateRank = function(school){
      return RankClasses.rankClasses(school, 'state', 'med');
    };
    $scope.setNationRank = function(school){
      return RankClasses.rankClasses(school, 'nation', 'med');
    };

    $scope.scoreNoExists = function(score){
      if (score === 999999999){
        return true;
      }
    };
  });
