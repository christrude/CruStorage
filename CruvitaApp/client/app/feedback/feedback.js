'use strict';

angular.module('cruvitaApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('feedback', {
        parent: 'site',
        url: '/feedback',
        views: {
          'content@': {
            templateUrl: 'app/feedback/feedback.html',
            controller: 'FeedbackCtrl'
          }
        }
      });
  });
