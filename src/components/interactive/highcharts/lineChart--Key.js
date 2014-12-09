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

                var chart = jQuery(".chart-container", element).highcharts({
                        chart: {
                            type: 'spline',
                            height : 430,
                            marginTop : 20,
                            marginBottom : 10,
                            marginLeft : 45,
                            marginRight: 5,
                            spacingLeft : 30
                        },
                        title: {
                            text: ''
                        },

                        xAxis: {
                            type: 'datetime',
                            dateTimeLabelFormats: { // don't display the dummy year
                                month: '%e. %b',
                                year: '%b'
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
                            gridLineWidth: 1,
                            gridLineColor : "white",
                            lineWidth: 0,
                            minorGridLineWidth: 0,

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
                            valueSuffix: ''
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
                        series: [{
                            //dashStyle: "ShortDot",
                            color : "yellow",
                            name: 'a',
                            data : [{x: 1, y:10}, {x: 3, y:5}]
                    
                        }]
                    });


                scope.$watch('model', function(model) {

                    chart.highcharts().series[0].setData(model)

                }, true);
            }
        };
    }]);