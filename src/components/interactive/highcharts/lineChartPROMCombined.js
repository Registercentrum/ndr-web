angular.module('ndrApp')
.directive('lineChartPromCombined', [function() {
  return {
    restrict: 'A',
    template : "<div id='promCombined' class='chart-container'></div>",

    scope: {
      model: "=",
      title : "="
    },

    // set up the isolate scope so that we don't clobber parent scope
    link: function(scope, element, attrs) {


      function updateColor(series){
        if(series == undefined) return;

        var color = series.color == '#ccc' ? '#74BAD8' : '#ccc';
        var width = series.color == '#ccc' ? 5 : 1;

        var sibling = $('#promCombined').highcharts().series[series.index];
        series.update({color:color});
        series.update({lineWidth:width});
        sibling.update({color:color});
        sibling.update({lineWidth:width});
      }

      scope.$watch('model', function(model) {

        var chart = jQuery(".chart-container", element).highcharts({
          chart: {
            type: 'spline',
            height : 500,
            width : 800,
            marginTop : 20,
            marginBottom : 30,
            marginLeft : 20,
            marginRight: 250,
            spacingLeft : 0,

            style : {
              color: "#666"
            }
          },
          title: {
            text : '',
            enabled: false,
          },

          xAxis: {

            type: 'datetime',

            dateTimeLabelFormats: {
              year: '%Y',
              month : '%B'
            },

            lineWidth: 0,
            gridLineWidth: 0.5,
            minorGridLineWidth: 0,
            lineColor: '#666',
            labels: {
              style: {
                color: '#666',
                fontSize : '12px'
              }
            },
            minorTickLength: 0,
            tickLength: 0

          },

          yAxis: {
            gridLineWidth: 0.5,
            gridLineColor : "#eee",
            lineWidth: 0,

            minorGridLineWidth: 0,
            min : 0,
            max : 100,

            title: {
              text: '',
              align: 'high'
            },

            labels: {
              x : -5,
              align : "right",
              style: {
                color: '#666',
                fontSize : '12px'
              }
            }
          },
          tooltip: {
            formatter: function(d) {
              var time = Highcharts.dateFormat('%Y-%m-%d', new Date(this.x))
              return "<b>" +  this.series.name + "</b><br /><br />" + time + ': <b>' +  this.y + '</b>';
            }
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true
              }
            },
            series : {
              stickyTracking: false,
              tooltip: {
                followPointer: true,
                split: true
              },
              marker: {
                symbol: 'circle',
                //fillColor: '#5999DA',
                lineWidth: 1,
                radius : 2,
                lineColor: null // inherit from series
              },

              events: {
                click: function () {
                  // updateColor(this);
                },

                legendItemClick: function (event) {
                  var visibility = this.visible ? 'visible' : 'hidden';
                  event.preventDefault();

                  updateColor(this);

                  // if (this.visible) series.hide();
                  //else series.show();
                  return true;
                },
              },

              states : {
                hover : {
                  lineWidth: 4,
                  color : 'blue'
                },
                select : {
                  lineWidth: 2,
                  color: '#851E20'
                }
              }
            },
          },
          legend: {
            margin: 0,
            x: -10,
            y: -15,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'top',
            itemMarginTop : 5,
            enabled: true,

            style: {
              color: '#666',
              fontSize : '12px'
            }

          },
          credits: {
            enabled: false
          },
          series: scope.model
        });

      }, true);
    }
  };
}]);