angular.module('ndrApp')
    .directive('barChart', [function() {

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
                            type: 'bar',
                            height : 500,
                            width: 700,
                            marginTop : 5,
                            spacingRight:30,
                            spacingLeft:10,
                            spacingBottom : 5,
                            marginRight: 100,
                          backgroundColor : "#f0f0f0",

                        },
                        title: {
                            text: ''
                        },

                        xAxis: {
                            minorTickLength: 0,
                            tickLength: 0,
                            gridLineWidth: 0,
                            gridLineColor : "#ccc",
                            lineWidth: 0,

                            title: {
                                text: ""
                            },
                            type : "category",


                          labels: {
                            // rotation: -45,
                            style: {
                              fontSize: '14px',
                              fontFamily: 'Roboto'
                            },

                          }


                        },
                        yAxis: {
                            gridLineWidth: 1,
                            gridLineColor : "#999",
                            // lineWidth: 2,
                            min : 0,
                            max : 100,

                            title: {
                                text: '',
                                align: 'high'
                            },
                          labels : {
                            style: {
                              fontSize: '14px',
                              fontFamily: 'Roboto'
                            }
                          },
                        },
                          tooltip: {
                            enabled: false
                          },
                        plotOptions: {
                            bar: {
                                pointWidth: 15,

                                dataLabels: {
                                  crop: false,
                                  overflow : "none",
                                  style: {
                                    fontSize: '13px',
                                    fontFamily: 'Roboto'
                                  },
                                    enabled: true,
                                    // format: '{y} ({prevOutcome})'
                                    formatter : function (d) {

                                        var previous = "";

                                        if(this.point.prevOutcome.outcome){

                                          var diff = this.point.prevOutcome.difference;

                                          if(diff > 0){
                                            var diff = "+" + diff;
                                          }

                                          previous = " (" + diff + ")";
                                        }

                                        // console.log("test", this.point)
                                        return this.point.y + previous;
                                    }
                                }
                            },
                            // series : {
                            //     pointWidth: 6
                            // }
                        },
                        legend: {
                            enabled: false,

                        },
                        credits: {
                            enabled: false
                        },


                        series: [{
                            color : "#74BAD8",
                            name: 'Värde',
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