angular.module('ndrApp').controller('BankIDController',
            ['$scope', '$http', '$stateParams', '$state', 'accountService', 'APIconfigService',
    function ($scope,   $http,   $stateParams,   $state,   accountService,   APIconfigService) {

        console.log('BankIDController: Init', accountService.accountModel.user);

        $scope.model = {
            orderRef : undefined,
            socialnumber : undefined,
            PROMKey: undefined,
            loginStarted : false,
            loginFailed : false,
            loginPROMKeyFailed : false,
            message: null
        };

        $scope.startLogin = function (){
            console.log("start login");

            if (!$scope.model.socialnumber) return;

            $scope.model.loginStarted = true;
            $scope.model.loginFailed = false;

            var query = {
                url: APIconfigService.baseURL + 'bid/ndr/order?socialnumber=' + $scope.model.socialnumber +
                    '&SESSIONID=ee28dcf9-02db-4d0b-a7cf-c06050e8bc57',
                method: 'GET'
            };

            $http(query)
                .then(function (response) {
                    console.log("response", response);
                    $scope.model.orderRef = response.data.orderRef;

                    waitForLogin();

                    return response.data;

                })
                ['catch'](function (response){
                    console.log("failed");
                    $scope.model.loginStarted = false;
                    $scope.model.loginFailed = true;
                });
        };

        $scope.loginPROMKey = function () {
            if (!$scope.model.PROMKey) return;

            $scope.model.loginFailed = false;

            var query = {
                url: APIconfigService.baseURL + 'prom?PROMKey=' + $scope.model.PROMKey +
                    '&APIKey=' + APIconfigService.APIKey +
                    '&SESSIONID=ee28dcf9-02db-4d0b-a7cf-c06050e8bc57',
                method: 'GET',
            };

            $http(query)
                .then(function (response) {
                    console.log(response);
                })
                ['catch'](function (response){
                    $scope.model.loginPROMKeyFailed = true;
                });
        }


        function waitForLogin(){


            var waitFor = setInterval(function (){

                var query = {
                    url: APIconfigService.baseURL + 'bid/ndr/collect?orderRef=' + $scope.model.orderRef,
                    method: 'GET',
                    //data: {socialNumber: socialNumber}
                };

                $http(query)
                    .then(function (response) {
                        console.log("response wait", response);
                        //$scope.model.orderRef = response.data.orderRef;
                        if(response.status === 200){
                            clearInterval(waitFor);
                            login();
                        }
                        //return response.data;
                    })
                    ['catch'](console.error.bind(console));
            },2000);
        }

        function login(){

            var query = {
                url: APIconfigService.baseURL + 'CurrentVisitor?SESSIONID=ee28dcf9-02db-4d0b-a7cf-c06050e8bc57',
                method: 'GET',
                //data: {socialNumber: socialNumber}
            };

            $http(query)
                .then(function (response) {
                    console.log("response login", response);

                    if (response.data.isUser){
                        $scope.model.message = null;
                        checkForLoggedIn();
                        $state.go('main.account.home', {}, {reload: true});
                    } else {
                        $scope.model.loginStarted = false;
                        $scope.model.message = 'Du är inte en användare i NDR.';
                    }

                })
                ['catch'](console.error.bind(console));
        }

        function checkForLoggedIn(){

            var waitFor = setInterval(function () {

                var query = {
                    url: APIconfigService.baseURL + 'CurrentVisitor',
                    method: 'GET',
                    //data: {socialNumber: socialNumber}
                };

                $http(query)
                    .then(function (response) {
                        console.log("Checking if still logged in:", response);

                        if(response.data.isUser == false){
                            clearInterval(waitFor);
                            accountService.logOut();
                        }
                    })
                    ['catch'](console.error.bind(console));

            }, 200000); //900000); //every 15 minutes
         }


}]);