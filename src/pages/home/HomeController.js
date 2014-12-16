angular.module("ndrApp")
    .controller('HomeController', ['$scope', 'dataService', function($scope, dataService) {


        $scope.model = {
            listModelNews : {},
            autocompleteModel : {
                selected : undefined,
            }
        }

        dataService.getList("news").then(function (data){
            data = data.splice(0,3);

            angular.forEach(data, function(item) {
                item.link = "/#/nyheter/" + item.newsID;
            });

            $scope.model.listModelNews = {
                data : data
            }

        })


        var preparedGeoList = dataService.data.preparedGeoList;

        $scope.myOptions = preparedGeoList;
        $scope.myModel = 11;

        $scope.config = {
            optgroupField : "type",

            valueField: 'id',
            labelField: 'name',
            searchField: 'name',
            sortField : 'name',

            delimiter: '|',
            placeholder: 'Landsting, sjukhus eller vårdcentral',
            maxItems: 1,
            optgroupOrder : [
                "county", "unit"
            ],
            optgroups: [
                {value: 'sweden', label: 'Riket'},
                {value: 'county', label: 'Landsting'},
                {value: 'unit', label: 'Vårdenheter'},
            ],
            render: {
                optgroup_header: function (data, escape) {
                    return '<div class="optgroup-header" style="font-weight: bold">' + escape(data.label) + '</div>';
                }
            }
        }



    }]);
