angular.module("ndrApp")
    .controller('CountyController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        var id = $stateParams.id;

        $scope.model = {
            id : id,
            autocompleteList : autocompleteList,
            data : {}
        }


        dataService.getOne("county", id).then(function (data){
            $scope.model.county = data;
        })


        var query = queryFactory();
        dataService.getStats(query).then(function (data){

            var series = [];

            _.each(data.statSet, function(obj, key){

                var o = {
                    name : obj.unit.name,
                    //color : "#B4BCBE",
                    y : obj.stat.r
                }

                series.push(o)
            })

            console.log("s", series);
            $scope.model.data.hba1c = series;
        })



        var autocompleteList = [
            {id: 1, title: 'Spectrometer'},
            {id: 2, title: 'Star Chart'},
            {id: 3, title: 'Laser Pointer'}
        ];



        $scope.config = {
            valueField: 'id',
            labelField: 'title',
            delimiter: '|',
           // maxItems: 1,
            placeholder: 'Välj'
            // maxItems: 1
        }


        function queryFactory(){


            return {

                    level: 1,
                    countyCode: 0,
                    unitID: 0,
                    indicatorID: 101,
                    fromYear: 2013,
                    fromQuartal: 0,
                    fromMonth: 0,
                    toYear: 2013,
                    toQuartal: 0,
                    toMonth: 0,
                    diabetesTypeCode: 1,
                    sex: 0,
                    unitTypeID: 0,
                    fromAge: 0,
                    toAge: 0,
                    interval: null,
                    recalculate: false,
                    outdatedDays: 14
            };
        }






    }]);





