angular.module('ndrApp')
    .directive('lineChart', [function() {

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
                            marginBottom : 10,
                            marginLeft : 35,
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



                            lineWidth: 0,
                            gridLineWidth: 0,
                            minorGridLineWidth: 0,
                            lineColor: 'transparent',
                            labels: {
                                enabled: false
                            },
                            minorTickLength: 0,
                            tickLength: 0

                        },

                        yAxis: {
                           gridLineWidth: 1,
                           gridLineColor : "white",
                           lineWidth: 0,

                            minorGridLineWidth: 0,
                            min : 50,
                            max : 70,

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
                            dashStyle: "ShortDot",
                            color : "#E14274",
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