'use strict';

angular.module('ndrApp')
    .directive('patientProfileKids', ['$q','$timeout','dataService','commonService','$state', '$modal', '$filter',
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
            mode: 'visual',
            domainPhysical : null
          }

          scope.init = function() {

            scope.model.domainPhysical = commonService.getMetafieldByQuestionText(scope.contactAttributes, 'fysisk').domain;

            populateSeriesData();
            setTablePaging();
            populateTableData();

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

          scope.diabetesTypeText = function() {
            if (!scope.contactAttributes) return;
            return commonService.getLabelByKeyVal(scope.contactAttributes,'diabetesType',scope.subject.diabetesType);
          }

          function setTablePaging() {
            if (scope.subject !== undefined) {
              scope.tableCount = Math.ceil(scope.subject.contacts.length / 5);
              scope.tableIndex = 1;
            } else {
              scope.tableCount = 0;
              scope.tableIndex = 0;
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
