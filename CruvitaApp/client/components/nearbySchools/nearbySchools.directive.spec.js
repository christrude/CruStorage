'use strict';

describe('Directive: nearbyHomes', function () {

  // load the directive's module and view
  beforeEach(module('cruvitaApp'));
  beforeEach(module('components/nearbyHomes/nearbyHomes.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<nearby-homes></nearby-homes>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the nearbyHomes directive');
  }));
});