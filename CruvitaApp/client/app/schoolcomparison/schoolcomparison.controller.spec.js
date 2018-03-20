'use strict';

describe('Controller: SchoolcomparisonCtrl', function () {

  // load the controller's module
  beforeEach(module('cruvitaApp'));

  var SchoolcomparisonCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SchoolcomparisonCtrl = $controller('SchoolcomparisonCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
