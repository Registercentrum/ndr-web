angular.module('ndrApp')
    .directive('lineChartCombinedPrint', [function() {

        return {
            restrict: 'A',
            template : "<div class='chart-container'></div>",

            scope: {
                model: "="
            },

            // set up the isolate scope so that we don't clobber parent scope
            link: function(scope, element, attrs) {

                scope.$watch('model', function(model) {

                    var chart = jQuery(".chart-container", element).highcharts({
                        chart: {
                            type: 'spline',
                            height : 250,
                            // width : 200,
                            marginTop : 20,
                            marginBottom : 30,
                            marginLeft : 25,
                            marginRight: 5,
                            spacingLeft : 20,
                            //spacingBottom : 60,

                            style : {
                                color: "#666"
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

                            series: {
                                marker: {
                                    enabled:true,
                                    fillColor: '#000',
                                    //lineWidth: 1,
                                    radius: 5,
                                    lineColor: null // inherit from series
                                }
                            }
                        },
                        legend: {
                            enabled: true,
                            align:'center',
                            margin: 16,
                            verticalAlign: 'top',

                        },
                        credits: {
                            enabled: false
                        },
                        series: scope.model
                    });


                }, true);
            }
        };
    }]);