'use strict';

describe('Controller: SalesCtrl', function () {

  // load the controller's module
  beforeEach(module('cruvitaApp'));

  var SalesCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SalesCtrl = $controller('SalesCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
