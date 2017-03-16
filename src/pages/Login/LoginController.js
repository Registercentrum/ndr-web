angular.module('ndrApp').controller('LoginController',
          ['$scope', '$http', '$stateParams', '$state', 'accountService', 'APIconfigService',
  function ($scope,   $http,   $stateParams,   $state,   accountService,   APIconfigService) {

    console.log('LoginController: Init', accountService.accountModel.user);

    $scope.model = {
      orderRef          : undefined,
      socialnumber      : undefined,
      PROMKey           : undefined,
      loginStarted      : false,
      loginFailed       : false,
      loginPROMKeyFailed: false,
      message           : null
    };

    $scope.startLogin = function (type) {
      console.log("start login");

      if (!$scope.model.socialnumber) return;

      $scope.model.loginStarted = true;
      $scope.model.loginFailed = false;

      var query = {
        url: APIconfigService.baseURL + 'bid/ndr/order' +
            '?socialnumber=' + $scope.model.socialnumber,
        method: 'GET'
      };

      $http(query)
        .then(function (response) {
          $scope.model.orderRef = response.data.orderRef;
          waitForLogin(type);
        })
        ['catch'](function (response) {
          $scope.model.loginStarted = false;
          $scope.model.loginFailed = true;
        });
    };

    $scope.loginPROMKey = function () {
      if (!$scope.model.PROMKey) return;

      $scope.model.loginFailed = false;
      $scope.model.loginPROMKeyFailedMessage = "";

      var query = {
        url: APIconfigService.baseURL + 'prom' +
            '?PROMKey=' + $scope.model.PROMKey +
            '&APIKey=' + APIconfigService.APIKey,
        method: 'GET',
      };

      $http(query)
      .then(function (response) {
        accountService.accountModel.PROMSubject = response.data;
        accountService.accountModel.PROMSubject.key = $scope.model.PROMKey;
        $state.go('main.subject.surveys');
      })
      ['catch'](function (response){
        var code = response.data ? response.data.code : null;
        if (code === 1) {
          $scope.model.loginPROMKeyFailedMessage = "Enkäten som redan lämnats in.";
        } else if (code === 2) {
          $scope.model.loginPROMKeyFailedMessage = "Enkäten är avslutad.";
        } else if (code === 3) {
          $scope.model.loginPROMKeyFailedMessage = "Enkäten har minskat.";
        }
        $scope.model.loginPROMKeyFailed = true;
      });
    }

    function waitForLogin (type) {
      var waitFor = setInterval(function () {
        var query = {
          url: APIconfigService.baseURL + 'bid/ndr/collect' +
              '?orderRef=' + $scope.model.orderRef,
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

      var query = {
        url: APIconfigService.baseURL + 'CurrentVisitor',
        method: 'GET'
      };

      $http(query)
        .then(function (response) {
          console.log("response login", response);
          if (type === "user") {
            if (response.data.isUser) {
              $scope.model.message = null;
              checkForLoggedIn();
              $state.go('main.account.home', {}, {reload: true});
            } else {
              $scope.model.loginStarted = false;
              $scope.model.message = 'Du är inte en användare i NDR.';
            }
          } else {
            if (response.data.isSubject) {
              $scope.model.message = null;
              accountService.accountModel.PROMSubject = null;
              checkForLoggedIn();
              $state.go('main.subject.home', {}, {reload: true});
            } else {
              $scope.model.loginStarted = false;
              $scope.model.message = 'Du är inte en användare i NDR.';
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
        var query = {
          url: APIconfigService.baseURL + 'CurrentVisitor',
          method: 'GET'
        };

        $http(query)
          .then(function (response) {
            console.log("Checking if still logged in:", response);

            if (response.data.isUser == false) {
              clearInterval(waitFor);
              accountService.logOut();
            }
          })
          ['catch'](console.error.bind(console));
      }, 200000);
    }
  }]);