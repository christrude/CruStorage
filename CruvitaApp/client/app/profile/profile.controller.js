'use strict';

angular.module('cruvitaApp')
  .controller('ProfileCtrl', function ($scope, $rootScope, $location, $filter, Homes, School, $stateParams, $q, $state, User, Auth, $timeout, Upload, Activity, Page, SchoolComparisonStorageService) {

    $scope.homeModel = {
      homes: {}
    };
    $scope.profilePage = true;
    $scope.currentUser = Auth.getCurrentUser();
    $scope.protocol = $location.protocol();
    $scope.tabs = {active: 1};

    //Needs a slight delay to generate the right user.
    $timeout(function(){$scope.isAdmin = Auth.isAdmin();}, 10);

    //
    // Charts data
    //

    $scope.totalViews = [];
    $scope.totalViewsLabels = ['Listing', 'School', 'Profile'];

    $scope.totalZipsData = [];
    $scope.totalZipsLabels = [];

    $scope.totalCitiesData = [];

    $scope.allActivityRecords = [];
    $scope.allActivityRecordsColumnDefs = [
      {
        field: 'time',
        cellTemplate: '<div class="ui-grid-cell-contents">{{ COL_FIELD | date : short }}</div>',
        headerCellTemplate: '<div ng-click="grid.appScope.sortChanged(col.field); grid.appScope.sortDirectionChange(col.field)" class="custom-header-wrapper ngHeaderText headerCell clearfix">{{col.name | camelCase}} <span class="sort" ng-if="grid.appScope.sorted[col.field]"><fa ng-if="grid.appScope.dir === -1" name="angle-down"></fa> <fa ng-if="grid.appScope.dir === 1" name="angle-up"></fa></span></div>'
      },{
        field: 'origination',
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


    if(!$stateParams.slug && !$scope.currentUser.name) {
      $state.go('404');
    }

    var createRecord = function() {
      var record = {
        time: new Date(),
        slug: $stateParams.slug,
        origination: 'profile',
        action:
        {
          type: 'view',
          target: 'profile'
        },
        zip: ' ',
        city: ' ',
        agentID: $scope.user._id,
        agentName: $scope.user.name
      }

      Activity.create(record);
    }

    var totalViewsDataFunc = function() {
      var queries = [];
      var q1 = {
        "value": $scope.user._id,
        "key": "agentID",
        "type": "equals"
      }

      var q2 = {
        "value": "view",
        "key": "action.type",
        "type": "equals"
      }

      var q3 = {
        "value": ['school', 'listing', 'profile'],
        "key": "action.target",
        "type": "OR"
      }



      queries.push(q1);
      queries.push(q2);
      queries.push(q3);

      var totalViewsPromise = Activity.search({}, {queries: queries}, function(response) {
        var schoolViews = 0;
        var listingViews = 0;
        var profileViews = 0;
       _.forEach(response, function(view){
        if (view.origination === 'listing') {
          listingViews ++;
        } else if (view.origination === 'school') {
          schoolViews ++;
        } else if (view.origination === 'profile') {
          profileViews ++;
        }
       });

       $scope.totalViews.push(listingViews);
       $scope.totalViews.push(schoolViews);
       $scope.totalViews.push(profileViews);
      }).$promise;
    }

    var totalClicksDataFunc = function() {
      var queries = [];
      var q1 = {
        "value": $scope.user._id,
        "key": "agentID",
        "type": "equals"
      }

      var q2 = {
        "value": "click",
        "key": "action.type",
        "type": "equals"
      }

      queries.push(q1);
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
          $scope.totalClicksData.push(clickCountGroups[z]);
        })

      }).$promise;
    }

    var totalZipsDataFunc = function() {
      var zips = returnZipsArray($scope.user.paidInterests.zips);
      var queries = [];
      $scope.totalZipsLabels = [];

      var q = {
        "value": $scope.user._id,
        "key": "agentID",
        "type": "equals"
      }

      var q1 = {
        "value": zips,
        "key": "zip",
        "type": "or"
      }

      var q2 = {
        "value": "view",
        "key": "action.type",
        "type": "equals"
      }

      var q4 = {
        "value": "profile",
        "key": "origination",
        "type": "not"
      }

      queries.push(q);
      queries.push(q1);
      queries.push(q2);
      queries.push(q4);

      var totalZipsPromise = Activity.search({}, {queries: queries}, function(response) {
        var zipGroup = {}
        _.forEach(zips, function(z){
          zipGroup[z] = 0;
          _.forEach(response, function(r){
            if (r.zip === z) {
              zipGroup[z] ++;
            }
          });
          if (zipGroup[z] > 0) {
            $scope.totalZipsLabels.push(z);
          }
          $scope.totalZipsData.push(zipGroup[z]);
        })
      }).$promise;
    }

    var totalCitiesDataFunc = function() {

      var queries = [];

      var q1 = {
        "value": $scope.user._id,
        "key": "agentID",
        "type": "equals"
      }

      var q2 = {
        "value": "view",
        "key": "action.type",
        "type": "equals"
      }

      var q4 = {
        "value": "profile",
        "key": "origination",
        "type": "not"
      }

      queries.push(q1);
      queries.push(q2);
      queries.push(q4);

      var totalCitiesPromise = Activity.search({}, {queries: queries}, function(response) {
        var cityGroups = [];
        var cityGroups2 = [];
        var cityCountGroups = {};
        $scope.totalCitiesLabels = [];

        cityGroups = _.map(response, 'city');
        _.forEach(cityGroups, function(n){
          n = n.toUpperCase();
          cityGroups2.push(n);
        })
        cityGroups = _.uniq(cityGroups2);

        _.forEach(cityGroups, function(z){
          cityCountGroups[z] = 0;
          _.forEach(response, function(r){
            if (r.city.toUpperCase() == z) {
              cityCountGroups[z] ++;
            }
          });
          if (cityCountGroups[z] > 0) {
            $scope.totalCitiesLabels.push(z);
          }
          $scope.totalCitiesData.push(cityCountGroups[z]);
        })
      }).$promise;
    }

    var allActivityRecordsFunc = function() {
      var queries = [];
      var q1 = {
        "value": $scope.user._id,
        "key": "agentID",
        "type": "equals"
      }


      queries.push(q1);

      var allActivityRecordsPromise = Activity.search({sortField: "time", sortDir: $scope.dir}, {queries: queries}, function(response) {
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

    var returnZipsArray = function(zips){
      var zipsArray = [];
      _.forEach(zips, function(z){
        zipsArray.push(z.zip);
      })

      return zipsArray;
    }

    var listFuncs = function() {
      var zips = returnZipsArray($scope.user.paidInterests.zips);
      var queries1 = [];
      var queries2 = [];

      var q1 = {
        "value": zips,
        "key": "address.zip",
        "type": "or"
      }

      var q2 = {
        "value": zips,
        "key": "listing.address.postalcode",
        "type": "or"
      }

      var q3 = {
        "value": "Purchase",
        "key": "listing.listingcategory",
        "type": "equals"
      }

      queries1.push(q1);
      queries2.push(q2);
      queries2.push(q3);

      var schoolsListPromise = School.retrieve({}, {queries: queries1}, function(response) {
        $scope.schoolsList = response.schools.results;
      }).$promise;
      var homesListPromise = Homes.retrieve({}, {queries: queries2}, function(response) {

        $scope.homeModel.homes.results = response.homes.results;
      }).$promise;
    }

    $scope.clear = function() {
      $scope.tabs.active = 1;
      $('body').scrollTop(0);
    }

    $scope.hidePen = false;

  ////
  //// Get info
  ////
    $scope.dir = -1;

    $scope.initLoad = function() {
      if($stateParams.slug) {
        $scope.isYou = false;
        $scope.settingsActiveTab = false;
        $scope.propertiesActiveTab = true;
        var userPromise = User.get({id: $stateParams.slug}, function(response) {
          $scope.user = response;
          if(!$scope.user.social.remarketing){
            $scope.user.social.remarketing = [];
          }
          if ($scope.user.social.remarketing && $scope.user.social.remarketing.length === 0) {
            $scope.user.social.remarketing.push('');
            $scope.user.social.remarketing.push('');
          }

          $scope.share = {
              Url:  $scope.protocol + '://www.cruvita.com/profile/' + $stateParams.slug,
              Name: 'See Cruvita Home Sales Expert ' + $scope.user.name + ' at #Cruvita'
          };

          $scope.updatedUser = angular.copy($scope.user);

          Page.setTitle('Cruvita Home Sales Expert | ' + $scope.user.name + ' | Cruvita');
          Page.setDescription('Cruvita Home Sales Expert | ' + $scope.user.name + ' | Cruvita');

          createRecord();
          totalZipsDataFunc();
          totalViewsDataFunc();
          totalCitiesDataFunc();
          allActivityRecordsFunc();
          listFuncs();
        }).$promise;
      } else {
        $scope.isYou = true;
        $scope.settingsActiveTab = false;
        $scope.propertiesActiveTab = true;
        $scope.user = angular.copy($scope.currentUser);

        $scope.updatedUser = angular.copy($scope.user);

        Page.setTitle('Cruvita Home Sales Expert | ' + $scope.user.name + ' | Cruvita');
        Page.setDescription('Cruvita Home Sales Expert | ' + $scope.user.name + ' | Cruvita');

        createRecord();
        totalViewsDataFunc();
        totalClicksDataFunc();
        totalZipsDataFunc();
        totalCitiesDataFunc();
        allActivityRecordsFunc();
        listFuncs();
      }
    }
    $scope.initLoad();

    ///Set is admin
    $scope.$watch('isAdmin', function(){
      if ($scope.isAdmin) {
        $scope.active = 4;
        $scope.isYou = true;
      }
    });

    //
    // Page Actions
    //

    $scope.errors = {};
    $scope.files = [];

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
      if (sort === "activityTarget") {
        sort = "action.target";
      } else if (sort === "activityType") {
        sort = "action.type";
      }

      var queries = [];
      var q1 = {
        "value": $scope.user._id,
        "key": "agentID",
        "type": "equals"
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

    $scope.clickTrackEmail = function(){
      //Cru Tracking Code
      var record = {
          time: new Date(),
          slug: $scope.user.slug,
          origination: 'profile',
          action:
          {
            type: 'click',
            target: 'email'
          }
      }

      Activity.create(record);
    };

    $scope.clickTrackWebsite = function(){
      //Cru Tracking Code
      var record = {
          time: new Date(),
          slug: $scope.user.slug,
          origination: 'profile',
          action:
          {
            type: 'click',
            target: 'website'
          }
      }

      Activity.create(record);
    };

    $scope.clickTrackPhone = function(agent){
      //Cru Tracking Code
      var record = {
          time: new Date(),
          slug: $scope.slug,
          origination: 'profile',
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

    $scope.showPopover = function(){
      angular.element('.share-list-item .btn').hide(100);
      angular.element('.share-list-item ul').delay(100).show(100);
    };
    $scope.hidePopover = function(){
      angular.element('.share-list-item ul').hide(100);
      angular.element('.share-list-item .btn').delay(100).show(100);
    };

    $scope.goToListing = function (home) {
      var unit = '';
      if (home.listing.address.unitnumber){
        unit = home.listing.address.unitnumber[0];
      }
      $state.go('listing', {homeId: home.slug, unit: unit});
    };

    $scope.addPhone = function() {
      $scope.updatedUser.phone.push('');
    }

    $scope.remPhone = function(ind) {
      $scope.updatedUser.phone.splice(ind, 1);
    }


    $scope.scoreExists = function(score){
      if (score < 999999999){
        return true;
      }
    };

    $scope.generateThumb = function(file) {
      if (file !==  null) {
        if (file.type.indexOf('image') > -1) {
          $timeout(function() {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = function(e) {
              $timeout(function() {
                file.dataUrl = e.target.result;
              });
            };
          });
        }
      }
    };

    $scope.changePassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changePassword( $scope.user.oldPassword, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
    };

    $scope.updateUser = function(picFile) {
      if ($scope.updatedUser.website){
        var website = $scope.updatedUser.website.split("://");
        if(website.length > 1 && (website[0] !== ('http' && 'https')) ) {
          $scope.updatedUser.website = 'http://' + website[1];
        } else if (website.length == 1){
          $scope.updatedUser.website = 'http://' + $scope.updatedUser.website ;
        }
      }

      if (picFile) {
        if ($scope.updatedUser.$$state){
          delete $scope.updatedUser.$$state;
        }
        if ($scope.updatedUser.$promise){
          delete $scope.updatedUser.$promise;
        }
        $scope.formUpload = true;
        $scope.generateThumb(picFile);
        Upload.upload({
          url: 'api/users/' + $scope.updatedUser._id,
          method: 'PUT',
          data: {data:$scope.updatedUser},
          file: picFile
        }).success(function(data, status, headers, config) {
          if(status === 200) {
            $scope.user = angular.copy(data);
            $scope.updatedUser = angular.copy(data);
            $scope.alert = {
              type: 'success',
              msg: 'User profile saved successfully.'
            }
          }
        }).catch(function(resp){
          $scope.alert = {
            type: "warning",
            msg: "User profile couldn't be saved. Please try again, or contact an admin."
          }
        });;
      } else {
				Auth.update($scope.updatedUser).then(function(data) {
          $scope.user = angular.copy(data);
          $scope.updatedUser = angular.copy(data);
          $scope.tabs.active = 1;
          $scope.alert = {
            type: 'success',
            msg: 'User profile saved successfully.'
          }
          $('body').scrollTop(0);

				}).catch(function(resp){
          $scope.alert = {
            type: "warning",
            msg: "User profile couldn't be saved. Please try again, or contact an admin."
          }
        });
      }
    };

    $scope.closeAlert = function() {
      $scope.alert = null;
    };

    $scope.compare = function(loc) {
      SchoolComparisonStorageService.setAgent($scope.user);
      SchoolComparisonStorageService.setAddress(loc);
      $state.go('schoolcomparison', {address: loc})
    }
  });
