'use strict';

angular.module('ndrApp')
    .directive('statReporting', ['$q', 'dataService', '$state', 'commonService', function($q, dataService, $state, commonService) {

        function link(scope) {

            var localModel = {
                reportList: [],
                reportSort: {
                    level: 3,
                    desc: true
                },
                unitType: scope.model.activeAccount.unit.typeID,
                excludes: ['yearOfOnset', 'smokingEndYear', 'snuffingEndYear', 'cgmType', 'contactDate', 'pumpOngoingSerial', 'diabetesType', 'pumpIndication', 'pumpClosureReason']
            };

            scope.model = jQuery.extend(scope.model, localModel);

            scope.sortRepList = function(list, sort) {
                //Riket = 1, County=2, Unit=3
                var sortField;

                switch (sort.level) {
                    case 1:
                        sortField = 'sweShare';
                        break;
                    case 2:
                        sortField = 'countyShare';
                        break;
                    case 3:
                        sortField = 'unitShare';
                        break;
                    default:
                        sortField = 'question';
                        break;
                }

                var getSortFunction = function(level, sortField) {

                    if (level)
                        return function(a, b) {
                            return sort.desc ? a[sortField].value - b[sortField].value : b[sortField].value - a[sortField].value;
                        };
                    else
                        return function(a, b) {
                            return sort.desc ? a[sortField].localeCompare(b[sortField]) : b[sortField].localeCompare(a[sortField])
                        };
                };

                list.sort(getSortFunction(sort.level, sortField));

                return list;
            };

            scope.handleSortClick = function(level) {
                if (level == scope.model.reportSort.level) {
                    scope.model.reportSort.desc = !scope.model.reportSort.desc;
                } else {
                    scope.model.reportSort = {
                        level: level,
                        desc: true
                    };
                }
                scope.model.reportList = scope.sortRepList(scope.model.reportList, scope.model.reportSort);
            };

            scope.handleRowClick = function(f) {

                var dateOffset = (24 * 60 * 60 * 1000) * 365;

                var filters = dataService.getSearchFilters();

                var valueFilter = {
                    dateFrom: new Date(new Date() - dateOffset),
                    dateTo: new Date()
                };
                valueFilter[f.columnName] = {
                    min: f.min,
                    max: f.max,
                    undef: true
                };

                dataService.setSearchFilters('values', valueFilter);

                $state.go('main.account.patients');

            }

            scope.getShare = function(d, n) {
                return parseInt(((d / n) * 100).toFixed(0));
            };

            scope.getValueGroup = function(v) {
                switch (true) {
                    case (v >= 90):
                        return 4;
                        break;
                    case (v >= 80):
                        return 3;
                        break;
                    case (v >= 70):
                        return 2;
                        break;
                    default:
                        return 1;
                }
            };

            dataService.getReportingStatistics(scope.model.activeAccount.accountID, function(d) {

                d.fields = d.fields.filter(function(f) {
                    return !f.isIndicatorExclusive;
                });

                d.fields = commonService.excludeMetafields(d.fields, scope.model.excludes);

                if (scope.model.unitType == 1) {
                    d.fields = d.fields.filter(function(f) {
                        return !(f.columnName === 'cgm' || f.columnName === 'pumpOngoing')
                    });
                }

                var list = d.fields.map(function(f) {

                    var denom;

                    if (f.id == 193)
                        f.question = 'Behandlad för ögonkomplikation';

                    if (f.id == 140)
                        f.question = 'Fysisk aktivitet';

                    if (f.id == 141)
                        f.question = 'Hypoglykemiförekomst svåra';

                    //Fields with different denominator
                    switch (f.columnName) {
                        case 'pumpOngoing':
                            denom = 'pumpUsing';
                            break;
                        case 'cgm':
                            denom = 'insulinTreated';
                            break;
                        case 'retinopathyDiagnosis':
                            denom = 'hasRetinopathy';
                            break;
                        case 'smokingHabit':
                            denom = 'ageGT13';
                            break;
                        case 'snuffingHabit':
                            denom = 'ageGT13';
                            break;
                        case 'smokingEndYear':
                            denom = 'ageGT13';
                            break;
                        case 'snuffingEndYear':
                            denom = 'ageGT13';
                            break;
                        case 'uAlbCreatinine':
                            denom = 'ageGT10';
                            break;
                        case 'albuminuria':
                            denom = 'ageGT10';
                            break;
                        case 'fundusExaminationDate':
                            denom = 'ageGT10';
                            break;
                        case 'bpSystolic':
                            denom = 'ageGT10';
                            break;
                        case 'bpDiastolic':
                            denom = 'ageGT10';
                            break;
                        case 'hypertension':
                            denom = 'ageGT10';
                            break;
                        case 'antihypertensives':
                            denom = 'ageGT10';
                            break;
                        case 'diabeticRetinopathy':
                            denom = 'ageGT10';
                            break;
                        //case 'retinopathyDiagnosis':
                        //    denom = 'ageGT10';
                        //    break;
                        case 'lipidLoweringDrugs':
                            denom = 'ageGT10';
                            break;
                        case 'physicalActivityKids':
                            denom = 'ageGT5';
                            break;
                        default:
                            denom = 'contactDate'
                    }

                    var o = {
                        columnName: f.columnName,
                        min: f.minValue,
                        max: f.maxValue,
                        question: f.question,
                        unitShare: {
                            value: scope.getShare(d.counts[3][f.columnName], d.counts[3][denom]),
                            group: null,
                        },
                        countyShare: {
                            value: scope.getShare(d.counts[2][f.columnName], d.counts[2][denom]),
                            group: null,
                        },
                        sweShare: {
                            value: scope.getShare(d.counts[1][f.columnName], d.counts[1][denom]),
                            group: null
                        }
                    };

                    o.unitShare.group = scope.getValueGroup(o.unitShare.value);
                    o.countyShare.group = scope.getValueGroup(o.countyShare.value);
                    o.sweShare.group = scope.getValueGroup(o.sweShare.value);

                    return o;
                });

                scope.model.reportList = scope.sortRepList(list, scope.model.reportSort);
            });

        }
        return {
            restrict: 'A',
            templateUrl: 'src/components/StatReporting/StatReporting.html',
            link: link,
            scope: {
                model: '=',
            }
        };
    }]);