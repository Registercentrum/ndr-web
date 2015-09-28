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

            $state.go($state.current, {}, {reload: true});
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
            //TODO:
            $state.go('main.home', {}, {reload: true});
        };


        this.bootstrap = function () {
            console.log('AccountService: Bootstrap');
            return self.login();
        };
    }]);
