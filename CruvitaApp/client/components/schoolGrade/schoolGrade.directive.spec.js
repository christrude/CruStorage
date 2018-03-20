'use strict';

describe('Directive: schoolGrade', function () {

  // load the directive's module and view
  beforeEach(module('cruvitaApp'));
  beforeEach(module('components/schoolGrade/schoolGrade.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<school-grade></school-grade>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the schoolGrade directive');
  }));
});