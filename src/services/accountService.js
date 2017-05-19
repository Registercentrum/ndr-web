'use strict';

angular.module('ndrApp')
  .service('accountService',
    ['$http', '$state', '$rootScope', 'APIconfigService', 'cookieFactory',
      function ($http, $state, $rootScope, APIconfigService, cookieFactory) {

        var self = this,
          isLoggingIn = false;

        this.accountModel = {
          isPROMSubject: false,
          user: null, //fallback
          visitor: null, //use this instead
          activeAccount: null,
          tempAccount: null,
          serverError: ''
        };

        this.helpers = {
          pnrRegex: /\b(19\d{2}|20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[-+]?\d{4}\b/

        };

        /* Updates User Account and reloads current route */
        this.updateAccount = function (accountID) {
          var activeAccount = _.find(this.accountModel.user.activeAccounts, {accountID: accountID});
          this.accountModel.activeAccount = activeAccount;
          this.accountModel.tempAccount = activeAccount;
          cookieFactory.create("ACTIVEACCOUNT", accountID, 7);

          $state.go($state.current, {}, {reload: true});
        };

        this.login = function () {
          var url = APIconfigService.baseURL + 'CurrentVisitor?APIKey=' + APIconfigService.APIKey;

          isLoggingIn = true;

          return $http.get(APIconfigService.constructUrl(url))
            .then(function (response) {

              console.log('ACCOUNTSERVICE: Login()', response.data);

              self.accountModel.visitor = response.data;

              var user = response.data.user,
                subject = response.data.subject,
                loginId;


              self.accountModel.user = user;
              self.accountModel.subject = subject;

              $rootScope.$broadcast('newUser');


              if (response.data.isSubject == true && self.accountModel.chosenUserType == "subject") {
                self.accountModel.activeAccount = {};
                cookieFactory.create("SUBJECT", "y", 7);
              }


              if(cookieFactory.read("SUBJECT")){
                self.accountModel.chosenUserType = 'subject';
                return false;
              }

              if (response.data.isUser == false) {
                return false;
              }


              if (self.accountModel.chosenUserType !== "subject") {
                console.log("test", response.data.isUser)

                user.activeAccounts = _.filter(user.accounts, function (account) {
                  return account.status.id === 1;
                });

                self.accountModel.chosenUserType = "user";

                //If cookie
                if (cookieFactory.read("ACTIVEACCOUNT")) {
                  self.accountModel.activeAccount = _.find(user.activeAccounts, function (a) {
                    return a.accountID === +cookieFactory.read("ACTIVEACCOUNT");
                  });

                } else if(self.accountModel.activeAccount){

                //If not logged in and only 1 account
                } else if(!self.accountModel.activeAccount && user.activeAccounts.length == 1){
                  self.accountModel.activeAccount = user.activeAccounts[0];

                  var accountID =  self.accountModel.activeAccount.accountID;
                  cookieFactory.create("ACTIVEACCOUNT", accountID, 7);
                  $state.go('main.account.home');

                  //If not logged in and >1 account
                } else if(!self.accountModel.activeAccount && user.activeAccounts.length > 1) {
                  $state.go('main.login', {direct: true}, {reload: true});
                }


                // // if there is only one account set it as activeAccount
                // if (!self.accountModel.activeAccount && user.activeAccounts.length > 1) {
                //   $state.go('main.login', {direct: true}, {reload: true});
                // } else if (cookieFactory.read("ACTIVEACCOUNT")) {
                //   self.accountModel.activeAccount = user.activeAccounts.find(function (a) {
                //     return a.accountID === +cookieFactory.read("ACTIVEACCOUNT");
                //   });
                // } else if(!self.accountModel.activeAccount && user.activeAccounts.length == 1){
                //    self.accountModel.activeAccount = user.activeAccounts[0];
                //    $state.go('main.account.home');
                // }
                // else {
                //   $state.go('main.login', {direct: true}, {reload: true});
                // }

                // if (self.accountModel.tempAccount) {
                //   self.accountModel.activeAccount = self.accountModel.tempAccount;
                // }

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
          cookieFactory.erase("SUBJECT");
          $state.go('main.home', {}, {reload: true});
        };


        this.bootstrap = function () {
          return self.login();
        };
      }]);
