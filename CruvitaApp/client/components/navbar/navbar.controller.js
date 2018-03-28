'use strict';

angular.module('cruvitaApp')
  .controller('NavbarCtrl', function ($rootScope, $scope, $state, $location, $window, Auth, Autocomplete, Page, $stateParams) {
    $scope.isCollapsed = true;
    $scope.today = new Date();
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.auth = Auth;
    $scope.autocomplete = Autocomplete;

    $scope.navTypeaheadContainer = angular.element(document.querySelector('#nav-typeahead-container'));


    $scope.menu = [
    {
      'title': 'Learn More',
      'link': '/learn'
    },
    {
      'title': 'School Rankings',
      'link': '/rankings'
    },
    {
      'title': 'Blog',
      'link': 'http://blog.cruvita.com',
      'target': '_blank'
    },
    {
      'title': 'News',
      'link': 'http://news.cruvita.com/browse/pr',
      'target': '_blank'
    }];

    $scope.sidebar = false;
    $scope.show_sidebar = function(){
      $scope.sidebar = !$scope.sidebar;
    }

    $scope.hide_sidebar = function(){
      $scope.sidebar = false;
    }

    $scope.resetPageDefaults = function() {
      Page.setTitle('Cruvita: Community. School. Home.');
      Page.setDescription('The best site for school rankings');
    }

    $scope.logout = function() {
      Auth.logout();
      if ($scope.isCollapsed) {
        $scope.isCollapsed = !$scope.isCollapsed;
      }

      $state.go('home');
    };

    $scope.goToRoute = function(link) {
      var firstLink = link.split(':', 1);

      $scope.isCollapsed = !$scope.isCollapsed;
      if (firstLink[0] === 'http'){
        $window.open(link);
      } else {
        $location.url(link);
      }
    }

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $scope.getLocation = Autocomplete.autocomplete;
    $scope.updateBounds = function() {
      Autocomplete.search();
    };
  });