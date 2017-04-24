angular.module('ndrApp')
    .directive('lineChartPatientHba1c', [function() {

        return {
            restrict: 'A',
            template : '<div class="chart-container"></div>',
            scope: {
                model: '=',
                type:  '='
            },

            // set up the isolate scope so that we don't clobber parent scope
            link: function(scope, element, attrs) {


                var chart = jQuery('.chart-container', element).highcharts({
                        chart: {
                            type: scope.type === 'basic' ? 'spline' : 'area',
                            height : 180,
                           // width : 200,
                            marginTop : 20,
                            marginBottom : 30,
                            marginLeft : 35,
                            marginRight: 5,
                            spacingLeft : 30,

                            style : {
                              color: 'rgba(89,153,218,1)',
                            }
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
                            gridLineWidth: 0.5,
                            minorGridLineWidth: 0,
                            lineColor: '#ccc',
                            labels: {
                                style: {
                                    // color: 'white',
                                    fontSize : '10px'
                                }
                            },
                            minorTickLength: 0,
                            tickLength: 0

                        },

                        yAxis: {
                           gridLineWidth: 0.5,
                           gridLineColor : '#cccc',
                           lineWidth: 0,

                            minorGridLineWidth: 0,
                            /*min : 55,
                            max : 80,*/

                            title: {
                                text: '',
                                align: 'high'
                            },
                            labels: {
                                align : 'right',

                                style: {
                                    fontSize : '10px'
                                }
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
                            series : {
                                marker: {
                                    //fillColor: '#5999DA',
                                    lineWidth: 1,
                                    radius : 2,
                                    lineColor: null // inherit from series
                                }
                            },
                            spline: {
                                /*marker: {
                                    enable: false
                                }*/
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
                                        [0, 'rgba(255,255,255,0.6)'],
                                        [0.7, 'rgba(255,255,255,0.2)'],
                                        [1, 'rgba(255,255,255,0)']

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
                            //dashStyle: 'ShortDot',
                            color: 'rgba(89,153,218,1)',
                            name: 'Värde',
                            data : [{x: 1, y:10}, {x: 3, y:5}]

                        }]
                    });


                scope.$watch('model', function(model) {

                    chart.highcharts().series[0].setData(model)

                }, true);
            }
        };
    }]);