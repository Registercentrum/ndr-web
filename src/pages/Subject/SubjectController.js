angular.module('ndrApp')
.controller('SubjectController',
  ['$scope', '$http', '$stateParams', '$state', 'accountService',
  function ($scope, $http, $stateParams, $state, accountService) {

    console.log('SubjectController: Init', accountService.accountModel.subject);

    $scope.accountModel   = accountService.accountModel;
    $scope.accountHelpers = accountService.helpers;

}]);