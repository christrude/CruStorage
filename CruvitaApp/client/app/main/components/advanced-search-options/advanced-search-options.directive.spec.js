'use strict';

describe('Directive: advancedSearchOptions', function () {

  // load the directive's module and view
  beforeEach(module('cruvitaApp'));
  beforeEach(module('components/advanced-search-options/advanced-search-options.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<advanced-search-options></advanced-search-options>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the advancedSearchOptions directive');
  }));
});