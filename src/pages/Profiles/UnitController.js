angular.module("ndrApp")
    .controller('UnitController',['$scope', '$stateParams', 'dataService', '$q', function($scope, $stateParams, dataService, $q) {

        var id = parseFloat($stateParams.id);
        var autocompleteSelected = "unit_" + id;


        $scope.model = {
            unit: _.findWhere(dataService.data.units, {unitID: id}),
            geo : _.findWhere(dataService.data.units, {unitID: id}),
            id: id,
            data: {},
            autocompleteModel: {
                selected: autocompleteSelected
            }
        }

        dataService.getOne("unit", id).then(function (data){
            console.log("dd", data);
            $scope.model.unit = data;
        })



        // GET DATA FOR TREND CHART
        var query = dataService.queryFactory({unitID : id, level : 2, interval : "y", fromYear: 2000, toYear : 2014, indicatorID: 101});
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





