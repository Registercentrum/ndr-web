angular.module('ndrApp')
    .controller('FilterUnitsController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        dataService.getUnits(function (data){

            console.log("d", data);
            var units = data;

            $scope.filteredUnits = [];

            $scope.$watch('postalCode', function (){

                $scope.filteredUnits = _.take(_.filter(units, function (d){
                    return  d.postalCode.indexOf( $scope.postalCode ) > -1 ;
                }), 10);

            }, true);

        });

    }]);


