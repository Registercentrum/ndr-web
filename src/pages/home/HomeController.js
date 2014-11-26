angular.module("ndrApp")
    .controller('HomeController', ['$scope', 'dataService', function($scope, dataService) {

        $scope.newsFeed = undefined


        dataService.getList("news").then(function (data){
            console.log("got news", data);
            $scope.newsFeed = data;
        })



    }]);





