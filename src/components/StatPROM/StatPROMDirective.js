'use strict';

angular.module('ndrApp')
    .directive('statProm', ['$q', 'dataService', '$state', function($q, dataService, $state) {

        function link(scope) {
            
            scope.state = {
                unit: scope.activeAccount.unit,
                formData: {
                    dt: 1,
                    sex: 0
                },
                dtTypes: [
                    { id: 1, name: 'Typ 1' },
                    { id: 2, name: 'Typ 2' }
                ],
                sex: [
                    { id: 0, name: 'Alla' },
                    { id: 1, name: 'Män' },
                    { id: 2, name: 'Kvinnor' }
                ],
                statData: null,
                helpText: "Om enkäter skickades ut nyligen är det rimligt att dessa ännu inte blivit besvarade"
            };
            scope.setCalculated = function() {
                var diffStep = 5;

                for(var d in scope.state.statData.dimStat['3']) {
                    var unitOutcome = scope.state.statData.dimStat[3][d].outcome;
                    var sweOutcome = scope.state.statData.dimStat[1][d].outcome;

                    var diff = parseFloat((unitOutcome - sweOutcome).toFixed(1));
                    var diffClass;

                    switch(true) {
                        case (diff<(-1*diffStep)):
                            diffClass = 1;
                            break;
                        case (diff>(1*diffStep)):
                            diffClass = 4;
                            break;
                        case (diff<0):
                            diffClass = 2;
                            break;
                        case (diff>0):
                            diffClass = 3;
                            break;
                        default:
                            diffClass = 0;
                    }

                    scope.state.statData.dimStat[3][d].diffClass = diffClass;
                    scope.state.statData.dimStat[3][d].diff = diff;
                }
            }
            scope.formatOutcome = function(v, decimals, suffix) {       
                
                try {
                    if (!v)
                    return '-'

                    return v.toFixed(decimals).replace('.',',') + (suffix ? suffix : '');   
                } catch(e) {
                    return '-'
                }

            }   
            scope.setDTType = function(id) {
                this.state.formData.dt = id;
                scope.fetchStat();
            }
            scope.setSex = function(id) {
                this.state.formData.sex = id;
                scope.fetchStat();
            }
            scope.fetchStat = function() {
                dataService.getPROMStatistics(scope.activeAccount.accountID, scope.state.formData).then(function(data) {

                    console.log('data',data);

                    scope.state.statData = data;
                    
                    //does unit have data
                    if (scope.state.statData.dimStat[3][1]) {
                        scope.setCalculated();
                    }
                    scope.$apply();
                });
            }

            if (scope.activeAccount.unit.isUsingPROM)
                scope.fetchStat();

        }
        return {
            restrict: 'A',
            templateUrl: 'src/components/StatPROM/StatPROM.html',
            link: link,
            scope: {
                activeAccount: '=',
            }
        };
    }]);