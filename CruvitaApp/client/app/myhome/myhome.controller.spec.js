'use strict';

describe('Controller: MyhomeCtrl', function () {

  // load the controller's module
  beforeEach(module('cruvitaApp'));

  var MyhomeCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MyhomeCtrl = $controller('MyhomeCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
