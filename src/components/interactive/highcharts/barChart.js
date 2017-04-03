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
                            marginTop : 5,
                            spacingRight:10,
                            spacingLeft:10,
                            spacingBottom : 5,
                            marginRight: 35

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
                            // rotation: -45,
                            style: {
                              fontSize: '13px',
                              fontFamily: 'Roboto'
                            },
                            //
                            // formatter: function(d){
                            //      return d;
                            // }
                          }
                            // labels: {
                            //     formatter: function(a){
                            //         if(this.value == scope.selected){
                            //             return this.value;
                            //         }
                            //     }
                            // }


                        },
                        yAxis: {
                            gridLineWidth: 0,
                            gridLineColor : "#eee",
                            lineWidth: 0,
                            min : 0,
                            max : 100,

                            title: {
                                text: '',
                                align: 'high'
                            },
                        },
                        // tooltip: {
                        //     formatter: function() {
                        //
                        //         var time = Highcharts.dateFormat('%Y', new Date(this.x))
                        //         return this.key + ': <b>' +  this.y + '</b>';
                        //     }
                        // },
                        plotOptions: {
                            bar: {
                                pointWidth: 10,
                                dataLabels: {
                                    enabled: true,
                                    // format: '{y} ({prevOutcome})'
                                    formatter : function (d) {

                                        var prev = "saknas";
                                        if(this.point.prevOutcome.outcome){
                                            prev = this.point.prevOutcome.outcome;
                                        }

                                        // console.log("test", this.point)
                                        return this.point.y + " (" + prev + ")"
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