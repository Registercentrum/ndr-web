angular.module("ndrApp")
    .controller('AccountHomeController', ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', 'APIconfigService', function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http, APIconfigService) {

        var Account = $scope.accountModel;

        $scope.subject = undefined;
        $scope.socialnumber = undefined;
        
        console.log("Active Account", Account.activeAccount);
        

        $scope.model = {
            id : Account.activeAccount.unit.unitID,
            geoType : "unit",
            unitType : Account.activeAccount.unit.typeID,
            diabetesType : Account.activeAccount.unit.typeID === 1 ? 0 : 1
        }

        dataService.getAny("News", "?isInternal=true").then(function (data){

            data.sort(function (a,b){
                return new Date(b.publishedFrom) - new Date(a.publishedFrom);
            })

            data = data.splice(0,4);

            angular.forEach(data, function(item) {
                item.categoryNames = [];
                angular.forEach(item.categories, function(category){
                    item.categoryNames.push(category.name);
                });
            });

            $scope.model.newsList = data;
        })


        $scope.gotoProfile = function () {
            console.log("Social", $scope.socialnumber);

            $http({
                url: APIconfigService.baseURL + 'Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey= ' + APIconfigService.APIKey,
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
                url: APIconfigService.baseURL + 'Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey= ' + APIconfigService.APIKey,
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

