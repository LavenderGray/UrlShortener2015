if(Modulo==undefined){var Modulo = angular.module('Controllers', []);}

/*
 * Shorter Controller
 */
Modulo.controller('QRController', function($scope, $routeParams, $rootScope, $http, $location, $window) {
    $scope.url = "http://";
    $scope.url_img = "";
    $scope.generar = function() {
        $scope.url_img = {};
        $http.post('/API/qr', {
            url: $scope.url
        }).success(function(res, status, headers, config) {
            //console.log(res);
            $scope.url_img = res;
        })
    }
});
