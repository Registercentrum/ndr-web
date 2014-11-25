angular.module("ndrApp")
    .controller('ResearchController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {


        dataService.getList("researchproject").then(function (data){
            $scope.publications = data;
        })



    }]);





