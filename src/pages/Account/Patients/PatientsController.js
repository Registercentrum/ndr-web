'use strict';

angular.module('ndrApp')
    .controller('PatientsController', [
                 '$scope', '$state', '$stateParams', '$log', '$filter', 'dataService', '$timeout', '$window', '$http',
        function ($scope,   $state,   $stateParams,   $log,   $filter,   dataService,   $timeout, $window, $http) {

            $log.debug('PatientsController: Init');
            var filterSettings = {
                    exclude: ['socialNumber', 'pumpOngoingSerial', 'pumpNewSerial', 'contactDate', 'dateOfDeath', 'smokingEndYear','subjectID'],
                    required: ['d', 'hba1c']
                },
                filterDisplayIndex;

            $scope.isLoadingSubjects = false;

            // If we don't want to restore filters, unset them
            if (!$stateParams.restoreFilters) dataService.setSearchFilters();
            console.log($stateParams);

            var allSubjects;

            var dateOffset = (24*60*60*1000) * 365; //365
            /* Date picker options */
            $scope.format = 'yyyy-MM-dd';
            $scope.datePickers = {

                maxDate : new Date(),
                from: {
                    date: $filter('date')(new Date(new Date()-dateOffset), $scope.format),
                    opened: false
                },
                to: {
                    date: $filter('date')(new Date(), $scope.format),
                    opened: false
                }
            };
			
            $scope.today = function () {
                $scope.dt = new Date();
            };
            $scope.today();

            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            $scope.open = function ($event, picker) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.datePickers[picker].opened = true;
            };

            $scope.openPicker = function ($event, columnName, direction) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.selectedFilters[columnName][direction].opened = true;
                //     $scope.selectedFilters[filter.columnName].from
            };

            $scope.lookupName = function (filter, value){
                if (filter.domain.isEnumerated) return _.result(_.find(filter.domain.domainValues, {code : value}), 'text', '');
                return $filter('number')(value);
            };

            /* DATA TABLE */
            $scope.$watchCollection('model.filteredSubjects', function () {
                $scope.pageSize = 15;
                $scope.allItems = $scope.model.filteredSubjects;
                $scope.reverse = false;

                $scope.filteredList = $scope.allItems;
                $scope.currentPage = 0;
                $scope.Header = ['','',''];

                //By Default sort ny SocialNumber
                $scope.sort('snr');
            });

            function paged (valLists, pageSize) {
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
				console.log(retVal);
				
                return retVal;
            }

            $scope.pagination = function () {
                $scope.ItemsByPage = paged($scope.filteredList, $scope.pageSize);
            };

            $scope.setPage = function () {
                $scope.currentPage = this.n;
            };

            $scope.firstPage = function () {
                $scope.currentPage = 0;
            };

            $scope.lastPage = function () {
                $scope.currentPage = $scope.ItemsByPage.length - 1;
            };

            $scope.range = function (input, total) {
                var ret = [];
                if (!total) {
                    total = input;
                    input = 0;
                }
                for (var i = input; i < total; i++)
                    if (i !== 0 && i !== total - 1) ret.push(i);
                return ret;
            };

            $scope.resetAll = function () {
                $scope.filteredList = $scope.allItems;
            };


            $scope.sort = function(sortBy) {
                var iconName;
                $scope.resetAll();

                $scope.columnToOrder = sortBy;

                //$Filter - Standard Service
                $scope.filteredList = $filter('orderBy')($scope.filteredList, $scope.columnToOrder, $scope.reverse);

                iconName = $scope.reverse ? 'glyphicon glyphicon-chevron-up' : 'glyphicon glyphicon-chevron-down';

                if(sortBy === 'snr') {
                    $scope.Header[0] = iconName;
                } else if (sortBy === 'snr') {
                    $scope.Header[1] = iconName;
                } else {
                    $scope.Header[2] = iconName;
                }

                $scope.reverse = false;// !$scope.reverse;

                $scope.pagination();
            };


            $scope.toggleDetail = function (d) {
                console.log('detail', d);
            };


            // -------------------------------------------------------------------
            // LOADING SUBJECTS
            // -------------------------------------------------------------------
            $scope.model = {
                allSubjects     : undefined,
                filteredSubjects: undefined
            };

            var ready = false;

            // Load data when period changes
            function loadSubjects () {

                if(!ready) { return false; }

                if($scope.isLoadingSubjects) return;
                $scope.isLoadingSubjects = true;

                var query;
                var selectedFilters = {};

                // Narrow down the filters to only the displayed ones
                _.each($scope.selectedFilters, function (filter, filterKey) {
                    if ($scope.isDisplayed(filterKey)) {
                        selectedFilters[filterKey] = filter;
                    }
                });

                query = {
                    DateFrom: moment($scope.datePickers.from.date).format('YYYY-MM-DD'),
                    DateTo  : moment($scope.datePickers.to.date).format('YYYY-MM-DD'),
                    f       : _.keys(selectedFilters),
                    filters : selectedFilters,
                    limit   : 15,
                    offset  : 100,
                    count    : 'given-by-server',
                    matching : 'given-by-server',
                    absence : $scope.absence
                };

                console.log('query on loaded', query);


                dataService.getSubjects(query, function (data){
					
                    allSubjects = data;
                    $scope.model.allSubjectsLength = allSubjects.length;

                    $scope.isLoadingSubjects = false;
                    debouncedFilter();

                });
            }


            var delayStartTime = 200;
            if(!Modernizr.svg){
                delayStartTime = 6000;
            }
			function validateDates() {
				return ($scope.datePickers.to.date >=$scope.datePickers.from.date)
			}	
			
            $timeout(function (){
                $scope.$watch('datePickers.to.date', function() {
					if (validateDates())
						loadSubjects();
				});
                $scope.$watch('datePickers.from.date', function() {
					if (validateDates())
						loadSubjects();
				});
            }, delayStartTime)


            // -------------------------------------------------------------------
            // FILTERING
            // -------------------------------------------------------------------

            // Fill additional filters from the API request for cantact attributes
            $scope.filters = [];
            dataService.getContactAttributes(filterSettings)
                .then(function (filters) {
                    var selected,
                        preselected = dataService.getSearchFilters();
                        console.log(preselected);

                    // Make placeholder objects for the rest of the filters in the selectedFilters.additional
                    _.each(filters, function (filter) {
                        // Normalize naming
                        if (filter.columnName === 'diabetesType' ) filter.columnName  = 'd';
						if (filter.columnName === 'yearOfOnset' ) filter.columnName  = 'y';
                        if (filter.columnName === 'sex' ) filter.columnName  = 's';

                        if(filter.sequence == null){ filter.sequence = 9999; }

                        // Fill out missing props
                        if (filter.columnName === 'age' ) {
                           filter.min      = 0;
                           filter.max      = 120;
                           filter.maxValue = 120;
                           filter.range    = [0, 120];
                        }

                        if (filter.columnName === 'smokingEndYear' ) {
                            filter.min   = 1900;
                            filter.max   = 2020;
                            filter.range = [1900, 2020];
                        }

                        if (filter.columnName === 'yearOfOnset' ) {
                            filter.min   = 1900;
                            filter.max   = 2020;
                            filter.range = [1900, 2020];
                        }


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
                                    opened : false
                                };
                                $scope.selectedFilters[filter.columnName].to = {
                                    date: $filter('date')(new Date(), $scope.format),
                                    opened : false
                                };
                            }
                        }
                    });

                    // Make sure that selected filters are always first in the list
                    selected = _.remove(filters, 'isChosen');
                    // Add display order for the selected
                    selected = _.map(selected, function (sel, selIndex) {
                        var preselectedFilter = _.find(preselected.filters, {columnName: sel.columnName});
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
                    loadSubjects();

                });

            // Used to update the list of chosen filters
            $scope.chosenFilter = null;

            // Whenever the filter is chosen from the list of available filters
            // update the list of chosen filters
            $scope.$watch('chosenFilter', function (name) {
                var filter, alreadySelected;

                if (!name) return;

                alreadySelected = $scope.isDisplayed(name);

                // Select the filter, only if it's not already displayed
                if (!alreadySelected) {
                    filter = _.find($scope.filters, {columnName: name});
                    if (filter) {
                        filter.isChosen = true;
                        filter.displayOrder = filterDisplayIndex;
                        filterDisplayIndex += 1;
                    }
                }
                $scope.chosenFilter = null;

                // Realy simple highlight
                $scope.highlightedFilter = name;
                $timeout(function () { $scope.highlightedFilter = null; }, 1000);

                dataService.setSearchFilters('filters', _.filter($scope.filters, {isChosen: true}));

                // Load subjects only if it's a new filter
                if (!alreadySelected) loadSubjects();
            });

            $scope.isDisplayed = function (name) {
                return $scope.isRequired(name) || _.find($scope.filters, {columnName: name}).isChosen;
            };

            $scope.isRequired = function (name) {
                return _.indexOf(filterSettings.required, name) !== -1;
            };

            // Chosen filters can be removed by the user
            $scope.removeChosenFilter = function (name) {
                _.find($scope.filters, {columnName: name}).isChosen = false;
                filterDisplayIndex -= 1;

                // Reset the selected filters
                // Reset range values
                if ($scope.selectedFilters[name].range) {
                    $scope.selectedFilters[name].min = $scope.selectedFilters[name].range[0];
                    $scope.selectedFilters[name].max = $scope.selectedFilters[name].range[1];
                } else {
                    $scope.selectedFilters[name] = {};
                }
            };

            $scope.selectedFilters = {};

            function filter () {

                // Check if there is anything to filter
                if (!$scope.model.allSubjectsLength) return;

                $log.debug('Changed Filters');

                var selectedFilters = {},
                    subjects = allSubjects;


                // Narrow down the filters to only the displayed ones
                _.each($scope.selectedFilters, function (filter, filterKey) {
                    if ($scope.isDisplayed(filterKey)) {
                        selectedFilters[filterKey] = filter;
                    }
                });

                dataService.setSearchFilters('values', selectedFilters);

                if($scope.absence !== true) {

                    // Check additional filters
                    _.each(selectedFilters, function (filter, prop) {

                        if (_.isEmpty(filter)) return;

                        subjects = _.filter(subjects, function (subject) {

                            //console.log(prop);

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
                            } else if (filter.from && (_.isDate(filter.from.date) || _.isDate(filter.to.date))) {
                                value = new Date(propValue);
                                return (_.isDate(value) && (value >= new Date(filter.from.date) && value <= new Date(filter.to.date)));

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

                //$scope.model.allSubjects = subjects;
                $scope.model.filteredSubjects = subjects;
                $scope.model.filteredSubjectsLength = subjects.length;

                //$log.debug('Filtered subjects', subjects.length, subjects);
            }

            var debouncedFilter = _.debounce(function () {
                $scope.$apply(function () {
                    filter();
                });
            }, 400);


            $scope.$watch('absence', function (){
                console.log("CHANGED ABS");
                loadSubjects();
            });

            $scope.$watch('selectedFilters', function (){
                console.log("CHANGED", $scope.selectedFilters);

                debouncedFilter();
            }, true);
			
			$scope.exportToCSV = function() {
							
				var textFile = {
					content: $scope.getCSVText('test'),
					name: 'NDR-lista',
					fileType: 'csv'
				};
				
				dataService.getFile(textFile);
			
			};
			$scope.getCSVText = function() {
				var ret = '';
				var row = 1;
				
				//Attribut som skall skrivas ut
				var attributes = [];
				
				//hämta valda attribut
				var selectedattributes = $scope.filters.filter(function (el) { return el.isChosen; }); //dataService.getSearchFilters();

				//lägg till obligatoriska attribut
				attributes.push({columnName: 'snr', question: 'Personnummer', domain: {isEnumerated: false, domainID:106}});
				attributes.push({columnName: 'contactDate', question: 'Senaste besök', domain: {isEnumerated: false, domainID:105}});
				//lägg till valda attribut
				for (var i = 0; i < selectedattributes.length; i++) { 
					attributes.push({columnName: selectedattributes[i].columnName, question: selectedattributes[i].question, domain: selectedattributes[i].domain});
				}
				
				//Skriv rubriker
				var first = true;
				for (var i = 0; i < attributes.length; i++) { 
					if (first)
						ret = ret + '"' + attributes[i].question + '"';
					else
						ret = ret + ';' + '"' + attributes[i].question + '"';
						
					first = false;
				}
				
				//Lägg patientrad
				function addContent(first, attribute, subject) {
					var ret = '';
			
					if (attribute.domain.isEnumerated) //listvärde
						ret = ret + (first ? '' : ';') + '"' + $scope.lookupName(attributes[j], subject[attribute.columnName]) + '"';
					else if (attribute.domain.domainID == 105) { //datum
						ret = ret + (first ? '' : ';') + '"' + subject[attribute.columnName].split('T')[0] + '"';
					}
					else //numeriskt värde
						ret = ret + (first ? '' : ';') + '"' + subject[attribute.columnName].toString().replace('.',',') + '"';
					
					return ret;
				}
				
				//Skriv datainnehåll
				for (var i = 0; i < $scope.model.filteredSubjects.length; i++) { 
					ret = ret + '\r\n';
					first = true;
				
					for (var j = 0; j < attributes.length; j++) { 	
						ret = ret + addContent(first, attributes[j], $scope.model.filteredSubjects[i])
						first = false;
					}
				}
				
				return ret;
			};
            // $scope.$watch('selectedFilters.hbMax', debouncedFilter, true);
            // $scope.$watch('selectedFilters.diabetesTypes', filter, true);
            // $scope.$watch('selectedFilters.additional', filter, true);
            //$scope.$watch('model.allSubjects', filter, true);

        }]);
