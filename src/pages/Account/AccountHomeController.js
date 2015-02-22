angular.module("ndrApp")
    .controller('AccountHomeController', ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http) {

        var Account = $scope.accountModel;

        $scope.subject = undefined;
        $scope.socialnumber = undefined;


        $scope.gotoProfile = function () {
            console.log("Social", $scope.socialnumber);

            $http({
                url: 'https://ndr.registercentrum.se/api/Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey=LkUtebH6B428KkPqAAsV',
                method: "POST",
                data: {socialNumber: $scope.socialnumber}
            })
                .success(function (data) {
                    $state.go("main.account.patient", {patientID: data.subjectID})
                })
                .error(function (data, status, headers, config) {
                    console.log("ERROR");
                });

        }

        $scope.gotoReport = function () {
            console.log("Social", $scope.socialnumber);

            $http({
                url: 'https://ndr.registercentrum.se/api/Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey=LkUtebH6B428KkPqAAsV',
                method: "POST",
                data: {socialNumber: $scope.socialnumber}
            })
            .success(function (data) {
                $state.go("main.account.report", {patientID: data.subjectID})
            })
            .error(function (data, status, headers, config) {
                console.log("ERROR");
            });


        }

}])

