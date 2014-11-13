angular.module('ndrApp')
    .controller('AppController', ['$scope', '$http', '$state', '$rootScope', 'dataService', function($scope, $http, $state, $rootScope, dataService) {


        var data = dataService.data;
        $scope.units = data.units;


        dataService.getOne("unit", 150).then(function (data){
            console.log("got", data);
        })
        

    }]);

