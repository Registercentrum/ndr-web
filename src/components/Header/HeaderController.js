'use strict';

angular.module('ndrApp')
  .controller('HeaderController', [
             '$scope', 'accountService',
    function ($scope,   accountService) {
      $scope.accountService = accountService;
      $scope.accountModel = accountService.accountModel;
    }]);
