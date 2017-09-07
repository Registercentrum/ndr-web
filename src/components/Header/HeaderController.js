'use strict';

angular.module('ndrApp')
.controller('HeaderController', [
		 '$scope', 'accountService', 'cookieFactory',
function ($scope,   accountService, cookieFactory) {
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

	readCookieConsent();
}]);
