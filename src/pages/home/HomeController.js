angular.module("ndrApp")
    .controller('HomeController', ['$scope', 'dataService', '$state', function($scope, dataService, $state) {

        $scope.model = {
            listModelNews : {},
            autocompleteModel : {
                selected : undefined
            }
        }


        var query = {
            DateFrom: '2014-04-29',
            DateTo  : '2015-04-29',
            f       : ['d', 'hba1c']
            //filters : selectedFilters,
            //limit   : 15,
            //offset  : 100,
            //count    : 'given-by-server',
            //matching : 'given-by-server'
        };

        //console.log('query on loaded', query);

        dataService.getSubjects(query, function (data){

            console.log("dd", data);
            $scope.model.allSubjects = data;
            $scope.model.allSubjectsLength = data.length;


        });



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

            setTimeout(function (){
                jQuery('.Intro--equalHeights').matchHeight(true);
            },100);

        })

    }]);
