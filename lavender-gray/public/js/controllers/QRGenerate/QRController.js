if(Modulo==undefined){var Modulo = angular.module('Controllers', []);}

/*
 * Shorter Controller
 */
Modulo.controller('QRController', function($scope, $routeParams, $rootScope, $http, $location, $window) {
    $scope.url = "http://";
    $scope.url_img = "";
    $scope.nombre = "";
    $scope.apellidos = "";
    $scope.rgb = "";
    $scope.err = "";
    $scope.generar = function() {
        $http.post('/API/qr', {
            url: $scope.url,
            nombre: $scope.nombre,
            apellidos: $scope.apellidos,
            rgb: $scope.rgb,
            err: $scope.err
        }).success(function(res, status, headers, config) {
            $scope.url_img = res;
            $scope.msg="";
        })
        .error(function(data, status, headers, config) {
          $scope.url_img = "";
          $scope.msg="Url no valida";
        });

    }
});
