angular.module("ndrApp")
    .controller('VariablesController',['$scope', '$stateParams', 'dataService', function($scope, $stateParams, dataService) {

        $scope.state = {
            metafields: [],
            filtered: [],
            fields: [ 
                { name: 'question', header: 'Fråga', type: String },
                { name: 'measureUnit', header: 'Enhet', type: String },
                { name: 'minValue', header: 'Min-värde', type: Number },
                { name: 'maxValue', header: 'Max-värde', type: Number },
                { name: 'isAdultcareExclusive', header: 'Vuxen-exklusiv', type: Boolean },
                { name: 'isChildcareExclusive', header: 'Barn-exklusiv', type: Boolean },
                { name: 'isCalculated', header: 'Beräknas', type: Boolean },
                { name: 'helpNote', header: 'Hjälptext', type: Number }
            ],
            meta: {
                registers: [
                    { id: 0, desc: 'Alla' },
                    { id: 1, desc: 'Vuxen' },
                    { id: 2, desc: 'Barn'}
                ]
            },
            query: {
                register: 0
            },
            sort: {
                field: null, //default sort set below
                asc: true
            }
        }

        $scope.state.sort.field = $scope.state.fields[0];



        console.log('hej', dataService);

        metafields = dataService.getValue('metafields');

        console.log();


        dataService.getMetaFields(null,null).then(function(data) {
            $scope.state.metafields = dataService.getValue('metafields');
            $scope.filter();
        })

        $scope.setQuery = function(key,val) {
            $scope.state.query[key] = val;
            $scope.filter();
        }

        $scope.displayVal = function(v,f) {
            switch(f.type) {
                case Boolean:
                    return v ? 'Ja' : ''
                default:
                    return v;
            } 
        }

        $scope.getSortVal = function(v,f) {
            switch(f.type) {
                case String:
                    return v === null ? '' : v.toString().toLowerCase();
                case Number:
                    return v === null ? -999999 : v
                default:
                    return v;
            } 
        }

        $scope.sort = function(f)
        {
            var sort = $scope.state.sort;
            
            sort.asc = sort.field.name === f.name ? !sort.asc : true;
            sort.field = f;
            $scope.filter();
        }

        $scope.filter = function() {

            var query = $scope.state.query
            var sort = $scope.state.sort;
            var fields = $scope.state.metafields;
            
            //filter
            fields = fields.filter(function(f) {
                if(query.register === 1)
                    return !f.isChildcareExclusive
                if(query.register === 2)
                    return !f.isAdultcareExclusive

                return true;
            });

            //and sort
            fields = fields.sort(function(a,b) {

                var x = $scope.getSortVal(a[sort.field.name],sort.field);
                var y = $scope.getSortVal(b[sort.field.name],sort.field);

                if (sort.asc) {
                    //if (x === null) return 0;
                    return (x>y ? 1 : (x<y ? -1 : null));
                }   
                else {
                    //if (x === null) return 0;
                    return (x<y ? 1 : (x>y ? -1 : null));
                }
                    
            });

            $scope.state.filtered = fields;
        }

    }]);

