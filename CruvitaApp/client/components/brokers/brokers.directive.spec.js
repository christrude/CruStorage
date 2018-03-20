'use strict';

describe('Directive: showBrokers', function () {

  // load the directive's module and view
  beforeEach(module('cruvitaApp'));
  beforeEach(module('components/brokers/brokers.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<show-brokers></show-brokers>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the brokers directive');
  }));
});