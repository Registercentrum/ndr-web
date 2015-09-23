angular.module('ndrApp')
    .controller('BankIDController', ['$scope', '$http', '$stateParams', '$state', 'accountService', function ($scope, $http, $stateParams, $state, accountService) {
    
            console.log('BankIDController: Init', accountService.accountModel.user);

            $scope.model = {
                orderRef : undefined,
                socialnumber : undefined,
                loginStarted : false
            };

            $scope.startLogin = function (){
                console.log("start login");

                var query = {
                    url: 'https://ndr.registercentrum.se/api/bid/ndr/order?socialnumber=' + $scope.model.socialnumber,
                    method: 'GET',
                    //data: {socialNumber: socialNumber}
                };

                $http(query)
                    .then(function (response) {
                        console.log("response", response);
                        $scope.model.orderRef = response.data.orderRef;

                        waitForLogin();

                        return response.data;

                    })
                    ['catch'](console.error.bind(console));

            };


            function waitForLogin(){

                $scope.model.loginStarted = true;

                var waitFor = setInterval(function (){

                    var query = {
                        url: 'https://ndr.registercentrum.se/api/bid/ndr/collect?orderRef=' + $scope.model.orderRef,
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
                },2000)
            }

            function login(){

                var query = {
                    url: 'https://ndr.registercentrum.se/api/CurrentUser',
                    method: 'GET',
                    //data: {socialNumber: socialNumber}
                };

                $http(query)
                    .then(function (response) {
                        console.log("response login", response);

                        $state.go('main.home', {}, {reload: true});

                    })
                    ['catch'](console.error.bind(console));
            }


            //{
             //orderRef: "6276d6ec-5b10-41de-822e-cef6eb7fc9bd"
             //}
        //https://ndr.registercentrum.se/api/bid/ndr/order?socialnumber={{personnummer}}

            //https://ndr.registercentrum.se/api/bid/ndr/collect?orderRef=07bea919-8a68-4a2e-90d7-641f51a9afe2

            //https://ndr.registercentrum/api/CurrentUser


        //$scope.accountModel   = accountService.accountModel;
            //$scope.accountHelpers = accountService.helpers;

        }]);