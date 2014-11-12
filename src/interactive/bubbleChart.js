angular.module('ndrApp')
    .directive('bubbleChart', [function () {

        return {
            restrict: 'E',

            template: "<div class='chart-container'></div>",

            // set up the isolate scope so that we don't clobber parent scope
            link: function (scope, element, attrs) {

                /*
                 * https://ndrstatistik.registercentrum.se/api/County/Indicator?indicator=201&fromYear=2013&toYear=2013&APIKey=kG6huimNDEQ7L9OpNVfg
                 *
                 * */

                var indicator_ldl = {"request": {"includeCareunits": false, "includeNDR": false, "fromYear": 2013, "fromQuartal": null, "toYear": 2013, "toQuartal": null, "indicator": 209, "careunitId": null, "countyId": null, "sex": null, "careunitType": null, "diabetesType": null, "fromAge": null, "toAge": null, "APIKey": "kG6huimNDEQ7L9OpNVfg"}, "stat": [
                    {"unit": {"id": 1, "name": "Stockholm", "level": 1}, "stat": {"cRep": 64857, "cTrue": 22885, "cRepInd": 48858, "r": 46.8, "lkonf": 46.4, "ukonf": 47.3, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 3, "name": "Uppsala", "level": 1}, "stat": {"cRep": 8362, "cTrue": 2503, "cRepInd": 5662, "r": 44.2, "lkonf": 42.9, "ukonf": 45.5, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 4, "name": "Sörmland", "level": 1}, "stat": {"cRep": 10782, "cTrue": 3650, "cRepInd": 6424, "r": 56.8, "lkonf": 55.6, "ukonf": 58.0, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 5, "name": "Östergötland", "level": 1}, "stat": {"cRep": 16591, "cTrue": 3754, "cRepInd": 6280, "r": 59.8, "lkonf": 58.6, "ukonf": 61.0, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 6, "name": "Jönköping", "level": 1}, "stat": {"cRep": 13019, "cTrue": 4731, "cRepInd": 8802, "r": 53.7, "lkonf": 52.7, "ukonf": 54.8, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 7, "name": "Kronoberg", "level": 1}, "stat": {"cRep": 8739, "cTrue": 4128, "cRepInd": 7851, "r": 52.6, "lkonf": 51.5, "ukonf": 53.7, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 8, "name": "Kalmar", "level": 1}, "stat": {"cRep": 11160, "cTrue": 3225, "cRepInd": 7012, "r": 46.0, "lkonf": 44.8, "ukonf": 47.2, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 9, "name": "Gotland", "level": 1}, "stat": {"cRep": 1297, "cTrue": 333, "cRepInd": 837, "r": 39.8, "lkonf": 36.5, "ukonf": 43.1, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 10, "name": "Blekinge", "level": 1}, "stat": {"cRep": 5214, "cTrue": 1726, "cRepInd": 3699, "r": 46.7, "lkonf": 45.1, "ukonf": 48.3, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 12, "name": "Skåne", "level": 1}, "stat": {"cRep": 48045, "cTrue": 14923, "cRepInd": 27876, "r": 53.5, "lkonf": 52.9, "ukonf": 54.1, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 13, "name": "Halland", "level": 1}, "stat": {"cRep": 8702, "cTrue": 3776, "cRepInd": 7375, "r": 51.2, "lkonf": 50.1, "ukonf": 52.3, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 14, "name": "Västra Götaland", "level": 1}, "stat": {"cRep": 68453, "cTrue": 27049, "cRepInd": 54667, "r": 49.5, "lkonf": 49.1, "ukonf": 49.9, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 17, "name": "Värmland", "level": 1}, "stat": {"cRep": 12528, "cTrue": 4424, "cRepInd": 8481, "r": 52.2, "lkonf": 51.1, "ukonf": 53.2, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 18, "name": "Örebro", "level": 1}, "stat": {"cRep": 12423, "cTrue": 3675, "cRepInd": 6837, "r": 53.8, "lkonf": 52.6, "ukonf": 54.9, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 19, "name": "Västmanland", "level": 1}, "stat": {"cRep": 11279, "cTrue": 1803, "cRepInd": 6734, "r": 26.8, "lkonf": 25.7, "ukonf": 27.8, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 20, "name": "Dalarna", "level": 1}, "stat": {"cRep": 10759, "cTrue": 2335, "cRepInd": 5100, "r": 45.8, "lkonf": 44.4, "ukonf": 47.2, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 21, "name": "Gävleborg", "level": 1}, "stat": {"cRep": 11365, "cTrue": 3447, "cRepInd": 7222, "r": 47.7, "lkonf": 46.6, "ukonf": 48.9, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 22, "name": "Västernorrland", "level": 1}, "stat": {"cRep": 10091, "cTrue": 3722, "cRepInd": 6777, "r": 54.9, "lkonf": 53.7, "ukonf": 56.1, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 23, "name": "Jämtland", "level": 1}, "stat": {"cRep": 4649, "cTrue": 2225, "cRepInd": 4319, "r": 51.5, "lkonf": 50.0, "ukonf": 53.0, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 24, "name": "Västerbotten", "level": 1}, "stat": {"cRep": 8096, "cTrue": 2555, "cRepInd": 5283, "r": 48.4, "lkonf": 47.0, "ukonf": 49.7, "sPop": false}, "permissionId": 0},
                    {"unit": {"id": 25, "name": "Norrbotten", "level": 1}, "stat": {"cRep": 7271, "cTrue": 2964, "cRepInd": 6755, "r": 43.9, "lkonf": 42.7, "ukonf": 45.1, "sPop": false}, "permissionId": 0}
                ], "statCareunits": null, "statNDR": null, "indicator": {"id": 209, "name": "LDL <2,5", "indicatorType": 1, "unit": "Andel %", "asc": false, "sortOrder": 255}, "requestedAt": "2014-06-02 15:16"};


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


                a = indicator_hba;

                var dataToDraw = [];

                _.each(indicator_hba.stat, function (obj, key) {


                    var o = {};

                    var size = obj.stat.cRep;
                    var hba = obj.stat.r;
                    var ldl = indicator_ldl.stat[key].stat.r;


                    o.name = obj.unit.name;
                    o.x = hba,
                    o.y = ldl,
                    o.z = size;


                    dataToDraw.push(o);

                })


                var chart = $(".chart-container", element).highcharts({
                    chart: {
                        type: 'bubble'
                    },
                    title: {
                        text: ''
                    },
                    subtitle: {
                        text: ''
                    },
                    xAxis: {
                        gridLineColor: "white",


                        /* categories: [       //14 indicators
                         'HbA1c < 52 mmol/mol',
                         'HbA1c < 70 mmol/mol',
                         'Blodtryck ≤ 130/80 mmHg',
                         'Blodtryck < 140/85 mmHg',
                         'Systoliskt BT < 150 mmgHg',
                         'LDL < 2,5 mmol/l',
                         'BMI < 150 35 kg/m2',
                         'Lipidbehandling',
                         'Ingen makroalbuminuri',
                         'Kontroll fotstatus',
                         'Kontroll ögonbottenstatus',
                         'Ingen diabetesreinopati',
                         'Icke-rökare',
                         'Fysisk aktivitet'

                         ],*/

                        title: {
                            text: "Andel patienter med HbA1c < 52"
                        },
                        labels: {
                            formatter : function (){
                                return this.value + "%";
                            },
                            overflow: 'justify'
                        }

                    },
                    yAxis: {
                        /* ceiling : 100,
                         min: 0,
                         max: 120,*/

                        title: {
                            text: "Andel patienter med LDL < 2.5",
                            align: 'high'
                        },
                        labels: {
                              formatter : function (){
                                  return this.value + "%";
                              },
                              overflow: 'justify'
                        }
                    },
                    tooltip: {
                        valueSuffix: '%',
                        valueDecimals: 1,

                        formatter: function () {
                            return "<h4><a href='#/statistik/landsting/200'>" +
                                this.point.name +
                                "</a></h4>" +
                                "<span>Hba1c < 52: " + this.point.x + "</span><br />" +
                                "<span>LDL < 2.5: " + this.point.y + "</span><br />" +
                                "<span>Antal patienter: " + this.point.z + "</span>";
                        },
                        useHTML : true

                    },
                    plotOptions: {
                        bubble: {
                            dataLabels: {
                                enabled: false
                            },
                            color: "#ffc100"
                        }


                    },
                    legend: {
                        enabled: false,
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
                            name : "test",
                            data : dataToDraw

                        }
                    ]

                });


                scope.$watch('bind', function (data) {

                    console.log("Reloading data", data);

                    /*
                     chart.highcharts().series[0].setData(data)*/


                });
            }
        };
    }]);