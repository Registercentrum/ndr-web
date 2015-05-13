angular.module('ndrApp')
    .controller('CurrentUserController', ['$scope', '$http', '$stateParams', '$state', 'accountService', 'dataService', 'APIconfigService', function ($scope, $http, $stateParams, $state, accountService, dataService, APIconfigService) {
    
            console.log('CurrentUserController: Init', accountService.accountModel.user);
    
            $scope.accountModel   = accountService.accountModel;
            $scope.accountHelpers = accountService.helpers;
			$scope.filteredUnits = [];
			$scope.unitSearchString = '';
			$scope.user = accountService.accountModel.user;
			
			//could be moved to Restangular
			$scope.setRoles = function() {
				angular.forEach($scope.user.accounts, function(account, accountkey) {
					var rolestring = '';
					
					angular.forEach(account.roles, function(role, rolekey) {
						rolestring = rolestring == '' ? account.roles[rolekey].name : rolestring + ', ' + account.roles[rolekey].name;
					});
					
					$scope.user.accounts[accountkey].rolestring = rolestring;
				});
			}
			
			$scope.resetAccountErrors = function() {
				$scope.newAccountError = [];
				$scope.newAccountSuccess = null;
			};
			
			dataService.getList('units').then(function (data){

				var units = data.plain();
				$scope.filteredUnits = [];

				$scope.$watch('unitSearchString', function (){
					
					$scope.resetAccountErrors();
					
					var s = $scope.unitSearchString.toLowerCase();
					
					if (s != '') {
						$scope.filteredUnits = _.take(_.filter(units, function (d){
							return  d.name.toLowerCase().indexOf(s) > -1 ;
						}), 20);
					}
					else {
						$scope.filteredUnits = [];
					}

				}, true);
			})

			$scope.updateUser = function() {
				
				$scope.updateUserError = [];
				$scope.updateUserSuccess = false;
				
				var httpConfig = {
					method: 'PUT',
					data: $scope.user,
					url: APIconfigService.baseURL + 'User/' + $scope.user.userID + '?APIKey=' + APIconfigService.APIKey
				};
				
				$http(httpConfig).success(function(data) {
					console.log('updated ok');
					
					if ($scope.accountModel.activeAccount =! null) {
						accountService.login($scope.accountModel.activeAccount.accountID);
					} else {
						$scope.user = data;
						$scope.setRoles();
					}	

					$scope.updateUserSuccess = true;
					setTimeout(function () { $scope.updateUserSuccess = null; $scope.$apply(); }, 3000);   
				}).error(function(data, status, headers, config) {
					if (data.ModelState != null) {
						for(var propertyName in data.ModelState) {
							$scope.updateUserError.push(data.ModelState[propertyName][0])
						}
					} else {
						$scope.updateUserError.push('Ett okänt fel inträffade. Var god försök igen senare.');
					}
				});

			}
			
			$scope.applyUnit = function(unitID) {
				
				$scope.resetAccountErrors();

				angular.forEach($scope.user.accounts, function(account, accountkey) {
					if (account.unit.unitID == unitID) {
						$scope.newAccountError.push('Du har redan ett konto på denna enhet.');
						alert('Du har redan ett konto på denna enhet.')
					}
				});
				
				if ($scope.newAccountError.length>0)
					return;
				
				var accountModel = {
					unitID: unitID,
					userID: $scope.user.userID,
					statusID: 2,
					roleIDs: []
				}				
				
				var httpConfig = {
					method: 'POST',
					data: accountModel,
					url: APIconfigService.baseURL + 'Account/?APIKey=' + APIconfigService.APIKey
				};
				
				$http(httpConfig).success(function(data) {
				
					$scope.user = data;
					$scope.setRoles();
					$scope.newAccountSuccess = true; 
					
				}).error(function(data, status, headers, config) {
					if (data.ModelState != null) {
						for(var propertyName in data.ModelState) {
							$scope.newAccountError.push(data.ModelState[propertyName][0])
						}
					} else {
						$scope.newAccountError.push('Ett okänt fel inträffade. Var god försök igen senare.');
					}
				});

			}
			
			$scope.$on('newUser', function() {
				$scope.user = accountService.accountModel.user;
			});
			
        }]);