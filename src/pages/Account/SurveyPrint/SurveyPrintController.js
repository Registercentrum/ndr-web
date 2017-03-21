'use strict';

angular.module('ndrApp')
  .controller('SurveyPrintController', [
                 '$scope', '$stateParams', '$state',
        function ($scope,   $stateParams,   $state) {

          console.log($stateParams)

          $scope.model = {
            unitName: $stateParams.unitName,
            socialNumber: $stateParams.socialNumber,
            key: $stateParams.key
          }
  }]);