angular.module('ndrApp')
    .directive('rankChart', [function() {

        return {
            restrict: 'E',

            template : "<div class='chart-container'></div>",

            // set up the isolate scope so that we don't clobber parent scope
            link: function(scope, element, attrs) {

                var indicator_hba = {"request": {"includeCareunits": false, "includeNDR": false, "fromYear": 2013, "fromQuartal": null, "toYear": 2013, "toQuartal": null, "indicator": 201, "careunitId": null, "countyId": null, "sex": null, "careunitType": null, "diabetesType": null, "fromAge": null, "toAge": null, "APIKey": "kG6huimNDEQ7L9OpNVfg"}, "stat": [
                    {"unit": {"id": 1, "name": "Stockholm", "level": 1}, "stat": {"cRep": 64857, "cTrue": 30999, "cRepInd": 62147, "r": 49.9, "lkonf": 49.5, "ukonf": 50.3, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 3, "name": "Uppsala", "level": 1}, "stat": {"cRep": 8362, "cTrue": 3440, "cRepInd": 8276, "r": 41.6, "lkonf": 40.5, "ukonf": 42.6, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 4, "name": "Sörmland", "level": 1}, "stat": {"cRep": 10782, "cTrue": 5072, "cRepInd": 10645, "r": 47.6, "lkonf": 46.7, "ukonf": 48.6, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 5, "name": "Östergötland", "level": 1}, "stat": {"cRep": 16591, "cTrue": 7189, "cRepInd": 16226, "r": 44.3, "lkonf": 43.5, "ukonf": 45.1, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 6, "name": "Jönköping", "level": 1}, "stat": {"cRep": 13019, "cTrue": 5469, "cRepInd": 12822, "r": 42.7, "lkonf": 41.8, "ukonf": 43.5, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 7, "name": "Kronoberg", "level": 1}, "stat": {"cRep": 8739, "cTrue": 3999, "cRepInd": 8678, "r": 46.1, "lkonf": 45.0, "ukonf": 47.1, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 8, "name": "Kalmar", "level": 1}, "stat": {"cRep": 11160, "cTrue": 5240, "cRepInd": 10840, "r": 48.3, "lkonf": 47.4, "ukonf": 49.3, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 9, "name": "Gotland", "level": 1}, "stat": {"cRep": 1297, "cTrue": 425, "cRepInd": 1250, "r": 34.0, "lkonf": 31.4, "ukonf": 36.6, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 10, "name": "Blekinge", "level": 1}, "stat": {"cRep": 5214, "cTrue": 2298, "cRepInd": 5172, "r": 44.4, "lkonf": 43.1, "ukonf": 45.8, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 12, "name": "Skåne", "level": 1}, "stat": {"cRep": 48045, "cTrue": 23046, "cRepInd": 46209, "r": 49.9, "lkonf": 49.4, "ukonf": 50.3, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 13, "name": "Halland", "level": 1}, "stat": {"cRep": 8702, "cTrue": 3919, "cRepInd": 8331, "r": 47.0, "lkonf": 46.0, "ukonf": 48.1, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 14, "name": "Västra Götaland", "level": 1}, "stat": {"cRep": 68453, "cTrue": 34378, "cRepInd": 65970, "r": 52.1, "lkonf": 51.7, "ukonf": 52.5, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 17, "name": "Värmland", "level": 1}, "stat": {"cRep": 12528, "cTrue": 5780, "cRepInd": 11824, "r": 48.9, "lkonf": 48.0, "ukonf": 49.8, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 18, "name": "Örebro", "level": 1}, "stat": {"cRep": 12423, "cTrue": 5543, "cRepInd": 12291, "r": 45.1, "lkonf": 44.2, "ukonf": 46.0, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 19, "name": "Västmanland", "level": 1}, "stat": {"cRep": 11279, "cTrue": 4951, "cRepInd": 10824, "r": 45.7, "lkonf": 44.8, "ukonf": 46.7, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 20, "name": "Dalarna", "level": 1}, "stat": {"cRep": 10759, "cTrue": 3291, "cRepInd": 8526, "r": 38.6, "lkonf": 37.6, "ukonf": 39.6, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 21, "name": "Gävleborg", "level": 1}, "stat": {"cRep": 11365, "cTrue": 5131, "cRepInd": 11218, "r": 45.7, "lkonf": 44.8, "ukonf": 46.7, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 22, "name": "Västernorrland", "level": 1}, "stat": {"cRep": 10091, "cTrue": 4409, "cRepInd": 9945, "r": 44.3, "lkonf": 43.4, "ukonf": 45.3, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 23, "name": "Jämtland", "level": 1}, "stat": {"cRep": 4649, "cTrue": 2091, "cRepInd": 4623, "r": 45.2, "lkonf": 43.8, "ukonf": 46.7, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 24, "name": "Västerbotten", "level": 1}, "stat": {"cRep": 8096, "cTrue": 3439, "cRepInd": 7940, "r": 43.3, "lkonf": 42.2, "ukonf": 44.4, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 25, "name": "Norrbotten", "level": 1}, "stat": {"cRep": 7271, "cTrue": 2948, "cRepInd": 7268, "r": 40.6, "lkonf": 39.4, "ukonf": 41.7, "sPop": false}, "permissionId": 0}
                ], "statCareunits": null, "statNDR": null, "indicator": {"id": 201, "name": "HbA1c <52", "indicatorType": 1, "unit": "Andel %", "asc": false, "sortOrder": 10}, "requestedAt": "2014-06-02 15:08"};

                var countyID = scope.app.model.active.countyID;

                var dataToDraw = [];

                _.each(indicator_hba.stat, function (obj, key) {

                    var o = {};

                    var hba = obj.stat.r;

                    o.name = obj.unit.name;
                    o.y = hba;
                    if((o.name == "Stockholm" && countyID == 200) || (o.name == "Jönköping" && countyID == 197)){
                        o.color = "#ffcc00";
                    }
                    else{
                        o.color = "#ddd";
                    }

                    dataToDraw.push(o);

                })

                var sorted = _.sortBy(dataToDraw, "y").reverse();
                var categories = _.pluck(sorted, "name")

                var chart = $(".chart-container", element).highcharts({
                        chart: {
                            type: 'bar',

                        },
                        title: {
                            text: ''
                        },
                        subtitle: {
                         text: ''
                        },
                        xAxis: {
                            gridLineColor : "white",

                            categories : categories,


                            labels: {
                                style: {
                                    fontSize: '11px'
                                }
                            },

                            title: {
                                text: null
                            }
                        },
                        yAxis: {
                            ceiling : 100,
                            min: 0,
                            max: 120,
                            title: {
                                text: '(%)',
                                align: 'high'
                            },
                            labels: {
                                overflow: 'justify'
                            }
                        },
                        tooltip: {
                            valueSuffix: '%',
                            valueDecimals: 1

                        },
                        plotOptions: {
                            bar: {
                                dataLabels: {
                                    enabled: true
                                },
                                color : "#ffc100"
                            }


                        },
                        legend: {
                            enabled : false,
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'top',
                            x: -40,
                            y: 100,
                            floating: true,
                            borderWidth: 1,
                            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor || '#FFFFFF'),
                            shadow: true
                        },
                        credits: {
                            enabled: false
                        },
                        series: [
                            {
                                name: 'År 2013',
                                data: sorted
                            }

                        ]

                    });


                scope.$watch('bind', function(data) {

                    console.log("Reloading data",data);



                    
                });
            }
        };
    }]);