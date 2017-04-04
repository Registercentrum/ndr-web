'use strict';

angular.module('ndrApp')
    .service('accountService',
                ['$http', '$state', '$rootScope', 'APIconfigService', 'cookieFactory',
        function ($http,   $state,   $rootScope, APIconfigService,   cookieFactory) {

        var self = this,
            isLoggingIn = false;

        this.accountModel = {
            user         : null, //fallback
            visitor      : null, //use this instead
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
            cookieFactory.create("ACTIVEACCOUNT", accountID, 7);

            $state.go($state.current, {}, { reload: true });
            //$state.go($state.current, {}, {reload: true}); //BUG 2015-10-14, page can´t reload since then active account then is reset
            //$state.go('main.account.home');
            //$state.go('main.account.home', {}, { reload: true });

        };

        this.login = function (type) {
            var url = APIconfigService.baseURL + 'CurrentVisitor?APIKey=' + APIconfigService.APIKey;

            console.log('ACCOUNT BOOTSTRAP: LOGGING IN');

            isLoggingIn = true;

            return $http.get(APIconfigService.constructUrl(url))
                .then(function (response) {

                    self.accountModel.visitor = response.data;



                    // if (response.data.user && response.data.user.userID === 22)
                    //     response.data.user.accounts.pop()

                  if(response.data.isUser == false) {
                    console.log("IS NOT USER")
                    return false;
                  }

                  // if(self.accountModel.user){
                  //   console.log("IS ALREADY LOGGED")
                  //   return false;
                  // }
                  //

                    // console.log("GOING TO LOGIN PAGE", $state)
                    // $state.go('main.login', {direct: true}, {reload: true});

                    var user = response.data.user,
                        subject = response.data.subject,
                        loginId;

                    console.log('LOGIN SUCCESS');
                    console.log("USER: ",user);

                    self.accountModel.user = user;
                    self.accountModel.subject = subject;

                    $rootScope.$broadcast('newUser');

                    user.activeAccounts = _.filter(user.accounts, function (account) {
                        return account.status.id === 1;
                    });

                    // if( self.accountModel.subject ) {
                    //   isLoggingIn = false;
                    //   return false;
                    // }

                    if(self.accountModel.chosenUserType != "subject") {
                      // if there is only one unit set it as activeAccount
                      if (!self.accountModel.activeAccount && user.activeAccounts.length === 1) {
                        self.accountModel.activeAccount = user.activeAccounts[0];
                      } else if (cookieFactory.read("ACTIVEACCOUNT")) {
                        self.accountModel.activeAccount = user.activeAccounts.find(function (a) {
                          return a.accountID === +cookieFactory.read("ACTIVEACCOUNT");
                        });
                      }
                      else {
                        $state.go('main.login', {direct: true}, {reload: true});
                      }

                      if (self.accountModel.tempAccount) {
                        self.accountModel.activeAccount = self.accountModel.tempAccount;
                      }
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
            cookieFactory.erase("SESSIONID");
            cookieFactory.erase("ACTIVEACCOUNT");
            $state.go('main.home', {}, {reload: true});
        };


        this.bootstrap = function (type) {
            console.log('AccountService: Bootstrap');
            // if(type == 'subject') return false;
            return self.login("subject");
        };
    }]);
