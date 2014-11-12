angular.module('ndrApp')
    .directive('barChart', [function() {

        return {
            restrict: 'E',

            template : "<div class='chart-container'></div>",

            // set up the isolate scope so that we don't clobber parent scope
            link: function(scope, element, attrs) {

                
                console.log("LINKING CHART");
                
                var chart = $(".chart-container", element).highcharts({
                        chart: {
                            type: 'bar'
                        },
                        title: {
                            text: ''
                        },
                        subtitle: {
                         text: ''
                        },
                        xAxis: {
                            gridLineColor : "white",

                            categories : [
                                'HbA1c < 52 mmol/mol',
                                'Blodtryck < 140/85 mmHg',
                                'Icke-rökare'
                            ],

                           /* categories: [       //14 indicators
                                'HbA1c < 52 mmol/mol',
                                'HbA1c < 70 mmol/mol',
                                'Blodtryck ≤ 130/80 mmHg',
                                'Blodtryck < 140/85 mmHg',
                                'Systoliskt BT < 150 mmgHg',
                                'LDL < 2,5 mmol/l',
                                'BMI < 150 35 kg/m2',
                                'Lipidbehandling',
                                'Ingen makroalbuminuri',
                                'Kontroll fotstatus',
                                'Kontroll ögonbottenstatus',
                                'Ingen diabetesreinopati',
                                'Icke-rökare',
                                'Fysisk aktivitet'

                            ],*/

                            title: {
                                text: null
                            }
                        },
                        yAxis: {
                            ceiling : 100,
                            min: 0,
                            max: 120,
                            title: {
                                text: '(%)',
                                align: 'high'
                            },
                            labels: {
                                overflow: 'justify'
                            }
                        },
                        tooltip: {
                            valueSuffix: '%',
                            valueDecimals: 1

                        },
                        plotOptions: {
                            bar: {
                                dataLabels: {
                                    enabled: false
                                },
                                color : "#ffc100"
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
                        series: [
                            {
                                name: 'År 2013',
                                data: []
                            }

                        ]

                    });


                scope.$watch('bind', function(data) {

                    console.log("Reloading data",data);


                    chart.highcharts().series[0].setData(data)

                    
                });
            }
        };
    }]);