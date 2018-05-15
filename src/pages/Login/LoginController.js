angular.module('ndrApp').controller('LoginController',
          ['$scope', '$http', '$stateParams', '$state', 'accountService', 'APIconfigService', '$modal', 'cookieFactory',
  function ($scope,   $http,   $stateParams,   $state,   accountService,   APIconfigService,   $modal,   cookieFactory) {
    
    var modalInstance = null;

    $scope.model = {
      accountModel      : accountService.accountModel,
      orderRef          : undefined,
      socialnumber      : undefined,
      PROMKey           : undefined,
      loginStarted      : false,
      loginFailed       : false,
      loginPROMKeyFailed: false,
      message           : null,
      selectedAccountID : null,
    };

    $scope.startLogin = function (type) {

      if (!$scope.model.socialnumber) return;

      $scope.model.loginStarted = true;
      $scope.model.loginFailed = false;

      var url = APIconfigService.baseURL + 'bid/ndr/order' +
            '?socialnumber=' + $scope.model.socialnumber

      var query = {
        url:  APIconfigService.constructUrl(url),
        method: 'GET'
      };

      $http(query)
        .then(function (response) {
          $scope.model.orderRef = response.data.orderRef;
          waitForLogin(type);
        })
        ['catch'](function (response) {

          try { //personnummer kan ej valideras
            if (response.data.ModelState.socialNumber) {
              $scope.model.message = response.data.ModelState.socialNumber[0];
            } 
          }
          catch(err) {}

          try { //personen är ej 18 år
            if (response.statusText) {
              $scope.model.message = response.statusText;
            } 
          }
          catch(err) {}

          console.log(response);

          $scope.model.loginFailed = true;

          $scope.model.loginStarted = false;
        });
    };

    $scope.loginPROMKey = function () {
      if (!$scope.model.PROMKey) return;

      accountService.accountModel.chosenUserType = 'subject';

      $scope.model.loginFailed = false;
      $scope.model.loginPROMKeyFailedMessage = "";

      var url = APIconfigService.baseURL + 'prom' +
            '?PROMKey=' + $scope.model.PROMKey +
            '&APIKey=' + APIconfigService.APIKey;

      var query = {
        url: APIconfigService.constructUrl(url),
        method: 'GET',
      };

      $http(query)
      .then(function (response) {
        accountService.accountModel.isPROMSubject = true;
        accountService.accountModel.PROMSubject = response.data;
        accountService.accountModel.PROMSubject.key = $scope.model.PROMKey;
        $state.go('main.subject.surveys.survey');
      })
      ['catch'](function (response){
        var code = response.data ? response.data.code : null;
        if (code === 1) {
          $scope.model.loginPROMKeyFailedMessage = "Enkäten har redan lämnats in.";
        } else if (code === 2) {
          $scope.model.loginPROMKeyFailedMessage = "Enkäten är avslutad.";
        } else if (code === 3) {
          $scope.model.loginPROMKeyFailedMessage = "Enkäten har minskat.";
        }
        $scope.model.loginPROMKeyFailed = true;
      });
    };

    // for users with multiple accounts show a modal
    // to choose one unit and redirect to "main.account.home"
    $scope.selectAccount = function() {
      var accountID = $scope.model.selectedAccountID;
      var activeAccount;

      if (accountID) {
        activeAccount = _.find(
          accountService.accountModel.user.activeAccounts,
          { accountID : accountID }
        );
        accountService.accountModel.activeAccount = activeAccount;
        accountService.accountModel.tempAccount   = activeAccount;
				
        cookieFactory.create("ACTIVEACCOUNT", accountID);
		
        if (modalInstance) modalInstance.dismiss("cancel");
        $state.go("main.account.home");
      }
    };


    function waitForLogin (type) {

      var waitFor = setInterval(function () {
        var url = APIconfigService.baseURL + 'bid/ndr/collect' +
              '?orderRef=' + $scope.model.orderRef;
        var query = {
          url: APIconfigService.constructUrl(url),
          method: 'GET',
        };

        $http(query)
          .then(function (response) {
            console.log("response wait", response);

            if (response.status === 200) {
              clearInterval(waitFor);
              login(type);
            }
          })
          ['catch'](function (response) {
            console.log("failed");
            clearInterval(waitFor);
            $scope.model.loginStarted = false;
            $scope.model.loginFailed = true;
          });
      }, 2000);
    }

    function login (type) {
      var url = APIconfigService.baseURL + 'CurrentVisitor';
      var query = {
        url: APIconfigService.constructUrl(url),
        method: 'GET'
      };

      $http(query)
        .then(function (response) {

          var user = response.data.user;
          accountService.accountModel.chosenUserType = type;

          // user login
          if (type === "user") {
            if (response.data.isUser) {
              $scope.model.message = null;
              checkForLoggedIn();

              accountService.accountModel.user = user

              // check for active accounts, if there's only one set it as active
              // and redirect to main.account.home, if there are more, show modal
              // to choose one and then set it and redirect
              user.activeAccounts = _.filter(user.accounts, function (account) {
                  return account.status.id === 1;
              });


              if (!accountService.accountModel.activeAccount && user.activeAccounts.length === 1) {
                accountService.accountModel.activeAccount = user.activeAccounts[0];


                // console.log("test2", $scope.model.selectedAccountID)
                // var accountID = $scope.model.selectedAccountID;
                // cookieFactory.create("ACTIVEACCOUNT", accountID, 7);


                $state.go('main.account.home');
              } else if (cookieFactory.read("ACTIVEACCOUNT")) {
                accountService.accountModel.activeAccount = _.find(user.activeAccounts,function (a) {
                  return a.accountID === +cookieFactory.read("ACTIVEACCOUNT");
                });
                $state.go('main.account.home');
              } else {
                modalInstance = $modal.open({
                  templateUrl: "unitModalTmpl",
                  backdrop   : true,
                  scope      : $scope,
                });
              }
            } else {
              $scope.model.loginStarted = false;
              $scope.model.message = 'Du är inte en användare i NDR.';
            }

          // subject login
          } else {
            if (response.data.isSubject) {

              accountService.accountModel.chosenUserType = 'subject';

              $scope.model.message = null;
              accountService.accountModel.PROMSubject = null;
              checkForLoggedIn();
              console.log("GOING TO SUBJECT HOME")
              $state.go('main.subject.home');
            } else {
              $scope.model.loginStarted = false;
              $scope.model.message = 'Det finns ingen information om dig i Nationella Diabetesregistret. Vänligen kontakta din vårdcentral för mer information.';
            }

          }
      })
      ['catch'](function (response) {
        console.log("failed");
        $scope.model.loginStarted = false;
        $scope.model.loginFailed = true;
      });
    }

    function checkForLoggedIn () {
      var waitFor = setInterval(function () {
        var url = APIconfigService.baseURL + 'CurrentVisitor';
        var query = {
          url: APIconfigService.constructUrl(url),
          method: 'GET'
        };

        $http(query)
          .then(function (response) {
            console.log("Checking if still logged in:", response);

            if (!response.data.isUser && !response.data.isSubject) {
              clearInterval(waitFor);
              accountService.logOut();
            }
          })
          ['catch'](console.error.bind(console));
      }, 1200000);
    }

    if($stateParams.direct){
      login("user");
    }



  }]);
