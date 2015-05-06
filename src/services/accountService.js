// =============================
// Account Service

angular.module('ndrApp')
    .service('accountService', ['$q', '$http', 'Restangular', '$state', '$filter', '$rootScope', 'APIconfigService', function($q, $http, Restangular, $state, $filter, $rootScope, APIconfigService) {

        var self = this;
		this.isLoggingIn = false;
		
        this.accountModel = {
            user : null,
            activeAccount : null,
            serverError : "",
            tempAccount : undefined
        };

        this.helpers = {
            pnrRegex: /\b(19\d{2}|20\d{2}|\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[-+]?\d{4}\b/
        };

        this.updateAccount = function(accountID) {

            var activeAccount =_.find(this.accountModel.user.activeAccounts,{accountID : accountID});
            this.accountModel.activeAccount = activeAccount;
            this.accountModel.tempAccount = activeAccount;

            $state.go($state.current, {}, {reload: true});
        }

        this.login = function(accountID) {

            this.isLoggingIn = true;

            console.log("LOGGING IN");

            return $http.get(APIconfigService.baseURL + "me?APIKey=" + APIconfigService.APIKey)
                .success(function(user) {

                    console.log("SUCCESS");

                    self.accountModel.user = user;
					$rootScope.$broadcast("newUser");

                    var logInId = accountID || user.defaultAccountID;

					user.activeAccounts = $filter('filter')(user.accounts, function (account)
					{
						return account.status.id == 1;
					});
					
                    self.accountModel.activeAccount = user.activeAccounts[0];

                    if(self.accountModel.tempAccount){
                        self.accountModel.activeAccount =  self.accountModel.tempAccount;
                    }

					
					
                    this.isLoggingIn = false;

                })
                .error(function(data, status, headers, config) {

                    switch (status) {
                        case 0:
                        case 400:
                            self.accountModel.serverError = 'Inget konto kunde hittas';
                            break
                        case 401:
                            self.accountModel.serverError = 'Inget konto kunde hittas';
                            break;
                        default:
                            self.accountModel.serverError = 'Ett okänt fel inträffade';
                    }
                });
        };

        this.logOut = function() {
            this.accountModel.user = null;
            this.accountModel.activeAccount = null;
            $state.go('main.home', {}, {reload: true});

        };


        this.bootstrap = function (){
            console.log("AccountService: Bootstrap");

           /* if(isLoggingIn) {
                return false;
            };*/

            var accountID = undefined;

            return self.login(accountID)
                ["catch"](function (error) {
                console.log("err", error);
                return error;
            });
        };

    }])


