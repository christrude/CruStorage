'use strict';

describe('Controller: AreasCtrl', function () {

  // load the controller's module
  beforeEach(module('cruvitaApp'));

  var AreasCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    AreasCtrl = $controller('AreasCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
