'use strict';

angular.module('cruvitaApp')
  .controller('FooterCtrl', function ($scope, Config, States) {
    $scope.states = States;
    $scope.footerAreas = [];
    $scope.footerSchoolAreas = [];

    _.forEach(Config.areasServed, function(area) {
    	angular.forEach(area.areas, function(element, index) {
            $scope.footerAreas.push(element);
    	})
    })

    _.forEach($scope.states, function(state){
        var newState = {
            name: state.name
        }
        $scope.footerSchoolAreas.push(newState);
    })


    $scope.readMoreSchoolsD = function(){
        angular.element('.link-lists-schoolsD ul').css('height', 'auto');
        if (angular.element('.link-lists-schoolsD .schoolD-more').text() == 'More'){
            angular.element('.link-lists-schoolsD .schoolD-more').text('Less');
        } else {
            angular.element('.link-lists-schoolsD ul').css('height', '115px');
            angular.element('.link-lists-schoolsD .schoolD-more').text('More');
        }
    }

    $scope.readMoreSchoolsR = function(){
        angular.element('.link-lists-schoolsR ul').css('height', 'auto');
        if (angular.element('.link-lists-schoolsR .schoolR-more').text() == 'More'){
            angular.element('.link-lists-schoolsR .schoolR-more').text('Less');
        } else {
            angular.element('.link-lists-schoolsR ul').css('height', '115px');
            angular.element('.link-lists-schoolsR .schoolR-more').text('More');
        }
    }
  });
