'use strict';

describe('Service: MapModel', function () {

  // load the service's module
  beforeEach(module('cruvitaApp'));

  // instantiate service
  var MapModel;
  beforeEach(inject(function (_MapModel_) {
    MapModel = _MapModel_;
  }));

  it('should do something', function () {
    expect(!!MapModel).toBe(true);
  });

});
