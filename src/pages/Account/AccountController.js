angular.module("ndrApp")
    .controller('AccountController', function ($scope, $http, $stateParams, $state, accountService) {

        console.log("AccountController: Init", accountService.accountModel.user);

        $scope.accountModel   = accountService.accountModel;
        $scope.accountHelpers = accountService.helpers;

    });