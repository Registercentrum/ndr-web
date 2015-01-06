angular.module("ndrApp")
    .controller('FilterUnitsController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

      var units = dataService.data.units;

      $scope.units = units;

      //dataService.getList("units").then(function (data){
      //  console.log(data);
      //  $scope.units = data;
      //})

    }]);



// https://ndr.registercentrum.se/api/Unit?active=1&APIKey=LkUtebH6B428KkPqAAsV