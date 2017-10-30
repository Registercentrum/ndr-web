angular.module("ndrApp")
    .controller('AccountHomeController', ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', 'APIconfigService', function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http, APIconfigService) {
	
		$scope.model = {
			activeAccount: $scope.accountModel.activeAccount,
			newsList: null,
			unitInIQV: dataService.isInProject('iqv'),
			activeTab: dataService.getValue('homeActiveTab')
		};
		
		//separated for future needs
		$scope.model.keyIndicatorModel = {
			geoType: "unit",
			unit: $scope.model.activeAccount.unit,
			unitType: $scope.model.activeAccount.unit.typeID,
			diabetesType: $scope.model.activeAccount.unit.typeID === 1 ? 0 : 1
		};
		
		//separated for future needs
		$scope.model.statCharModel = {
			activeAccount: $scope.model.activeAccount
		};
		
		//separated for future needs
		$scope.model.statReporting = {
			activeAccount: $scope.model.activeAccount
		};
		$scope.handleTabClick = function(tab) {
			this.model.activeTab = tab;
			dataService.setValue('homeActiveTab', tab);
		}
	
        dataService.getList("news", "?excludePublic=true").then(function (data){

            data = data.splice(0,4);

            angular.forEach(data, function(item) {
                item.link = "#/nyheter/" + item.newsID;
                item.categoryNames = [];
                angular.forEach(item.categories, function(category){
                    item.categoryNames.push(category.name);
                });
            });

            $scope.model.newsList = {
                data : data
            }

            setTimeout(function (){
                jQuery('.Intro--equalHeights').matchHeight(true);
            },100);

        })

        $scope.gotoProfile = function () {
            console.log("Social", $scope.socialnumber);

            $http({
                url: APIconfigService.baseURL + 'Subject?AccountID=' + $scope.model.activeAccount.accountID + '&APIKey=' + APIconfigService.APIKey,
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
                url: APIconfigService.baseURL + 'Subject?AccountID=' + $scope.model.activeAccount.accountID + '&APIKey=' + APIconfigService.APIKey,
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

