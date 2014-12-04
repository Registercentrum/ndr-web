angular.module("ndrApp")
    .controller('NewsItemController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        dataService.getOne("news", $stateParams.id).then(function (data){
            $scope.newsItem = data;
        })

    }]);
