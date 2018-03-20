'use strict';

angular.module('cruvitaApp')
  .directive('advancedSearchOptions', function () {
    return {
      templateUrl: 'app/main/components/advanced-search-options/advanced-search-options.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      },
      controller: function($scope, Autocomplete, FilterModel, HomeModel, SchoolModel, Config, $state, $uibModal, $document, $location, SavedSearch) {
        $scope.menu = {
					isCollapsed: true
				};
		    $scope.schoolTypeChange = function(edLevel) {
		      if(FilterModel.schoolFilters.edLevel.value !== edLevel) {
		        if(FilterModel.schoolFilters.score && FilterModel.schoolFilters.score.value) {
		          HomeModel.updateHomes();
		        }
		        FilterModel.schoolFilters.edLevel = _.find(Config.advancedSchoolFilters.edLevel.options, {value: edLevel});
		        FilterModel.schoolFilters.edLevel.value = FilterModel.schoolFilters.edLevel.value;
		        SchoolModel.updateSchools();
		      }
		    }

		    $scope.setHomeFilter = function(filter, key) {
		      if(FilterModel.homeFilters[key] != filter) {
		        if(typeof filter !== "object") {
		          FilterModel.homeFilters[key] = Config.advancedHomeFilters[key].options[0];
		          FilterModel.homeFilters[key].value = filter;
		          switch(FilterModel.homeFilters[key].type) {
		            case 'max':
		              FilterModel.homeFilters[key].label = FilterModel.homeFilters[key].value;
		              break;
		            case 'min':
		              FilterModel.homeFilters[key].label = FilterModel.homeFilters[key].value + '+';
		              break;
		          }
		          FilterModel.homeFilters[key].label = filter;
		        }
		        else {
		          FilterModel.homeFilters[key] = filter;
		        }
		        Config.advancedHomeFilters[key].isopen = false;
						$scope.menu.isCollapsed = true;
		        HomeModel.updateHomes();
		      }
		    }

		    $scope.setScoreFilter = function(filter, key) {
	        Config.advancedSchoolFilters[key].isopen = false;
	        FilterModel.schoolFilters.score = _.find(Config.advancedSchoolFilters.score.options, {value: filter.value});
				  $scope.isCollapsed = true;
					SchoolModel.updateSchools();
		    }

		    $scope.updateOrFilter = function(key, value) {
		      if(!FilterModel.homeFilters[key].value) {
		        FilterModel.homeFilters[key].value = [];
		      }
		      if(FilterModel.orFilters.propertysubtype[value]) {
		        FilterModel.homeFilters[key].value.push(value);
		      }
		      else {
		        FilterModel.homeFilters[key].value.splice(FilterModel.homeFilters[key].value.indexOf(value), 1);
		      }
					$scope.menu.isCollapsed = true;
		      HomeModel.updateHomes();
		    }

				$scope.updateHomeSort = function(choice) {
					Config.advancedHomeFilters.sort.isopen = false;
					$scope.menu.isCollapsed = true;
					HomeModel.homeSortField = choice;
					HomeModel.updateHomes();
				}

				$scope.saveSearch = function() {
					var body = {
						queries: HomeModel.buildQueries(angular.copy(FilterModel.homeFilters)),
						url: $location['$$url'],
						email: '', // Input for email address
						frequency: 7 // Amount of days for emails to be sent, this example is 7 days which is once a week
					};

					/* Launch Modal */
		      var modalInstance = $uibModal.open({
		        animation: true,
		        templateUrl: 'savedSearchModal/savedSearchModal.html',
		        controller: 'SavedSearchModalCtrl',
		        appendTo: $document.find('.results-pge'),
		        resolve: {
		          body: function () {
		            return body;
		          }
		        }
		      });

		      modalInstance.result.then(function (body) {
		      	$scope.savedSearchPromise = SavedSearch.save({}, body, function(response) {
			      }).$promise;
		      }, function () {
		      });
				}
      }
    };
  });