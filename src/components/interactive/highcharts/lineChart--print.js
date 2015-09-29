angular.module('ndrApp')
    .directive('lineChartPrint', [function() {

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
                            type: 'spline',
                            height : 250,
                           // width : 200,
                            marginTop : 20,
                            marginBottom : 30,
                            marginLeft : 45,
                            marginRight: 5,
                            spacingLeft : 30,

                            style : {
                                color: 'black'
                            }
                        },
                        title: {
                            text: ''
                        },



                    xAxis: {

                        type: 'datetime',

                        dateTimeLabelFormats: {
                            year: '%y, %b'
                        },

                        lineWidth: 0,
                        gridLineWidth: 0.5,
                        minorGridLineWidth: 0,
                        lineColor: '#eee',
                        labels: {
                            style: {
                                color: '#666',
                                fontSize : '10px'
                            }
                        },
                        minorTickLength: 0,
                        tickLength: 0

                    },

                    yAxis: {
                        gridLineWidth: 0.5,
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
                            x : -5,
                            align : "right",

                            style: {
                                color: '#666',
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
                            spline: {
                                dataLabels: {
                                    enabled: true
                                }
                            },
                            series : {
                                marker: {
                                    fillColor: '#000',

                                    lineWidth: 2,
                                    radius : 2,
                                    lineColor: null // inherit from series
                                }
                            },

                        },
                        legend: {
                            enabled: false,
                        },
                        credits: {
                            enabled: false
                        },
                        series: [{
                            //dashStyle: 'ShortDot',
                            color : 'black',
                            name: 'Värde',
                            data : [{x: 1, y:10}, {x: 3, y:5}],
                            //marker: {
                            //    fillColor: '#000',
                            //    symbol : 'square',
                            //    lineWidth: 2,
                            //    radius : 3,
                            //    lineColor: null // inherit from series
                            //}

                        }]
                    });


                scope.$watch('model', function(model) {

                    chart.highcharts().series[0].setData(model)

                }, true);
            }
        };
    }]);