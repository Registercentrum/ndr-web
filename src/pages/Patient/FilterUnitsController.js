angular.module('ndrApp')
    .controller('FilterUnitsController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

      dataService.getList('units').then(function (data){
          console.log("d", data);
          var units = data.plain();

          $scope.filteredUnits = [];

          $scope.$watch('postalCode', function (){

              $scope.filteredUnits = _.take(_.filter(units, function (d){
                  return  d.postalCode.indexOf( $scope.postalCode ) > -1 ;
              }), 10);

          }, true);

      })





      //dataService.getList("units").then(function (data){
      //  console.log(data);
      //  $scope.units = data;
      //})

    }]);



// https://ndr.registercentrum.se/api/Unit?active=1&APIKey=LkUtebH6B428KkPqAAsV