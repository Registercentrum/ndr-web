angular.module("ndrApp")
    .controller('ResearchItemController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {


        dataService.getOne("researchproject", $stateParams.id).then(function (data){

            console.log('data: ', data);
            $scope.publications = data;
        })



    }]);





