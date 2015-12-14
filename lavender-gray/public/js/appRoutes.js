angular.module('appRoutes', []).config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {

    $routeProvider
    // home page
      .when('/', {
        templateUrl: 'views/Shorter/inicio.html',
        controller: 'MainController',
        reloadOnSearch: false
      })
      // Statistics url
      .when('/:id\\+', {
        templateUrl: 'views/Shorter/statistics.html',
        controller: 'StatisticsController',
        reloadOnSearch: false
      })
      // Short url
      .when('/:id', {
        templateUrl: 'views/Shorter/redirect.html',
        controller: 'RedirectController',
        reloadOnSearch: false
      });


    $locationProvider.html5Mode(true);

  }
]);
