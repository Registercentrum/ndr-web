'use strict';

angular.module('ndrApp')
  .controller('PatientController', [
    '$scope', '$q', '$timeout', '$stateParams', '$state', '$log', '$filter', 'dataService', 'accountService', 'commonService',
    function ($scope, $q, $timeout, $stateParams, $state, $log, $filter, dataService, accountService, commonService) {

      $scope.subject = undefined;
      $scope.subjectID = false || $stateParams.patientID;
      $scope.pnrRegex = accountService.helpers.pnrRegex;
      $scope.unitTypeID = accountService.accountModel.activeAccount.unit.typeID;
      $scope.hasError = false;
      $scope.errorMessage = '';

      // When user navigated here from the search page,
      // allow him/her to go back and restore the filter settings
      $scope.backToSearchVisible = $stateParams.backToSearchVisible;
      $scope.backToSurveysVisible = $stateParams.backToSurveysVisible;

      $scope.diabetesTypeText = function() {
        if (!$scope.contactAttributes) return;
        return commonService.getLabelByKeyVal($scope.contactAttributes,'diabetesType',$scope.subject.diabetesType);
      }

      $scope.getSubject = function () {
        if (!$scope.socialnumber) return;

        dataService.getSubjectBySocialNumber($scope.socialnumber)
          .then(function (data) {

            if (data)
              if (data.contacts) {
                if (data.contacts.length > 0) {
                  $scope.hasError = false;
                  getPatient(data.subjectID);
                  return;
                } else {
                  $scope.hasError = true;
                  $scope.errorMessage = 'Personen finns inte rapporterad på din enhet.';
                  return;
                }
              }

            $scope.hasError = true;
            $scope.errorMessage = 'Felaktigt personnummer. Kontrollera inmatning.';
          });
      };

      // Make requests for the subject data and contactAttributes needed to display the labels in the table
      function getPatient(id) {

        $q.all([
          dataService.getSubjectById(id).then(function (response) {
            return response;
          }),
          dataService.getMetaFields($scope.accountModel.activeAccount.accountID,$scope.accountModel.activeAccount.unit.typeID).then(function (response) {
            return dataService.getFormFields(1,$scope.accountModel.activeAccount.unit.typeID);
          })
        ])
          .then(function (values) {
            console.log('values found',values);
            $log.debug('Retrieved subject', values[0]);

            // Sort the contacts by date in desc order
            values[0].contacts = _.sortBy(values[0].contacts, 'contactDate').reverse();
            $scope.subject = values[0];
            $scope.contactAttributes = values[1];
            $scope.socialnumber = $scope.subject.socialNumber;
            $scope.latest = commonService.getLatestModel($scope.subject, $scope.contactAttributes)

            /* PROM */
            // update subject's age
            $scope.subject.age = moment().diff(moment($scope.subject.dateOfBirth), 'years');
            // update subject's debut
            $scope.subject.debut = moment().diff(moment([$scope.subject.yearOfOnset, 0, 1]), 'years');


          });

      }

      if ($scope.subjectID) {
        getPatient($scope.subjectID);
      }
    }]);
