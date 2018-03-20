'use strict';

angular.module('cruvitaApp')
  .directive('generalContact', function () {
    return {
      templateUrl: 'components/generalContact/generalContact.html',
      restrict: 'EA',
      replace: true,
      scope: {
        subject: '=',
        to: '=',
        messages: '=',
        lkey: '=',
        listing: '=',
        chse: '=',
        slug: '=',
        zip: '=',
        city: '=',
        state: '='
      },
      controller: function($scope, Auth, email, $timeout, Activity) {
        $scope.messageChanged = false;
        $scope.agreed = true;

        $scope.$on('setEmails', function(){
          if ($scope.chse){
            $scope.email = {
              name: '',
              num: '',
              subject: $scope.subject || '',
              from: '',
              body: $scope.messages[0] || '',
              to: $scope.to[0],
              cc: 'leads@cruvita.com',
            };
            $scope.listingAgentEmail = {
              subject: $scope.subject || '',
              body: $scope.messages[1] || '',
              to: $scope.to[1],
              cc: 'leads@cruvita.com'
            };
          } else if ($scope.chse === false){
            $scope.email = {
              name: '',
              num: '',
              subject: $scope.subject || '',
              from: '',
              body: $scope.messages[0] || '',
              to: $scope.to,
              cc: 'leads@cruvita.com'
            };
          } else {
            $scope.email = {
              name: '',
              num: '',
              subject: $scope.subject || '',
              from: '',
              body: $scope.messages || '',
              to: 'info@cruvita.com'
            };
          }
        })


        $scope.submit = function() {
          $scope.email.subject = $scope.email.subject + ' from ' + $scope.email.name;
          if ($scope.chse){
            if ($scope.email.body != $scope.messages[0]){
              $scope.email.body = $scope.email.body + "\r\n \r\n<br /><br />" + $scope.messages[0];
            }
            if ($scope.listingAgentEmail.body != $scope.messages[1]){
              $scope.listingAgentEmail.body = $scope.email.body + "\r\n \r\n<br /><br />" + $scope.messages[1];
            }
          } else if ($scope.chse === false){
            if ($scope.email.body != $scope.messages){
              $scope.email.body = $scope.email.body + "\r\n \r\n<br /><br />" + $scope.messages;
            }
          } else {
            if ($scope.email.body != $scope.messages){
              $scope.email.body = $scope.email.body + "\r\n \r\n<br /><br />" + $scope.messages;
            }
          }


          if ($scope.contactForm.$valid) {
            if ($scope.chse){
              $scope.listingAgentEmail.from = angular.copy($scope.email.from);
              $scope.listingAgentEmail.name = angular.copy($scope.email.name);
              $scope.listingAgentEmail.num = angular.copy($scope.email.num);

              $scope.emailPromise = email.send({}, $scope.email, function(resp){
                $scope.emailFail = false;
                $scope.emailSuccess = true;
                $scope.hideContactForm = true;
                if ($scope.lkey){
                  lh('submit', 'AGENT_EMAIL_SENT', {lkey:$scope.lkey});
                }
                $timeout(function() { $scope.emailSuccess = false; }, 4500);
                $timeout(function() { $scope.hideContactForm = false; }, 5000);
              }, function(err) {
                $scope.emailFail = true;
              });
              $scope.lEmailPromise = email.send({}, $scope.listingAgentEmail, function(resp){
                $scope.emailFail = false;
                $scope.emailSuccess = true;
                $scope.hideContactForm = true;
                if ($scope.lkey){
                  lh('submit', 'AGENT_EMAIL_SENT', {lkey:$scope.lkey});
                }
                $timeout(function() { $scope.emailSuccess = false; }, 4500);
                $timeout(function() { $scope.hideContactForm = false; }, 5000);
              }, function(err) {
                $scope.emailFail = true;
              });

            } else if ($scope.chse === false){
              $scope.emailPromise = email.send({},$scope.email, function(resp){
                $scope.emailFail = false;
                $scope.emailSuccess = true;
                $scope.hideContactForm = true;
                if ($scope.lkey){
                  lh('submit', 'AGENT_EMAIL_SENT', {lkey:$scope.lkey});
                }
                $timeout(function() { $scope.emailSuccess = false; }, 4500);
                $timeout(function() { $scope.hideContactForm = false; }, 5000);
              }, function(err) {
                $scope.emailFail = true;
              });
            } else {
              $scope.emailPromise = email.send({},$scope.email, function(resp){
                $scope.emailFail = false;
                $scope.emailSuccess = true;
                $scope.hideContactForm = true;
                if ($scope.lkey){
                  lh('submit', 'AGENT_EMAIL_SENT', {lkey:$scope.lkey});
                }
                $timeout(function() { $scope.emailSuccess = false; }, 4500);
                $timeout(function() { $scope.hideContactForm = false; }, 5000);
              }, function(err) {
                $scope.emailFail = true;
              });
            }
          }

          if ($scope.listing){
            //Cru Tracking Code
            var record = {
                time: new Date(),
                slug: $scope.slug,
                origination: 'listing',
                action:
                {
                  type: 'contact',
                  target: 'direct'
                },
                zip: $scope.zip,
                city: $scope.city,
                state: $scope.state
            }

            if($scope.agent){
                record.agentID = $scope.agent._id;
                record.agentName = $scope.agent.name;
            }
            Activity.create(record);
          }
        };
      }
    };
  });