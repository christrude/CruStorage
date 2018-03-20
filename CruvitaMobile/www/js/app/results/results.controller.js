angular.module('Cruvitamobile').controller('ResultsCtrl', function($scope, Homes, $stateParams) {
  var request = {"polygons":[],"queries":[{"type":"equals","key":"locations.city","value":$stateParams.location, caseSensitive: true}]};
	$scope.homePromise = Homes.retrieve({}, request, function(response) {
    $scope.homes = response.homes.results;
    $scope.agent = response.agents[0];
    $scope.advertisements = response.advertisements;
  }).$promise;
});