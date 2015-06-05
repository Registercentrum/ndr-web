angular.module("ndrApp")
    .controller('CountyController',['$scope', '$stateParams', 'dataService', '$q', '$state', function($scope, $stateParams, dataService, $q, $state) {

        var id = parseFloat($stateParams.id);
        var autocompleteSelected = "county_" + id;


        $scope.model = {
            county: _.findWhere(dataService.data.counties, {code: id}),
            geo : _.findWhere(dataService.data.counties, {code: id}),
            id: id,
            data: {},
            autocompleteModel: {
                selected: autocompleteSelected,
                options: dataService.data.preparedGeoList
            }
        };

        $scope.gotoUnit = function (){
            $state.go('main.profiles.unit', {id: $scope.selectedUnit });
        }

        dataService.getOne("county", id).then(function (data){
            $scope.model.county = data;

            $scope.model.data.no = _.countBy($scope.model.county.units, 'typeID');
            $scope.model.data.noUnits = $scope.model.county.units.length;
        })

        // GET DATA FOR BAR CHART
        var query = dataService.queryFactory({fromYear: 2013, toYear : 2014, indicatorID: 101});
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
        var query = dataService.queryFactory({countyCode : id, interval : "y", fromYear: 2000, toYear : 2014, indicatorID: 101});
        dataService.getStats(query).then(function (data){

            var series = [];

            _.each(data.statSet[0].intervalSet, function(obj, key){

                console.log(obj);

                var o = {
                   // name : obj.unit.name,
                   // color : obj.unit.levelID != id ? "#D4D4D4" : "#F1AD0F",
                    x : new Date(obj.interval),
                    y : obj.stat.r,
                    cRep : obj.stat.cRep,
                }

                series.push(o)
            })

            $scope.model.data.noPatients = _.last(series).cRep;
            $scope.model.data.trendhba1c = series;
        })





    }]);





