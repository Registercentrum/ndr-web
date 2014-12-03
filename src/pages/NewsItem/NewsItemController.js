angular.module("ndrApp")
    .controller('NewsItemController',['$scope', '$stateParams', 'dataService', '$routeParams', function($scope, $stateParams, dataService, $routeParams) {

        console.log('routeparams', $routeParams.id);

        dataService.getOne("news", 1).then(function (data){
            $scope.newsItem = data;
        })

    }]);
