'use strict';

angular.module('ndrApp')
    .controller('HomeController', ['$scope', 'dataService', 'accountService', function($scope, dataService, accountService) {

        $scope.model = {
            listModelNews : {},
            autocompleteModel : {
                selected : undefined,
                options: dataService.data.preparedGeoList
            },
            stats : {}
        };

        $scope.accountModel = accountService.accountModel;

        $scope.selectedAccountID = accountService.accountModel.activeAccount != null ?
                                   accountService.accountModel.activeAccount.accountID :
                                   null;

        $scope.AccountIsSelected = function() {
            if ($scope.selectedAccountID > 0) {
                accountService.updateAccount($scope.selectedAccountID);
            }
        };

        var date = new Date();

        /* Get data for stats */
        var query_smoking = dataService.queryFactory(
            {
                ID : [202],
                level : 0,
                fromYear    : date.getFullYear()-1,
                toYear    : date.getMonth() == 0 ? date.getFullYear()-1 : date.getFullYear(),
                fromMonth   : date.getMonth()+1,
                toMonth   : date.getMonth() == 0 ? 12 : date.getMonth()
            }
        );

        var query_hba1c_70 = dataService.queryFactory(
            {
                ID : [221],
                level : 0,
                diabetesType : 1,
                fromYear    : date.getFullYear()-1,
                toYear    : date.getMonth() == 0 ? date.getFullYear()-1 : date.getFullYear(),
                fromMonth   : date.getMonth()+1,
                toMonth   : date.getMonth() == 0 ? 12 : date.getMonth()
            }
        );

        var query_hba1c_rep = dataService.queryFactory(
            {
                ID : [221],
                level : 0,
                fromYear    : date.getFullYear()-1,
                toYear    : date.getMonth() == 0 ? date.getFullYear()-1 : date.getFullYear(),
                fromMonth   : date.getMonth()+1,
                toMonth   : date.getMonth() == 0 ? 12 : date.getMonth()
            }
        );

        dataService.getStats(query_smoking).then(function (data){
            $scope.model.stats.smoking = data;
        })

        dataService.getStats(query_hba1c_70).then(function (data){
            $scope.model.stats.hba1c_70 = data;
        })

        dataService.getStats(query_hba1c_rep).then(function (data){
            $scope.model.stats.hba1c_rep = data;
        })
		
        dataService.getList("news").then(function (data){

            data = data.splice(0,4);

            angular.forEach(data, function(item) {
                item.link = "#/nyheter/" + item.newsID;
                item.categoryNames = [];
                angular.forEach(item.categories, function(category){
                    item.categoryNames.push(category.name);
                });
            });

            $scope.model.listModelNews = {
                data : data
            }

            setTimeout(function (){
                jQuery('.Intro--equalHeights').matchHeight(true);
            },100);

        })

    }]);
