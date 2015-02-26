angular.module('ndrApp')
    .directive('gaugeChart', [function() {

        return {
            restrict: 'A',
            template : "<div class='chart-container'></div>",

            scope: {
                model: "="
            },

            // set up the isolate scope so that we don't clobber parent scope
            link: function(scope, element, attrs) {

                scope.$watch('model', function(model) {


                    console.log("Reload gauge", model, scope.model);

                    if(!model) return;

                    var gaugeOptions = {

                        chart: {
                            type: 'solidgauge'
                        },

                        title: null,

                        pane: {

                            center: ['50%', '35%'],
                            size: '100%',
                            startAngle: -90,
                            endAngle: 90,
                            background: {
                                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
                                innerRadius: '60%',
                                outerRadius: '100%',
                                shape: 'arc'
                            }
                        },

                        tooltip: {
                            enabled: false
                        },

                        // the value axis
                        yAxis: {
                            stops: [
                           //     [0.5, '#ff0000'], // red
                                [1, '#278470'] // green
                            ],
                            lineWidth: 0,
                            minorTickInterval: null,
                            tickPixelInterval: 400,
                            tickWidth: 0,
                            title: {
                                y: -70
                            },
                            labels: {
                                y: 16
                            }
                        },

                        plotOptions: {
                            solidgauge: {
                                dataLabels: {
                                    y: 5,
                                    borderWidth: 0,
                                    useHTML: true
                                }
                            }
                        }
                    };

                    var chart = $('.chart-container', element).highcharts(Highcharts.merge(gaugeOptions, {
                        yAxis: {
                            min: 0,
                            max: 200,
                            title: {
                                enabled : false,
                                text: 'Speed'
                            },

                            labels : {
                                enabled : false
                            }

                        },

                        credits: {
                            enabled: false
                        },

                        series: [{
                            name: 'Speed',
                            data: [150],
                            dataLabels: {
                                format: '<div style="text-align:center"><span style="font-size:16px;color:' +
                                ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">' + scope.model.label +  '</span><br/>' +
                                '<span style="font-size:12px;color:silver"></span></div>'
                            },
                            tooltip: {
                                valueSuffix: ' km/h'
                            }
                        }]

                    }));

                  /*  point = chart.series[0].points[0];
                    point.update(40);*/

                }, true);
            }
        };
    }]);