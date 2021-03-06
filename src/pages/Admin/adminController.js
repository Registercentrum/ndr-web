angular.module("ndrApp")
    .controller('HomeController', ['$scope', 'dataService', '$state', function($scope, dataService, $state) {



        /* Get data for stats */
        var query = dataService.queryFactory({ID : [202,221], level : 0})

        dataService.getStats(query).then(function (data){
            $scope.model.stats = data;
        })

        dataService.getList("news").then(function (data){
            data = data.splice(0,3);

            angular.forEach(data, function(item) {
                item.link = "#/nyheter/" + item.newsID;
                item.categoryNames = [];
                angular.forEach(item.categories, function(category){
                    item.categoryNames.push(category.name);
                });
            });

            $scope.model.listModelNews = {
                data : data
            }
        })

    }]);
