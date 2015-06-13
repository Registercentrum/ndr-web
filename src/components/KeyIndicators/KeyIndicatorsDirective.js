'use strict';

angular.module('ndrApp')
    .directive('keyIndicators', ['$q','dataService', function($q, dataService) {

        function link (scope) {

            if (!scope.id) return;

            var id = scope.id;

            scope.model = {
                id : id,
                geo : scope.geo,
                selectedKeyIndicator: 201,
                sex : 0,
                unitType : 0,
                diabetesType : 0
            };

            scope.data = {
                keyIndicator : undefined,
                keyIndicators : undefined
            };

            scope.$watch('model', function (newValue, oldValue){
                getSelectedKeyIndicator();
                if(newValue.sex === oldValue.sex || newValue.diabetesType === oldValue.diabetesType) getKeyIndicators();
            }, true);


            function getSelectedKeyIndicator () {
                var selectedIndicator = scope.model.selectedKeyIndicator,
                    promises          = [],
                    queryCountry      = dataService.queryFactory({
                        indicatorID : selectedIndicator,
                        level       : 0,
                        interval    : 'y',
                        fromYear    : 2010,
                        toYear      : 2014,
                        sex         : scope.model.sex,
                        unitType    : scope.model.unitType,
                        diabetesType: scope.model.diabetesType
                    }),
                    queryGeo;

                if (scope.geoType === 'unit') {
                    console.log('UNIT', scope.model);
                    queryGeo = dataService.queryFactory({
                        unitID      : id,
                        level       : 2,
                        indicatorID : selectedIndicator,
                        interval    : 'y',
                        fromYear    : 2010,
                        toYear      :2014,
                        sex         : scope.model.sex,
                        unitType    : scope.model.unitType,
                        diabetesType: scope.model.diabetesType
                    });
                    //var queryCountry = dataService.queryFactory({ indicatorID: selectedIndicator, level : 0, interval : 'y', fromYear : 2010, toYear:2014,  sex : scope.model.sex, unitType: scope.model.unitType, diabetesType : scope.model.diabetesType });
                } else {
                    queryGeo = dataService.queryFactory({
                        countyCode  : id,
                        indicatorID : selectedIndicator,
                        interval    : 'y',
                        fromYear    : 2010,
                        toYear      : 2014,
                        sex         : scope.model.sex,
                        unitType    : scope.model.unitType,
                        diabetesType: scope.model.diabetesType
                    });
                }

                promises.push(dataService.getStats(queryCountry));
                promises.push(dataService.getStats(queryGeo));

                $q.all(promises).then(function (data) {
                    var seriesCountry = [],
                        seriesGeo = [];

                    _.each(data[0].statSet[0].intervalSet, function (obj) {
                        seriesCountry.push({
                            color : '#999',
                            x : new Date(obj.interval),
                            y : obj.stat.r,
                            cRep : obj.stat.cRepInd
                        });
                    });

                    _.each(data[1].statSet[0].intervalSet, function (obj) {
                        seriesGeo.push({
                            color : '#74BAD8',
                            x : new Date(obj.interval),
                            y : obj.stat.r,
                            cRep : obj.stat.cRepInd
                        });
                    });

                    scope.data.keyIndicator = [{
                        name: scope.geo ? scope.geo.name : 'Enhet',
                        lineWidth: 3,
                        color : '#74BAD8',
                        data: seriesGeo
                    }, {
                        name : 'Riket',
                        color: '#ccc',
                        data : seriesCountry
                    }];
                });
            }


            function getKeyIndicators () {
                var toInclude = [201, 221, 207, 222, 209, 214, 211, 203, 223, 216, 202, 219],
                    promises  = [],
                    query     = dataService.queryFactory({
                        countyCode  : id,
                        ID          : toInclude,
                        sex         : scope.model.sex,
                        unitType    : scope.model.unitType,
                        diabetesType: scope.model.diabetesType
                    });

                if (scope.geoType === 'unit'){
                    query = dataService.queryFactory({
                        unitID      : id,
                        level       : 2,
                        ID          : toInclude,
                        sex         : scope.model.sex,
                        unitType    : scope.model.unitType,
                        diabetesType: scope.model.diabetesType
                    });
                }
                promises.push(dataService.getStats(query));

                //RIKET
                query = dataService.queryFactory({
                    level: 0,
                    ID: toInclude,
                    sex: scope.model.sex,
                    unitType: scope.model.unitType,
                    diabetesType: scope.model.diabetesType
                });
                promises.push(dataService.getStats(query));


                $q.all(promises).then(function (data) {
                    var geoData       = data[0].indicatorSet,
                        countryData   = data[1].indicatorSet,
                        keyIndicators = [];

                    _.each(geoData, function (obj, key) {

                        var o = {
                            riket : countryData[key].statSet[0].stat.r,
                            geo   : obj.statSet[0].stat.r,
                            status: 'equal',
                            name  : obj.indicator.name,
                            id    : obj.indicator.id,
                            lKonf : countryData[key].statSet[0].stat.lKonf,
                            uKonf : countryData[key].statSet[0].stat.uKonf
                        };

                        if (!obj.asc && o.geo < o.lKonf || obj.asc && o.geo > o.uKonf) o.status = 'better';
                        if (!obj.asc && o.geo > o.lKonf || obj.asc && o.geo < o.uKonf) o.status = 'worse';

                        keyIndicators.push(o);
                    });

                    scope.data.keyIndicators = keyIndicators;
                });
            }
        }

        return {
            restrict : 'A',
            templateUrl: 'src/components/KeyIndicators/KeyIndicators.html',
            link: link,
            scope: {
                id     : '=',
                geo    : '=',
                geoType: '=',
                light  : '='
            }
        };
    }]);