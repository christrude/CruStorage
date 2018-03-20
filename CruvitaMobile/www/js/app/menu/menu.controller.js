angular.module('Cruvitamobile').controller('MenuCtrl', function($scope, $state, Autocomplete) {
	$scope.autocomplete = Autocomplete;
	$scope.autocompleteState = function() {
		$state.go('app.autocomplete'); 
	};
	$scope.search = function() {
		Autocomplete.resource.retrieve({nGram: Autocomplete.input}, function(response) {
			Autocomplete.response = response;
		});
	}
});