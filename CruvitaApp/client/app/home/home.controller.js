'use strict';

angular.module('cruvitaApp')
  .controller('HomeCtrl', function ($scope, $http, Autocomplete, geolocation, $timeout, $location, Config, Page, School, Homes) {

    Page.setTitle('Search Homes for Sale by School District & Rating | Cruvita');

    Page.setDescription('Search Homes for Sale by School District & Rating | Cruvita');

    $scope.areasServed = Config.areasServed;
    $scope.nearby = {};
    $scope.autocomplete = Autocomplete;
  	$scope.getResults = function() {
      Autocomplete.search();
	  };

    $scope.typeaheadContainer = angular.element(document.querySelector('#typeahead-container'));

    $scope.init = function() {
    	$http.get('//freegeoip.net/json/').then(function(data){

        // For if we have too many hits per day, switch to this
        //$http.get('//api.ipify.org?format=jsonp&callback=?', function(data) {
        //   console.log(JSON.stringify(data, null, 2));
        // });
        // var location = 'http://ipinfodb.com/ip_query.php?timezone=false&ip=' + ip;
        // $http.get(location).then(function(data){
        //   console.log(data)
        // })


        var schoolQ = [];
        var homeQ = [];

        schoolQ.push({
          "key": "coordinates.latitude",
          "type": "range",
          "min": data.data.latitude,
          "max": data.data.latitude + .2
        },{
          "key":"coordinates.longitude",
          "type": "range",
          "min": data.data.longitude,
          "max": data.data.longitude + .2
        })

        homeQ.push({
          "key": "listing.location.latitude",
          "type": "range",
          "min": data.data.latitude,
          "max": data.data.latitude + .2
        },{
          "key":"listing.location.longitude",
          "type": "range",
          "min": data.data.longitude,
          "max": data.data.longitude + .2
        },{
          "key": "listing.listingcategory",
          "label": "For Sale",
          "type": "equals",
          "value": "Purchase"
        })

        var schoolPromise = School.retrieve({page: 1}, {queries: schoolQ}, function(response) {
          $scope.nearby.schools = response.schools.results;
        })
        var homesPromise = Homes.retrieve({}, {queries: homeQ}, function(response) {
          $scope.nearby.homes = response.homes.results;

        }).$promise;
	    });
    };


    $scope.searchAreaSchools = function() {
      $http.get('//freegeoip.net/json/').then(function(data){
        $location.search('SWLAT', data.data.latitude - 0.03);
        $location.search('NELAT', data.data.latitude + 0.03);
        $location.search('NELONG', data.data.longitude + 0.03);
        $location.search('SWLONG', data.data.longitude - 0.03);
        $location.search('zoom', 13);
        $location.path('/results');
      });
    };

    $scope.searchAreaHomes = function() {
      $http.get('//freegeoip.net/json/').then(function(data){
        $location.search('tab', 'homes');
        $location.search('SWLAT', data.data.latitude - 0.03);
        $location.search('NELAT', data.data.latitude + 0.03);
        $location.search('NELONG', data.data.longitude + 0.03);
        $location.search('SWLONG', data.data.longitude - 0.03);
        $location.search('zoom', 13);
        $location.path('/results');
      });
    };

    $scope.init();

  });
