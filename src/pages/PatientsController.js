angular.module("ndrApp")
    .controller('PatientsController', function ($scope, $http, $stateParams, $state) {

        console.log("PatientsController: Init");


        $scope.model = {

            contacts : undefined,
            subjects : undefined,
            subjectList : undefined

        }


        $scope.accountModel = {
            user : null,
            activeAccount : null,
        }


        $scope.logIn = function(accountID) {


            accountID = accountID || 13;


            $http.get("https://ndr.registercentrum.se/api/User?APIKey=LkUtebH6B428KkPqAAsV")
                .success(function(user) {

                    $scope.accountModel.user = user;
                    var logInId = accountID || user.defaultAccountID;

                    $scope.accountModel.activeAccount = user.accounts[0];

                    $http.get("https://ndr.registercentrum.se/api/Contact?APIKey=LkUtebH6B428KkPqAAsV&AccountID=" + $scope.accountModel.activeAccount.accountID)
                        .success(function(data) {

                            $scope.model.contacts = data;

                            var subjects = _.toArray(_.groupBy($scope.model.contacts, function(contact){ return contact.subject.subjectID }));

                            $scope.model.subjects = subjects;
                            $scope.model.subjectList = subjects;


                            console.log("Contacts", data, subjects);

                        })
                            
                            


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
                            $scope.serverError = 'Inget konto kunde hittas';
                            break;
                        default:
                            $scope.serverError = 'Ett okÃ¤nt fel intrÃ¤ffade';
                    }
                });
        };

        $scope.logOut = function() {
            $scope.user = null;
            $scope.activeAccount = null;
            Account.setAccount(null);
        };

        $scope.updateAccount = function() {
            Account.setAccount($scope.activeAccount);
        }

        var accountID = 14;
        if (accountID>0)
            $scope.logIn(accountID);

        $scope.toggleLogin = function() {

            if ($scope.activeAccount != null) {
                $scope.logOut();
            }
            else {
                $scope.logIn();
            }
        };



    })