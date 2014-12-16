angular.module("ndrApp")
    .controller('CountyController',['$scope', '$stateParams', 'dataService', '$q', function($scope, $stateParams, dataService, $q) {

        var id = $stateParams.id;
        var autocompleteSelected = "county_" + id;

        $scope.model = {
            county: _.findWhere(dataService.data.counties, {code: id}),
            id: id,
            data: {},
            autocompleteModel: {
                selected: autocompleteSelected
            },
            selectedKeyIndicator: 201,
        }

        $scope.keyIndicatorModel = {
            data : undefined
        }

        $scope.$watch('model.selectedKeyIndicator', function (newValue, oldValue){
            getSelectedKeyIndicator();
        })


        dataService.getOne("county", id).then(function (data){
            $scope.model.county = data;
            $scope.model.data.noUnits = $scope.model.county.units.length;
        })


        // GET DATA FOR BAR CHART
        var query = queryFactory({fromYear: 2013, toYear : 2014, indicatorID: 101});
        dataService.getStats(query).then(function (data){

            var series = [];
            
            _.each(data.statSet, function(obj, key){

                var o = {
                    name : obj.unit.name,
                    color : obj.unit.levelID != id ? "#D4D4D4" : "#FFCC01",
                    y : obj.stat.r,
                    cRep : obj.stat.cRep,
                }

                series.push(o)
            })
            
            $scope.model.data.hba1c = series;

        })



        // GET DATA FOR TREND CHART
        var query = queryFactory({countyCode : id, interval : "y", fromYear: 2000, toYear : 2015, indicatorID: 101});
        dataService.getStats(query).then(function (data){

            var series = [];

            _.each(data.statSet[0].intervalSet, function(obj, key){

                console.log(obj);

                var o = {
                   // name : obj.unit.name,
                   // color : obj.unit.levelID != id ? "#D4D4D4" : "#F1AD0F",
                    x : new Date(obj.Interval),
                    y : obj.stat.r,
                    cRep : obj.stat.cRep,
                }

                series.push(o)
            })

            $scope.model.data.noPatients = _.last(series).cRep;
            $scope.model.data.trendhba1c = series;
        })


        function getSelectedKeyIndicator(){

            var selectedIndicator = $scope.model.selectedKeyIndicator;

            var promises = [];

            var queryCountry = queryFactory({ indicatorID: selectedIndicator, level : 0, interval : "y", fromYear : 2010, toYear:2014 });
            var queryGeo    = queryFactory({countyCode : id, indicatorID: selectedIndicator, interval : "y", fromYear : 2010, toYear:2014 });

            promises.push(dataService.getStats(queryCountry));
            promises.push(dataService.getStats(queryGeo));

            $q.all(promises).then(function (data) {

                var seriesCountry = [];
                var seriesGeo = [];


                _.each(data[0].statSet[0].intervalSet, function(obj, key){

                    var o = {
                        color : "#999",

                        x : new Date(obj.Interval),
                        y : obj.stat.r,
                        cRep : obj.stat.cRep
                    }
                    seriesCountry.push(o)
                })

                _.each(data[1].statSet[0].intervalSet, function(obj, key){
                    var o = {
                        color : "#F1AD0F",
                        x : new Date(obj.Interval),
                        y : obj.stat.r,
                        cRep : obj.stat.cRep
                    }
                    seriesGeo.push(o)
                })

                $scope.keyIndicatorModel.data = [
                    {
                        name : "Riket",
                        color: "#ccc",
                        data : seriesCountry
                    },
                    {
                        name: "Vald",
                        lineWidth: 4,
                        color : "#FFEAA8",
                        data: seriesGeo
                    }
                ]

            })

        }


        
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

            _.each(indicators, function(obj, key){
                if(_.indexOf(toInclude, obj.id) != -1){
                    var query = queryFactory({ indicatorID: obj.id, level : 0});
                    promises.push(dataService.getStats(query));
                }
            })


            $q.all(promises).then(function (data){

                var keyIndicators = [];

                console.log("data", data);

                var byIndicator = _.groupBy(data, function (d){
                    return d.indicator.name;
                });

                //loop through indicators and precalculate relevant info
                _.each(byIndicator, function(obj, key){

                    obj.precalculated = {
                        riket   : undefined,
                        geo     : undefined,
                        status  : "equal",
                        name : undefined,
                    }

                    var riket = _.filter(obj, function (o){
                        return o.statSet[0].unit.name == "Riket";
                    })[0]

                    var geo = _.filter(obj, function (o){
                        return o.statSet[0].unit.name != "Riket";
                    })[0]

                    obj.precalculated.name = riket.indicator.name;
                    obj.precalculated.id = riket.indicator.id;

                    obj.precalculated.riket = riket.statSet[0].stat.r;
                    obj.precalculated.geo = geo.statSet[0].stat.r;

                    var lKonf = riket.statSet[0].stat.lKonf;
                    var uKonf = riket.statSet[0].stat.uKonf;

                    //console.log(obj.precalculated.geo < lKonf, obj.precalculated.geo, lKonf);

                    if(obj.precalculated.geo < lKonf) obj.precalculated.status = "better";
                    if(obj.precalculated.geo > uKonf) obj.precalculated.status = "worse";

                })

                console.log("by", byIndicator);
                
                $scope.model.data.keyIndicators = byIndicator;

            })

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





