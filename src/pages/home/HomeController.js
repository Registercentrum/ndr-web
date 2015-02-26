angular.module("ndrApp")
    .controller('HomeController', ['$scope', 'dataService', '$state', function($scope, dataService, $state) {

        $scope.model = {
            listModelNews : {},
            autocompleteModel : {
                selected : undefined
            }
        }


        /* Get data for stats */


        var query = dataService.queryFactory({ID : [202,221], level : 0})

        dataService.getStats(query).then(function (data){
            $scope.model.stats = data;
        })

        dataService.getList("news").then(function (data){

            data.sort(function (a,b){
                return new Date(b.publishedFrom) - new Date(a.publishedFrom);
            })

            data = data.splice(0,4);

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
