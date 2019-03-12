angular.module("ndrApp")
    .controller('ResearchEnglishController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        $scope.model = {};

		// Return only publications with dates
        dataService.getAny("publication", "?hasDate=true").then(function (data){
            console.log(data);
            angular.forEach(data, function(item) {
                item.link = '#/forskning/' + item.id;
                item.title = item.name;
            });

            $scope.publications = data;

        })

    }]);





