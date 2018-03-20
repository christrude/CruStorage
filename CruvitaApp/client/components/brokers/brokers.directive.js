'use strict';

angular.module('cruvitaApp')
  .directive('showBroker', function (Analytics) {
    return {
      templateUrl: 'components/brokers/brokers.html',
      restrict: 'EA',
      scope:{
        broker: '=',
        location: '=',
        slug: '=',
        zip: '=',
        city: '=',
        state: '=',
        school: '='
      },
      replace: true,
      controller: ['$scope', '$state', '$window', 'Activity', function ($scope, $state, $window, Activity) {
        if($scope.broker && $scope.broker.social && $scope.broker.social.remarketing){
          _.forEach($scope.broker.social.remarketing, function(r){
            var remarketing = r;
            $(".broker-info").append(remarketing);
          })
        }

        $scope.basicLocation = $scope.location.split("/");
        $scope.basicLocation = $scope.basicLocation[1];

        $scope.clickTrackEmail = function(broker){
          //Cru Tracking Code
          var record = {
              time: new Date(),
              slug: $scope.slug,
              origination: $scope.basicLocation,
              action:
              {
                type: 'click',
                target: 'email'
              },
              zip: $scope.zip,
              city: $scope.city,
              state: $scope.state
          }

          if($scope.broker){
              record.brokerID = broker._id;
              record.brokerName = broker.name;
          }
          Activity.create(record);


          Analytics.trackEvent('send', {
            'hitType': 'event',
            'eventCategory': 'brokerspot - ' + $scope.basicLocation,
            'eventAction': 'click',
            'eventLabel': broker.name,
            'eventValue': 1,
            'nonInteraction': 1
          });
        };

        $scope.clickTrackWebsite = function(broker){
          //Cru Tracking Code
          var record = {
              time: new Date(),
              slug: $scope.slug,
              origination: $scope.basicLocation,
              action:
              {
                type: 'click',
                target: 'website'
              },
              zip: $scope.zip,
              city: $scope.city,
              state: $scope.state
          }

          if($scope.broker){
              record.brokerID = broker._id;
              record.brokerName = broker.name;
          }
          Activity.create(record);


          Analytics.trackEvent('send', {
            'hitType': 'event',
            'eventCategory': 'brokerspot - ' + $scope.basicLocation,
            'eventAction': 'click',
            'eventLabel': broker.name,
            'eventValue': 1,
            'nonInteraction': 1
          });
        };

        $scope.clickTrackPhone = function(broker){
          //Cru Tracking Code
          var record = {
              time: new Date(),
              slug: $scope.slug,
              origination: $scope.basicLocation,
              action:
              {
                type: 'click',
                target: 'phone'
              },
              zip: $scope.zip,
              city: $scope.city,
              state: $scope.state
          }

          if($scope.broker){
              record.brokerID = broker._id;
              record.brokerName = broker.name;
          }
          Activity.create(record);
        };

        $scope.clickTrackSM = function(broker, sm, link){
          //Cru Tracking Code
          var record = {
              time: new Date(),
              slug: $scope.slug,
              origination: $scope.basicLocation,
              action:
              {
                type: 'click',
                target: sm
              },
              zip: $scope.zip,
              city: $scope.city,
              state: $scope.state
          }

          if($scope.broker){
              record.brokerID = broker._id;
              record.brokerName = broker.name;
          }
          Activity.create(record);


          Analytics.trackEvent('send', {
            'hitType': 'event',
            'eventCategory': 'brokerspot - ' + $scope.basicLocation,
            'eventAction': 'click',
            'eventLabel': broker.name,
            'eventValue': 1,
            'nonInteraction': 1
          });

          $window.open(link);
        };


        $scope.loadTrack = function(broker){
          Analytics.trackEvent('send', {
            'hitType': 'event',
            'eventCategory': 'brokerspot - ' + $scope.basicLocation,
            'eventAction': 'impression',
            'eventLabel': broker.name,
            'eventValue': 1,
            'nonInteraction': 1
          });
        };
      }]
    };
  });