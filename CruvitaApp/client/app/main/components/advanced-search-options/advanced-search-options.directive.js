'use strict';

angular.module('cruvitaApp')
  .directive('advancedSearchOptions', function () {
    return {
      templateUrl: 'app/main/components/advanced-search-options/advanced-search-options.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      },
      controller: function($scope, Autocomplete, FilterModel, SchoolModel, Config, $state, $uibModal, $document, $location, SavedSearch) {
        $scope.menu = {
					isCollapsed: true
				};
		    $scope.schoolTypeChange = function(edLevel) {
		      if(FilterModel.schoolFilters.edLevel.value !== edLevel) {

		        FilterModel.schoolFilters.edLevel = _.find(Config.advancedSchoolFilters.edLevel.options, {value: edLevel});
		        FilterModel.schoolFilters.edLevel.value = FilterModel.schoolFilters.edLevel.value;
		        SchoolModel.updateSchools();
		      }
		    }

		    $scope.setScoreFilter = function(filter, key) {
	        Config.advancedSchoolFilters[key].isopen = false;
	        FilterModel.schoolFilters.score = _.find(Config.advancedSchoolFilters.score.options, {value: filter.value});
				  $scope.isCollapsed = true;
					SchoolModel.updateSchools();
		    }


				// $scope.saveSearch = function() {
				// 	var body = {
				// 		queries: HomeModel.buildQueries(angular.copy(FilterModel.homeFilters)),
				// 		url: $location['$$url'],
				// 		email: '', // Input for email address
				// 		frequency: 7 // Amount of days for emails to be sent, this example is 7 days which is once a week
				// 	};

				// 	/* Launch Modal */
		  //     var modalInstance = $uibModal.open({
		  //       animation: true,
		  //       templateUrl: 'savedSearchModal/savedSearchModal.html',
		  //       controller: 'SavedSearchModalCtrl',
		  //       appendTo: $document.find('.results-pge'),
		  //       resolve: {
		  //         body: function () {
		  //           return body;
		  //         }
		  //       }
		  //     });

		  //     modalInstance.result.then(function (body) {
		  //     	$scope.savedSearchPromise = SavedSearch.save({}, body, function(response) {
			 //      }).$promise;
		  //     }, function () {
		  //     });
				// }
      }
    };
  });