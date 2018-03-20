'use strict';

angular.module('cruvitaApp')
  .controller('AreasCtrl', function ($scope, Config, Page) {



    Page.setTitle('Find Homes on Cruvita in These Areas');
    Page.setDescription('Cruvita has Schools listings nationwide and Home Listings available in Virginia, Washington DC, Maryland, North Carolina and Florida');

    $scope.areasQuartered = [];
    $scope.viewable = true;
    angular.forEach(Config.areasServed, function(area) {
    	var currentState = {
    		label: area.label,
    		areas: []
    	};

    	var currentQuarter = [];
    	angular.forEach(area.areas, function(element, index) {
    		currentQuarter.push(element);
    		if(index % 4 === 3 || index === area.areas.length - 1) {
    			currentState.areas.push(angular.copy(currentQuarter));
    			currentQuarter = [];
    		}
    	})
    	$scope.areasQuartered.push(currentState);
    })
  });
