'use strict';

angular.module('ndrApp')
.controller('HeaderController', [
		 '$scope', '$state', 'accountService', 'cookieFactory', 'dataService',
function ($scope, $state, accountService, cookieFactory, dataService) {
	$scope.accountService = accountService;
	$scope.accountModel = accountService.accountModel;

	var cookieKey = 'cookieConsent';

  	var readCookieConsent = function()  {
		$scope.accountModel.cookieConsent = cookieFactory.read(cookieKey);
	};

	$scope.setCookieConsent = function() {
		var minutes = 60*24*365*20; //20 år
		cookieFactory.create(cookieKey,1,minutes);
		readCookieConsent();
	};

	$scope.setAccount = function(accountID) {
		accountService.updateAccount(accountID)
		dataService.setValue('metafields', null);
	};

	readCookieConsent();
}]);
