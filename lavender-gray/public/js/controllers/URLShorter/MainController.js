if(Modulo==undefined){var Modulo = angular.module('Controllers', []);}

/*
 * Main Controller
 */
 Modulo.controller('MainController', function($scope, $rootScope,
                                                            $http,$location) {
   $rootScope.PageName = "Shorter";
   $rootScope.TitleName = $rootScope.PageName;
   $scope.HostName = $location.absUrl();
   $scope.result="";
   $scope.idURL="";
   $scope.short = function(url){
     result=("Creando URL short...");
     $http.put('/API/redirect', {
       url: url
     }).
     success(function(res, status, headers, config) {
       if(res.err==0){
         $scope.idURL=res.redirect.id;
         $scope.result="";
       } else if (res.err==3){
         $scope.idURL=res.redirect.id;
         $scope.result="La URL ya había sido acortada";
       } else {
         $scope.idURL="";
         $scope.result="URL incorrecta";
       }
     }).
     error(function(data, status, headers, config) {
       $scope.idURL="";
       $scope.result=("Error interno, pruebe más tarde")
     });
   }
 });
