'use strict';

angular.module('cruvitaApp')
  .directive('login', function () {
    return {
      restrict: 'EA',
      link: function (scope, element) {
      	element.on('click', function () {
          if(scope.isCollapsed) {
            scope.isCollapsed = !scope.isCollapsed;
          }
      		scope.open();
			  });
      },
      controller: function($scope, $uibModal) {
      	$scope.open = function() {
	      	$uibModal.open({
						backdrop: true,
			      templateUrl: 'components/login/login.html',
			      controller: function($scope, $uibModalInstance, Auth, $location, $window, email, $timeout) {
			      	$scope.user = {};
					    $scope.errors = {};
              $scope.user.agentType = 'realtor';

              $scope.showReg = false;

              $scope.phonePattern = (function(){
                var regexp = /^\(?(\d{3})\)?[ .-]?(\d{3})[ .-]?(\d{4})$/;
                return {
                    test: function(value) {
                        if( $scope.requireTel === false ) {
                            return true;
                        }
                        return regexp.test(value);
                    }
                };
              })();

					    $scope.login = function(form) {
					      $scope.submitted = true;

					      if(form.$valid) {
					        Auth.login({
					          email: $scope.user.email,
					          password: $scope.user.password
					        })
					        .then( function() {
						    		$uibModalInstance.close();
					        })
					        .catch( function(err) {
					          $scope.errors.err = "Invalid Email and/or Password. Please try again, or, fill in your email address and click 'Forgot Password' above to reset your password.";
					        });
					      }
					    };

              $scope.resetPassword = function(form) {
                if($scope.user.email) {
                  $scope.errors= {};
                  $scope.emailPromise = email.send({email: $scope.user.email, type: 'resetPassword'}, function(resp){
                    $scope.errors.success = "Password Reset email sent, please be sure to check your spam filter for it too."
                  }, function(err) {
                    $scope.emailFail = true;
                    $scope.errors.other = err;
                  });
                } else {
                  $scope.errors.err = "Please enter an email address to send the password reset information to.";
                }
              }

					    $scope.loginOauth = function(provider) {
					      $window.location.href = '/auth/' + provider;
					    };
			      	$scope.ok = function () {
						    $uibModalInstance.close();
						  };

						  $scope.cancel = function () {
						    $uibModalInstance.dismiss('cancel');
						  };

              $scope.register = function(form) {
                $scope.submitted = true;
                if(form.$valid) {
                  Auth.createUser({
                    agentType: $scope.user.agentType,
                    email: $scope.user.email,
                    licenseNumber: $scope.user.licenseNumber,
                    name: $scope.user.name,
                    bio: '',
                    phone: $scope.user.phone,
                    pictureType: '',
                    pictureLocation: '',
                    password: $scope.user.password,
                    realtyName: '',
                    social: {
                      facebook: '',
                      linkedin: '',
                      google: '',
                      twitter: '',
                      remarketing: []
                    },
                    state: $scope.user.state,
                    status: 'pending',
                    website: 'http://'
                  })
                  .then( function() {
                    // Send email to Sales

                    $scope.email = {
                      subject: 'New Agent Signup',
                      from: 'info@cruvita.com',
                      body: $scope.user.name + 'has joined Cruvita. Their email is ' + $scope.user.email + ' and phone number is ' + $scope.user.phone + '. be sure to go to https://www.cruvita.com/console and verify their license and send them a welcome message.',
                      to: 'sales@cruvita.com'
                    };

                    $scope.emailPromise = email.send({},$scope.email, function(resp){
                      $scope.emailFail = false;
                      $scope.emailSuccess = true;

                      $timeout(function() { $scope.emailSuccess = false; }, 5000);
                    }, function(err) {
                      $scope.emailFail = true;
                    });
                    // Account created, redirect to home
                    $location.path('/');
                  })
                  .catch( function(err) {
                    err = err.data;
                    $scope.errors = {};
                    // Update validity of form fields that match the mongoose errors
                    angular.forEach(err.errors, function(error, field) {
                      form[field].$setValidity('mongoose', false);
                      $scope.errors[field] = error.message;
                    });
                  });
                }
                $uibModalInstance.close();
              };
			      }
			    });
	      };
      }
    };
  });
