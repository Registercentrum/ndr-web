angular.module("ndrApp")
    .controller('PublicationController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        dataService.getOne("researchproject", $stateParams.id).then(function (data){

            var authors = [
                data.firstAuthor,
                data.otherAuthor,
                data.lastAuthor
            ]

            $scope.publication = data;
            $scope.publication.authors = authors;

        })


    }]);





