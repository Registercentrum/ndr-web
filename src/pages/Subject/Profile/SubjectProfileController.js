angular.module("ndrApp")
    .controller('SubjectProfileController', ['$scope', '$stateParams', 'dataService', '$timeout', '$filter', 'commonService',
        function($scope, $stateParams, dataService, $timeout, $filter, commonService) {

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
                mode: 'visual',
                tableIndex: null,
                tableCount: null,
            };

            $scope.tableForward = function() {
                $scope.model.tableIndex--;
                populateTableData();
            };

            $scope.tableBack = function() {
                $scope.model.tableIndex++;
                populateTableData();
            };

            $scope.subject = $scope.accountModel.subject;

            // update subject's age
            $scope.subject.age = moment().diff(moment($scope.subject.dateOfBirth), 'years');
            // update subject's debut
            $scope.subject.debut = moment().diff(moment([$scope.subject.yearOfOnset, 0, 1]), 'years');

            // get submitted surveys
            var submitted = _.filter($scope.subject.invites, function(i) {
                return !!i.submittedAt;
            });
            if (submitted.length) submitted = _.sortBy(submitted, function(s) {
                return +(new Date(s.submittedAt));
            })
            // create time series
            $scope.subject.surveys = !submitted.length ? [] :
                _.map(submitted[0].outcomes, function(outcome) {
                    var datum = {
                        dimension: outcome.dimension
                    };

                    datum.series = _.map(submitted, function(s) {
                        return {
                            x: +(new Date(s.submittedAt)),
                            y: _.find(s.outcomes, function(o) {
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


            var latestInvite = submitted[submitted.length - 1]
            var previousInvite = submitted[submitted.length - 2]

            $scope.model.latestInvite = latestInvite;

            var categories = [];

            if (latestInvite)
                var latest = {
                    name: "Senaste enkätsvar",
                    data: latestInvite.outcomes.map(function(outcome, index) {
                        categories.push(outcome.dimension.desc);
                        return outcome.outcome;
                    }),
                    color: "#5EBCDC"
                }

            if (previousInvite)
                var previous = {
                    name: "Tidigare enkätsvar",
                    data: previousInvite ? previousInvite.outcomes.map(function(outcome, index) {
                        return outcome.outcome;
                    }) : null,
                    color: "#ECECEC"
                }


            $scope.model.categories = categories;

            $scope.model.selectedInviteData = [];
            if (latest) $scope.model.selectedInviteData.push(latest);
            if (previous) $scope.model.selectedInviteData.push(previous);

            var promSeries = angular.copy($scope.subject.surveys);

            promSeries.map(function(dimension) {

                dimension.name = dimension.dimension.desc;
                dimension.data = dimension.series;
                dimension.color = "#ccc",
                    dimension.lineWidth = 1

            })

            $scope.model.promSeries = promSeries;


            // group them by main group ids
            $scope.subject.surveys = _.groupBy(
                $scope.subject.surveys,
                function(s) {
                    return s.dimension.isPREM ? 2 : 1;
                }
            );

            //var trendKeys = ['hba1c', 'bmi','bpSystolic','ldl'];
            //$scope.model.data.trend = commonService.getSeries($scope.subject, trendKeys, 3)


            // get series for the profile charts
            var charts = [{
                title: 'HbA1c',
                series: getSeries('hba1c'),
                helpText: 'HbA1c – eller "långtidssocker" – speglar hur blodsockret varit i genomsnitt under cirka två till tre månader före provtagningen. För vuxna som har diabetes är den generella målsättningen enligt socialstyrelsens nationella riktlinjer att HbA1c ska vara lägre än 52 mmol/mol.'

            }, {
                title: 'BMI',
                series: getSeries('bmi'),
                helpText: 'Body Mass Index (BMI) är ett sätt att skatta om man är överviktig genom att mäta förhållandet mellan vikt och längd enligt formeln BMI=vikt (Kg)/ längd2 (Meter)'
            }, {
                title: 'LDL',
                series: getSeries('ldl'),
                helpText: 'Det finns flera typer av fetter i blodet. De som brukar bedömas är totalkolesterol, LDL-kolesterol, HDL-kolesterol och triglycerider.Höga halter av det skadliga kolesterolet LDL kan bidra till åderförfettning. Det kan leda till olika hjärt-kärlsjukdomar som kärlkramp, hjärtinfarkt, stroke eller försämrad blodcirkulation i benen, så kallad fönstertittarsjuka.'
            }, {
                title: 'Blodtryck',
                series: getSeries('bpSystolic'),
                helpText: 'För vuxna som har diabetes är den generella målsättningen enligt socialstyrelsens nationella riktlinjer att blodtrycket ska vara lägre än 140/85 mm/Hg.'
            }];

            $scope.subject.charts = _.map(charts, function(chart) {
                chart.latest = _.last(chart.series).y;
                chart.yMax = _.max(chart.series, function(s) {
                    return s.y;
                }).y;
                return chart;
            });

            $timeout(function() {
                Highcharts.charts.map(function(c) {
                    if (c) {
                        c.reflow();
                    }
                })
            }, 500);


            function getSeries(type) {
                return _.map(
                    _.sortBy($scope.subject.contacts, function(c) {
                        return +(new Date(c.contactDate));
                    }),
                    function(contact) {
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
            /*function getLatestValue(key) {

                var visit = _.find($scope.subject.contacts, function(v) {
                        return !_.isNull(v[key]);
                    }),
                    attribute = _.find($scope.contactAttributes, {
                        columnName: key
                    }),
                    value;

                if (key === 'diabetesType') return {
                    value: null,
                    date: null,
                    label: 'saknas'
                };
                if (typeof visit === 'undefined') return {
                    value: null,
                    date: null,
                    label: 'saknas'
                };

                if (_.isNull(visit[key]) || _.isUndefined(visit[key])) {
                    value = 'saknas';

                    // If it's a date, format it in a nice way
                } else if (attribute && attribute.domain && attribute.domain.name === 'Date') {
                    value = $filter('date')(new Date(visit[key]), 'yyyy-MM-dd');

                    // Get proper label for the id value
                } else if (attribute && attribute.domain && attribute.domain.isEnumerated) {
                    value = _.find(attribute.domain.domainValues, {
                        code: visit[key]
                    }).text;

                    // If it's a boolean, return proper translation (ja-nej)
                } else if (attribute && attribute.domain && attribute.domain.name === 'Bool') {
                    value = visit[key] ? 'Ja' : 'Nej';
                } else {
                    value = $filter('number')(visit[key]) + (attribute.measureUnit != null ? ' ' + attribute.measureUnit : '');
                }

                var ret = visit ? {
                        value: visit[key],
                        date: visit.contactDate,
                        label: value
                    } : //$filter('number')(value)
                    {
                        value: null,
                        date: null,
                        label: value
                    };

                return ret;
            }*/


            function populateTableData() {

                var excluded = ['unit', 'contactID', 'insertedAt', 'lastUpdatedAt', 'unitID', 'optionals'];
                var tableFields = commonService.excludeMetafields($scope.contactAttributes, excluded);
                var contacts = angular.copy($scope.subject.contacts).splice(($scope.model.tableIndex - 1) * 5, 5);

                $scope.model.data.table = commonService.populateTableData(contacts, tableFields, 'contactDate');
            }

            function populateLatestData() {
                $scope.model.latest = commonService.getLatestModel($scope.subject, $scope.contactAttributes)
            }

            function setTablePaging() {
                if ($scope.subject !== undefined) {
                    $scope.model.tableCount = Math.ceil($scope.subject.contacts.length / 5);
                    $scope.model.tableIndex = 1;
                } else {
                    $scope.model.tableCount = 0;
                    $scope.model.tableIndex = 0;
                }
              };

            dataService.getPROMFormMeta()
                .then(function(response) {
                    console.log("test", response)
                    $scope.PROMFormMeta = response.data;
                });
            $scope.diabetesTypeText = function() {
                if (!$scope.contactAttributes) return;
                return commonService.getLabelByKeyVal($scope.contactAttributes,'diabetesType',$scope.subject.diabetesType);
            }
            $scope.init = function() {

                $scope.contactAttributes = dataService.getFormFields(1, 1);

                if (!$scope.contactAttributes) {
                    $scope.fetchMetaField();
                    return;
                }

                setTablePaging();
                populateLatestData();
                populateTableData();

            }
            $scope.fetchMetaField = function() {
                dataService.getMetaFields().then(function(d) {
                    $scope.init();
                })
            }
            $scope.init();

        }
    ]);