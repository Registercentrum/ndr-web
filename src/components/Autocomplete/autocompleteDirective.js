angular.module('ndrApp')
    .directive('autocomplete', ['dataService', function(dataService) {

        function link(scope, element, attrs) {

        }

        return {

            controller : function ($scope, $element){

                var preparedGeoList = dataService.data.preparedGeoList;


                $scope.myOptions = preparedGeoList;
                $scope.myModel = undefined;
                
                $scope.$watch('myModel', function (){
                   //  console.log("Changed",  $scope.myModel);
                })

                $scope.class =  "Autocomplete--bare";

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
            template : '<div class="Autocomplete" ng-class=\"class\" selectize="config" options="myOptions" ng-model="myModel"></div>',
            link: link,

            scope: {
                model: "=",
                type: "="
            }
        }

    }]);
