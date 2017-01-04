'use strict';

angular.module('ndrApp')
  .controller('SurveyController', [
                 '$scope', '$stateParams', '$state', '$filter', 'List', 'dataService',
        function ($scope,   $stateParams,   $state,   $filter,   List,   dataService) {

        var account = $scope.accountModel;
        console.log('SurveyController: Init');

        dataService.getInvites()
          .then(function (response) {
            console.log(response);
          })
  }])