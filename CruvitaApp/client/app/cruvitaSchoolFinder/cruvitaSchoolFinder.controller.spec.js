'use strict';

describe('Controller: CruvitaSchoolFinderCtrl', function () {

  // load the controller's module
  beforeEach(module('cruvitaApp'));

  var CruvitaSchoolFinderCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    CruvitaSchoolFinderCtrl = $controller('CruvitaSchoolFinderCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
