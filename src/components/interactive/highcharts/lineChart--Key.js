angular.module('ndrApp')
    .directive('lineChartKey', [function() {

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
                            height : 470,
                            marginTop : 60,
                            marginBottom : 30,
                            marginLeft : 45,
                            marginRight: 45,
                            spacingLeft : 30,
                        },
                        title: {
                            text: ''
                        },

                        xAxis: {

                            type: 'datetime',

                            dateTimeLabelFormats: {
                                month: '%Y',
                                year: '%Y'
                            },

                            lineWidth: 1,
                            gridLineWidth: 0,
                            minorGridLineWidth: 0,
                            // lineColor: 'transparent',
                            labels: {
                                enabled: true
                            },
                            minorTickLength: 0,
                            tickLength: 0

                        },

                        yAxis: {
                            "opposite": true,
                            gridLineWidth: 1,
                            gridLineColor : "white",
                            lineWidth: 0,
                            minorGridLineWidth: 0,

                            title: {
                                text: '',
                                align: 'high'
                            },
                            labels: {
                                align : "left",
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
                        series: scope.model
                    });



                }, true);
            }
        };
    }]);