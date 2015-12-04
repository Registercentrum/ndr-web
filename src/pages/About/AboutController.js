angular.module("ndrApp")
    .controller('AboutController',['$scope', '$stateParams', 'accountService', function($scope, $stateParams, accountService) {

        $scope.model = {};
		$scope.accountModel = accountService.accountModel;
		
		console.log($scope.accountModel);

    }]);





