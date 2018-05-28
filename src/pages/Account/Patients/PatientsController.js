'use strict';

angular.module('ndrApp')
    .controller('PatientsController', [
        '$scope', '$state', '$stateParams', '$log', '$filter', 'dataService', '$timeout', '$window', '$http','commonService',
        function($scope, $state, $stateParams, $log, $filter, dataService, $timeout, $window, $http, commonService) {

            /*
            This whole file needs to be rubuilt!!!
            
            $scope.model = {
                subjects: null,
                filters: [],
                selectedFilter: null,
            }*/


            $log.debug('PatientsController: Init');
            var filterSettings = {
                    exclude: ['socialNumber', 'pumpNew', 'pumpNewSerial', 'contactDate', 'dateOfDeath', 'smokingEndYear', 'snuffingEndYear', 'subjectID'],
                    required: ['d','s','sex']
                },
                filterDisplayIndex;

            $scope.filterSettings = {
                    excluded: ['socialNumber', 'pumpNew', 'pumpNewSerial', 'contactDate', 'dateOfDeath', 'smokingEndYear', 'snuffingEndYear', 'subjectID'],
                    required: ['d','s','sex']
                };
            $scope.isLoadingSubjects = false;

            // If we don't want to restore filters, unset them
            if (!$stateParams.restoreFilters) dataService.setSearchFilters();

            var allSubjects;

            var dateOffset = (24 * 60 * 60 * 1000) * 365;

            /* Date picker options */
            $scope.format = 'yyyy-MM-dd';

            var filters = dataService.getSearchFilters('values');
            
            $scope.datePickers = {

                maxDate: new Date(),
                from: {
                    date: $filter('date')(filters.dateFrom, $scope.format),
                    opened: false
                },
                to: {
                    date: $filter('date')(filters.dateTo, $scope.format),
                    opened: false
                }
            };

            //optional fields
            $scope.addOptionalFields = function(fields) {
                var o = dataService.optionalQuestions();
                return fields.concat(o);
            }

            //fields not included in forms
            $scope.addExtraFields = function(fields, keys) {
                var extraFields = dataService.getFieldByKey(keys);
                for (var i = 0; i <= extraFields.length - 1; i++) {
                    fields.splice(1, 0, extraFields[i]);
                }
                
                return fields;
            }

            $scope.init = function() {

                $scope.unitTypeID = $scope.accountModel.activeAccount.unit.typeID;
                var fields = dataService.getFormFields(1, $scope.unitTypeID);
                //not loaded?
                if (!fields) {
                    $scope.loadFilters($scope.unitTypeID);
                    return;
                }

                //add extra fields
                fields = $scope.addExtraFields(fields, ['age','sex','s']);
                //add optional questions
                fields = $scope.addOptionalFields(fields);
                fields = $scope.removeExcluded(fields);

                $scope.getContactAttributes($scope.filterSettings, fields);
            }

            $scope.removeExcluded = function(fields) {

                var ret = []

                for (var i = 0; i <= fields.length - 1; i++) {
                    var add = true;
                    for (var j = 0; j <= $scope.filterSettings.excluded.length - 1; j++) {
                        if ($scope.filterSettings.excluded[j] === fields[i].columnName) {
                            add = false;
                            break;
                        }
                    };
                    if (add) ret.push(fields[i]);
                }

                return ret;
            }

            $scope.loadFilters = function(unitTypeID) {

                $scope.isLoading = true;
                dataService.getMetaFields($scope.accountModel.activeAccount.accountID,unitTypeID).then(function() {
                    $scope.init();
                    return;
                });

            };
            $scope.showCurrentNames = function(){

                for (var i = 0; i < $scope.ItemsByPage[$scope.currentPage].length; i++) { 
                    var subject = $scope.ItemsByPage[$scope.currentPage][i];
                    $scope.setName(subject);
                }
            },
            $scope.setName = function(subject) {
                
                if ($scope.unitTypeID != 3) return;

                var personInfo = commonService.getPersonInfoLocal(subject);
                
                if (personInfo != null) {
                    commonService.setPersonName(subject, personInfo);
                    $scope.$digest();
                } else {
                    var accountID = $scope.accountModel.activeAccount.accountID
                    dataService.fetchSubjectInfo(accountID,subject.snr)
                    .then(function(data) {
                        commonService.setPersonName(subject, data);
                        $scope.$digest();
                    });
                }

            }
            /*$scope.showName = function(subject) {
                
                var subjectInfo;

                //already fetched
                if (subject.firstName) {
                    return;
                }

                var getSubjectInfo = function(snr) {
                    subjectInfo = dataService.getSubjectInfo(subject.snr);
                    return subjectInfo;
                }

                var setSubjectInfo = function(subjectInfo) {
                    console.log(subjectInfo);
                    if (!subjectInfo.firstName || !subjectInfo.lastName) {
                        alert('Ingen information kunde hittas för personnummer ' + snr + ' i folkbokföringen');
                    } else {
                        subject.name = subjectInfo.firstName + ' ' + subjectInfo.lastName;
                    }
                }

                subjectInfo = getSubjectInfo(subject.snr);

                if (subjectInfo) {
                    setSubjectInfo(subjectInfo)
                    return;
                } else {
                    var accountID = $scope.accountModel.activeAccount.accountID
                    dataService.fetchSubjectInfo(accountID,subject.snr)
                    .then(function(data) {
                        setSubjectInfo(data);
                        $scope.$digest();
                    });
                }
                
            }*/
            $scope.today = function() {
                $scope.dt = new Date();
            };
            $scope.today();

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };
            $scope.open = function($event, picker) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.datePickers[picker].opened = true;
            };

            $scope.openPicker = function($event, columnName, direction) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.selectedFilters[columnName][direction].opened = true;
                //     $scope.selectedFilters[filter.columnName].from
            };

            $scope.lookupName = function(filter, value) {

                if (value != 0 && !value) //0 is a valid code
                    return '';

                if (filter.domain.isEnumerated) return _.result(_.find(filter.domain.domainValues, {
                    code: value
                }), 'text', '');

                if (filter.domain.domainID == 105) return value.split('T')[0];

                if (filter.domain.domainID == 106 || filter.domain.domainID == 101) return value;

                return $filter('number')(value);
            };

            /* DATA TABLE */
            $scope.$watchCollection('model.filteredSubjects', function() {
                $scope.pageSize = 15;
                $scope.allItems = $scope.model.filteredSubjects;
                $scope.reverse = false;

                $scope.filteredList = $scope.allItems;
                $scope.currentPage = 0;
                $scope.Header = ['', '', ''];

                //By Default sort ny SocialNumber
                $scope.sort('snr');
            });

            function paged(valLists, pageSize) {
                var valLength, retVal;

                if (!valLists) return;

                valLength = valLists.length;
                retVal = [];

                for (var i = 0; i < valLength; i++) {
                    if (i % pageSize === 0) {
                        retVal[Math.floor(i / pageSize)] = [valLists[i]];
                    } else {
                        retVal[Math.floor(i / pageSize)].push(valLists[i]);
                    }
                }
                return retVal;
            }

            $scope.pagination = function() {
                $scope.ItemsByPage = paged($scope.filteredList, $scope.pageSize);
            };

            $scope.setPage = function() {
                $scope.currentPage = this.n;
            };

            $scope.firstPage = function() {
                $scope.currentPage = 0;
            };

            $scope.lastPage = function() {
                $scope.currentPage = $scope.ItemsByPage.length - 1;
            };

            $scope.range = function(input, total) {
                var ret = [];
                if (!total) {
                    total = input;
                    input = 0;
                }
                for (var i = input; i < total; i++)
                    if (i !== 0 && i !== total - 1) ret.push(i);
                return ret;
            };

            $scope.resetAll = function() {
                $scope.filteredList = $scope.allItems;
            };


            $scope.sort = function(sortBy) {
                var iconName;
                $scope.resetAll();

                $scope.columnToOrder = sortBy;

                //$Filter - Standard Service
                $scope.filteredList = $filter('orderBy')($scope.filteredList, $scope.columnToOrder, $scope.reverse);

                iconName = $scope.reverse ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down';

                if (sortBy === 'snr') {
                    $scope.Header[0] = iconName;
                } else if (sortBy === 'snr') {
                    $scope.Header[1] = iconName;
                } else {
                    $scope.Header[2] = iconName;
                }

                $scope.reverse = false; // !$scope.reverse;

                $scope.pagination();
            };


            $scope.toggleDetail = function(d) {
                console.log('detail', d);
            };


            // -------------------------------------------------------------------
            // LOADING SUBJECTS
            // -------------------------------------------------------------------
            $scope.model = {
                allSubjects: undefined,
                filteredSubjects: undefined
            };

            var ready = false;

            // Load data when period changes
            function loadSubjects() {

                if (!ready) {
                    return false;
                }

                if ($scope.isLoadingSubjects) return;
                $scope.isLoadingSubjects = true;

                var query;
                var selectedFilters = {};

                // Narrow down the filters to only the displayed ones
                _.each($scope.selectedFilters, function(filter, filterKey) {
                    if ($scope.isDisplayed(filterKey)) {
                        selectedFilters[filterKey] = filter;
                    }
                });

                query = {
                    DateFrom: $scope.dateFrom, //moment($scope.datePickers.from.date).format('YYYY-MM-DD'),
                    DateTo: $scope.dateTo, //moment($scope.datePickers.to.date).format('YYYY-MM-DD'),
                    f: _.keys(selectedFilters),
                    filters: selectedFilters,
                    limit: 15,
                    offset: 100,
                    count: 'given-by-server',
                    matching: 'given-by-server',
                    absence: $scope.absence
                };

                //console.log('query on loaded', query);

                dataService.getSubjects(query)
                    .then(function(data) {
                        allSubjects = data;
                        $scope.model.allSubjectsLength = allSubjects.length;
                        $scope.isLoadingSubjects = false;
                        debouncedFilter();
                    })
                    .fail(function(data) {
                        allSubjects = null;
                        $scope.model.allSubjectsLength = 0;
                        $scope.isLoadingSubjects = false;
                        debouncedFilter();
                    });
            }

            var delayStartTime = 200;
            if (!Modernizr.svg) {
                delayStartTime = 6000;
            }
            $scope.dateAttributeIsValid = function(attribute) {

                var from = $scope.searchForm[attribute + 'From'];
                var to = $scope.searchForm[attribute + 'To'];

                if (!$scope.oneDateInputIsValid(from, attribute + 'FromInValid') || !$scope.oneDateInputIsValid(to, attribute + 'ToInValid'))
                    return false;

                return true;
            }

            $scope.shortcut = function(min, max) {
                $scope.selectedFilters['hba1c'].min = min;
                $scope.selectedFilters['hba1c'].max = max;

            }

            $scope.oneDateInputIsValid = function(formCmp, valKey) {

                var input = formCmp.$viewValue;
                var isValid = true;

                if (typeof input === 'string') {
                    if (input.length !== 10)
                        isValid = false;
                    else if (new Date(input) == 'Invalid Date')
                        isValid = false;
                }

                formCmp.$setValidity(valKey, isValid);

                return isValid;

            };
            $scope.contactDateInputIsValid = function() {

                if (!$scope.dateAttributeIsValid('date'))
                    return false;

                if (!$scope.contactDateValuesIsValid())
                    return false;

                return true;

            };
            $scope.filterDateIsValid = function() {

                if ($scope.searchForm['fundusExaminationDateTo'])
                    if (!$scope.dateAttributeIsValid('fundusExaminationDate'))
                        return false;

                if ($scope.searchForm['footExaminationDateTo'])
                    if (!$scope.dateAttributeIsValid('footExaminationDate'))
                        return false;

                return true;

            };
            $scope.contactDateValuesIsValid = function() {

                //collect response
                var from = $scope.datePickers.from;
                var to = $scope.datePickers.to;

                //check if undefined
                if (from === undefined) {
                    $scope.searchForm.dateFrom.$setValidity('dateFromInValid', false);
                    return false;
                }

                //check if undefined
                if (to === undefined) {
                    $scope.searchForm.dateTo.$setValidity('dateToInValid', false);
                    return false;
                }

                //create strings
                from = $filter('date')(from, $scope.format);
                to = $filter('date')(to, $scope.format);

                if ((to < from)) {
                    $scope.searchForm.dateFrom.$setValidity('dateFromInValid', false);
                    $scope.searchForm.dateTo.$setValidity('dateToInValid', false);
                    return false;
                }

                $scope.searchForm.dateFrom.$setValidity('dateFromInValid', true);
                $scope.searchForm.dateTo.$setValidity('dateToInValid', true);

                return true;

            };
            $scope.clearSearch = function() {
                $scope.clearResultList();
                $scope.model.allSubjectsLength = 0;
                $scope.ItemsByPage = [];
            }
            $scope.clearResultList = function() {
                $scope.model.filteredSubjects = [];
                $scope.model.filteredSubjectsLength = 0;
            }

            function tryLoad() {

                $scope.clearSearch();

                //$scope.contactDateInputIsValid()
                if ($scope.searchForm) {
                    if ($scope.searchForm.$valid) {
                        loadSubjects();
                    }
                }

            }
            $timeout(function() {
                $scope.$watch('dateFrom', function() {
                    dataService.setSearchFilters('dateFrom', $scope.dateFrom)
                    tryLoad();
                });
                $scope.$watch('dateTo', function() {
                    dataService.setSearchFilters('dateTo', $scope.dateTo)
                    tryLoad();
                });
            }, delayStartTime)


            // -------------------------------------------------------------------
            // FILTERING
            // -------------------------------------------------------------------

            // Fill additional filters from the API request for cantact attributes
            $scope.filters = [];

            $scope.getStringDate = function(date) {

                if (typeof date === 'string') return date;
                if (date === undefined) return;
                if (date === null) return;
                if (!(date instanceof Date && !isNaN(date.valueOf()))) return;

                var yyyy = date.getFullYear().toString();
                var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
                var dd = date.getDate().toString();

                return (yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]));
            };

            $scope.getContactAttributes = function(filterSettings, filters) {

                var selected,
                    preselected = dataService.getSearchFilters()// dataService.getSearchFilters();

                $scope.dateFrom = $filter('date')(preselected.values.dateFrom, $scope.format)
                $scope.dateTo = $filter('date')(preselected.values.dateTo, $scope.format)
                // Make placeholder objects for the rest of the filters in the selectedFilters.additional
                _.each(filters, function(filter) {
                    // Normalize naming
                    if (filter.columnName === 'diabetesType') filter.columnName = 'd';
                    if (filter.columnName === 'yearOfOnset') filter.columnName = 'y';
                    if (filter.columnName === 'sex') filter.columnName = 's';

                    if (filter.sequence == null) {
                        filter.sequence = 9999;
                    }

                    // Fill out missing props
                    /*if (filter.columnName === 'age') {
                        filter.min = 0;
                        filter.max = 120;
                        filter.maxValue = 120;
                        filter.range = [0, 120];
                    }

                    if (filter.columnName === 'smokingEndYear') {
                        filter.min = 1900;
                        filter.max = 2020;
                        filter.range = [1900, 2020];
                    }

                    if (filter.columnName === 'yearOfOnset') {
                        filter.min = 1900;
                        filter.max = 2020;
                        filter.range = [1900, 2020];
                    }*/

                    // If the filter is required or preselected choose it instantly
                    filter.isChosen = $scope.isRequired(filter.columnName) || _.keys(preselected.values).indexOf(filter.columnName) !== -1;

                    $scope.selectedFilters[filter.columnName] = {};

                    // If the filter was preselected, use those values
                    if (_.keys(preselected.values).indexOf(filter.columnName) !== -1) {
                        $scope.selectedFilters[filter.columnName] = preselected.values[filter.columnName];

                        // Otherwise fill out some defaults
                    } else {
                        // Setup min and max for range slider
                        // We need that for setting up the range slider directive
                        if (_.isNumber(filter.maxValue)) {
                            $scope.selectedFilters[filter.columnName].min = filter.minValue || 0;
                            $scope.selectedFilters[filter.columnName].max = filter.maxValue;
                        }

                        if (filter.domain.name === 'Date') {
                            $scope.selectedFilters[filter.columnName].from = {
                                date: $filter('date')(new Date(new Date() - dateOffset), $scope.format),
                                opened: false
                            };
                            $scope.selectedFilters[filter.columnName].to = {
                                date: $filter('date')(new Date(), $scope.format),
                                opened: false
                            };
                        }
                    }

                });

                // Make sure that selected filters are always first in the list
                selected = _.remove(filters, 'isChosen');
                // Add display order for the selected
                selected = _.map(selected, function(sel, selIndex) {
                    var preselectedFilter = _.find(preselected.filters, {
                        columnName: sel.columnName
                    });
                    sel.displayOrder = preselectedFilter ? preselectedFilter.displayOrder : selIndex;
                    return sel;
                });
                // Update filterDisplayIndex used for ordering chosen filters
                filterDisplayIndex = selected.length;

                // Also make sure they are sorted by API sequence
                filters = _.sortBy(selected.concat(filters), 'sequence');


                // Set the available filters

                //filters.missing =
                $scope.filters = filters;

                ready = true;
                tryLoad();

            };
            // Used to update the list of chosen filters
            $scope.chosenFilter = null;

            // Whenever the filter is chosen from the list of available filters
            // update the list of chosen filters
            $scope.$watch('chosenFilter', function(name) {
                var filter, alreadySelected;

                if (!name) return;

                alreadySelected = $scope.isDisplayed(name);

                // Select the filter, only if it's not already displayed
                if (!alreadySelected) {
                    filter = _.find($scope.filters, {
                        columnName: name
                    });
                    if (filter) {
                        //filter.min 		= filter.minValue;
                        //filter.max 		= filter.maxValue;
                        //filter.range 	= [filter.minValue,filter.maxValue];
                        filter.isChosen = true;
                        filter.displayOrder = filterDisplayIndex;
                        filterDisplayIndex    += 1;
                    }
                }
                $scope.chosenFilter = null;

                // Realy simple highlight
                $scope.highlightedFilter = name;
                $timeout(function() {
                    $scope.highlightedFilter = null;
                }, 1000);

                dataService.setSearchFilters('filters', _.filter($scope.filters, {
                    isChosen: true
                }));

                // Load subjects only if it's a new filter
                if (!alreadySelected) tryLoad();
            });

            $scope.isDisplayed = function(name) {
                return $scope.isRequired(name) || _.find($scope.filters, {
                    columnName: name
                }).isChosen;
            };
            $scope.isRequired = function(name) {
                return _.indexOf(filterSettings.required, name) !== -1;
            };

            // Chosen filters can be removed by the user
            $scope.removeChosenFilter = function(name) {

                _.find($scope.filters, {
                    columnName: name
                }).isChosen = false;
                filterDisplayIndex -= 1;

                // Reset the selected filters
                // Reset range values

                /*if ($scope.selectedFilters[name].range) {
                    $scope.selectedFilters[name].min = $scope.selectedFilters[name].range[0];
                    $scope.selectedFilters[name].max = $scope.selectedFilters[name].range[1];
                } else {
                    $scope.selectedFilters[name] = null;
                }*/

                dataService.setSearchFilters('filters', _.filter($scope.filters, {
                    isChosen: true
                }));
                filter();

            };

            $scope.selectedFilters = {};

            function filter() {

                // Check if there is anything to filter
                if (!$scope.model.allSubjectsLength) return;

                $log.debug('Changed Filters');

                var selectedFilters = {},
                    subjects = allSubjects;

                // Narrow down the filters to only the displayed ones
                _.each($scope.selectedFilters, function(filter, filterKey) {
                    if ($scope.isDisplayed(filterKey)) {
                        selectedFilters[filterKey] = filter;
                    }
                });

                if ($scope.absence !== true) {

                    // Check additional filters
                    _.each(selectedFilters, function(filter, prop) {

                        if (_.isEmpty(filter)) return;

                        subjects = _.filter(subjects, function(subject) {

                            var propValue = subject[prop],
                                value;

                            // if filter.undef is true it means that option for searching undefined values is checked
                            // so return only those that have null specified for this option
                            if (filter.undef) {

                                return typeof subject[prop] === 'undefined';

                                // Handle range filtering
                            } else if (typeof filter.min === 'number' && typeof filter.max === 'number') {
                                return typeof propValue === 'number' && (propValue >= filter.min && propValue <= filter.max);

                                // Handle date filtering
                            } else if (filter.from) { //&& (_.isDate(filter.from.date) || _.isDate(filter.to.date))
                                if (!propValue)
                                    return false;

                                value = propValue.split('T')[0];

                                //changes filter to textbased date
                                filter.from.date = $filter('date')(filter.from.date, $scope.format)
                                filter.to.date = $filter('date')(filter.to.date, $scope.format)

                                return ((value >= filter.from.date) && (value <= filter.to.date));

                                // Handle value filtering
                            } else if (!_.isNull(filter.value) && !_.isUndefined(filter.value)) {
                                value = parseInt(filter.value, 10);
                                return propValue === value;

                                // Nothing to filter, filter out only null values
                            } else {
                                return true;
                            }
                        });
                    });
                }
                selectedFilters.dateFrom = $scope.datePickers.from.date;
                selectedFilters.dateTo = $scope.datePickers.to.date;

                dataService.setSearchFilters('values', selectedFilters);

                //$scope.model.allSubjects = subjects;
                $scope.model.filteredSubjects = subjects;
                $scope.model.filteredSubjectsLength = subjects.length;

                //$log.debug('Filtered subjects', subjects.length, subjects);
            }

            var debouncedFilter = _.debounce(function() {
                $scope.$apply(function() {
                    filter();
                });
            }, 400);


            $scope.$watch('absence', function() {
                console.log("CHANGED ABS");
                tryLoad();
            });
            $scope.tryFilter = function() {

                $scope.clearResultList();

                if ($scope.filterDateIsValid()) {
                    debouncedFilter();
                }
            };
            $scope.$watch('selectedFilters', function() {
                $scope.tryFilter();
            }, true);

            $scope.init();

            $scope.exportToCSV = function() {

                var textFile = {
                    content: $scope.getCSVText('test'),
                    name: 'NDR-lista',
                    extension: 'csv'
                };

                dataService.getFile(textFile);

            };
            $scope.getCSVText = function() {
                var ret = '';

                //To collect attributes
                var attributes = [];

                //Get selected attributes
                var selectedAttributes = $scope.filters.filter(function(el) {
                    return el.isChosen;
                }); //dataService.getSearchFilters();

                //Add compulsory attributes
                attributes.push({
                    columnName: 'snr',
                    question: 'Personnummer',
                    domain: {
                        isEnumerated: false,
                        domainID: 106
                    }
                });

                if ($scope.unitTypeID == 3) {
                    attributes.push({
                        columnName: 'name',
                        question: 'Namn',
                        domain: {
                            isEnumerated: false,
                            domainID: 106
                        }
                    });
                }

                attributes.push({
                    columnName: 'contactDate',
                    question: 'Senaste besök',
                    domain: {
                        isEnumerated: false,
                        domainID: 105
                    }
                });

                //Add selected attributes
                for (var i = 0; i < selectedAttributes.length; i++) {
                    attributes.push({
                        columnName: selectedAttributes[i].columnName,
                        question: selectedAttributes[i].question,
                        domain: selectedAttributes[i].domain
                    });
                }

                attributes.push({
                    columnName: 'isDead',
                    question: 'Avliden',
                    domain: {
                        isEnumerated: false,
                        domainID: 107
                    }
                });

                //Write headers
                var firstInRow = true;
                for (var i = 0; i < attributes.length; i++) {
                    if (firstInRow)
                        ret = ret + '"' + attributes[i].question + '"';
                    else
                        ret = ret + ';' + '"' + attributes[i].question + '"';

                    firstInRow = false;
                }

                //Add row for patient
                function addPatientValue(firstInRow, attribute, subject) {
                    var ret = '';

                    if (subject[attribute.columnName] == undefined)
                        ret = ';';
                    else if (attribute.domain.isEnumerated) //listvärde
                        ret = (firstInRow ? '' : ';') + '"' + $scope.lookupName(attributes[j], subject[attribute.columnName]) + '"';
                    else if (attribute.domain.domainID == 105) { //datum
                        ret = (firstInRow ? '' : ';') + '"' + subject[attribute.columnName].split('T')[0] + '"';
                    } else if (attribute.domain.domainID == 107) { //bool
                        ret = (firstInRow ? '' : ';') + '"' + (subject[attribute.columnName] ? 'Ja' : '') + '"';
                    } else //numeriskt värde
                        ret = (firstInRow ? '' : ';') + '"' + subject[attribute.columnName].toString().replace('.', ',') + '"';

                    return ret;
                }

                //Iterate patients
                for (var i = 0; i < $scope.model.filteredSubjects.length; i++) {
                    ret = ret + '\r\n';
                    firstInRow = true;

                    for (var j = 0; j < attributes.length; j++) {
                        ret = ret + addPatientValue(firstInRow, attributes[j], $scope.model.filteredSubjects[i])
                        firstInRow = false;
                    }
                }

                return ret;
            };
            // $scope.$watch('selectedFilters.hbMax', debouncedFilter, true);
            // $scope.$watch('selectedFilters.diabetesTypes', filter, true);
            // $scope.$watch('selectedFilters.additional', filter, true);
            //$scope.$watch('model.allSubjects', filter, true);

        }
    ]);