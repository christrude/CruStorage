'use strict';
angular.module('cruvitaApp')
  .factory('SchoolComparisonStorageService', function (Auth, $location, $http) {
    // Service logic
    // ...
    var address = $location.search().address || '';
    var agent = Auth.getCurrentUser() || {};

    // Public API here
    return {
      address: function() { return address; },
      setAddress: function(newAddress) { address = newAddress; },
      agent: function() { return agent; },
      setAgent: function(newAgent) { agent = newAgent; },


      getPdf: function(pdfData){
        var req = {
           method: 'POST',
           url: 'https://cruvita.jsreportonline.net/api/report',
           headers: {
            'Content-Type': 'application/json',
              Authorization: 'Basic YXJpZWxAY3J1dml0YS5jb206Y29tbXVuaXR5MTgwOQ=='
           },
           responseType: 'arraybuffer',
           data: { 
              template: {shortid: 'VJXdwmHBb',
                    scripts: [{
                          content: "function beforeRender(done) {request.template.helpers += 'function json(context) { return JSON.stringify(context); }'; done();}"           
                    }] 
              },
              data: pdfData
            },
        }
        return $http(req);
      }
    };



  });


  