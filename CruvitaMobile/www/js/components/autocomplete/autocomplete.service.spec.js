'use strict';

describe('Service: homes', function () {

  // load the service's module
  beforeEach(module('myAppApp'));

  // instantiate service
  var homes;
  beforeEach(inject(function (_homes_) {
    homes = _homes_;
  }));

  it('should do something', function () {
    expect(!!homes).toBe(true);
  });

});
