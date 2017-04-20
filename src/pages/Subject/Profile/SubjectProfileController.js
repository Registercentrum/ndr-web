angular.module("ndrApp")
    .controller('SubjectProfileController',
                ['$scope', '$stateParams', 'dataService',
        function ($scope,   $stateParams,   dataService) {

        $scope.tabOversight = {
          heading: "Mina värden",
          active: $stateParams.tab !== "besvarade-enkater"
        };
        $scope.tabAnsweredSourveys = {
          heading: "Enkätsvar",
          active: $stateParams.tab === "besvarade-enkater"
        };

        $scope.model = {};

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
              return outcome.outcome || null;
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

        dataService.getPROMFormMeta()
          .then(function (response) {
              console.log("test", response)
            $scope.PROMFormMeta = response.data;
          });

        console.log($scope.subject);
}]);

