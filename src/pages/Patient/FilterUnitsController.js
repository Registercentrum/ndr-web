angular.module("ndrApp")
    .controller('FilterUnitsController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

      $scope.unitModel = {};
                                debugger;
      dataService.getList("units").then(function (data){
        console.log(data);
        $scope.units = data;
      })

    }]);



// https://ndr.registercentrum.se/api/Unit?active=1&APIKey=LkUtebH6B428KkPqAAsV