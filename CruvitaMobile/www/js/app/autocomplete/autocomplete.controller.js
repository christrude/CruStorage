angular.module('Cruvitamobile').controller('AutocompleteCtrl', function($scope, Autocomplete, $state,$location) {
	$scope.autocomplete = Autocomplete;
	$scope.setLocation = function(location) {
		$state.transitionTo('app.results', {location: location.slug});
	}
});