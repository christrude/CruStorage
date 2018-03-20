'use strict';

angular.module('cruvitaApp')
  .controller('MyhomeCtrl', function ($scope, Autocomplete, Myhome, Config, $state) {
		$scope.data = {
			weightScale: ['Must Have', 'Very Important', 'Somewhat Important', 'A little Important', 'Irrelevant'],
			selected: null,
			maxRating: 10
		};
		
		$scope.tabs = [{
			label: 'Location',
			active: true,
			activeQuestion: 0,
			questions: [{
				value: 'Where do you want to live?',
				label: 'location',
				multiCardinal: true,
				inputType: 'search',
				must: true,
				weight: 1000,
				type: 'or',
				values: [{
					label: '',
					value: '',
					key: ''
				}]
			}]
		},{
			label: 'Financial',
			activeQuestion: 0,
			questions: [{
				value: 'What is your max sales price?',
				label: 'priceMax',
				inputType: 'dropdown',
				must: true,
				options: Config.advancedHomeFilters.priceMax.options,
				type: 'rangeMin',
				weight: 1000,
				values: [{
					value: '',
					key: 'listing.listprice.0' 
				}]
			}]
		},{
			label: 'Schools',
			activeQuestion: 0,
			questions: [{
				value: 'Are elementary schools important to you?',
				label: 'elementary schools',
				inputType: 'radio',
				weights: [250, 100, 50, 25, 0],
				weight: 50,
				type: 'rangeMin',
				values: [{
					label: null,
					min: 0,
					max: 10000,
					key: 'schools.elementaryScore'
				}]
			}]
    },{
			label: 'House Features',
			activeQuestion: 0,
			questions: [{
				value: 'How many bedrooms do you want?',
				label: 'bedrooms',
				inputType: 'input',
				weights: [250, 100, 50, 25, 0],
				weight: 50,
				type: 'min',
				values: [{
					label: null,
					value: null,
					key: 'listing.bedrooms.0'
				}]
			}]
		}];
		
		$scope.addValue = function(question) {
			question.values.push({
				label: '',
				value: '',
				key: ''
			});
		}
		
		$scope.removeValue = function(question, value) {
			question.values.splice(question.values.indexOf(value), 1);
		}
		
    $scope.autocomplete = Autocomplete;
		$scope.getResults = function(value) {
			_.each(Autocomplete.lastSelected, function(item) {
				if(value.label.toString().indexOf(item.dispName.capitalize()) !== -1) {
					value.label = item.dispName;
					value.value = item.slug;
					value.key = Autocomplete.homesComponentMap['location' + item.type];
				}	
			});
		}
		
		$scope.setTab = function(tab) {
			_.map($scope.tabs, function(tab) { 
			  tab.active = false; 
			  return tab;
			});
			tab.active = true;
			$scope.activeTab = tab;
		};
		
		$scope.backQuestion = function() {
			if($scope.activeTab.activeQuestion > 0) {
				$scope.activeTab.activeQuestion--;
			}
			else {
				$scope.activeTab.activeQuestion = 0;
				var tabIndex = $scope.tabs.indexOf($scope.activeTab);
				if(tabIndex > 0) {
					$scope.setTab($scope.tabs[tabIndex-1]);
				}
			}
		};
		
		$scope.skipQuestion = function() {
			$scope.nextQuestion();
		};
		
		$scope.nextQuestion = function() {
			if($scope.activeTab.activeQuestion < $scope.activeTab.questions.length - 1) {
				$scope.activeTab.activeQuestion++;
			}
			else {
				$scope.activeTab.activeQuestion = 0;
				var tabIndex = $scope.tabs.indexOf($scope.activeTab);
				if(tabIndex < $scope.tabs.length - 1) {
					$scope.setTab($scope.tabs[tabIndex+1]);
				}
			}
		};
		
		$scope.setQuestion = function(index) {
			$scope.activeTab.activeQuestion = index;
		}
		
		$scope.submit = function() {
			/* Transform tabs object into myhome model */
			var myhome = {};
			myhome.queries = [];
			angular.forEach(_.clone($scope.tabs, true), function(tab) {
				angular.forEach(tab.questions, function(question) {
					question.must = question.must || question.weight === question.weights[0];
					if(question.label === 'priceMax') {
						question.values[0].max = question.values[0].value;
						question.values[0].min = question.values[0].value * 0.75;
						myhome.queries.push(question);
					}
					else if(tab.weight !== 4 && (question.values[0].value || question.values[0].min || question.values[0].max)) {
						myhome.queries.push(question);
					}
				});
			});
      $scope.myHomePromise = Myhome.create({}, myhome, function(response) {
				$state.go('results', {myhome: response._id});
      }).$promise;
		}
		
		$scope.setTab($scope.tabs[0]);

	  $scope.hoveringOver = function(value) {
	    $scope.overStar = value;
	    $scope.percent = 100 * (value / $scope.data.maxRating);
	  };
  });
	