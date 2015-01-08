angular.module('ndrApp')
    .controller('GuidelinesController', ['$scope', function($scope) {

        $scope.myModel = 1;

        $scope.myOptions = [
            {id: 1, title: 'Spectrometer'},
            {id: 2, title: 'Star Chart'},
            {id: 3, title: 'Laser Pointer'}
        ];

        $scope.config = {
            create: true,
            valueField: 'id',
            labelField: 'title',
            delimiter: '|',
            maxItems : 1,
            placeholder: 'Pick something'
            // maxItems: 1
        }


        /*
        * DATE STUFF
        * */
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        // Disable weekend selection
        $scope.disabled = function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };

        $scope.toggleMin = function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

       /* $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };*/

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];
        /*
        * END DATE STUFF
        * */



    }]);

