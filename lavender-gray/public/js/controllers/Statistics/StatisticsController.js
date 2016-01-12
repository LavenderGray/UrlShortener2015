if (Modulo == undefined) {
  var Modulo = angular.module('Controllers', []);
}

/*
 * Statistics Controller
 */
Modulo.controller('StatisticsController', function($scope, $rootScope, $http,
  $location) {
  $rootScope.PageName = "Shorter - Statistics";
  $rootScope.TitleName = $rootScope.PageName;
  $scope.idURLShort = $location.path().split('+')[0].substring(1);
  console.log("----------------------------");
  console.log($location.path());
  $http.get($location.path(), {
    params: {
      format: "JSON"
    }
  }).
  success(function(res, status, headers, config) {
    $scope.statistics = res;
  }).
  error(function(data, status, headers, config) {
    if (status == 404) {
      $scope.msg = "No existe redirección";
    } else if (status == 500) {
      $scope.msg = "Error interno, pruebe más tarde";
    }
  });

  function isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
  }
  $scope.getGraph = function(el, ar,pre) {
    var R = [];
    for (var key in ar) {
      R.push({
        label: pre+key,
        value: ar[key]
      });
    }

    Morris.Donut({
      element: el,
      data: R,
      resize: true
    });
  }
});
