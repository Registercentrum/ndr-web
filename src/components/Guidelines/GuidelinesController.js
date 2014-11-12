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
            placeholder: 'Pick something'
            // maxItems: 1
        }

        

    }]);

