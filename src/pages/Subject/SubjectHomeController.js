angular.module("ndrApp")
    .controller('SubjectHomeController',
        ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', 'APIconfigService',
        function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http, APIconfigService) {

        var Account = $scope.accountModel;

        console.log(Account);

}])
