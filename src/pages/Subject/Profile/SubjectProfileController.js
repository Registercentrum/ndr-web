angular.module("ndrApp")
    .controller('SubjectProfileController',
        ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', 'APIconfigService',
        function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http, APIconfigService) {

        $scope.subject = $scope.accountModel.subject;

        // update subject's age
        $scope.subject.age = moment().diff(moment($scope.subject.dateOfBirth), 'years');
        // update subject's debut
        $scope.subject.debut = moment().diff(moment([$scope.subject.yearOfOnset, 0, 1]), 'years');

        // get submitted surveys
        var submitted = _.filter($scope.subject.invites, function (i) { return !!i.submittedAt; });
        if (submitted.length) submitted = _.sortBy(submitted, function (s) { return +(new Date(s.submittedAt)); })
        // group by dates
        $scope.subject.surveys = !submitted.length ?
          [] :
          _.map(submitted[0].outcomes, function (outcome) {
            var datum = {
              dimension: outcome.dimension
            };
            datum.series = _.map(submitted, function (s) {
              return {
                x: +(new Date(s.submittedAt)),
                y: _.find(s.outcomes, function (o) {
                  return o.dimension.id === outcome.dimension.id;
                }).outcome
              };
            });
            datum.latestOutcome = _.last(datum.series).y
            datum.diffFromPrevious = datum.series.length > 1 && _.isNumber(datum.latestOutcome) && _.isNumber(datum.series[datum.series.length - 2].y) ?
              datum.latestOutcome - datum.series[datum.series.length - 2].y :
              null;
            return datum;
          });

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

        console.log($scope.subject);
}]);

