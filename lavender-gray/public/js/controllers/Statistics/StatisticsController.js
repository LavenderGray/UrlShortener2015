if(Modulo==undefined){var Modulo = angular.module('Controllers', []);}

/*
 * Statistics Controller
 */
 Modulo.controller('StatisticsController', function($scope, $rootScope, $http,
                                                          $location) {
   $rootScope.PageName = "Shorter - Statistics";
   $rootScope.TitleName = $rootScope.PageName;
   $http.get($location.path(), {
     params: {format: "JSON"}
   }).
   success(function(res, status, headers, config) {
     if (res.err == 0) {
       $scope.statistics = res.statistics;
     } else if (res.err == 1) {
       $scope.msg = "No existe redirección";
     }else{
       $scope.msg = "Error interno, pruebe más tarde";
     }
   }).
   error(function(data, status, headers, config) {
     $scope.msg = "Error interno, pruebe más tarde";
   });
 });
