'use strict';

describe('Directive: mapResults', function () {

  // load the directive's module and view
  beforeEach(module('cruvitaApp'));
  beforeEach(module('app/main/components/mapResults/mapResults.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<map-results></map-results>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mapResults directive');
  }));
});