angular.module('ndrApp')
    .directive('autocomplete', ['dataService', "$state", function(dataService, $state) {

        function link(scope, element, attrs) {

        }

        return {

            controller : function ($scope, $element){

                var preparedGeoList = dataService.data.preparedGeoList;

                $scope.config = {

                    options : preparedGeoList,

                    optgroupField : "type",

                    valueField: 'id',
                    labelField: 'name',
                    searchField: 'name',
                    sortField : 'name',

                    delimiter: '|',
                    placeholder: 'Landsting, sjukhus eller vårdcentral',
                    maxItems: 1,
                    lockOptgroupOrder: true,
                    optgroups: [
                        {value: 'sweden', label: 'Riket'},
                        {value: 'county', label: 'Landsting'},
                        {value: 'unit', label: 'Vårdenheter'},
                    ],
                    render: {
                        optgroup_header: function (data, escape) {
                            return '<div class="optgroup-header" style="font-weight: bold">' + escape(data.label) + '</div>';
                        }
                    },

                    items: [$scope.model.selected],

                    onChange : function (v){

                        var type =  v.split("_")[0];
                        var id = v.split("_")[1];

                        if(type == "county"){
                            $state.go("main.profiles.county", {id : id})
                        }

                        if(type == "unit") {
                            $state.go("main.profiles.unit", {id: id})
                        }
                    }

                }

                $($element).selectize($scope.config);


            },

            restrict : 'A',
            //template : '<div ng-class=\"class\" selectize="config" options="options" ng-model="selected"></div>',
            link: link,

            scope: {
                model: "="
            }
        }

    }]);
