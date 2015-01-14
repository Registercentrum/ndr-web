angular.module("ndrApp")
    .controller('ResearchItemController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {


        dataService.getOne("researchproject", $stateParams.id).then(function (data){

            //$scope.log('data: ', data);

            $scope.article = {
                title: data.name,
                createdAt: data.dateOfPublication,
                body: data.laymansDescription,
                author: data.firstAuthor + ', ' + data.otherAuthor + ', ' + data.lastAuthor
            };
        })



    }]);





