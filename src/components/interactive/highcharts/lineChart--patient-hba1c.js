angular.module('ndrApp')
    .directive('lineChartPatientHba1c', [function() {

        return {
            restrict: 'A',
            template : "<div class='chart-container'></div>",

            scope: {
                model: "="
            },

            // set up the isolate scope so that we don't clobber parent scope
            link: function(scope, element, attrs) {


                var chart = jQuery(".chart-container", element).highcharts({
                        chart: {
                            type: 'area',
                            height : 130,
                            marginTop : 20,
                            marginBottom : 30,
                            marginLeft : 35,
                            marginRight: 5,
                            spacingLeft : 30
                        },
                        title: {
                            text: ''
                        },


                        xAxis: {


                            type: 'datetime',
                           /* dateTimeLabelFormats: { // don't display the dummy year
                                //month: '%e. %b',
                                year: '%b'
                            },*/

                            dateTimeLabelFormats: {
                                year: '%Y'
                            },

                            lineWidth: 0,
                            gridLineWidth: 0,
                            minorGridLineWidth: 0,
                            lineColor: '#eee',
                            labels: {
                                //enabled: false
                            },
                            minorTickLength: 0,
                            tickLength: 0

                        },

                        yAxis: {
                           gridLineWidth: 1,
                           gridLineColor : "#eee",
                           lineWidth: 0,

                            minorGridLineWidth: 0,
                            /*min : 55,
                            max : 80,*/

                            title: {
                                text: '',
                                align: 'high'
                            },
                            labels: {
                                align : "right",
                                //x : 20,
                                //y : -8,

                            }


                        },
                         tooltip: {
                            formatter: function() {
                                var time = Highcharts.dateFormat('%Y', new Date(this.x))
                                return time + ': <b>' +  this.y + '</b>';
                            }
                        },
                        plotOptions: {
                            bar: {
                                dataLabels: {
                                    enabled: true
                                }
                            },
                            area : {

                                fillColor : {
                                    linearGradient: {
                                        x1: 0,
                                        y1: 0,
                                        x2: 0,
                                        y2: 1
                                    },
                                    stops: [
                                        [0, Highcharts.Color("#fff").setOpacity(0.5).get('rgba')],
                                        [1, Highcharts.Color("lightblue").setOpacity(0).get('rgba')]
                                    ]
                                }
                            }
                        },
                        legend: {
                            enabled: false,
                        },
                        credits: {
                            enabled: false
                        },
                        series: [{
                            dashStyle: "ShortDot",
                            color : "white",
                            name: 'Värde',
                            data : [{x: 1, y:10}, {x: 3, y:5}]

                        }]
                    });


                scope.$watch('model', function(model) {

                    console.log("Reload patient chart line");
                    
                    chart.highcharts().series[0].setData(model)

                }, true);
            }
        };
    }]);