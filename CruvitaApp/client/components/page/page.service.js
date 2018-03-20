'use strict';

angular.module('cruvitaApp')
  .factory('Page', function () {
    // Service logic
    // ...
    var title = 'Cruvita: Community. School. Home.';
    var description = 'The best site for school rankings and home searches';
    var photo = 'https://www.cruvita.com/assets/images/cruvita_logo_325x250.png';

    // Public API here
    return {
      title: function() { return title; },
      setTitle: function(newTitle) { title = newTitle; },
      description: function() { return description; },
      setDescription: function(newDescription) { description = newDescription; },
      photo: function() { return photo; },
      setPhoto: function(newPhoto) { photo = newPhoto; },
    };
  });
