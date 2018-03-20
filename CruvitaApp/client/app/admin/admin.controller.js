'use strict';

angular.module('cruvitaApp')
  .controller('AdminCtrl', function ($scope, $filter, $window, $http, Auth, User, $uibModal, $location, email, $timeout, Activity) {
    $scope.ints = '';
    $scope.messages = [];
    $scope.paidZips = [];
    $scope.expZips = [];
		$scope.model = {
			apiInput: ''
		}

    $http.get('/api/users').success(function(users) {
      $scope.users = users;
      if ($scope.users) {
        _.each($scope.users, function(u){
          if (u.paidInterests.zips) {
            _.each(u.paidInterests.zips, function(z){
							var expiringZip = angular.copy(z);
              expiringZip.owner = u;
              $scope.paidZips.push(expiringZip);

              var dateComp = $filter('amDifference')(z.paidThrough, null, 'days');
              expiringZip.expires = dateComp;

              if (dateComp < 10) {
                $scope.expZips.push(expiringZip);
              }
            });
          }
        });
      }
    });

		$scope.autocompleteUsers = function() {
			return $http.post('/api/users/search', {queries:[{
	    	partial: true,
				key: 'email',
				value: $scope.model.apiInput
	    }]}).then(function(users) {
				$scope.apiKeyResponse = users.data;
	    	return _.map(users.data, 'email');
	    });
		}

		$scope.getAPIKey = function() {
			var user = _.filter($scope.apiKeyResponse, {email: $scope.model.apiInput})[0];
			user.addAPIKey = {schoolFinder:{version: $scope.model.apiVersion}};
			Auth.update(user).then( function(user) {
				$scope.apiKey = user.apiKey.schoolFinder.key;
			});
		}

    $scope.closeAlert = function(index) {
      $scope.messages.splice(index, 1);
    };

    $scope.sendEmailToOwner = function(interest){
      var r = confirm('Clicking this will send an email to the user, and delete the Zip from their Paid Interests. Do you want to continue??');
      var user = interest.owner;
      if(r){
        var message = 'Dear ' + interest.owner.name + ', We at Cruvita hope this message finds you well! It appears that the zip code you own with us for advertising, ' + interest.zip + ', has come up due for renewal on ' + $filter('date')(interest.paidThrough) + '. Please contact us at sales@cruvita.com to renew your subscription, or call us at 1-844-Cruvita and select the "Sales" option. Thanks again. Sincerely, The Cruvita Team';

        var updateEmail = {
          subject: 'Zip Code Renewal Pending',
          from: 'sales@cruvita.com',
          body: message,  //setup config file for stuff like this
          to: 'admin@cruvita.com'//interest.owner.email
        };

        $scope.emailPromise = email.send({}, updateEmail, function(resp){
          $scope.deleteZip(interest, user);
          $scope.emailFail = false;
          $scope.emailSuccess = true;
          $scope.messages.push({type: 'success', msg: "Email sent to " + user.name + " and zip " + interest.zip + " removed from their interests."});

          $timeout(function() { $scope.emailSuccess = false; }, 5000);
        }, function(err) {
          $scope.emailFail = true;
        });
      }
    };

    $scope.delete = function(user) {
      var r = confirm('Are you sure you want to delete?');
      if (r === true) {
        User.remove({ id: user._id });
        angular.forEach($scope.users, function(u, i) {
          if (u === user) {
            $scope.users.splice(i, 1);
          }
        });
      }
    };

    $scope.deleteZip = function(interest, user) {
      var r = confirm('Are you sure you want to delete?');
      if (r === true) {
        angular.forEach(user.paidInterests.zips, function(z, i) {
          if (z === interest) {
            user.paidInterests.zips.splice(i, 1);
          }
        });

        Auth.update(user).then( function() {
          $scope.messages.push({type: 'success', msg: 'User successfully updated.'});
        })
        .catch( function() {
          $scope.messages.push({type: 'danger', msg: 'Unable to Update'});
        });
      }
    };

    $scope.approve = function(user){
      user.status = 'active';
      Auth.update(user).then( function() {
          $scope.messages.push({type: 'success', msg: 'User successfully updated.'});

          var message = 'Dear ' + user.name + ', Welcome to Cruvita! We at Cruvita wanted to thank you for signing up for our service. One of our Customer Service reps will contact you within 24 hours to help you finish setting up your account, and get you started with Cruvita. If you want to get a jump on the process, go to www.cruvita.com, and login with your new user account using the login button on the upper right side. You may also contact us at sales@cruvita.com, or call us at 1-844-Cruvita and select the "Sales" option. Thanks again. Sincerely, The Cruvita Team';

          var approveEmail = {
            subject: 'Welcome to Cruvita',
            from: 'memberservices@cruvita.com',
            body: message,  //setup config file for stuff like this
            to: user.email
          };

          $scope.emailPromise = email.send({},approveEmail, function(resp){
            $scope.emailFail = false;
            $scope.emailSuccess = true;

            $timeout(function() { $scope.emailSuccess = false; }, 5000);
          }, function(err) {
            $scope.emailFail = true;
          });
        })
        .catch( function() {
          $scope.messages.push({type: 'danger', msg: 'Unable to Update'});
        }
      );
    };


    $scope.deny = function(user) {
      var r = confirm('Are you sure you want to delete?');
      if (r === true) {

        var message = 'Dear ' + user.name + ', \r\n \r\n We at Cruvita wanted to thank you for your interest in Cruvita. At this time we are only allowing Cruvita Home Sales Experts to be registered on the site. If you feel this is in error contact us directly at MemberServices@cruvita.com. \r\n \r\n Sincerely, The Cruvita Management Team \r\n MemberServices@cruvita.com';

        var denyEmail = {
          subject: 'Membership Update from Cruvita',
          from: 'memberservices@cruvita.com',
          body: message,  //setup config file for stuff like this
          to: user.email
        };

        $scope.emailPromise = email.send({},denyEmail, function(resp){
          $scope.emailFail = false;
          $scope.emailSuccess = true;


          $timeout(function() { $scope.emailSuccess = false; }, 5000);
        }, function(err) {
          $scope.emailFail = true;
        });

        User.remove({ id: user._id });
        angular.forEach($scope.users, function(u, i) {
          if (u === user) {
            $scope.users.splice(i, 1);
          }
        });
      }
    };

    $scope.saveInterests = function(user, ints){
      $scope.user = user;
      $scope.ints = ints;

      $uibModal.open({
        backdrop: true,
        templateUrl: 'app/admin/intAddition.html',
        controller: function($scope, $uibModalInstance) {
          $scope.initialInterestArray = ints.split(', ');
          $scope.interestArray = [];
          $scope.savableDate = true;
          $scope.savableAmt = true;
          $scope.messages = [];

          $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1,
            showWeeks: false
          };

          $scope.savable = function (interest, type) {
            if (type === 'date'){
              if (interest.paidThrough) {
                $scope.savableDate = false;
              }
            } else if (type === 'amt'){
              if (interest.amount) {
                $scope.savableAmt = false;
              }
            }
          };

          $scope.toggleMin = function() {
            $scope.minDate = $scope.minDate ? null : new Date();
          };
          $scope.toggleMin();

          $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
          $scope.format = $scope.formats[3];

          $scope.openDatepicker = function($event) {

            $scope.opened = true;
          };

          _.each($scope.initialInterestArray, function(ii){
            var today = new Date();
            today = $filter('date')(today, 'shortDate');

            var x = {
              zip: ii,
              amount: '',
              paidThrough: today
            };

            $scope.interestArray.push(x);
          });

          $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
          };

          $scope.save = function() {
            _.each($scope.interestArray, function(i){
              user.paidInterests.zips.push(i);
            });

            //Save the user
            Auth.update(user).then( function() {
                $scope.messages.push({type: 'success', msg: 'User successfully updated.'});
                $uibModalInstance.close($scope.messages);
              })
              .catch( function() {
                $scope.messages.push({type: 'danger', msg: 'Unable to Update'});
                $uibModalInstance.close($scope.messages);
              });


          };
        }
      }).result.then(function (selectedItem) {
        $scope.messages = selectedItem;
      });
    };


    /// ACTIVITY

    $scope.allActivityRecordsColumnDefs = [
      {
        field: 'time',
        cellTemplate: '<div class="ui-grid-cell-contents">{{ COL_FIELD | date : short }}</div>',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>'
      },{
        field: 'origination',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>'
      },{
        field: 'agentName',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>'
      },{
        field: 'zip',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>'
      },{
        field: 'city',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>'
      },{
        field: 'activityType',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>'
      },{
        field: 'activityTarget',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>'
      },{
        field: 'url',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>',
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="{{ COL_FIELD }}" target="_blank">{{ COL_FIELD }}</a></div>'
      },
    ];

    $scope.dir = -1;

    $scope.sortDirectionChange = function (target) {
      $scope.sorted = {
        time: false,
        origination: false,
        zip: false,
        city: false,
        activityType: false,
        activityTarget: false,
        url: false
      }
      $scope.sorted[target] = true;
    }
    $scope.sortChanged = function(sort) {
      var queries = [];
      if (sort === "activityTarget") {
        sort = "action.target";
      } else if (sort === "activityType") {
        sort = "action.type";
      }

      var q1 = {
        "value": ['view', 'click'],
        "key": "action.type",
        "type": "or"
      }

      $scope.dir = -$scope.dir;
      queries.push(q1);

      var sortByPromise = Activity.search({sortField: sort, sortDir: $scope.dir}, {queries: queries}, function(response) {
        $scope.allActivityRecords = response;
        _.forEach($scope.allActivityRecords, function(r){
          delete r.__v;
          delete r.agentID;
          delete r._id;
          delete r.agentName;
          r.activityType = r.action.type;
          r.activityTarget = r.action.target;
          delete r.action;
          r.url = $location.protocol() + "://" +  $location.host() + ":" + $location.port() + "/" + r.origination + "/" + r.slug;
          delete r.slug;
          r.time = $filter('date')(r.time, 'short');
        })
      }).$promise;
    }

    var totalViewsDataFunc = function() {
      var queries = [];
      $scope.totalViews = [];

      var q2 = {
        "value": "view",
        "key": "action.type",
        "type": "equals"
      }

      var q3 = {
        "value": ['school', 'listing', 'results', 'ranking', 'profile', 'mobile-school', 'mobile-listing', 'mobile-results', 'mobile-ranking', 'mobile-profile'],
        "key": "origination",
        "type": "OR"
      }

      queries.push(q2);
      queries.push(q3);

      var totalViewsPromise = Activity.search({}, {queries: queries}, function(response) {
        var schoolViews = 0;
        var listingViews = 0;
        var profileViews = 0;
        var rankingViews = 0;
        var resultsViews = 0;
        var mobileSchoolViews = 0;
        var mobileListingViews = 0;
        var mobileResultsViews = 0;
        var mobileRankingViews = 0;
        var mobileProfileViews = 0;

       _.forEach(response, function(view){
        if (view.origination === 'listing') {
          listingViews ++;
        } else if (view.origination === 'school') {
          schoolViews ++;
        } else if (view.origination === 'profile') {
          profileViews ++;
        } else if (view.origination === 'ranking') {
          rankingViews ++;
        } else if (view.origination === 'results') {
          resultsViews ++;
        } else if (view.origination === 'mobile-school') {
          mobileSchoolViews ++;
        } else if (view.origination === 'mobile-listing') {
          mobileListingViews ++;
        } else if (view.origination === 'mobile-results') {
          mobileResultsViews ++;
        } else if (view.origination === 'mobile-ranking') {
          mobileRankingViews ++;
        } else if (view.origination === 'mobile-profile') {
          mobileProfileViews ++;
        }
       });

       $scope.totalViews.push(listingViews);
       $scope.totalViews.push(schoolViews);
       $scope.totalViews.push(profileViews);
       $scope.totalViews.push(rankingViews);
       $scope.totalViews.push(resultsViews);
       $scope.totalViews.push(mobileSchoolViews);
       $scope.totalViews.push(mobileListingViews);
       $scope.totalViews.push(mobileResultsViews);
       $scope.totalViews.push(mobileRankingViews);
       $scope.totalViews.push(mobileProfileViews);

       $scope.totalViewsLabels = ['Listings', 'Schools', 'Profiles', 'Rankings', 'Results', 'Mobile Schools', 'Mobile Listings', 'Mobile Results', 'Mobile Rankings', 'Mobile Profiles'];

      }).$promise;
    }

    var totalClicksDataFunc = function() {
      var queries = [];
      $scope.totalClicks = [];

      var q2 = {
        "value": "click",
        "key": "action.type",
        "type": "equals"
      }

      queries.push(q2);

      var totalClicksPromise = Activity.search({}, {queries: queries}, function(response) {

        var clickGroups = [];
        var clickCountGroups = {};

        clickGroups = _.uniq(_.map(response, 'action.target'));

        $scope.totalClicksLabels = clickGroups;

        _.forEach(clickGroups, function(z){
          clickCountGroups[z] = 0;
          _.forEach(response, function(r){
            if (r.action.target === z) {
              clickCountGroups[z] ++;
            }
          });
          $scope.totalClicks.push(clickCountGroups[z]);
        })
      }).$promise;
    }

    var allActivityRecordsFunc = function() {
      var queries = [];
      var q1 = {
        "value": ['view', 'click'],
        "key": "action.type",
        "type": "or"
      }

      queries.push(q1);

      var allActivityRecordsPromise = Activity.search({}, {queries: queries}, function(response) {
        $scope.allActivityRecords = response;
        _.forEach($scope.allActivityRecords, function(r){
          delete r.__v;
          delete r.agentID;
          delete r._id;
          r.activityType = r.action.type;
          r.activityTarget = r.action.target;
          delete r.action;
          r.url = $location.protocol() + "://" +  $location.host() + ":" + $location.port() + "/" + r.origination + "/" + r.slug;
          delete r.slug;
          r.time = $filter('date')(r.time, 'short');
        })
      }).$promise;
    }

    allActivityRecordsFunc();
    totalViewsDataFunc();
    totalClicksDataFunc();
  });