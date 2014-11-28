angular.module("ndrApp")
    .controller('CountyController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        console.log("CountyController Init ID:", $stateParams.id);

        var id = $stateParams.id;

        $scope.model = {
            county : _.findWhere(dataService.data.counties,  {code : id}),
            id : id,
            data : {}
        }

        dataService.getOne("county", id).then(function (data){
            $scope.model.county = data;
        })


        // GET DATA FOR BAR CHART
        var query = queryFactory({});
        dataService.getStats(query).then(function (data){

            var series = [];
            
            _.each(data.statSet, function(obj, key){

                var o = {
                    name : obj.unit.name,
                    color : obj.unit.levelID != id ? "#D4D4D4" : "#F1AD0F",
                    y : obj.stat.r
                }

                series.push(o)
            })
            
            $scope.model.data.hba1c = series;
        })

        // GET DATA FOR TREND CHART
        var query = queryFactory({countyCode : id, interval : "m"});
        dataService.getStats(query).then(function (data){

            console.log("dd", data);
            
            var series = [];

            _.each(data.statSet, function(obj, key){

                var o = {
                    name : obj.unit.name,
                    color : obj.unit.levelID != id ? "#D4D4D4" : "#F1AD0F",
                    y : obj.stat.r
                }

                series.push(o)
            })

            $scope.model.data.hba1c = series;

        })



/*

        function getKeyIndicators(){

            var indicators = $scope.data.indicators.byType.target;
            
            console.log("indicators", indicators);


            $q.all(promises).then(function (results) {
                var resultOfFirstPromise = results[0],
                    resultOfSecondPromise = results[1];
                // update model.property based on data returned and relevant logic.
            });




        }


        getKeyIndicators();

*/






        function queryFactory(params){

            var defaults = {
                level: 1,
                countyCode: 0,
                unitID: 0,
                indicatorID: 101,
                fromYear: 2013,
                fromQuartal: 0,
                fromMonth: 0,
                toYear: 2014,
                toQuartal: 0,
                toMonth: 0,
                diabetesTypeCode: 1,
                sex: 0,
                unitTypeID: 0,
                fromAge: 0,
                toAge: 0,
                interval: null,
                recalculate: false,
                outdatedDays: 14
            }

            return angular.extend(defaults, params)

        }



    }]);





