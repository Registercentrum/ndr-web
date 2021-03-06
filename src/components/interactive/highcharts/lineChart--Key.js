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
                            marginRight: 50,
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
                            maxPadding: 0.4,
                            minPadding: 0.4,
                            ceiling : 100,
                           // min : 0,
                            title: {
                                text: '',
                                align: 'high'
                            },
                            labels: {
                                align : "left",
                                //x : 20,
                                //y : -8,

                                formatter: function () {
                                    return  this.value + '%';

                                }
                            }
                        },

                        tooltip: {
                            formatter: function(d) {
                                var time = Highcharts.dateFormat('%Y', new Date(this.x))
                                return time + ': <b>' +  this.y + '</b><br />Baserat på ' + this.point.cRep + ' rapporteringar';
                            }
                        },
                        plotOptions: {

                            bar: {
                                dataLabels: {
                                    enabled: true
                                }
                            },


                            spline: {
                                dataLabels: {
                                    style: {
                                        fontSize: '12px'
                                    },
                                    enabled: true,
                                   /* formatter: function() {
                                        return '<b>' +  this.series.name + '</b>';
                                    }*/
                                    //crop : false,
                                    //overflow : false,
                                    allowOverlap : true,
                                    //showLastLabel : true
                                },
                            }
                        },
                        legend: {
                            //enabled: enabled,
                            layout: 'horizontal',
                            align: 'center',
                            verticalAlign: 'top',
                            //x: -40,
                            y: 30,
                            floating: true,
                            //borderWidth: 1,
                            //backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor || '#FFFFFF'),
                            //shadow: true
                        },
                        credits: {
                            enabled: false
                        },
                        series: angular.copy(scope.model)
                    });



                }, true);
            }
        };
    }]);