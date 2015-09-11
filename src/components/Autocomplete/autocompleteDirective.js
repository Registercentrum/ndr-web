angular.module('ndrApp')
    .directive('autocomplete', ['$state', function ($state) {
            return {
                controller: function ($scope, $element) {

                    console.log("pp", $scope.model.options);

                    //var opts = _.where($scope.model.options, {type : 'county'})

                    $scope.config = {
                        options          : $scope.model.options,
                        items            : [$scope.model.selected],
                        optgroupField    : 'type',
                        valueField       : 'id',
                        labelField       : 'name',
                        searchField      : 'name',
                        sortField        : 'name',
                        delimiter        : '|',
                        placeholder      : 'Landsting, sjukhus eller vårdcentral',
                        maxItems         : 1,
                        maxOptions       : 2000,
                        lockOptgroupOrder: true,
                        optgroups        : [
                            {value: 'sweden', label: 'Riket'},
                            {value: 'county', label: 'Landsting'},
                            {value: 'unit', label: 'Vårdenheter'},
                        ],
                        render: {
                            optgroup_header: function (data, escape) {
                                return '<div class="optgroup-header">' + escape(data.label) + '</div>';
                            }
                        },
                        onChange : function (v) {
                            var type =  v.split('_')[0],
                                id   = v.split('_')[1];

                            if (type === 'county') $state.go('main.profiles.county', {id : id});
                            if (type === 'unit') $state.go('main.profiles.unit', {id: id});
                        }
                    };

                    $element.selectize($scope.config);
                },
                restrict : 'A',
                scope: {
                    model: '='
                }
            };
    }]);
