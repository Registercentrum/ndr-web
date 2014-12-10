angular.module("ndrApp")
    .controller('NewsItemController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        $scope.model = {};

        dataService.getOne("news", $stateParams.id).then(function (data){
            $scope.article = data;
        })

        dataService.getList("news").then(function (data){
            data = data.splice(0,3);

            angular.forEach(data, function(item) {
                item.link = '/#/nyheter/' + item.newsID;
            });
            
            $scope.model.listModelNews = {
                data : data
            }
        })

    }]);
