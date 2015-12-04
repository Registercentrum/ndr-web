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
		console.log(accountService.accountModel);
		
		$scope.selectedAccountID = accountService.accountModel.activeAccount != null ? accountService.accountModel.activeAccount.accountID : null;
		
		$scope.AccountIsSelected = function() {
			if ($scope.selectedAccountID>0) {
				console.log('user selects account');
				accountService.updateAccount($scope.selectedAccountID);
			}
		};
		
		/* Get data for stats */
        var query_smoking = dataService.queryFactory(
            {
                ID : [202],
                level : 0,
                fromYear    : new Date().getFullYear()-1,
                toYear    : new Date().getFullYear(),
                fromMonth   : new Date().getMonth()+1,
                toMonth   : new Date().getMonth()
            }
        );

        var query_hba1c_70 = dataService.queryFactory(
            {
                ID : [221],
                level : 0,
                diabetesType : 1,
                fromYear    : new Date().getFullYear()-1,
                toYear    : new Date().getFullYear(),
                fromMonth   : new Date().getMonth()+1,
                toMonth   : new Date().getMonth()
            }
        );

        var query_hba1c_rep = dataService.queryFactory(
            {
                ID : [221],
                level : 0,
                fromYear    : new Date().getFullYear()-1,
                toYear    : new Date().getFullYear(),
                fromMonth   : new Date().getMonth()+1,
                toMonth   : new Date().getMonth()
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

            //data.sort(function (a,b){
            //    return new Date(a.publishedFrom) - new Date(a.publishedFrom);
            //})

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
