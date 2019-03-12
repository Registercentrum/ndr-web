angular.module("ndrApp")
    .controller('PublicationController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        dataService.getOne("publication", $stateParams.id).then(function (data){

            $scope.isEnglish = !!$stateParams.english

            console.log('isEnglish',$scope.isEnglish);


            var authors = [
                data.firstAuthor,
                data.otherAuthor,
                data.lastAuthor
            ]

            $scope.publication = data;
            $scope.publication.authors = authors;

        })


    }]);





