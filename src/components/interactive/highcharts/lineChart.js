angular.module('diApp')
    .directive('singleLineChart', [function() {

        return {
            restrict: 'EAC',
            template : "<div class='chart-container'></div>",

            scope: {
                data: "="
            },

            // set up the isolate scope so that we don't clobber parent scope
            link: function(scope, element, attrs) {


                Highcharts.setOptions({
                    lang: {
                        numericSymbols: ['k', 'M', 'B', 'T', 'P', 'E']
                    }
                });

                var chart = jQuery(".chart-container", element).highcharts({
                        chart: {
                            type: 'spline',
                            height : 130,
                            marginTop : 20,
                            marginBottom : 10,
                            marginLeft : 15,
                            marginRight: 5,
                            spacingLeft : 30
                        },
                        title: {
                            text: ''
                        },
                        /*   subtitle: {
                         text: 'Source: Wikipedia.org'
                         },*/

                        xAxis: {
                           /* gridLineWidth: 0,
                            gridLineColor : "#BDC3C7",
                            title: {
                                text: ""
                            },*/

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

                           // ceiling : 100,
                           // min: 0,
                           // max: 110,
                            title: {
                                text: '',
                                align: 'high'
                            },
                            labels: {
                                align : "right",
                                x : 20,
                                y : -8,
                                //enabled: false

                                /*formatter: function() {
                                    if ( this.value > 1000 ) return Highcharts.numberFormat( this.value/1000, 1) + "K";  // maybe only switch if > 1000
                                    return Highcharts.numberFormat(this.value,0);
                                }*/
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
                            color : "#D03928",
                            name: ' ',
                    
                        }]
                    });


                scope.$watch('data', function(data) {

                    console.log("reloading data for line chart", data);


                    var dataToDraw = [];


                    _.each(data, function(obj, key){
                        
                        console.log(typeof obj);
                        
                        
                        var o = {
                            x : obj.year,
                            y : obj.value
                        }
                        dataToDraw.push(o)

                    })

                    chart.highcharts().series[0].setData(dataToDraw)

                });
            }
        };
    }]);