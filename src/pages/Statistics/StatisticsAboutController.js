angular.module('ndrApp')
    .controller('StatisticsAboutController',['$scope', 'dataService', function($scope, dataService) {

        $scope.model = {
            indicators: null
        };
        
        $scope.init = function() {
            this.model.indicators = dataService.getValue('indicators2017');
            console.log(this.model.indicators);
        }

        $scope.init();

    }]);





