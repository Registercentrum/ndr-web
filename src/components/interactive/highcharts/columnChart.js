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


                scope.$watch('model', function(model) {
                    console.log("Reloading Column Chart", model);

                    if(typeof model == "undefined") return false;


                    var chart = jQuery(".chart-container", element).highcharts({
                        chart: {
                            type: 'column',
                            height : 120,
                            marginTop : 5,
                            spacingRight:10,
                            spacingLeft:10,
                            spacingBottom : 5
                        },
                        title: {
                            text: ''
                        },
                        xAxis: {
                            minorTickLength: 0,
                            tickLength: 0,
                            gridLineWidth: 0,
                            gridLineColor : "#eee",
                            lineWidth: 0,


                            title: {
                                text: ""
                            },
                            type : "category",

                            labels: {
                                formatter: function(a){
                                    if(this.value == scope.selected){
                                        return this.value;
                                    }
                                }
                            }


                        },
                        yAxis: {
                            gridLineWidth: 0,
                            gridLineColor : "#eee",
                            lineWidth: 0,
                            min : 40,
                            max : 70,

                            title: {
                                text: '',
                                align: 'high'
                            },
                        },
                        tooltip: {
                            formatter: function() {

                                var time = Highcharts.dateFormat('%Y', new Date(this.x))
                                return this.key + ': <b>' +  this.y + '</b>';
                            }
                        },
                        plotOptions: {
                            bar: {
                                dataLabels: {
                                    enabled: true
                                }
                            },
                            series : {
                                pointWidth: 6
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
                            data: model
                        }]
                    });


                    //if(typeof model != "undefined")
                    //scope.selected = _.findWhere(model, {color : "#FFCC01"}).name;
                    //chart.highcharts().series[0].setData(model)
                }, true);
            }
        };
    }]);