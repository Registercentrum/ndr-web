'use strict';

angular.module('ndrApp')
    .directive('patientProfilePrintKids', ['$q', '$timeout', 'commonService',
        function($q, $timeout, commonService) {

            function link(scope, element, attrs) {

                scope.model = {
                    data: {
                        trend: {},
                        chart: {
                            gauge: {
                                physicalActivity: {}
                            }
                        },
                        table: null,
                        fullTable: null

                    },
                    latest: null,
                    mode: 'visual',
                    trendKeys: ['hba1c']
                };

                scope.init = function() {
                  scope.setTrendData();
                }

                scope.setTrendData = function() {
                  scope.model.data.trend = commonService.getSeries(scope.subject, scope.model.trendKeys, 3)
                }

                scope.diabetesTypeText = function() {
                    if (!scope.contactAttributes) return;
                    return commonService.getLabelByKeyVal(scope.contactAttributes,'diabetesType',scope.subject.diabetesType);
                }
                
                scope.init();

            }
            return {
                restrict: 'A',
                templateUrl: 'src/components/PatientProfile/PatientProfilePrintKids.html',
                link: link,
                scope: {
                    subject: '=',
                    latest: '=',
                    contactAttributes: "="
                }
            };
        }
    ]);