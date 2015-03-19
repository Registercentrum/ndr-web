angular.module('ndrApp')
    .directive('lineChartPatientBp', [function() {

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
                            type: 'area',
                            height : 180,
                            // width : 200,
                            marginTop : 20,
                            marginBottom : 30,
                            marginLeft : 35,
                            marginRight: 5,
                            spacingLeft : 30,

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
                                year: '%Y'
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

                            series: {

                                marker: {
                                    fillColor: '#FFFFFF',
                                    lineWidth: 1,
                                    lineColor: null // inherit from series
                                }
                            }


                        },
                        legend: {
                            enabled: false,
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