angular.module("ndrApp")
    .controller('NewsController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {



        dataService.getList("news").then(function (data){

            angular.forEach(data, function(item, i) {
                item.link = "#/nyheter/" + item.newsID;
            });

            $scope.news = data;
        })

    }]);

