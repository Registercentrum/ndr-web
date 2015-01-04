angular.module('ndrApp')
    .directive('keyIndicators', ['$q','dataService', function($q, dataService) {

        function link(scope, element, attrs) {

            var id = scope.id;
            console.log("cc", scope.geoType);

            scope.model = {
                id : id,
                geo : scope.geo,
                selectedKeyIndicator: 201,
                sex : 0,
                unitTypeID : 0,
                diabetesTypeCode : undefined,
            }

            scope.data = {
                keyIndicator : undefined,
                keyIndicators : undefined
            }

            scope.$watch('model', function (newValue, oldValue){
                getSelectedKeyIndicator();
            }, true)


            function getSelectedKeyIndicator(){

                var selectedIndicator = scope.model.selectedKeyIndicator;
                var promises = [];

                var queryCountry = dataService.queryFactory({ indicatorID: selectedIndicator, level : 0, interval : "y", fromYear : 2010, toYear:2014,  sex : scope.model.sex, unitTypeID: scope.model.unitTypeID, diabetesTypeCode : scope.model.diabetesTypeCode });
                var queryGeo    = dataService.queryFactory({countyCode : id, indicatorID: selectedIndicator, interval : "y", fromYear : 2010, toYear:2014,  sex : scope.model.sex, unitTypeID: scope.model.unitTypeID, diabetesTypeCode : scope.model.diabetesTypeCode });

                if(scope.geoType == "unit"){
                    var queryGeo = dataService.queryFactory({unitID : id, level : 2, indicatorID: selectedIndicator, interval : "y", fromYear : 2010, toYear:2014,  sex : scope.model.sex, unitTypeID: scope.model.unitTypeID, diabetesTypeCode : scope.model.diabetesTypeCode });
                }

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
                            color : "#74BAD8",
                            x : new Date(obj.Interval),
                            y : obj.stat.r,
                            cRep : obj.stat.cRep
                        }
                        seriesGeo.push(o)
                    })

                    scope.data.keyIndicator = [
                        {
                            name : "Riket",
                            color: "#ccc",
                            data : seriesCountry
                        },
                        {
                            name: "Vald",
                            lineWidth: 3,
                            color : "#74BAD8",
                            data: seriesGeo
                        }
                    ]

                })

            }


            function getKeyIndicators(){

                var indicators = dataService.data.indicators.byType.target;
                var toInclude = [201,204,207,206,209,214,211,203,212,216,202,309];

                var promises = [];

                _.each(indicators, function(obj, key){
                    if(_.indexOf(toInclude, obj.id) != -1){
                        var query = dataService.queryFactory({countyCode : id, indicatorID: obj.id, sex : scope.model.sex, unitTypeID: scope.model.unitTypeID, diabetesTypeCode: scope.model.diabetesTypeCode});

                        if(scope.geoType == "unit"){
                            query = dataService.queryFactory({unitID : id, level : 2, indicatorID: obj.id, sex : scope.model.sex, unitTypeID: scope.model.unitTypeID, diabetesTypeCode: scope.model.diabetesTypeCode});
                        }

                        promises.push(dataService.getStats(query));
                    }



                })

                _.each(indicators, function(obj, key){
                    if(_.indexOf(toInclude, obj.id) != -1){
                        var query = dataService.queryFactory({ level : 0, indicatorID: obj.id, sex : scope.model.sex, unitTypeID: scope.model.unitTypeID, diabetesTypeCode : scope.model.diabetesTypeCode});
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

                    var sorted = [];

                    _.each(byIndicator, function(obj, key){
                        var id = obj.precalculated.id;
                        var i = _.indexOf(toInclude, id)
                        obj.sortOrder = i;
                    })


                    byIndicator = _.sortBy(byIndicator, function (a){
                        return a.sortOrder
                    })

                    scope.data.keyIndicators = byIndicator;


                })

            }

            getKeyIndicators();




        }




        return {
            restrict : 'A',
            templateUrl: function(elem, attr){
                return 'src/components/KeyIndicators/KeyIndicators.html';
            },
            link: link,
            scope: {
                id: "=",
                geo: "=",
                geoType : "="
            }
        }

    }]);