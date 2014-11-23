angular.module('ndrApp')
    .controller('AppController', ['$scope', '$http', '$state', '$rootScope', 'dataService', function($scope, $http, $state, $rootScope, dataService) {


        $scope.data = dataService.data;



        dataService.getOne("unit", 150).then(function (data){
            console.log("got", data);
        })






    }]);

