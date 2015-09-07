'use strict';

angular.module('ndrApp')
    .controller('CurrentUserController',
                ['$scope', '$http', 'accountService', 'dataService', 'APIconfigService',
        function ($scope,   $http,   accountService,   dataService,   APIconfigService) {

            console.log('CurrentUserController: Init', accountService.accountModel.user);

            $scope.accountModel     = accountService.accountModel;
            $scope.accountHelpers   = accountService.helpers;
            $scope.filteredUnits    = [];
            $scope.unitSearchString = '';
            $scope.user             = accountService.accountModel.user;


            $scope.$on('newUser', function () {
                $scope.user = accountService.accountModel.user;
            });


            dataService.getList('units').then(function (data) {
                var units = data.plain();
                $scope.filteredUnits = [];

                $scope.$watch('unitSearchString', function (unitSearchString) {
                    $scope.resetAccountErrors();

                    unitSearchString = unitSearchString.toLowerCase();

                    if (unitSearchString != '') {

                        $scope.filteredUnits = _.take(_.filter(units, function (d) {
							return (d.name.toLowerCase().indexOf(unitSearchString) > -1);
                        }), 20);
                    } else {
                        $scope.filteredUnits = [];
                    }

                });
            });


            //could be moved to Restangular
            $scope.setRoles = function () {
                angular.forEach($scope.user.accounts, function (account, accountkey) {
                    var rolestring;

                    angular.forEach(account.roles, function (role, rolekey) {
                        if (!rolestring) rolestring = '';
                        rolestring += ', ' + account.roles[rolekey].name;
                    });

                    $scope.user.accounts[accountkey].rolestring = rolestring;
                });
            };


            $scope.resetAccountErrors = function () {
                $scope.newAccountError   = [];
                $scope.newAccountSuccess = null;
            };


            $scope.updateUser = function () {
                $scope.updateUserError   = [];
                $scope.updateUserSuccess = false;

                var httpConfig = {
                    method: 'PUT',
                    data  : $scope.user,
                    url   : APIconfigService.baseURL + 'User/' + $scope.user.userID + '?APIKey=' + APIconfigService.APIKey
                };

                $http(httpConfig)
                    .success(function (data) {
                        console.log('updated ok');

                        if ($scope.accountModel.activeAccount) {
                            accountService.login($scope.accountModel.activeAccount.accountID);
                        } else {
                            $scope.user = data;
                            $scope.setRoles();
                        }

                        $scope.updateUserSuccess = true;
                        setTimeout(function () {
                            $scope.updateUserSuccess = null;
                            $scope.$apply();
                        }, 3000);
                    })
                    .error(function (data) {
                        if (data.ModelState) {
                            for (var prop in data.ModelState)
                                if (data.ModelState.hasOwnProperty(prop))
                                    $scope.updateUserError.push(data.ModelState[prop][0]);
                        } else {
                            $scope.updateUserError.push('Ett okänt fel inträffade. Var god försök igen senare.');
                        }
                    });
            };


            $scope.applyUnit = function (unitID) {
				var reActivateAccount = null;
				var accountModel;
				var httpConfig;

                $scope.resetAccountErrors();

                angular.forEach($scope.user.accounts, function (account) {
                    if (account.unit.unitID === unitID && account.status.id === 1) {
                        $scope.newAccountError.push('Du har redan ett konto på denna enhet.');
					} else if (account.unit.unitID === unitID && (account.status.id === 2 || account.status.id === 3)){
                        $scope.newAccountError.push('En kontobegäran är redan under behandling för dig på denna enhet.');
                    } else if (account.unit.unitID === unitID && account.status.id === 9) { //inaktivt konto finns, skall återaktiveras
						reActivateAccount = account;
					}
                });

				if ($scope.newAccountError.length) return;

				if (reActivateAccount != null) {
					httpConfig = {
						method: 'PUT',
						data  : {
							statusID: 3
						},
						url   : APIconfigService.baseURL + 'Account/' + reActivateAccount.accountID + '?APIKey=' + APIconfigService.APIKey
					};
				} else {
					accountModel = {
						unitID  : unitID,
						userID  : $scope.user.userID,
						statusID: 3,
						roleIDs : []
					};

					var httpConfig = {
						method: 'POST',
						data  : accountModel,
						url   : APIconfigService.baseURL + 'Account/?APIKey=' + APIconfigService.APIKey
					};
				};

                $http(httpConfig)
                    .success(function (data) {
                        $scope.user = data;
                        $scope.setRoles();
                        $scope.newAccountSuccess = true;
                    })
                    .error(function (data) {
                        if (data.ModelState) {
                            for (var prop in data.ModelState)
                                if (data.ModelState.hasOwnProperty(prop)) $scope.newAccountError.push(data.ModelState[prop][0]);
                        } else {
                            $scope.newAccountError.push('Ett okänt fel inträffade. Var god försök igen senare.');
                        }
                });
            };
        }]);
