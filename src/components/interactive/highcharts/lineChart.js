angular.module('ndrApp')
.directive('lineChart', [function() {
  return {
    restrict: 'A',
    template : "<div style='position: relative'>" +
                  "<div class='chart-container'></div>" +
                  "<div class='chart-empty-label' style='position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%)'>" +
                    "Det finns ingen historik" +
                  "</div>" +
                "</div>",
    scope: {
      model: "=",
      yMin: "@",
      yMax: "@",
      dateFormat: "@",
      height: "@",
      color: "@"
    },
    link: function(scope, element, attrs) {
      var dateFormat = _.isString(scope.dateFormat) ? scope.dateFormat : "%Y-%m-%d";
      var color = scope.color || "#E14274";

      var chart = jQuery(".chart-container", element).highcharts({
          chart: {
            type: 'area',
            height : !_.isUndefined(scope.height) && _.isNumber(+scope.height) ? +scope.height : 140,
            marginTop : 5,
            marginBottom : 30,
            marginLeft : 35,
            marginRight: 5,
            spacingLeft : 30
          },
          title: {
            text: ''
          },
          xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
              year: dateFormat,
              month: dateFormat,
              week: dateFormat,
              day: dateFormat
            },
            lineWidth: 0,
            gridLineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: '#eee',
            minorTickLength: 0,
            tickLength: 0
          },
          yAxis: {
            gridLineWidth: 1,
            gridLineColor : "#eee",
            lineWidth: 0,
            minorGridLineWidth: 0,
            min : !_.isUndefined(scope.yMin) && _.isNumber(+scope.yMin) ? +scope.yMin : 40,
            max : !_.isUndefined(scope.yMax) && _.isNumber(+scope.yMax) ? +scope.yMax : 70,
            title: {
              text: '',
              align: 'high'
            },
            labels: {
              align : "right",
            }
          },
          tooltip: {
            formatter: function () {
              var time = Highcharts.dateFormat(dateFormat, new Date(this.x));
              return time + ': <b>' +  this.y + '</b>';
            }
          },
          plotOptions: {
            bar: {
              dataLabels: {
                enabled: true
              }
            },
            area : {
              fillColor : {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                stops: [
                  [0, Highcharts.Color(color).setOpacity(0.5).get('rgba')],
                  [1, Highcharts.Color(color).setOpacity(0).get('rgba')]
                ]
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
            color : color,
            name: 'Värde',
            data : [{x: 1, y:10}, {x: 3, y:5}],
            marker: {
              enabled: true,
              fillColor: color,
              lineWidth: 2,
              lineColor: null // inherit from series
            }
          }]
        });

      scope.$watch('model', function (model) {
        chart.highcharts().series[0].setData(angular.copy(model));
        jQuery(".chart-empty-label", element)
          .toggle(_.filter(model, function (m) { return m.y !== null; }).length <= 1)
          .css("color", color)
      }, true);
    }
  };
}]);