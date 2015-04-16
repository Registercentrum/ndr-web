angular.module('ndrApp')
    .directive('keyIndicators', ['$q','dataService', function($q, dataService) {

        function link(scope, element, attrs) {

            if(!scope.id) return false;
            
            var id = scope.id;
            
            scope.model = {
                id : id,
                geo : scope.geo,
                selectedKeyIndicator: 201,
                sex : 0,
                unitType : 0,
                diabetesType : 0,
            }

            scope.data = {
                keyIndicator : undefined,
                keyIndicators : undefined
            }

            scope.$watch('model', function (newValue, oldValue){
                getSelectedKeyIndicator();
            }, true)


            function getSelectedKeyIndicator(){

                
                console.log("MM", scope.model);
                
                var selectedIndicator = scope.model.selectedKeyIndicator;
                var promises = [];

                var queryCountry = dataService.queryFactory({ indicatorID: selectedIndicator, level : 0, interval : "y", fromYear : 2010, toYear:2014,  sex : scope.model.sex, unitType: scope.model.unitType, diabetesType : scope.model.diabetesType });
                var queryGeo    = dataService.queryFactory({countyCode : id, indicatorID: selectedIndicator, interval : "y", fromYear : 2010, toYear:2014,  sex : scope.model.sex, unitType: scope.model.unitType, diabetesType : scope.model.diabetesType });

                if(scope.geoType == "unit"){
                    var queryGeo = dataService.queryFactory({unitID : id, level : 2, indicatorID: selectedIndicator, interval : "y", fromYear : 2010, toYear:2014,  sex : scope.model.sex, unitType: scope.model.unitType, diabetesType : scope.model.diabetesType });
                }

                promises.push(dataService.getStats(queryCountry));
                promises.push(dataService.getStats(queryGeo));

                $q.all(promises).then(function (data) {

                    var seriesCountry = [];
                    var seriesGeo = [];

                    _.each(data[0].statSet[0].intervalSet, function(obj, key){

                        var o = {
                            color : "#999",
                            x : new Date(obj.interval),
                            y : obj.stat.r,
                            cRep : obj.stat.cRep
                        }
                        seriesCountry.push(o)
                    })

                    _.each(data[1].statSet[0].intervalSet, function(obj, key){
                        var o = {
                            color : "#74BAD8",
                            x : new Date(obj.interval),
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

                var toInclude = [201,221,207,222,209,214,211,203,223,216,202,309];
                var highIsBetter = [201, 207, 222, 209, 203, 212, 213, 223]

                var promises = [];

                var query = dataService.queryFactory({countyCode : id, ID: toInclude, sex : scope.model.sex, unitType: scope.model.unitType, diabetesType: scope.model.diabetesType});

                if(scope.geoType == "unit"){
                    query = dataService.queryFactory({unitID : id, level : 2, ID: toInclude, sex : scope.model.sex, unitType: scope.model.unitType, diabetesType: scope.model.diabetesType});
                }

                promises.push(dataService.getStats(query));

                //RIKET
                var query = dataService.queryFactory({ level : 0, ID: toInclude, sex : scope.model.sex, unitType: scope.model.unitType, diabetesType : scope.model.diabetesType});
                promises.push(dataService.getStats(query));

                $q.all(promises).then(function (data){

                    
                    var geoData = data[0].indicatorSet;
                    var countryData = data[1].indicatorSet;

                    var keyIndicators = [];
                    
                    _.each(geoData, function(obj, key){
                        
                        console.log(obj);
                        
                        var o = {
                            riket   : countryData[key].statSet[0].stat.r,
                            geo     : obj.statSet[0].stat.r,
                            status  : "equal",
                            name    : obj.indicator.name,
                            id      : obj.indicator.id,
                            lKonf   : countryData[key].statSet[0].stat.r,
                            uKonf   : countryData[key].statSet[0].stat.uKonf

                        }


                        if(_.indexOf(highIsBetter, o.id) == -1){
                            if(o.geo < o.lKonf) o.status = "better";
                            if(o.geo > o.uKonf) o.status = "worse";
                        }

                        else{
                            if(o.geo < o.lKonf) o.status = "worse";
                            if(o.geo > o.uKonf) o.status = "better";
                        }

                        keyIndicators.push(o)

                        
                    })

                    scope.data.keyIndicators = keyIndicators;

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
                geoType : "=",
                light : "="
            }
        }

    }]);