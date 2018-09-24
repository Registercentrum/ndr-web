'use strict';

angular.module('ndrApp')
    .directive('patientProfileKids', ['$q','$timeout','dataService','commonService','$state', '$modal', '$filter',
      function($q, $timeout, dataService, commonService, $state, $modal, $filter) {

        function link (scope, element, attrs) {

          scope.model = {
            tableIndex: null,
            tableCount: null,
            excluded: [],
            warnings: null,
            data: {
              trend: {

              },
              chart: {
                gauge: {
                  physicalActivity: {}
                }
              }
            },
            mode: 'visual',
            domainPhysical : null
          }

          scope.init = function() {

            scope.model.domainPhysical = commonService.getMetafieldByQuestionText(scope.contactAttributes, 'fysisk').domain;

            populateSeriesData();
            setTablePaging();
            populateTableData();
            setWarnings();
            scope.setName(scope.subject);

            $timeout(function () {
              Highcharts.charts.map(function (c) {
                if(c){
                  c.reflow();
                }
              })
            }, 500);

          }

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

          scope.$watch('subject', function(newValue) {
            scope.init();
          });
          
          function setWarnings() {          
            scope.model.warnings = {
              selfcarePlanDate: (scope.latest.selfcarePlanDate.value ? commonService.dateWithinMonths(scope.latest.selfcarePlanDate.value,11) : false),
              bpSystolic: (scope.latest.bpSystolic.value ? commonService.dateWithinMonths(scope.latest.bpSystolic.date,11) : false),
              fundusExaminationDate: (scope.latest.fundusExaminationDate.value ? commonService.dateWithinMonths(scope.latest.fundusExaminationDate.value,11) : false),
              uAlbCreatinine: (scope.latest.uAlbCreatinine.value ? commonService.dateWithinMonths(scope.latest.uAlbCreatinine.date,11) : false)
            }
          };

          scope.tableForward = function () {
            scope.model.tableIndex--;
            populateTableData();
          };

          scope.tableBack = function () {
            scope.model.tableIndex++;
            populateTableData();
          };

          scope.diabetesTypeText = function() {
            if (!scope.contactAttributes) return;
            return commonService.getLabelByKeyVal(scope.contactAttributes,'diabetesType',scope.subject.diabetesType);
          }

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
            var trendKeys = ['hba1c'];
            scope.model.data.trend = commonService.getSeries(scope.subject, trendKeys, 3)
          }

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
        }
        return {
          restrict : 'A',
          templateUrl: 'src/components/PatientProfile/PatientProfileKids.html',
          link: link,
          scope: {
            subject 		: '=',
	          activeAccount 	: '=',
		        contactAttributes	: '=',
            latest : '='
          }
        };
    }]);
