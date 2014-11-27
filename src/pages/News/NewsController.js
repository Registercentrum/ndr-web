angular.module("ndrApp")
    .controller('NewsController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        dataService.getList("news").then(function (data){
            $scope.news = data;
        })

    }]);

