angular.module("ndrApp")
    .controller('NewsItemController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        dataService.getOne("news", $stateParams.id).then(function (data){
            $scope.article = data;
        })

        dataService.getList("news").then(function (data){
            $scope.news = data;
        })

    }]);
