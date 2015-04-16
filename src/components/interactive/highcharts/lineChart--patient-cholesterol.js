angular.module('ndrApp')
    .directive('lineChartPatientCholesterol', [function() {

        return {
            restrict: 'A',
            template : "<div class='chart-container'></div>",

            scope: {
                model: "=",
                title : "="
            },

            // set up the isolate scope so that we don't clobber parent scope
            link: function(scope, element, attrs) {


                scope.$watch('model', function(model) {

                    console.log("Kol", model);
                    
                    var chart = jQuery(".chart-container", element).highcharts({
                        chart: {
                            type: 'area',
                            height : 180,
                            //width : 200,
                            marginTop : 40,
                            marginBottom : 30,
                            marginLeft : 20,
                            marginRight: 5,
                            spacingLeft : 0,

                            style : {
                                color: "#666"
                            }
                        },
                        title: {
                            enabled: false,
                            text: '',
                            style : {
                                color: "#666",
                                fontSize : 10
                            }
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
                            lineColor: '#666',
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

                            area : {
                                /*dataLabels: {
                                    enabled: true,
                                    style: {
                                        color: '#666',
                                        fontSize : '11px',
                                        fontWeight : 300,
                                    }
                                },*/
                                fillColor : {
                                    linearGradient: {
                                        x1: 0,
                                        y1: 0,
                                        x2: 0,
                                        y2: 1
                                    },
                                    stops: [
                                        [0, 'rgba(89,153,218,0.2)'],
                                        [1, 'rgba(89,153,218,0.2)']

                                    ]
                                }
                            }
                        },
                        legend: {
                            margin: 0,
                            x: -10,
                            y: -15,
                            align: 'left',
                            verticalAlign: 'top',
                            enabled: true,
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