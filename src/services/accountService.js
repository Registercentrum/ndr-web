'use strict';

angular.module('ndrApp')
    .service('accountService',
                ['$http', '$state', '$rootScope', 'APIconfigService',
        function ($http,   $state,   $rootScope,   APIconfigService) {

        var self = this,
            isLoggingIn = false;
		
        this.accountModel = {
            user         : null, //fallback
			visitor		 : null, //use this instead
            activeAccount: null,
            tempAccount  : null,
            serverError  : ''
        };

        this.helpers = {
            pnrRegex: /\b(19\d{2}|20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[-+]?\d{4}\b/

        };


        this.updateAccount = function (accountID) {
            var activeAccount = _.find(this.accountModel.user.activeAccounts, {accountID : accountID});
            this.accountModel.activeAccount = activeAccount;
            this.accountModel.tempAccount   = activeAccount;
			
			$state.go($state.current, {}, { reload: true });
            //$state.go($state.current, {}, {reload: true}); //BUG 2015-10-14, page can´t reload since then active account then is reset
			//$state.go('main.account.home');
			//$state.go('main.account.home', {}, { reload: true });
			
        };

        this.login = function (accountID) {
            var url = APIconfigService.baseURL + 'CurrentVisitor?APIKey=' + APIconfigService.APIKey;

            console.log('LOGGING IN');

            isLoggingIn = true;

            return $http.get(url)
                .then(function (response) {
					
					self.accountModel.visitor = response.data;
					
                    if(response.data.isUser == false) return false;

                    var user = response.data.user,
                        loginId;

                    console.log('LOGIN SUCCESS');
                    console.log("USER: ",user);

                    self.accountModel.user = user;

                    $rootScope.$broadcast('newUser');

                    loginId = accountID || user.defaultAccountID;

                    user.activeAccounts = _.filter(user.accounts, function (account) {
                        return account.status.id === 1;
                    });
					
					//if many units redirect to home page to choose unit
					if (self.accountModel.activeAccount == null && user.activeAccounts.length > 1)
						$state.go('main.home');
					else
						self.accountModel.activeAccount = user.activeAccounts[0];

                    if (self.accountModel.tempAccount) {
                        self.accountModel.activeAccount = self.accountModel.tempAccount;
                    }

                    isLoggingIn = false;
                })
                ['catch'](function (data, status) {
                    console.error(data.statusText, data);
                    self.accountModel.serverError = (status === 0 || status === 400 || status === 401) ?
                                                    'Inget konto kunde hittas' :
                                                    'Ett okänt fel inträffade';
                });
        };


        this.logOut = function () {
            this.accountModel.user = null;
            this.accountModel.activeAccount = null;
            document.cookie = "SESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
            $state.go('main.home', {}, {reload: true});
        };


        this.bootstrap = function () {
            console.log('AccountService: Bootstrap');
            return self.login();
        };
    }]);
