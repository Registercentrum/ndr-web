'use strict';

angular.module('ndrApp')
  .controller('SurveyController', [
                 '$scope', '$stateParams', '$state', '$filter', 'List', 'dataService',
        function ($scope,   $stateParams,   $state,   $filter,   List,   dataService) {

        var account = $scope.accountModel;
        console.log('SurveyController: Init');

        $scope.model = {
          socialnumbers: [],
          prominvites: []
        };

        dataService.getInvites()
          .then(function (response) {
            $scope.model.prominvites = response.data;
          })


        $scope.fetchSubject = function (index) {
          var sn = $scope.model.socialnumbers[index]

          if (!sn || sn.length !== 12) return false;

          dataService.getSubjectBySocialNumber(sn)
            .then(function (subject) {
              console.log(subject)
            })
        };
  }])