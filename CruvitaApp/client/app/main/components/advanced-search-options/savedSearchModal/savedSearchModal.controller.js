'use strict';

angular.module('cruvitaApp')
  .controller('SavedSearchModalCtrl', function ($scope, $uibModalInstance, body) {

    $scope.body = body;


    $scope.ok = function () {
      $uibModalInstance.close($scope.body);
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
    };
  });