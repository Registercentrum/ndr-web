angular.module('ndrApp')
  .controller('HeaderController', [
             '$scope', 'accountService', '$state',
    function ($scope,   accountService, $state) {

      $scope.accountService = accountService;
      $scope.accountModel = accountService.accountModel;
    }]);
  