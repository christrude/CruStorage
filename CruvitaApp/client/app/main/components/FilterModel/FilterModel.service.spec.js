'use strict';

describe('Service: FilterModel', function () {

  // load the service's module
  beforeEach(module('cruvitaApp'));

  // instantiate service
  var FilterModel;
  beforeEach(inject(function (_FilterModel_) {
    FilterModel = _FilterModel_;
  }));

  it('should do something', function () {
    expect(!!FilterModel).toBe(true);
  });

});
