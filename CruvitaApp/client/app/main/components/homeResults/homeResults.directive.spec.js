'use strict';

describe('Directive: homeResults', function () {

  // load the directive's module and view
  beforeEach(module('cruvitaApp'));
  beforeEach(module('app/main/components/homeResults/homeResults.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<home-results></home-results>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the homeResults directive');
  }));
});