'use strict';

angular.module('cruvitaApp')
  .controller('ListingCtrl', function (
    $scope,
    $q,
    $routeParams,
    $location,
    $stateParams,
    $state,
    Homes,
    RankClasses,
    Page,
    $window,
    $document,
    HomeModel,
    $filter,
    Activity,
    States,
    SchoolComparisonStorageService,
    $uibModal,
    $timeout,
    deviceDetector,
    Config
  ) {
    $scope.HomeModel = HomeModel;
    $scope.homeId = $stateParams.homeId;
    $scope.rooms = false;
	  $scope.listingsScrollable = HomeModel.homes && HomeModel.homes.results && HomeModel.homes.results.length > 1;
    $scope.protocol = $location.protocol();
    $scope.host = $location.host();
    $scope.deviceDetector = deviceDetector;
    $scope.map = { zoom: 13 };
    $scope.options = { icon: 'assets/images/houseicon.png' };
    $scope.mapOptions = Config.mapOptions;

    var query = {homeId: $scope.homeId};

    $q.all([Homes.get(query).$promise]).then(function(responses) {
      var listing = responses[0];
      $scope.slug = listing.home.slug;
      $scope.compareAddress = $scope.slug.replace(/-/g, " ");
      $scope.listing = listing.home.listing;
			/* Everything is mapped through home.listing forcing this manual mapping... */
			$scope.cruvitaDate = listing.home.cruvitaDate
      $scope.nearby = listing.metadata.nearHomes;
      $scope.listing.status = listing.home.status;
      $scope.map.coordinates = {
        latitude: $scope.listing.location.latitude,
        longitude: $scope.listing.location.longitude
      };
      $scope.map.center = {
        latitude: $scope.listing.location.latitude,
        longitude: $scope.listing.location.longitude
      };

      if(HomeModel.homes) {
        $scope.currentIndex = _.findIndex(HomeModel.homes.results, function(home) {
          return home.slug == $scope.slug;
        });
        $scope.maxIndices = HomeModel.homes.results.length;
      }

      Page.setTitle($scope.listing.address.fullstreetaddress + ', ' + $scope.listing.address.city + ', ' + $scope.listing.address.stateorprovince + ' ' + $scope.listing.address.postalcode + ' | ' + $scope.listing.mlsnumber[0] + ' | Home for Sale/Rent | Cruvita');

      if ($scope.listing.listingdescription) {
        Page.setDescription($scope.listing.address.fullstreetaddress + ', ' + $scope.listing.address.city + ', ' + $scope.listing.address.stateorprovince + ', ' + $scope.listing.address.postalcode + ' - ' + $scope.listing.listingdescription[0] + ' | Home for Sale/Rent | Cruvita');
      } else {
        Page.setDescription($scope.listing.address.fullstreetaddress + ', ' + $scope.listing.address.city + ', ' + $scope.listing.address.stateorprovince + ', ' + $scope.listing.address.postalcode + ' | Home for Sale/Rent | Cruvita');
      }
      $scope.share = {
          Url:  $scope.protocol + '://www.cruvita.com/listing/' + listing.home.slug,
          Name: "Check out this great home for sale at Cruvita.com"
      };

      //make it easier to call the listing agent
      $scope.lagent = $scope.listing.listingparticipants[0] ? $scope.listing.listingparticipants[0].participant[0] : null;

      if (listing.metadata.agent){
        $scope.agent = listing.metadata.agent;
        $scope.buildAgentMessage();
      } else if ($scope.lagent) {
        $scope.buildListingAgentMessage();
      }

      $scope.broker = listing.metadata.mortgage;

      $scope.schools = listing.home.schools;
      //Send Metrics to LH
      $scope.lkey = $scope.listing.listingkey;

      //LH View Tracking
      lh('submit', 'DETAIL_PAGE_VIEWED', {lkey:$scope.lkey});

      $scope.trackZip = $scope.listing.address.postalcode;
      $scope.trackZip = $scope.trackZip.split("-");
      $scope.trackZip = $scope.trackZip[0];

      //Cru Tracking Code
      var record = {
        time: new Date(),
        slug: $scope.slug,
        origination: 'listing',
        action:
        {
          type: 'view',
          target: 'listing'
        },
        zip: $scope.trackZip,
        city: $scope.listing.address.city,
        state: $scope.listing.address.stateorprovince
      }

      if($scope.agent){
          record.agentID = $scope.agent._id;
          record.agentName = $scope.agent.name;
      }
      Activity.create(record);

      var brokerRecord = {
        time: new Date(),
        slug: $scope.slug,
        origination: 'listing',
        action:
        {
          type: 'view',
          target: 'listing'
        },
        zip: $scope.trackZip,
        city: $scope.listing.address.city,
        state: $scope.listing.address.stateorprovince
      }

      if($scope.broker){
          brokerRecord.agentID = $scope.broker._id;
          brokerRecord.agentName = $scope.broker.name;
      }
      Activity.create(brokerRecord);
      $timeout(function(){
        $scope.$broadcast('setEmails');
      })
    }, function(err){
      $state.go('404');
    });
    $scope.goBack = function() {
      $window.history.back();
    }

    $scope.openContact = function () {
      var openContactRecord = {
          time: new Date(),
          slug: $scope.slug,
          origination: 'listing',
          action:
          {
            type: 'contact',
            target: 'contact dialog'
          },
          zip: $scope.trackZip,
          city: $scope.listing.address.city,
          state: $scope.listing.address.stateorprovince
        }

        if($scope.agent){
            openContactRecord.agentID = $scope.agent._id;
            openContactRecord.agentName = $scope.agent.name;
        }
        Activity.create(openContactRecord);

      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'contactContent.html',
        controller: 'ContactContentCtrl',
        appendTo: $document.find('.listing-container'),
        resolve: {
          listing: function () {
            return $scope.listing;
          },
          agent: function () {
            return $scope.agent;
          },
          lagent: function () {
            return $scope.lagent;
          },
          lkey: function () {
            return $scope.lkey;
          },
          messages: function () {
            return $scope.messages;
          }
        }
      });

      modalInstance.result.then(function () {
      }, function () {
      });
    };

    $scope.states = States;

    $scope.stateName = function(state) {
      return _.result(_.find($scope.states, 'abbreviation', state), 'name').toLowerCase();
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

  	$scope.nextListing = function(dir) {
  		var newHome = HomeModel.homes.results[$scope.currentIndex + parseInt(dir)];

  		$state.go('listing', {homeId: newHome.slug});
  	}

    $scope.goToCompare = function() {
      SchoolComparisonStorageService.setAddress($scope.compareAddress);
      if ($scope.agent) {
        SchoolComparisonStorageService.setAgent($scope.agent);
      }
      $state.go('schoolcomparison', {address: $scope.compareAddress});
    }

  	$scope.buildAgentMessage = function() {
      $scope.agent_message = 'Dear ' + $scope.agent.name + ', I saw this listing on Cruvita.com and would like some information on the property at ' + $filter('titleCase')($scope.listing.address.fullstreetaddress) + ' ' + $filter('titleCase')($scope.listing.address.city) + ', ' + $filter('titleCase')($scope.listing.address.stateorprovince) + ' ' + $scope.listing.address.postalcode + '.  Please contact me at your earliest convenience. Thank you for your help!';
      $scope.lagent_message = 'Dear ' + $scope.lagent.firstname[0] + ' ' + $scope.lagent.lastname[0] + ', I saw this listing on Cruvita.com and would like some information on the property at ' + $filter('titleCase')($scope.listing.address.fullstreetaddress) + ' ' + $filter('titleCase')($scope.listing.address.city) + ', ' + $filter('titleCase')($scope.listing.address.stateorprovince) + ' ' + $scope.listing.address.postalcode + '.  Please contact me at your earliest convenience. Thank you for your help!';
      $scope.messages = [$scope.agent_message, $scope.lagent_message];
  	}

    $scope.buildListingAgentMessage = function() {
      $scope.lagent_message = 'Dear ' + $scope.lagent.firstname[0] + ' ' + $scope.lagent.lastname[0] + ', I saw this listing on Cruvita.com and would like some information on the property at ' + $filter('titleCase')($scope.listing.address.fullstreetaddress) + ' ' + $filter('titleCase')($scope.listing.address.city) + ', ' + $filter('titleCase')($scope.listing.address.stateorprovince) + ' ' + $scope.listing.address.postalcode + '.  Please contact me at your earliest convenience. Thank you for your help!';
      $scope.messages = [$scope.lagent_message];
    }

    //LH Clicktracking
    $scope.lagentClick = function(agent, target){
        //Cru Tracking Code
        var record = {
            time: new Date(),
            slug: $scope.slug,
            origination: 'listing',
            action:
            {
              type: 'click',
              target: target
            },
            zip: $scope.listing.address.postalcode,
            city: $scope.listing.address.city,
            state: $scope.listing.address.stateorprovince,
        }

        if($scope.agent){
            record.agentID = agent._id;
            record.agentName = agent.name;
        }

        Activity.create(record);

        Analytics.trackEvent('send', {
        'hitType': 'event',
        'eventCategory': 'agentspot - listing',
        'eventAction': 'click',
        'eventLabel': 'Listing Agent - ' + agent.firstname[0] + agent.lastname[0],
        'eventValue': 1,
        'nonInteraction': 1
        });
        lh('submit', 'AGENT_EMAIL_CLICKED', {lkey:$scope.lkey});
    };
  }).controller('ContactContentCtrl', function ($scope, $uibModalInstance, agent, lagent, listing, lkey, messages) {

  $scope.agent = agent;
  $scope.lagent = lagent;
  $scope.listing = listing;
  $scope.lkey = lkey;
  $scope.messages = messages;

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
