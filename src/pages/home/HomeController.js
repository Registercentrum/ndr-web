'use strict';

angular.module('ndrApp')
    .controller('HomeController', ['$scope', 'dataService', 'accountService', function($scope, dataService, accountService) {

        $scope.model = {
            listModelNews : {},
            autocompleteModel : {
                selected : undefined,
                options: dataService.data.preparedGeoList
            }
        };

        $scope.accountModel = accountService.accountModel;

        /* Get data for stats */

        var query = dataService.queryFactory(
            {
                ID : [202,221],
                level : 0,
                fromYear    : new Date().getFullYear()-1,
                toYear    : new Date().getFullYear(),
                fromMonth   : new Date().getMonth(),
                toMonth   : new Date().getMonth()
            }
        )

      /*  var query1 = dataService.queryFactory(
            {
                ID : [202,221],
                level : 0,

                fromYear    : new Date().getFullYear()-1,
                toYear    : new Date().getFullYear(),
                fromMonth   : new Date().getMonth(),
                toMonth   : new Date().getMonth()
            }
        )
*/
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

            setTimeout(function (){
                jQuery('.Intro--equalHeights').matchHeight(true);
            },100);

        })

    }]);
