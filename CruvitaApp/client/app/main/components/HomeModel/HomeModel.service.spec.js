'use strict';

describe('Service: HomeModel', function () {

  // load the service's module
  beforeEach(module('cruvitaApp'));

  // instantiate service
  var HomeModel;
  beforeEach(inject(function (_HomeModel_) {
    HomeModel = _HomeModel_;
  }));

  it('should do something', function () {
    expect(!!HomeModel).toBe(true);
  });

});
