'use strict';
// =============================
// Account Service

angular.module('ndrApp')
    .service('accountService', ['$q', '$http', 'Restangular', function($q, $http, Restangular) {

        var self = this;


        this.accountModel = {
            user : null,
            activeAccount : null,
            serverError : "",
        }


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


        this.login = function(accountID) {

            accountID = accountID || 13;

            return $http.get("https://ndr.registercentrum.se/api/User?APIKey=LkUtebH6B428KkPqAAsV")
                .success(function(user) {

                    self.accountModel.user = user;
                    var logInId = accountID || user.defaultAccountID;

                    self.accountModel.activeAccount = user.accounts[0];


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


        this.bootstrap = function (){
            console.log("AccountService: Bootstrap");
            var deferred = $q.defer();

            var accountID = 14;
            if (accountID>0)
                deferred.resolve(self.login(accountID));


            return deferred.promise;

        }
        
        
    }])
