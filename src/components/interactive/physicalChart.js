'use strict';

angular.module('ndrApp')
    .directive('physicalChart', [function () {
        return {
            scope: {
                model: '='
            },
            restrict: 'A',
            //templateUrl: 'wp-content/themes/diConcept/components/KeyStats/keyStatBar.html',
            link: function($scope, iElm, iAttrs, controller) {

                $scope.$watch('model', render, true);

                function render (model) {
                    var data = {}, maxValue = 0, minValue;

                    if (!model) return;

                    console.log('Physical Stat Bar Chart render', $scope.model);


                    var domainValues = [
                        {
                            text: "Aldrig ",
                            code: 1,
                            XMLText: "Aldrig",
                            isActive: true
                        },
                        {
                            text: "<1 ggr/vecka",
                            code: 2,
                            XMLText: "Oregelbundet",
                            isActive: true
                        },
                        {
                            text: "Regelbundet 1-2 ggr/vecka",
                            code: 3,
                            XMLText: "Regelbundet1",
                            isActive: true
                        },
                        {
                            text: "Regelbundet 3-5 ggr/vecka",
                            code: 4,
                            XMLText: "Regelbundet2",
                            isActive: true
                        },
                        {
                            text: "Dagligen",
                            code: 5,
                            XMLText: "Dagligen",
                            isActive: true
                        }
                    ]


                    // Draw the "chart"
                    _.each(domainValues, function (d, key) {

                        if($scope.model.value >=  d.code  ) {

                            iElm.find('#_' + d.code)
                                .css('background-color', "#74BAD8")
                            /*.toggleClass('lowest', d === minValue)
                             .find('span')
                             .text(d3.round(d, 1) + '%');*/
                        }

                    });
                }
            }
        };
    }])




