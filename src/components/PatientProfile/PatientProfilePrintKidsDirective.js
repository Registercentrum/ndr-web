'use strict';

angular.module('ndrApp')
    .directive('patientProfilePrintKids', ['$q', '$timeout', 'commonService', 'dataService',
        function($q, $timeout, commonService, dataService) {

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
                  scope.setName(scope.subject);
                  scope.setWarnings();
                }

                scope.setWarnings = function() {          
                    scope.model.warnings = {
                      selfcarePlanDate: (scope.latest.selfcarePlanDate.value ? commonService.dateWithinMonths(scope.latest.selfcarePlanDate.value,11) : false),
                      bpSystolic: (scope.latest.bpSystolic.value ? commonService.dateWithinMonths(scope.latest.bpSystolic.date,11) : false),
                      fundusExaminationDate: (scope.latest.fundusExaminationDate.value ? (scope.latest.diabeticRetinopathy.value ? commonService.dateWithinMonths(scope.latest.fundusExaminationDate.value,9) : commonService.dateWithinMonths(scope.latest.fundusExaminationDate.value,21))  : false),
                      uAlbCreatinine: (scope.latest.uAlbCreatinine.value ? commonService.dateWithinMonths(scope.latest.uAlbCreatinine.date,11) : false)
                    }
                  };

                scope.setName = function(subject) {

                    var personInfo = commonService.getPersonInfoLocal(subject);
            
                    if (personInfo != null) {
                        subject.name = commonService.getName(personInfo);
                        scope.$digest();
                    } else {
                        var accountID = scope.activeAccount.accountID;
                        dataService.fetchSubjectInfo(accountID,subject.socialNumber)
                        .then(function(data) {
                            subject.name = commonService.getName(data);
                            scope.$digest();
                        });
                    }

    
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
                    contactAttributes: "=",
                    activeAccount 	: '='
                }
            };
        }
    ]);