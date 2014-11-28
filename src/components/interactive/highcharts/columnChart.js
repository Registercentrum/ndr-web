angular.module('ndrApp')
    .directive('columnChart', [function() {

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
                            type: 'column',
                            height : 120,
                            marginTop : 5,
                            marginBottom : 30
                        },
                        title: {
                            text: ''
                        },
                        xAxis: {
                            minorTickLength: 0,
                            tickLength: 0,
                            gridLineWidth: 0,
                            gridLineColor : "white",
                            lineWidth: 0,


                            title: {
                                text: ""
                            },
                            type : "category",


                        },
                       yAxis: {
                           gridLineWidth: 0,
                           gridLineColor : "white",
                           lineWidth: 0,
                           min : 60,
                           max : 70,

                            title: {
                                text: '',
                                align: 'high'
                            },
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
                            color : "#ccc",
                            name: 'Amount',
                            data: [
                                {
                                    name : "Domestic",
                                    color : "#D03928",
                                    stroke : "none",
                                    y : 1
                                },
                                {
                                    name : "International",
                                    color : "#B4BCBE",
                                    y : 2.5
                                }
                            ]
                        }]
                    });


                scope.$watch('model', function(model) {
                    console.log("Reloading Column Chart", model);
                    chart.highcharts().series[0].setData(model)
                }, true);
            }
        };
    }]);