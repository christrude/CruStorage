'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('restorePassword', {
        parent: 'site',
        url: '/restorePassword?key',
        views: {
          'content@': {
            templateUrl: 'app/restorePassword/restorePassword.html',
            controller: 'restorePasswordCtrl'
          }
        },
        resolve: {
          resetUser: function(User, $stateParams){
            return User.validPassword({resetPassword: $stateParams.key}, function(user) {
            });
          }
        }
      })
  });
