'use strict';

angular.module('cruvitaApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      update: {
        method: 'PUT'
      },
      get: {
        method: 'GET',
        url: 'api/users/:id'
      },
      validPassword: {
        method: 'GET',
        params: {
          id: 'password',
          controller: 'valid'
        }
      },
      restorePassword: {
        method: 'GET',
        params: {
          id: 'password',
          controller: 'restore'
        }
      }
	  });
  });
