angular.module("ndrApp")
    .controller('CountyController',['$scope', '$stateParams', 'dataService', '$q', function($scope, $stateParams, dataService, $q) {

        // console.log("CountyController Init ID:", $stateParams.id);

        var id = $stateParams.id;

        $scope.model = {
            county : _.findWhere(dataService.data.counties,  {code : id}),
            id : id,
            data : {}
        }


        dataService.getOne("county", id).then(function (data){
            $scope.model.county = data;
            $scope.model.data.noUnits = $scope.model.county.units.length;
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

            console.log("dda", data);
            
            var series = [];

            _.each(data.statSet[0].intervalSet, function(obj, key){

                var o = {
                   // name : obj.unit.name,
                   // color : obj.unit.levelID != id ? "#D4D4D4" : "#F1AD0F",
                    x : new Date(obj.Interval),
                    y : obj.stat.r
                }

                series.push(o)
            })

            $scope.model.data.trendhba1c = series;

        })





        function getKeyIndicators(){

            var indicators = $scope.data.indicators.byType.target;
            var toInclude = [201,204,207,206,209,214,211,203,212,216,202,309];

            var promises = [];

            _.each(indicators, function(obj, key){

                if(_.indexOf(toInclude, obj.id) != -1){
                    var query = queryFactory({countyCode : id, indicatorID: obj.id});
                    promises.push(dataService.getStats(query));
                }
            })

            $q.all(promises).then(function (data){

                var keyIndicators = [];

                _.each(data, function(obj, key){
                    var o = {
                        indicator : obj.indicator,
                        stat : obj.statSet[0].stat
                    }
                    keyIndicators.push(o);
                })

                $scope.model.data.keyIndicators = keyIndicators;

            })


         /*   $q.all(promises).then(function (results) {
                var resultOfFirstPromise = results[0],
                    resultOfSecondPromise = results[1];
                // update model.property based on data returned and relevant logic.
            });*/


        }

        getKeyIndicators();








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





