'use strict';

describe('Service: myhome', function () {

  // load the service's module
  beforeEach(module('cruvitaApp'));

  // instantiate service
  var myhome;
  beforeEach(inject(function (_myhome_) {
    myhome = _myhome_;
  }));

  it('should do something', function () {
    expect(!!myhome).toBe(true);
  });

});
