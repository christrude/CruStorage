'use strict';

angular.module('cruvitaApp')
  .controller('restorePasswordCtrl', function ($scope, resetUser, User, $state, $stateParams) {
    $scope.changePassword = function(form) {
    	if(form.newPassword.$valid) {
    		User.restorePassword({resetPassword: $stateParams.key, password: form.newPassword.$modelValue}, function(user) {
					$state.go('home');
				});
    	}
    }
  });
