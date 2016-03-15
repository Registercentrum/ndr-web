angular.module("ndrApp")
    .controller('ResearchController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        $scope.model = {};


        dataService.getList("news").then(function (data){

            data.sort(function (a,b){
                return new Date(b.publishedFrom) - new Date(a.publishedFrom);
            })

            data = _.filter(data, function (d){
                var catNames = _.pluck(d.categories, "name")

                return _.indexOf(catNames, "Forskning") != -1;
            })

            data = data.splice(0,4);

            angular.forEach(data, function(item) {
                item.link = "#/nyheter/" + item.newsID;
                item.categoryNames = [];
                angular.forEach(item.categories, function(category){
                    item.categoryNames.push(category.name);
                });
            });

            $scope.model.listModelResearch = {
                data : data
            }
        })


        dataService.getList("publications").then(function (data){
            console.log(data);
            angular.forEach(data, function(item) {
                item.link = '#/forskning/' + item.id;
                item.title = item.name;
            });

            $scope.publications = data;

        })





    }]);





