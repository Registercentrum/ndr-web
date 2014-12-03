angular.module('ndrApp')
    .controller('AppController', ['$scope', '$http', '$state', '$rootScope', 'dataService', function($scope, $http, $state, $rootScope, dataService) {


        $scope.data = dataService.data;


    }]);

