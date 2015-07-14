angular.module('ndrApp')
    .controller('AccountController', ['$scope', '$http', '$stateParams', '$state', 'accountService', function ($scope, $http, $stateParams, $state, accountService) {
    
            console.log('AccountController: Init', accountService.accountModel.user);
    
            $scope.accountModel   = accountService.accountModel;
            $scope.accountHelpers = accountService.helpers;

        }]);