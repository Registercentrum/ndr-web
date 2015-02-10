'use strict';
// =============================
// Account Service

angular.module('ndrApp')
    .service('accountService', ['$q', '$http', 'Restangular', '$state', function($q, $http, Restangular, $state) {

        var self = this;


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

            var activeAccount =_.find(this.accountModel.user.accounts,{accountID : accountID});
            this.accountModel.activeAccount = activeAccount;
            this.accountModel.tempAccount = activeAccount;

            $state.go($state.current, {}, {reload: true});
        }

        this.login = function(accountID) {


            return $http.get("https://ndr.registercentrum.se/api/User?APIKey=LkUtebH6B428KkPqAAsV")
                .success(function(user) {

                    self.accountModel.user = user;
                    
                    console.log("user", user);
                    
                    var logInId = accountID || user.defaultAccountID;

                    self.accountModel.activeAccount = user.accounts[0];

                    if(self.accountModel.tempAccount){
                        self.accountModel.activeAccount =  self.accountModel.tempAccount;
                    }


                })
                .error(function(data, status, headers, config) {

                    switch (status) {
                        case 0:
                        case 401:
                            self.accountModel.serverError = 'Inget konto kunde hittas';
                            break;
                        default:
                            self.accountModel.serverError = 'Ett okÃ¤nt fel intrÃ¤ffade';
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
            var deferred = $q.defer();

            var accountID = undefined;

            deferred.resolve(self.login(accountID));

            return deferred.promise;
        }

    }])



/*        $scope.logOut = function() {
 $scope.user = null;
 $scope.activeAccount = null;
 Account.setAccount(null);
 };

 $scope.updateAccount = function() {
 Account.setAccount($scope.activeAccount);
 }

 $scope.toggleLogin = function() {

 if ($scope.activeAccount != null) {
 $scope.logOut();
 }
 else {
 $scope.logIn();
 }
 };
 */



/*  if (logInId>0) {
 $scope.accountModel.activeAccount = $filter('filter')(user.accounts, function (d)
 {
 return d.accountID == logInId;
 })[0]
 } else {
 self.activeAccount = user.accounts[0];
 }*/

//Account.setAccount($scope.activeAccount);
//List.init();