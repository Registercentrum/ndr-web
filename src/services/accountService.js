'use strict';

angular.module('ndrApp')
    .service('accountService',
                ['$http', '$state', '$rootScope', 'APIconfigService',
        function ($http,   $state,   $rootScope,   APIconfigService) {

        var self = this,
            isLoggingIn = false;

        this.accountModel = {
            user         : null,
            activeAccount: null,
            tempAccount  : null,
            serverError  : ''
        };

        this.helpers = {
            pnrRegex: /\b(19\d{2}|20\d{2}|\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[-+]?\d{4}\b/
        };


        this.updateAccount = function (accountID) {
            var activeAccount =_.find(this.accountModel.user.activeAccounts, {accountID : accountID});
            this.accountModel.activeAccount = activeAccount;
            this.accountModel.tempAccount   = activeAccount;

            $state.go($state.current, {}, {reload: true});
        };


        this.login = function (accountID) {
            isLoggingIn = true;

            console.log('LOGGING IN');

            return $http.get(APIconfigService.baseURL + 'me?APIKey=' + APIconfigService.APIKey)
                .success(function (user) {
                    var logInId;

                    console.log('LOGIN SUCCESS');

                    self.accountModel.user = user;
                    $rootScope.$broadcast('newUser');

                    logInId = accountID || user.defaultAccountID;

                    user.activeAccounts = _.filter(user.accounts, function (account) {
                        return account.status.id === 1;
                    });

                    self.accountModel.activeAccount = user.activeAccounts[0];

                    if (self.accountModel.tempAccount) {
                        self.accountModel.activeAccount = self.accountModel.tempAccount;
                    }

                    isLoggingIn = false;
                })
                .error(function (data, status) {
                    self.accountModel.serverError = (status === 0 || status === 400 || status === 401) ?
                                                    'Inget konto kunde hittas' :
                                                    'Ett okänt fel inträffade';
                });
        };


        this.logOut = function () {
            this.accountModel.user = null;
            this.accountModel.activeAccount = null;
            $state.go('main.home', {}, {reload: true});
        };


        this.bootstrap = function () {
            console.log('AccountService: Bootstrap');

            return self.login()
                ['catch'](function (error) {
                    console.error(error);
                    return error;
            });
        };
    }]);
