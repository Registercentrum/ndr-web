angular.module('ndrApp')
    .controller('AppController', ['$scope', '$http', '$state', '$rootScope', 'dataService', 'accountService', '$anchorScroll', function($scope, $http, $state, $rootScope, dataService, accountService, $anchorScroll) {


        accountService.bootstrap();


    }]);

