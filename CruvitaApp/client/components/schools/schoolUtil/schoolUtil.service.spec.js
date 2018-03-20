'use strict';

describe('Service: schoolUtil', function () {

  // load the service's module
  beforeEach(module('cruvitaApp'));

  // instantiate service
  var schoolUtil;
  beforeEach(inject(function (_schoolUtil_) {
    schoolUtil = _schoolUtil_;
  }));

  it('should do something', function () {
    expect(!!schoolUtil).toBe(true);
  });

});
