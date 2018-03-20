'use strict';

angular.module('cruvitaApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngMessages',
  'ngAnimate',
  'ui.bootstrap',
  'ngRoute',
  'ui.router',
  'uiGmapgoogle-maps',
  'cgBusy',
	'dndLists',
  'geolocation',
  'ngFileUpload',
  'ngLoad',
  'angular-google-analytics',
  'chart.js',
  'angulike',
  'angularMoment',
  'ngInflection',
  'ng.deviceDetector',
  'ngTouch',
  'picardy.fontawesome',
	'yaru22.angular-timeago',
  'ui.grid',
  'ui.grid.resizeColumns'
])
  .config(function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, $urlMatcherFactoryProvider, ChartJsProvider) {
    $urlRouterProvider.otherwise('/404');
    $urlMatcherFactoryProvider.caseInsensitive(true);

    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');

    $stateProvider.state('site', {
        'abstract': true,
        controller: 'IndexCtrl',
        views: {
            'navbar@': {
                templateUrl: 'components/navbar/navbar.html',
                controller: 'NavbarCtrl'
            },
            'footer@': {
                templateUrl: 'components/footer/footer.html'
            }
        }
    });

  })

  .config(function(AnalyticsProvider){
    AnalyticsProvider.setAccount('UA-56938117-1');
    AnalyticsProvider.useAnalytics(true);
    AnalyticsProvider.trackPages(false);
  })

  .config(function (ChartJsProvider) {
    ChartJsProvider.setOptions({ legend : {display: true}});
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};

        // prevent interceptor from overriding existing Authorization
        if(config.headers.Authorization && config.headers.Authorization.indexOf('Basic') > -1){
          return config
        }

        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to home
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, Auth, $templateCache, $stateParams, $routeParams, Analytics, amMoment) {
    $rootScope.facebookAppId = '1557143717880270';
    amMoment.changeLocale('en');
		FastClick.attach(document.body);
    $rootScope.isAdmin = Auth.isAdmin();

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
      $rootScope.previousState = fromState.name;
    });

    $rootScope.updateRoute = function(route) {
      $location.path(route);
    };
    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$stateChangeStart', function (event, next) {
      if (next.authenticate && !Auth.isLoggedIn()) {
        $state.go('home');
      }
    });
    $templateCache.put('draw.tpl.html', '<button class="btn btn-primary" ng-click="drawWidget.controlClick()""><i class="fa fa-pencil"></i></button>');
  })
  .filter('capitalize', function() {
    return function(input, scope) {
      if (input) {
        return input.substring(0, 1).toUpperCase() + input.substring(1).toLowerCase();
      }
    };
  }).filter('has', function(){
    return function(input) {
      if (input) {
        if (input.substring(0,3) == 'has' ){
          return 'Has ' + input.substring(3);
        } else if (input.substring(0,2) == 'is') {
          return 'Is ' + input.substring(2);
        }
      }
    };
  }).filter('titleCase', function(){
    return function(input, scope) {
      if (input) {
        return input.replace(/\w+('\w+)|\w+| \w+(-\w+)/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
      }
    };
  }).filter('decToPct', function(){
    return function(input, scope) {
        input = Math.round(input * 100) + '%';
        return input;
    };
  }).filter('camelCase', function() {
    return function(input) {
        return input.replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase(); });
    };
  }).filter('ifElem', function() {
    return function(input) {
      if(input) { return input.replace(/\belem\b/gi, 'Elementary');}
    };
  }).filter('encodeURIComponent', function() {
    return window.encodeURIComponent;
  }).filter('boolean', function() {
    return function(input) {
        return input ? 'Yes' : 'No';
    };
  }).filter('tel', function(){
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country === 1) {
            country = '';
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + ' (' + city + ') ' + number).trim();
    };
  }).directive('ads', function() {
    return {
        restrict: 'A',
        templateUrl: 'components/advertisement/googleads.html',
        controller: function(){
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    };
});;
