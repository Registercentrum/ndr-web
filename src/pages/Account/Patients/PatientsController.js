angular.module('ndrApp')
    .controller('PatientsController', [
        '$scope', '$http', '$stateParams', '$state', '$log', '$filter', 'dataService', 'DTOptionsBuilder', 'DTColumnDefBuilder',
        function ($scope,   $http,   $stateParams,   $state,   $log,   $filter,   dataService,   DTOptionsBuilder,   DTColumnDefBuilder) {
            $log.debug('PatientsController: Init');

            var filterNames = ['diabetesType', 'hba1c', 'treatment', 'weight', 'height', 'antihypertensives', 'lipidLoweringDrugs'],
                requiredFilters = ['diabetesType', 'hba1c'];

            var dateOffset = (24*60*60*1000) * 365; //365
            /* Date picker options */
            $scope.format = 'yyyy-MM-dd';
            $scope.datePickers = {
                from: {
                    date: $filter('date')(new Date(new Date()-dateOffset), $scope.format),
                    opened: false,
                },
                to: {
                    date: $filter('date')(new Date(), $scope.format),
                    opened: false,
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

                if(filter.domain.isEnumerated){
                    return _.result(_.findWhere(filter.domain.domainValues, {code : value}), "text", "");
                }
                else{
                    return value;
                }
            }

            /* DATA TABLE */
            $scope.$watch("model.filteredSubjects", function (){

                function paged (valLists,pageSize){

                    if(!valLists) return false;

                    retVal = [];
                    for (var i = 0; i < valLists.length; i++) {
                        if (i % pageSize === 0) {
                            retVal[Math.floor(i / pageSize)] = [valLists[i]];
                        } else {
                            retVal[Math.floor(i / pageSize)].push(valLists[i]);
                        }
                    }
                    return retVal;
                };

                $scope.pageSize = 15;
                $scope.allItems = $scope.model.filteredSubjects;
                $scope.reverse = false;

                $scope.filteredList = $scope.allItems;

                $scope.currentPage = 0;
                $scope.Header = ['','',''];


                $scope.pagination = function () {
                    $scope.ItemsByPage = paged( $scope.filteredList, $scope.pageSize );
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
                    for (var i = input; i < total; i++) {
                        if (i != 0 && i != total - 1) {
                            ret.push(i);
                        }
                    }
                    return ret;
                };

                $scope.resetAll = function () {
                    $scope.filteredList = $scope.allItems;
                    //$scope.newEmpId = '';
                    //$scope.newName = '';
                    //$scope.newEmail = '';
                    //$scope.searchText = '';

                }

                $scope.sort = function(sortBy){
                    $scope.resetAll();

                    $scope.columnToOrder = sortBy;

                    //$Filter - Standard Service
                    $scope.filteredList = $filter('orderBy')($scope.filteredList, $scope.columnToOrder, $scope.reverse);

                    if($scope.reverse)
                        iconName = 'glyphicon glyphicon-chevron-up';
                    else
                        iconName = 'glyphicon glyphicon-chevron-down';

                    if(sortBy === 'EmpId')
                    {
                        $scope.Header[0] = iconName;
                    }
                    else if(sortBy === 'name')
                    {
                        $scope.Header[1] = iconName;
                    }else {
                        $scope.Header[2] = iconName;
                    }

                    $scope.reverse = !$scope.reverse;

                    $scope.pagination();
                };

                //By Default sort ny Name
                $scope.sort ('name');

            }, true)


            $scope.toggleDetail = function (d){
                console.log("detail",d);
            }



            // -------------------------------------------------------------------
            // LOADING SUBJECTS
            // -------------------------------------------------------------------
            $scope.model = {
                allSubjects     : undefined,
                filteredSubjects: undefined
            };

            var isLoading = false;

            // Load data when period changes
            function loadSubjects () {

                if(isLoading) return;
                isLoading = true;

                var from = moment($scope.datePickers.from.date).format('YYYY-MM-DD'),
                    to   = moment($scope.datePickers.to.date).format('YYYY-MM-DD'),
                    url  = 'https://ndr.registercentrum.se/api/Contact?APIKey=LkUtebH6B428KkPqAAsV&dateFrom=' + from +  '&dateTo=' + to + '&AccountID=' + $scope.accountModel.activeAccount.accountID;

                $http.get(url)
                    .success(function (data) {
                        $log.debug('Loaded Contacts', data);

                        var subjects = []
                        subjectsArray = _.toArray(_.groupBy(data, function (contact){
                            return contact.subject.socialNumber;
                        }));

                        _.each(subjectsArray, function (contactsArray, key){
                            var o = {
                                contacts : contactsArray,
                                aggregatedProfile : _.clone(_.first(contactsArray))
                            };

                            angular.extend(o, _.last(contactsArray).subject);

                            if (contactsArray.length > 1) {
                                _.each(o.aggregatedProfile, function (obj, key) {
                                    for (var i = 1, l = contactsArray.length; i < l; i++) {
                                        if (obj == null && contactsArray[i][key] !== null) {
                                            o.aggregatedProfile[key] = contactsArray[i][key];
                                            break;
                                        }
                                    }
                                });
                            }
                            subjects.push(o)
                        });

                        $log.debug('Loaded Subjects', subjects.length, subjects);

                        $scope.model.allSubjects = subjects;
                        $scope.model.allSubjectsLength = subjects.length;

                        isLoading = false;

                    });
            }

            $scope.$watch('datePickers.to.date', loadSubjects);
            $scope.$watch('datePickers.from.date', loadSubjects);


            // -------------------------------------------------------------------
            // FILTERING
            // -------------------------------------------------------------------

            // Fill additional filters from the API request for cancatct attributes
            $scope.filters = [];
            // dataService.getContactAttributes(filterNames)
            dataService.getContactAttributes()
                .then(function (filters) {
                    var required;

                    var toReject = ["gfr", "socialNumber", "pumpOngoingSerial", "pumpNewSerial", "contactDate"];

                    filters = _.reject(filters, function (d){
                        return toReject.indexOf(d.columnName) !== -1;
                    })


                    _.each(filters, function(filter, key){


                        if (filter.columnName  == 'age' ) {
                            filter.min = 0;
                            filter.max = 120;
                            filter.maxValue = 120;
                            filter.range = [0, 120];
                        }

                        if (filter.columnName  == 'smokingEndYear' ) {
                            filter.min = 1900;
                            filter.max = 2020;
                            filter.range = [1900, 2020];
                        }

                        if (filter.columnName  == 'yearOfOnset' ) {
                            filter.min = 1900;
                            filter.max = 2020;
                            filter.range = [1900, 2020];
                        }

                    })


                    // Make placeholder objects for the rest of the filters in the selectedFilters.additional
                    _.each(filters, function (filter, index) {
                        // If the filter is required choose it instantly
                        filter.isChosen = $scope.isRequired(filter.columnName);

                        $scope.selectedFilters[filter.columnName] = {};

                        // Setup min and max for range slider
                        // We need that for setting up the range slider directive
                        // .range is need to determine if something was acutally selected and there is need for filtering
                        if (_.isNumber(filter.maxValue)) {
                            $scope.selectedFilters[filter.columnName].min = filter.minValue || 0;
                            $scope.selectedFilters[filter.columnName].max = filter.maxValue;
                            $scope.selectedFilters[filter.columnName].range = [filter.minValue || 0, filter.maxValue];
                        }

                        if (filter.domain.name == 'Date') {
                            $scope.selectedFilters[filter.columnName].from = {
                                date: $filter('date')(new Date(new Date()-dateOffset), $scope.format),
                                opened : false
                            };
                            $scope.selectedFilters[filter.columnName].to = {
                                date: $filter('date')(new Date(), $scope.format),
                                opened : false
                            };
                        }

                    });

                    // Make sure that required filters are always first in the list
                    // Also make sure they are sorted alphabetically
                    required = _.remove(filters, 'isChosen');
                    filters = required.concat(_.sortBy(filters, 'question'));


                    // Set the available filters
                    $scope.filters = filters;
                });

            // Used to update the list of chosen filters
            $scope.chosenFilter = null;

            // Whenever the filter is chosen from the list of available filters
            // update the list of chosen filters
            $scope.$watch('chosenFilter', function (name) {
                if (name !== null) {
                    _.find($scope.filters, {columnName: name}).isChosen = true;
                    $scope.chosenFilter = null;
                }
            });

            $scope.isDisplayed = function (name) {
                return $scope.isRequired(name) || _.find($scope.filters, {columnName: name}).isChosen;
            }

            $scope.isRequired = function (name) {
                return _.indexOf(requiredFilters, name) !== -1;
            }

            // Chosen filters can be removed by the user
            $scope.removeChosenFilter = function (name) {
                _.find($scope.filters, {columnName: name}).isChosen = false;

                // Reset the selected filters
                // Reset range values
                if ($scope.selectedFilters[name].range) {
                    $scope.selectedFilters[name].min = $scope.selectedFilters[name].range[0];
                    $scope.selectedFilters[name].max = $scope.selectedFilters[name].range[1];
                } else {
                    $scope.selectedFilters[name] = {}
                }
            };

            $scope.selectedFilters = {};

            function filter () {
                // Check if there is anything to filter
                if (!$scope.model.allSubjectsLength) return;

                $log.debug('Changed Filters');

                var selectedFilters = $scope.selectedFilters,
                    subjects        = angular.copy($scope.model.allSubjects);

                // Check additional filters
                _.each(selectedFilters, function (filter, prop, list) {

                    if(prop == "hba1c") {
                        console.log("FILTER", filter, prop, list);
                    }

                    subjects = _.filter(subjects, function (subject) {
                        var value;

                        // if filter.undef is true it means that option for searching undefined values is checked
                        // so return only those that have null specified for this option
                        if (filter.undef) {
                            return _.isNull(subject[prop]) || _.isNull(subject.aggregatedProfile[prop]);

                            // Handle range filtering
                        } else if (_.isNumber(filter.min) && _.isNumber(filter.max) && (filter.min > filter.range[0] || filter.max < filter.range[1])) {

                            // prop may sit directly on the subject (sex) or on aggregatedProfile
                            // also, it can have 'code' or 'id' as the prop name, so check for both
                            return (_.isNumber(subject[prop]) && (subject[prop] >= filter.min && subject[prop] <= filter.max)) ||
                                (_.isNumber(subject.aggregatedProfile[prop]) && (subject.aggregatedProfile[prop] >= filter.min && subject.aggregatedProfile[prop] <= filter.max));

                        }
                        else if (filter.from && (_.isDate(filter.from.date) || _.isDate(filter.to.date))) {

                            //console.log(new Date(filter.from.date), new Date(filter.to.date ));
                            //console.log("Look", subject.aggregatedProfile[prop], _.isDate(subject.aggregatedProfile[prop], filter.from.date,  new Date(filter.from.date), new Date(filter.to.date) ));
                            var dateToLookFor = new Date(subject.aggregatedProfile[prop]);
                            return (_.isDate(dateToLookFor) && (dateToLookFor >= new Date(filter.from.date) && dateToLookFor <= new Date(filter.to.date)));

                            // Handle value filtering
                        } else if (!_.isNull(filter.value) && !_.isUndefined(filter.value)) {
                            value = parseInt(filter.value, 10);
                            // prop may sit directly on the subject (sex) or on aggregatedProfile
                            // also, it can have 'code' or 'id' as the prop name, so check for both
                            return subject[prop] === value || subject.aggregatedProfile[prop] === value;

                            // Nothing to filter
                        } else {
                            return true;
                        }
                    });
                });


                /*var subjects = _.toArray(_.groupBy(contacts, function(contact){
                 return contact.subject.subjectID
                 }));*/

                $scope.model.filteredSubjects = subjects;
                $scope.model.filteredSubjectsLength = subjects.length;

                $log.debug('Filtered subjects', subjects.length, subjects);
            }

            var debouncedFilter = _.debounce(function () {
                $scope.$apply(function () {
                    filter();
                })
            }, 400);


            $scope.$watch('selectedFilters', debouncedFilter, true);
            // $scope.$watch('selectedFilters.hbMax', debouncedFilter, true);
            // $scope.$watch('selectedFilters.diabetesTypes', filter, true);
            // $scope.$watch('selectedFilters.additional', filter, true);
            $scope.$watch('model.allSubjects', filter, true);

        }]);
