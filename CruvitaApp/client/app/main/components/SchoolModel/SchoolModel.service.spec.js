'use strict';

describe('Service: SchoolModel', function () {

  // load the service's module
  beforeEach(module('cruvitaApp'));

  // instantiate service
  var SchoolModel;
  beforeEach(inject(function (_SchoolModel_) {
    SchoolModel = _SchoolModel_;
  }));

  it('should do something', function () {
    expect(!!SchoolModel).toBe(true);
  });

});
