angular.module('ndrApp')
    .controller('AccountController', ['$scope', '$http', '$stateParams', '$state', 'accountService', function ($scope, $http, $stateParams, $state, accountService) {

            $scope.accountModel   = accountService.accountModel;
            $scope.accountHelpers = accountService.helpers;

        }]);