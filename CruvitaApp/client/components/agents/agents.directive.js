'use strict';

angular.module('cruvitaApp')
  .directive('showAgent', function (Analytics) {
    return {
      templateUrl: 'components/agents/agents.html',
      restrict: 'EA',
      scope:{
        agent: '=',
        location: '=',
        slug: '=',
        zip: '=',
        city: '=',
        state: '=',
        school: '='
      },
      replace: true,
      controller: ['$scope', '$state', '$window', 'Activity', function ($scope, $state, $window, Activity) {
        if($scope.agent && $scope.agent.social && $scope.agent.social.remarketing){
          _.forEach($scope.agent.social.remarketing, function(r){
            var remarketing = r;
            $(".agent-info").append(remarketing);
          })
        }

        $scope.basicLocation = $scope.location.split("/");
        $scope.basicLocation = $scope.basicLocation[1];


        $scope.clickTrackEmail = function(agent){
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

          if($scope.agent){
              record.agentID = agent._id;
              record.agentName = agent.name;
          }
          Activity.create(record);


          Analytics.trackEvent('send', {
            'hitType': 'event',
            'eventCategory': 'agentspot - ' + $scope.basicLocation,
            'eventAction': 'click',
            'eventLabel': agent.name,
            'eventValue': 1,
            'nonInteraction': 1
          });
        };

        $scope.clickTrackWebsite = function(agent){
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

          if($scope.agent){
              record.agentID = agent._id;
              record.agentName = agent.name;
          }
          Activity.create(record);


          Analytics.trackEvent('send', {
            'hitType': 'event',
            'eventCategory': 'agentspot - ' + $scope.basicLocation,
            'eventAction': 'click',
            'eventLabel': agent.name,
            'eventValue': 1,
            'nonInteraction': 1
          });
        };

        $scope.clickTrackPhone = function(agent){
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

          if($scope.agent){
              record.agentID = agent._id;
              record.agentName = agent.name;
          }
          Activity.create(record);
        };

        $scope.clickTrackSM = function(agent, sm, link){
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

          if($scope.agent){
              record.agentID = agent._id;
              record.agentName = agent.name;
          }
          Activity.create(record);


          Analytics.trackEvent('send', {
            'hitType': 'event',
            'eventCategory': 'agentspot - ' + $scope.basicLocation,
            'eventAction': 'click',
            'eventLabel': agent.name,
            'eventValue': 1,
            'nonInteraction': 1
          });

          $window.open(link);
        };


        $scope.loadTrack = function(agent){
          Analytics.trackEvent('send', {
            'hitType': 'event',
            'eventCategory': 'agentspot - ' + $scope.basicLocation,
            'eventAction': 'impression',
            'eventLabel': agent.name,
            'eventValue': 1,
            'nonInteraction': 1
          });
        };
      }]
    };
  });