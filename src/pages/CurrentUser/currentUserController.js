angular.module('ndrApp')
    .controller('CurrentUserController', ['$scope', '$http', '$stateParams', '$state', 'accountService', 'dataService', function ($scope, $http, $stateParams, $state, accountService, dataService) {
    
            console.log('CurrentUserController: Init', accountService.accountModel.user);
    
            $scope.accountModel   = accountService.accountModel;
            $scope.accountHelpers = accountService.helpers;
			$scope.filteredUnits = [];
			$scope.unitSearchString = '';
			$scope.user = accountService.accountModel.user;
			
			
			var server = {
				//baseURL: 'https://ndr.registercentrum.se',
				baseURL: 'https://w8-038.rcvg.local',
				APIKey: 'jEGPvHoP7G4eMkjLQwE5'
			}
			
			$scope.setRoles = function() {
				angular.forEach($scope.user.accounts, function(account, accountkey) {
					var rolestring = '';
					
					angular.forEach(account.roles, function(role, rolekey) {
						rolestring = rolestring == '' ? account.roles[rolekey].name : rolestring + ', ' + account.roles[rolekey].name;
					});
					
					$scope.user.accounts[accountkey].rolestring = rolestring;
				});
			}
			
			dataService.getList('units').then(function (data){

				var units = data.plain();
				$scope.filteredUnits = [];

				$scope.$watch('unitSearchString', function (){
					
					var s = $scope.unitSearchString.toLowerCase()
					
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
				
				var httpConfig = {
					method: 'PUT',
					data: $scope.user,
					url: server.baseURL + '/api/User/' + $scope.user.userID + '?AccountID=' + $scope.accountModel.activeAccount.accountID + '&APIKey=' + server.APIKey
				};
				
				$http(httpConfig).success(function(data) {
					$scope.user = data;
					$scope.setRoles();
					$scope.updatedUserOK = true; 
				}).error(function(data, status, headers, config) {
					if (data.ModelState != null) {
						for(var propertyName in data.ModelState) {
							$scope.serverSaveErrors.push(data.ModelState[propertyName][0])
						}
					} else {
						$scope.serverSaveErrors.push('Ett okänt fel inträffade. Var god försök igen senare.');
					}
				});

			}
			
			$scope.applyUnit = function(unitID) {
				
				
				angular.forEach($scope.user.accounts, function(account, accountkey) {
					if (account.unit.unitID == unitID) {
						alert('Du har redan ett konto på denna enhet.')
						return;
					}
				});
				
				var accountModel = {
					unitID: unitID,
					userID: $scope.user.userID,
					statusID: 2,
					roleIDs: []
				}				
				
				var httpConfig = {
					method: 'POST',
					data: accountModel,
					url: server.baseURL + '/api/Account/?AccountID=' + $scope.accountModel.activeAccount.accountID + '&APIKey=' + server.APIKey
				};
				
				$http(httpConfig).success(function(data) {
					$scope.user = data;
					$scope.setRoles();
					$scope.appliedUnitOK = true; 
				}).error(function(data, status, headers, config) {
					if (data.ModelState != null) {
						for(var propertyName in data.ModelState) {
							$scope.serverSaveErrors.push(data.ModelState[propertyName][0])
						}
					} else {
						$scope.serverSaveErrors.push('Ett okänt fel inträffade. Var god försök igen senare.');
					}
				});

			}
			

			$scope.setRoles();
			
			console.log($scope);
        }]);