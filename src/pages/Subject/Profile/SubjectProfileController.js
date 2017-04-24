angular.module("ndrApp")
    .controller('SubjectProfileController',
                ['$scope', '$stateParams', 'dataService', '$timeout', '$filter',
        function ($scope,   $stateParams,   dataService, $timeout, $filter) {

        $scope.tabOversight = {
          heading: "Mina värden",
          active: $stateParams.tab !== "besvarade-enkater"
        };
        $scope.tabAnsweredSourveys = {
          heading: "Enkätsvar",
          active: $stateParams.tab === "besvarade-enkater"
        };

          $scope.model = {
            data: {
              trend: {},
              chart: {
                gauge: {
                  physicalActivity: {}
                }
              }
            },
            latest: {},
            mode: 'visual'
          };

        $scope.subject = $scope.accountModel.subject;

        // update subject's age
        $scope.subject.age = moment().diff(moment($scope.subject.dateOfBirth), 'years');
        // update subject's debut
        $scope.subject.debut = moment().diff(moment([$scope.subject.yearOfOnset, 0, 1]), 'years');

        // get submitted surveys
        var submitted = _.filter($scope.subject.invites, function (i) { return !!i.submittedAt; });
        if (submitted.length) submitted = _.sortBy(submitted, function (s) { return +(new Date(s.submittedAt)); })
        // create time series
        $scope.subject.surveys = !submitted.length ?
          [] :
          _.map(submitted[0].outcomes, function (outcome) {
            var datum = { dimension: outcome.dimension };

            datum.series = _.map(submitted, function (s) {
              return {
                x: +(new Date(s.submittedAt)),
                y: _.find(s.outcomes, function (o) {
                  return o.dimension.id === outcome.dimension.id;
                }).outcome || null
              };
            });
            datum.latestOutcome = _.last(datum.series).y

            // calculate the diff from previous, if we have the data
            if (datum.series.length > 1 &&
                _.isNumber(datum.latestOutcome) &&
                _.isNumber(datum.series[datum.series.length - 2].y))
              datum.diffFromPrevious = datum.latestOutcome - datum.series[datum.series.length - 2].y;

            return datum;
          });


          var latestInvite = submitted[submitted.length-1]
          var previousInvite = submitted[submitted.length-2]

          $scope.model.latestInvite = latestInvite;


          var categories = [];

          var latest = {
            name : "Senaste enkätsvar",
            data : latestInvite.outcomes.map(function (outcome, index) {
              categories.push(outcome.dimension.desc);
              return outcome.outcome;
            }),
            color : "#5EBCDC"
          }

          var previous = {
            name : "Tidigare enkätsvar",
            data : previousInvite ? previousInvite.outcomes.map(function (outcome, index) {
              return outcome.outcome;
            }) : null,
            color : "#ECECEC"
          }


          $scope.model.categories = categories;
          $scope.model.selectedInviteData = [latest, previous];

          var promSeries = angular.copy($scope.subject.surveys);

          promSeries.map(function (dimension) {

            dimension.name = dimension.dimension.desc;
            dimension.data = dimension.series;
            dimension.color = "#ccc",
              dimension.lineWidth= 1

          })

          $scope.model.promSeries = promSeries;


        // group them by main group ids
        $scope.subject.surveys = _.groupBy(
          $scope.subject.surveys,
          function (s) { return s.dimension.isPREM ? 2 : 1; }
        );

        // get series for the profile charts
        var charts = [{
            title: 'HbA1c',
            series: getSeries('hba1c'),

          }, {
            title: 'BMI',
            series: getSeries('bmi'),
          }, {
            title: 'LDL',
            series: getSeries('ldl'),
          }, {
            title: 'Blodtryck',
            series: getSeries('bpSystolic'),
          }
        ];

        $scope.subject.charts = _.map(charts, function (chart) {
          chart.latest = _.last(chart.series).y;
          chart.yMax = _.max(chart.series, function (s) { return s.y; }).y;
          return chart;
        });

        $timeout(function () {
          Highcharts.charts.map(function (c) {
            if(c){
              c.reflow();
            }
          })
        }, 500);


        function getSeries (type) {
          return _.map(
            _.sortBy($scope.subject.contacts, function (c) { return +(new Date(c.contactDate)); }),
            function (contact) {
              return {
                x: +(new Date(contact.contactDate)),
                y: contact[type]
              };
            }
          );
        }

          /**
           * Get the most recent value for the key
           * @param  {String} key What are we looking for?
           * @return {Object} A pair of value and the data
           */
          function getLatestValue(key) {

            var visit = _.find($scope.subject.contacts, function (v) {
                return !_.isNull(v[key]);
              }),
              attribute = _.find($scope.contactAttributes, {columnName: key}),
              value;
            
            console.log("test", attribute)

            if (key === 'diabetesType') return {value: null, date: null, label: 'saknas'};
            if (typeof visit === 'undefined') return {value: null, date: null, label: 'saknas'};

            if (_.isNull(visit[key]) || _.isUndefined(visit[key])) {
              value = 'saknas';

              // If it's a date, format it in a nice way
            } else if (attribute && attribute.domain && attribute.domain.name === 'Date') {
              value = $filter('date')(new Date(visit[key]), 'yyyy-MM-dd');

              // Get proper label for the id value
            } else if (attribute && attribute.domain && attribute.domain.isEnumerated) {
              value = _.find(attribute.domain.domainValues, {code: visit[key]}).text;

              // If it's a boolean, return proper translation (ja-nej)
            } else if (attribute && attribute.domain && attribute.domain.name === 'Bool') {
              value = visit[key] ? 'Ja' : 'Nej';
            } else {
              console.log("test", attribute)
              value = $filter('number')(visit[key]) + (attribute.measureUnit != null ? ' ' + attribute.measureUnit : '');
            }

            var ret = visit ?
              {value: visit[key], date: visit.contactDate, label: value} : //$filter('number')(value)
              {value: null, date: null, label: value};

            return ret;
          }


          function populateLatestData() {
            if (!$scope.subject) return false;

            $scope.model.latest.bmi = getLatestValue('bmi');
            $scope.model.latest.weight = getLatestValue('weight');
            $scope.model.latest.treatment = getLatestValue('treatment');
            $scope.model.latest.footRiscCategory = getLatestValue('footRiscCategory');
            $scope.model.latest.footExaminationDate = getLatestValue('footExaminationDate');

            _.each($scope.contactAttributes, function (obj) {
              $scope.model.latest[obj.columnName] = getLatestValue(obj.columnName);
            });

            console.log($scope.model.latest['pumpNew']);
            console.log($scope.model.latest['pumpOngoing']);

            //pumpOngoing should be pumpNew if reported later
            if ($scope.model.latest['pumpNew']) {
              if ($scope.model.latest['pumpNew'].date >= $scope.model.latest['pumpOngoing'].date) {
                $scope.model.latest['pumpOngoing'] = $scope.model.latest['pumpNew'];
              }
            }

            console.log($scope.model.latest['pumpNew']);
            console.log($scope.model.latest['pumpOngoing']);
            console.log($scope.model.latest['pumpClosureReason']);

            //pumpOngoing should be reset if closure reported later
            if ($scope.model.latest['pumpClosureReason']) {
              if ($scope.model.latest['pumpClosureReason'].date >= $scope.model.latest['pumpOngoing'].date) {
                $scope.model.latest['pumpOngoing'] = {value: null, date: null, label: 'saknas'};
              }
            }

            console.log($scope.model.latest['pumpNew']);
            console.log($scope.model.latest['pumpOngoing']);
            console.log($scope.model.latest['pumpClosureReason']);

            console.log($scope.model.latest);
          }


          function populateSeriesData() {
            if (!$scope.subject) return false;

            $scope.model.data.trend.hba1c = getSeries('hba1c');
            $scope.model.data.trend.bpSystolic = getSeries('bpSystolic');
            $scope.model.data.trend.bpDiastolic = getSeries('bpDiastolic');
            $scope.model.data.trend.cholesterol = getSeries('cholesterol');
            $scope.model.data.trend.triglyceride = getSeries('triglyceride');
            $scope.model.data.trend.ldl = getSeries('ldl');
            $scope.model.data.trend.hdl = getSeries('hdl');

            $scope.model.data.chart.physicalActivity = getLatestValue('physicalActivity');
            $scope.model.data.chart.smoking = getLatestValue('smoking');

            $scope.model.data.trend.combinedLDLHDL = [{
              //dashStyle: "ShortDot",
              color: 'rgba(89,153,218,1)',
              fillColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                stops: [
                  [0, 'rgba(89,153,218,0.2)'],
                  [1, 'rgba(89,153,218,0.2)']
                ]
              },
              name: 'LDL',
              data: $scope.model.data.trend.ldl
            }, {
              //dashStyle: "ShortDot",
              color: 'rgba(26,188,156,1)',
              fillColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                stops: [
                  [0, 'rgba(26,188,156,0.2)'],
                  [1, 'rgba(26,188,156,0.2)']
                ]
              },
              name: 'HDL',
              data: $scope.model.data.trend.hdl
            }];

            $scope.model.data.trend.combinedCholesterol = [{
              //dashStyle: "ShortDot",
              color: 'rgba(89,153,218,1)',
              fillColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                stops: [
                  [0, 'rgba(89,153,218,0.2)'],
                  [1, 'rgba(89,153,218,0.2)']
                ]
              },

              name: 'Kolesterol',
              data: $scope.model.data.trend.cholesterol
            }, {
              //dashStyle: "ShortDot",
              color: 'rgba(26,188,156,1)',
              fillColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                stops: [
                  [0, 'rgba(26,188,156,0.2)'],
                  [1, 'rgba(26,188,156,0.2)']
                ]
              },
              name: 'Triglycerider',
              data: $scope.model.data.trend.triglyceride
            }];

            $scope.model.data.trend.combinedBp = [{
              //dashStyle: "ShortDot",
              color: 'rgba(89,153,218,1)',
              fillColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                stops: [
                  [0, 'rgba(89,153,218,0.2)'],
                  [1, 'rgba(89,153,218,0.2)']
                ]
              },
              name: 'Värde',
              data: $scope.model.data.trend.bpSystolic
            }, {
              //dashStyle: "ShortDot",
              color: 'rgba(26,188,156,1)',
              fillColor: {
                linearGradient: {
                  x1: 0,
                  y1: 0,
                  x2: 0,
                  y2: 1
                },
                stops: [
                  [0, 'rgba(26,188,156,0.2)'],
                  [1, 'rgba(26,188,156,0.2)']
                ]
              },
              name: 'Värde',
              data: $scope.model.data.trend.bpDiastolic
            }];
          }

          dataService.getPROMFormMeta()
          .then(function (response) {
              console.log("test", response)
            $scope.PROMFormMeta = response.data;
          });

          dataService.getContactAttributes().then(function (response) {
            return response;
          }) .then(function (values) {

            $scope.contactAttributes = values;
            populateLatestData();
            populateSeriesData();

          })
        console.log($scope.subject);
}]);

