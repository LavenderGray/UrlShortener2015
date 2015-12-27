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
     $http.post('/API/redirect', {
       url: url
     }).
     success(function(res, status, headers, config) {
       console.log(res);
       if(res.create==true){
         $scope.idURL=res.redirect.id;
         $scope.result="";
       } else if (res.create==false){
         $scope.idURL=res.redirect.id;
         $scope.result="La URL ya había sido acortada";
       }
     }).
     error(function(data, status, headers, config) {
       if(status==400){
         $scope.result = "URL incorrecta";
       }else if(status==500){
         $scope.idURL="";
         $scope.result="Error interno";
       }
     });
   }
 });
