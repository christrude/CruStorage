'use strict';

describe('Directive: states', function () {

  // load the directive's module and view
  beforeEach(module('cruvitaApp'));
  beforeEach(module('components/states/states.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<states></states>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the states directive');
  }));
});