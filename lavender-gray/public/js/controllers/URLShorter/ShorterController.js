if (Modulo == undefined) {
  var Modulo = angular.module('Controllers', []);
}

/*
 * Shorter Controller
 */
Modulo.controller('RedirectController', function($scope, $routeParams, $rootScope, $http, $location, $window) {
  $rootScope.PageName = "Shorter - Redirect";
  $rootScope.TitleName = $rootScope.PageName;
  $http.get('/API/redirect', {
    params: {
      id: $routeParams.id
    }
  }).
  success(function(res, status, headers, config) {
    $scope.msg = "Redirigiendo a " + res.redirect.url;
    $window.location.href = res.redirect.url;
  }).
  error(function(data, status, headers, config) {
    if (status == 404) {
      $scope.msg = "No existe redirección";
    } else if (status == 500) {
      $scope.msg = "Error interno, pruebe más tarde";
    }
  });
});
