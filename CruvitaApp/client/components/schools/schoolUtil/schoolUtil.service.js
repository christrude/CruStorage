'use strict';

angular.module('cruvitaApp')
  .service('SchoolUtil', function (Config) {
		var service = {};
		service.getGrade = function(school) {
      _.each(Config.gradeScale, function(grade, index) {
        if(school.score.overall >= grade.low && (index === Config.gradeScale.length - 1 || school.score.overall < Config.gradeScale[index+1].low)) {
          school.icon = grade.icon;
          school.grade = grade.value;
          school.color = grade.color;
        }
      });
		}
		return service;
  });
