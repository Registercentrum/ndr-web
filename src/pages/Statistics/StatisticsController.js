angular.module('ndrApp')
    .controller('StatisticsController',['$scope', 'dataService', function($scope, dataService) {

        $scope.model = {
            autocompleteModel: {
                selected: undefined,
                options: dataService.data.preparedGeoList
            }
        };

    }]);





