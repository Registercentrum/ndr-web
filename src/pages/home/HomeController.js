angular.module("ndrApp")
    .controller('HomeController', ['$scope', 'dataService', function($scope, dataService) {

        $scope.model = {

            feedModelNews : {}

        }

        dataService.getList("news").then(function (data){
            console.log("got news", data);
            $scope.model.feedModelNews = {
                data : data
            }
        })



    }]);





