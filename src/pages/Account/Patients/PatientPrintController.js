'use strict';

angular.module('ndrApp')
    .controller('PatientPrintController', [
        '$scope', '$q', '$timeout', '$stateParams', '$state', '$log', '$filter', 'dataService', 'accountService', 'commonService',
        function($scope, $q, $timeout, $stateParams, $state, $log, $filter, dataService, accountService, commonService) {

            $scope.subject = undefined;
            $scope.subjectID = false || $stateParams.patientID;
            $scope.unitTypeID = accountService.accountModel.activeAccount.unit.typeID;

            // allow him/her to go back and restore the filter settings
            $scope.backToSearchVisible = $stateParams.backToSearchVisible;
            $scope.model = {
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
                mode: 'visual'
            };


            $scope.init = function() {
                if ($scope.subjectID) {
                  if (!$scope.subject) {
                    $scope.getData($scope.subjectID);
                  } else {
                    $scope.setData();
                  }
                }
            }

            $scope.setData = function() {
              //populateSeriesData();
              populateTableData();
              populateFullTableData();
              populateLatestData();
              $timeout(function() {
                  jQuery(window).resize();
              }, 500);
            }

            $scope.gotoReport = function(subjectID) {
                console.log('go', subjectID);
                $state.go('main.account.report', {
                    patientID: subjectID
                });
            };

            $scope.print = function() {
                window.print();
            };

            function populateTableData() {

              var included = $scope.unitTypeID != 3 ? 
              [ //grownup
                  'contactDate',
                  'hba1c',
                  'weight',
                  'height',
                  'bmi',
                  'bpSystolic',
                  'bpDiastolic',
                  'cholesterol',
                  'triglyceride',
                  'hdl',
                  'ldl',
                  'albuminuria',
                  'macroscopicProteinuria',
                  'fundusExaminationDate',
                  'footExamination',
                  'footRiscCategory',
                  'physicalActivity',
                  'smokingHabit'
                ] :
                [ //kids
                    'contactDate',
                    'hba1c',
                    'weight',
                    'height',
                    'noInsDosePerDay',
                    'noUnitsBasePerDay',
                    'meanGlukosesLast2W',
                    'sdCGMLast2W',
                    'shareGlucoseLast2W',
                    'shareGlucoseTarget',
                    'hypoglycemiaKids',
                    'ketoKids'
                  ];


                //var excluded = ['unit', 'contactID', 'insertedAt', 'lastUpdatedAt', 'unitID', 'optionals'];
                var tableFields = commonService.includeMetafields($scope.contactAttributes, included);
                var contacts = angular.copy($scope.subject.contacts).splice(0, 5);

                $scope.model.data.table = commonService.populateTableData(contacts, tableFields, 'contactDate');
            }


            function populateFullTableData() {

              var excluded = ['unit', 'contactID', 'insertedAt', 'lastUpdatedAt', 'unitID', 'optionals'];
              var tableFields = commonService.excludeMetafields($scope.contactAttributes, excluded);
              var contacts = angular.copy($scope.subject.contacts).splice(0, 5);

              $scope.model.data.fullTable = commonService.populateTableData(contacts, tableFields, 'contactDate');

            }

            function populateLatestData() {
                $scope.model.latest = $stateParams.latest ? $stateParams.latest : commonService.getLatestModel($scope.subject, $scope.contactAttributes);
            }

            // Make requests for the subject data and contactAttributes needed to display the labels in the table
            $scope.getData = function(subjectID) {

                $q.all([
                        dataService.getSubjectById(subjectID).then(function(response) {
                            return response;
                        }),
                        dataService.getMetaFields($scope.accountModel.activeAccount.accountID,$scope.unitTypeID).then(function(response) {
                            return dataService.getFormFields(1,$scope.unitTypeID);
                        })
                    ])
                    .then(function(values) {
                        $log.debug('Retrieved subject', values[0]);

                        // Sort the contacts by date in desc order
                        values[0].contacts = _.sortBy(values[0].contacts, 'contactDate').reverse();
                        $scope.contactAttributes = values[1];
                        $scope.subject = values[0];
                        $scope.subject.age = moment().diff(moment($scope.subject.dateOfBirth), 'years');
                        $scope.setData();

                    });

            }
            $scope.init();

        }
    ]);
