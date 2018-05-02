'use strict';

angular.module('ndrApp')
    .directive('keyIndicators', ['$q','dataService', 'accountService', function($q, dataService, accountService) {

        function link (scope) {
			
			var localModel = {
				selectedKeyIndicator: 201,
				diabetesType: 0,
				diabetesTypes: [
					{ id: 0, name: 'Typ 1 och 2'},
					{ id: 1, name: 'Typ 1' },
					{ id: 2, name: 'Typ 2' }
				],
				sex: 0,
				sexes: [
					{ id: 0, name: 'Kvinnor och män'},
					{ id: 2, name: 'Kvinnor' },
					{ id: 1, name: 'Män' }
				],
			}
		
			scope.model = jQuery.extend(scope.model, localModel);

            scope.data = {
                keyIndicator : undefined,
                keyIndicators : undefined
            };

            scope.$watch('model', function (newValue, oldValue){
                getSelectedKeyIndicator();
                scope.model.selectedKeyIndicatorName = _.find(dataService.data.indicators.byType.target, {id: scope.model.selectedKeyIndicator}).name;
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
                        toYear      : new Date().getFullYear(),
                        sex         : scope.model.sex,
                        unitType    : scope.model.unitType,
                        diabetesType: scope.model.diabetesType
                    }),
                    queryGeo;

                if (scope.model.geoType === 'unit') {

                    queryGeo = dataService.queryFactory({
                        unitID      : scope.model.unit.unitID,
                        level       : 2,
                        indicatorID : selectedIndicator,
                        interval    : 'y',
                        fromYear    : 2010,
                        toYear      : new Date().getFullYear(),
                        sex         : scope.model.sex,
                        unitType    : scope.model.unitType,
                        diabetesType: scope.model.diabetesType,
                        countyCode  : null,
                    });
                    //var queryCountry = dataService.queryFactory({ indicatorID: selectedIndicator, level : 0, interval : 'y', fromYear : 2010, toYear:2014,  sex : scope.model.sex, unitType: scope.model.unitType, diabetesType : scope.model.diabetesType });
                } else {
                    queryGeo = dataService.queryFactory({
                        countyCode  : scope.model.county.code,
                        indicatorID : selectedIndicator,
                        interval    : 'y',
                        fromYear    : 2010,
                        toYear      : new Date().getFullYear(),
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
                            y : obj.stat ? obj.stat.r : null,
                            cRep : obj.stat ? obj.stat.cRepInd : null
                        });
                    });

                    _.each(data[1].statSet[0].intervalSet, function (obj) {
                        seriesGeo.push({
                            color : '#74BAD8',
                            x : new Date(obj.interval),
                            y : obj.stat != null ? obj.stat.r : null,
                            cRep : obj.stat != null ? obj.stat.cRepInd : null
                        });
                    });


                    scope.data.keyIndicator = [
                        {
                            name: scope.model.geo ? scope.model.geo.name : 'Enhet',
                            lineWidth: 3,
                            color : '#74BAD8',
                            data: seriesGeo,
                            zoneAxis: 'x',
                            zones: [{
                                value: Date.UTC(new Date().getFullYear()-1, 0),
                                //dashstyle: "black"
                            }, {
                                value: Date.UTC(new Date().getFullYear(), 0),
                                dashStyle: "dash",
                            }]
                        },
                        {
                        name : 'Riket',
                        color: '#ccc',
                        data : seriesCountry,
                        zoneAxis: 'x',
                        zones: [{
                            value: Date.UTC(new Date().getFullYear()-1, 0),
                            //dashstyle: "black"
                        }, {
                            value: Date.UTC(new Date().getFullYear(), 0),
                            dashStyle: "dash",
                        }]
                    }
                    ];
                });
            }


            function getKeyIndicators () {

                var account = accountService.accountModel.activeAccount;

                var toInclude = [201,221,207,222,209,214,211,203,223,216,202,219],
                    promises  = [],
                    query;
                    
                if (account) {
                    if (scope.model.unitType == 3) {
                        toInclude = [225,201,226,221,223,211,219,227,228]
                    }
                }

                if (scope.model.geoType === 'unit'){
                    query = dataService.queryFactory({
                        unitID      : scope.model.unit.unitID,
                        level       : 2,
                        ID          : toInclude,
                        sex         : scope.model.sex,
                        unitType    : scope.model.unitType,
                        diabetesType: scope.model.diabetesType
                    });
                } else {
                    query = dataService.queryFactory({
                        countyCode  : scope.model.county.code,
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
                            riket 		: countryData[key].statSet[0].stat.r,
                            riketLKonf	: countryData[key].statSet[0].stat.lKonf,
                            riketUKonf 	: countryData[key].statSet[0].stat.uKonf,
                            geo   		: obj.statSet[0].stat.r,
                            geoLKonf	: obj.statSet[0].stat.lKonf,
                            geoUKonf	: obj.statSet[0].stat.uKonf,
                            status		: 'equal',
                            name  		: obj.indicator.name,
                            id    		: obj.indicator.id
                        };
						
						if (o.geoLKonf > o.riketUKonf){
							o.status = (obj.indicator.asc ? 'worse' : 'better');
						}
						else if (o.geoUKonf < o.riketLKonf){
							o.status = (obj.indicator.asc ? 'better' : 'worse');
						}
						
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
                model : '='

                //id     : '=',
                //geo    : '=',
                //geoType: '=',
                //light  : '=',
                //unitType: '='
            }
        };
    }]);