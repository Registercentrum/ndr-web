'use strict';

angular.module('ndrApp')
    .directive('patientProfileGrownup', ['$q','$timeout','dataService','commonService','$state', '$modal', '$filter',
      function($q, $timeout, dataService, commonService, $state, $modal, $filter) {

        function link (scope, element, attrs) {

          scope.model = {
            tableIndex: null,
            tableCount: null,
            excluded: [],
            data: {
              trend: {

              },
              chart: {
                gauge: {
                  physicalActivity: {}
                }
              }
            },
            latest: {

            },
            mode: 'visual'
          }

          scope.init = function() {

            populateSeriesData();
            setTablePaging();
            populateTableData();
            preparePROM();

            $timeout(function () {
              Highcharts.charts.map(function (c) {
                if(c){
                  c.reflow();
                }
              })
            }, 500);

          }

          scope.$watch('subject', function(newValue) {
            scope.init();
          });

          scope.tableForward = function () {
            scope.model.tableIndex--;
            populateTableData();
          };

          scope.tableBack = function () {
            scope.model.tableIndex++;
            populateTableData();
          };

          function setTablePaging() {
            if (scope.subject !== undefined) {
              scope.model.tableCount = Math.ceil(scope.subject.contacts.length / 5);
              scope.model.tableIndex = 1;
            } else {
              scope.model.tableCount = 0;
              scope.model.tableIndex = 0;
            }
          };

          function populateTableData() {
            var excluded = ['unit', 'contactID', 'insertedAt', 'lastUpdatedAt', 'unitID', 'optionals'];
            var tableFields = commonService.excludeMetafields(scope.contactAttributes, excluded);
            var contacts = angular.copy(scope.subject.contacts).splice((scope.model.tableIndex-1)*5, 5);

            scope.model.data.table = commonService.populateTableData(contacts, tableFields, 'contactDate');

          }

          function populateSeriesData() {
            if (!scope.subject) return false;

            var trendKeys = ['hba1c', 'bpSystolic','bpDiastolic','cholesterol','triglyceride','ldl','hdl'];
            scope.model.data.trend = commonService.getSeries(scope.subject, trendKeys, 3)

            scope.model.data.trend.combinedLDLHDL = [{
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
              data: scope.model.data.trend.ldl
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
              data: scope.model.data.trend.hdl
            }];

            scope.model.data.trend.combinedCholesterol = [{
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
              data: scope.model.data.trend.cholesterol
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
              data: scope.model.data.trend.triglyceride
            }];

            scope.model.data.trend.combinedBp = [{
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
              data: scope.model.data.trend.bpSystolic
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
              data: scope.model.data.trend.bpDiastolic
            }];
          }

          function preparePROM() {

            console.log('subject=',scope.subject);
            // get submitted surveys
            var submitted = _.filter(scope.subject.invites, function (i) { return !!i.submittedAt; });
            if (submitted.length) submitted = _.sortBy(submitted, function (s) { return +(new Date(s.submittedAt)); })

            submitted = _.filter(submitted, function (d) {
              return d.isApprovedNDR == true;
            })

            if (!submitted.length)
            {
              scope.model.latestInvite = null;
              return;
            }

            // create time series
            scope.subject.surveys = !submitted.length ?
              [] :
              _.map(submitted[0].outcomes, function (outcome) {
                var datum = { dimension: outcome.dimension };

                datum.series = _.map(submitted, function (s) {
                  return {
                    x: +(new Date(s.submittedAt)),
                    y: _.find(s.outcomes, function (o) {
                      return o.dimension.id === outcome.dimension.id;
                    }).outcome
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

            scope.model.latestInvite = latestInvite;



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


            scope.model.categories = categories;
            scope.model.selectedInviteData = [latest, previous];

            var promSeries = angular.copy(scope.subject.surveys);

            promSeries.map(function (dimension) {

              dimension.name = dimension.dimension.desc;
              dimension.data = dimension.series;
              dimension.color = "#ccc",
              dimension.lineWidth= 1

            })

            scope.model.promSeries = promSeries;

            // group them by main group ids
            scope.subject.surveys = _.groupBy(
              scope.subject.surveys,
              function (s) { return s.dimension.isPREM ? 2 : 1; }
            );


            function getSeries (type) {
              return _.map(
                _.sortBy(scope.subject.contacts, function (c) { return +(new Date(c.contactDate)); }),
                function (contact) {
                  return {
                    x: +(new Date(contact.contactDate)),
                    y: contact[type]
                  };
                }
              );
            }

            scope.checkFootDate = function() {
              if (scope.latest.footExaminationDate.value) {
                  return commonService.dateWithinYears(scope.latest.footExaminationDate.label, 1);
              }
              return true;
            }
          }

        }
        return {
          restrict : 'A',
          templateUrl: 'src/components/PatientProfile/PatientProfileGrownup.html',
          link: link,
          scope: {
            subject 		: '=',
	          activeAccount 	: '=',
            contactAttributes	: '=',
            latest : '='
          }
        };
    }]);
