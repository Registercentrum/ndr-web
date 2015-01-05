angular.module("ndrApp")
    .controller('ResearchController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        $scope.model = {};

        dataService.getList("researchproject").then(function (data){
            console.log(data);
            angular.forEach(data, function(item) {
                item.link = '#/forskning/' + item.id;
                item.title = item.name;
            });


            $scope.publications = data;

            var sidebarData = data.splice(0,3);

            $scope.model.listModelResearch = {
                data : sidebarData
            }
        })





    }]);





