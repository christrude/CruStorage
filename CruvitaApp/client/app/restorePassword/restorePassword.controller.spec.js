'use strict';

describe('Controller: RestorepasswordCtrl', function () {

  // load the controller's module
  beforeEach(module('cruvitaApp'));

  var RestorepasswordCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    RestorepasswordCtrl = $controller('RestorepasswordCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
