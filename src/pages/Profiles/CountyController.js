angular.module("ndrApp")
    .controller('CountyController',['$scope', '$stateParams', 'dataService', '$q', '$state', function($scope, $stateParams, dataService, $q, $state) {

        var id = parseFloat($stateParams.id);
        var autocompleteSelected = "county_" + id;

        $scope.model = {
            unitType : 1, //1 primär, 2 = medicin
            county: _.findWhere(dataService.data.counties, {code: id}),
            geo : _.findWhere(dataService.data.counties, {code: id}),
            id: id,
            data: {},
            diabetesType : 1,
			unitTypes: [
				{
					id: 1,
					name: 'Primärvårdsenhet'
				},
				{
					id: 2,
					name: 'Medicinklinik'
                },
				{
					id: 3,
					name: 'Barnklinik'
				}
			],
            autocompleteModel: {
                selected: autocompleteSelected,
                options: dataService.data.preparedGeoList
            }
        };

        $scope.gotoUnit = function (){
            $state.go('main.profiles.unit', {id: $scope.selectedUnit });
        }

        dataService.getOne("county", id).then(function (data){
          console.log('unit found', data);
            $scope.model.county = data;
            $scope.model.data.no = _.countBy($scope.model.county.units, 'typeID');
            $scope.model.data.noUnits = $scope.model.county.units.length;
        })


        $scope.$watch('model.unitType', function (){
            $scope.model.diabetesType = +$scope.model.unitType === 1 ? 0 : 1;
            updateKeyStats();
        })

        function updateKeyStats(){

			var date = new Date();

            // GET DATA FOR BAR CHART
            var query = dataService.queryFactory(
                {
                    unitType : $scope.model.unitType,
          					fromYear    : date.getFullYear()-1,
          					toYear    : date.getMonth() == 0 ? date.getFullYear()-1 : date.getFullYear(),
          					fromMonth   : date.getMonth()+1,
          					toMonth   : date.getMonth() == 0 ? 12 : date.getMonth(),
                    indicatorID: 101,

                }
            );
            dataService.getStats(query).then(function (data){

                var series = [];

                _.each(data.statSet, function(obj, key){

                    var o = {
                        name : obj.unit.name,
                        color : obj.unit.levelID != id ? "#D4D4D4" : "#FFCC01",
                        y : obj.stat.r,
                        cRep : obj.stat.cRep,
                    }

                    series.push(o)
                })

                $scope.model.data.hba1c = series;

            })

            // GET DATA FOR TREND CHART
            var queryTrendChart = dataService.queryFactory(
                {
                    unitType : $scope.model.unitType,
                    countyCode : id,
                    interval : "y",
                    fromYear: 2000,
                    toYear : new Date().getFullYear(),
                    //fromMonth : new Date().getMonth(),
                    //toMonth : new Date().getMonth(),
                    indicatorID: 101
                });



            dataService.getStats(queryTrendChart).then(function (data){
                var series = [];
                _.each(data.statSet[0].intervalSet, function(obj, key){
                    var o = {
                        // name : obj.unit.name,
                        // color : obj.unit.levelID != id ? "#D4D4D4" : "#F1AD0F",
                        x : new Date(obj.interval),
                        y : obj.stat.r,
                        cRep : obj.stat.cRep,
                    }
                    series.push(o);
                })
                $scope.model.data.trendhba1c = series;
            });

            // GET DATA FOR NUMBER OF PATIENTS
            var queryPatients = dataService.queryFactory(
                {
                    unitType : $scope.model.unitType,
                    countyCode : id,
                    //interval : "m",
          					fromYear    : date.getFullYear()-1,
          					toYear    : date.getMonth() == 0 ? date.getFullYear()-1 : date.getFullYear(),
          					fromMonth   : date.getMonth()+1,
          					toMonth   : date.getMonth() == 0 ? 12 : date.getMonth(),
                    indicatorID: 101
                });


            dataService.getStats(queryPatients).then(function (data){
                $scope.model.data.noPatients = data.statSet[0].stat.cRep;
            });
        }
    }]);
