'use strict';

angular.module('ndrApp')
    .controller('FilterUnitsController', ['$scope', 'dataService', function ($scope, dataService) {
        var units = [];

        $scope.filteredUnits = [];

        $scope.$watch('postalCode', function (postalCode) {
            if (!units.length) return;
            $scope.filteredUnits = getFilteredUnits(postalCode);
        });

        dataService.getUnits(function (data) {
            console.log('Units', data);
            units = data;
        });


        function getFilteredUnits (postalCode) {
            var filtered = [];
            postalCode = postalCode.replace(/\s+/g, '');

            $scope.fuzzySearch = false;

            while (!filtered.length && postalCode.length > 1) {
                filtered = _.take(_.filter(units, function (unit) {
                    return unit.postalCode.replace(/\s+/g, '').indexOf(postalCode) === 0;
                }), 10);

                if (!filtered.length && postalCode.length > 3) {
                    $scope.fuzzySearch = true;
                    postalCode = postalCode.slice(0, -1);
                }
            }

            return filtered;
        }
    }]);
