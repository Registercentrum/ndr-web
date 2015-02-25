angular.module("ndrApp")
    .controller('NewsController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {


        dataService.getList("news").then(function (data){

            data.sort(function (a,b){
                return new Date(b.publishedFrom) - new Date(a.publishedFrom);
            })

            angular.forEach(data, function(item, i) {
                item.link = "#/nyheter/" + item.newsID;
            });

            $scope.news = data;
        })

    }]);

