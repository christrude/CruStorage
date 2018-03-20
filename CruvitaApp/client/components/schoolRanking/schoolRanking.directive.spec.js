'use strict';

describe('Directive: schoolRanking', function () {

  // load the directive's module and view
  beforeEach(module('cruvitaApp'));
  beforeEach(module('components/schoolRanking/schoolRanking.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<school-ranking></school-ranking>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the schoolRanking directive');
  }));
});