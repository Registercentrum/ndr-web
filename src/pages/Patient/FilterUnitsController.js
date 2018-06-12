'use strict';

angular.module('ndrApp')
    .controller('FilterUnitsController', ['$scope', 'dataService', function ($scope, dataService) {
        var units = [];

        $scope.filteredUnits = [];

        $scope.$watch('postalCode', function (postalCode) {
            if (!units.length) return;
            filterUnits(postalCode);
        });


        dataService.getUnits(function (data) {
            units = data.filter(function(u) {
                return u.postalCode;
            });
        });

        function filterUnits (postalCode) {
            var filtered = [];
            postalCode = postalCode.replace(/\s+/g, '');

            $scope.triedFuzzy = false;

            while (!filtered.length && postalCode.length) {
                if (!$scope.triedFuzzy || $scope.triedFuzzy && postalCode.length > 2) filtered = getFilteredUnits(postalCode);

                // If the list came up empty, try search with one less digit
                if (!filtered.length) {
                    postalCode = postalCode.slice(0, -1);

                    // Fuzzy search only for at least 3 digits
                    $scope.triedFuzzy = true;
                    $scope.fuzzySuccess = (postalCode.length > 2) ? true : false;
                }
            }

            $scope.filteredUnits = filtered;
        }


        function getFilteredUnits (postalCode) {
            return _.take(_.filter(units, function (unit) {
                return unit.postalCode.replace(/\s+/g, '').indexOf(postalCode) === 0;
            }), 10);
        }
    }]);
