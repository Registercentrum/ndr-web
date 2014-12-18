angular.module('ndrApp')
    .directive('autocomplete', ['dataService', "$state", function(dataService, $state) {

        function link(scope, element, attrs) {

        }

        return {

            controller : function ($scope, $element){

                var preparedGeoList = dataService.data.preparedGeoList;

                $scope.model = $scope.model || {}

                $scope.options = preparedGeoList;
                $scope.selected = $scope.model.selected || undefined;
                
                $scope.$watch('selected', function (newVal, oldVal){
                    console.log("Changed Autocomplete:",  $scope.selected);

                    if(newVal == oldVal) return false;

                    var type =  $scope.selected.split("_")[0];
                    var id = $scope.selected.split("_")[1];

                    if(type == "county"){
                        $state.go("main.profiles.county", {id : id})
                    }

                    if(type == "unit"){
                        $state.go("main.profiles.unit", {id : id})
                    }

                })

               // $scope.class =  "Autocomplete--bare";

                $scope.config = {

                    valueField: 'id',
                    labelField: 'name',
                    searchField: 'name',
                    sortField : 'name',

                    delimiter: '|',
                    placeholder: 'Landsting, sjukhus eller vårdcentral',
                    maxItems: 1,

                    optgroupField : "type",
                    optgroups: [
                        {value: 'sweden', label: 'Riket'},
                        {value: 'county', label: 'Landsting'},
                        {value: 'unit', label: 'Vårdenheter'},
                    ],
                    optgroupOrder : [
                        "county", "unit"
                    ],

                    render: {
                        optgroup_header: function (data, escape) {
                            return '<div class="optgroup-header" style="font-weight: bold">' + escape(data.label) + '</div>';
                        }
                    }
                }

            },

            restrict : 'A',
            template : '<div ng-class=\"class\" selectize="config" options="options" ng-model="selected"></div>',
            link: link,

            scope: {
                model: "="
            }
        }

    }]);
