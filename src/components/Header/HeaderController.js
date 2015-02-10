angular.module('ndrApp')
    .controller('HeaderController', function ($scope, accountService) {

        $scope.accountService = accountService;

        $scope.accountModel = accountService.accountModel;

});