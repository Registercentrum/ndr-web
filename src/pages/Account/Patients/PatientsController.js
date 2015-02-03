angular.module('ndrApp')
    .controller('PatientsController', [
        '$scope', '$http', '$stateParams', '$state', '$log', '$filter', 'dataService', 'DTOptionsBuilder', 'DTColumnDefBuilder',
        function ($scope, $http, $stateParams, $state, $log, $filter, dataService, DTOptionsBuilder, DTColumnDefBuilder) {
            $log.debug('PatientsController: Init');

            var filterNames = ['diabetesType', 'hba1c', 'treatment', 'weight', 'height', 'antihypertensives', 'lipidLoweringDrugs'];
            // var filterNames = ['diabetesType', 'hba1c', 'treatment', 'weight', 'height', 'antihypertensives', 'lipidLoweringDrugs'];
            var requiredFilters = ['diabetesType', 'hba1c'];

            /* Date picker options */
            $scope.format = 'dd MMM yyyy';
            $scope.datePickers = {
                from: {
                    date: $filter('date')(new Date('2013-01-01'), $scope.format),
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



            // -------------------------------------------------------------------
            // DATA TABLES
            // -------------------------------------------------------------------

            // Table options
            $scope.dtOptions = {
                paginate : false,
                bFilter  : false,
                bRetrieve: true,
                order    : [[ 2, 'desc' ]],
                // bDestroy : false,
                language: {
                    sEmptyTable    : 'Tabellen innehåller ingen data',
                    sInfo          : 'Visar _START_ till _END_ av totalt _TOTAL_ rader',
                    sInfoEmpty     : 'Visar 0 till 0 av totalt 0 rader',
                    sInfoFiltered  : '(filtrerade från totalt _MAX_ rader)',
                    sInfoPostFix   : '',
                    sInfoThousands : ' ',
                    sLengthMenu    : 'Visa _MENU_ rader',
                    sLoadingRecords: 'Laddar...',
                    sProcessing    : 'Bearbetar...',
                    sSearch        : 'Sök:',
                    sZeroRecords   : 'Hittade inga matchande resultat',
                    oPaginate: {
                        sFirst   : 'Första',
                        sLast    : 'Sista',
                        sNext    : 'Nästa',
                        sPrevious: 'Föregående'
                    },
                    oAria: {
                        sSortAscending : ': aktivera för att sortera kolumnen i stigande ordning',
                        sSortDescending: ': aktivera för att sortera kolumnen i fallande ordning'
                    }
                }
            };

            $scope.dtColumnDefs = [
                DTColumnDefBuilder.newColumnDef(0).notSortable(),
                DTColumnDefBuilder.newColumnDef(4).notSortable()
            ];

            // Template function for additional visit rows in the table
            function format (visits) {
                return _.map(visits, function (visit) {
                    return [
                        '<tr class="visit-detail">',
                        '<td colspan="2"></td>',
                        '<td>' + $filter('date')(new Date(visit.contactDate), 'yyyy-MM-dd') + '</td>',
                        '<td>' + ((visit.bpDiastolic === null) ? '-' : visit.bpDiastolic) + '</td>',
                        '<td>' + ((visit.hba1c === null) ? '-' : visit.hba1c) + '</td>',
                        '<td></td>',
                        '</tr>'
                    ].join('');
                }).join('');
            }

            $scope.$on('event:dataTableLoaded', function (event, loadedDT) {
                var dt = loadedDT.DataTable,
                    detailRows = [],
                    visits;

                $('#Table--patients tbody').on('click', 'tr td:first-child', function () {
                    var tr = $(this).closest('tr'),
                        row = dt.row(tr),
                        idx = $.inArray(tr.attr('id'), detailRows);

                    if (row.child.isShown()) {
                        tr.removeClass('details');
                        row.child.hide();

                        // Remove from the 'open' array
                        detailRows.splice(idx, 1);
                    } else {
                        tr.addClass('details');
                        // find all the visits aka contacts for this patient
                        visits = _.find($scope.model.filteredSubjects, {socialNumber: row.data()[1]}).contacts;
                        // render them as child rows
                        row.child($(format(visits))).show();
                        // Add to the 'open' array
                        if (idx === -1) {
                            detailRows.push(tr.attr('id'));
                        }
                    }
                });

                // On each draw, loop over the `detailRows` array and show any child rows
                dt.on('draw', function () {
                    $.each(detailRows, function (i, id) {
                        $('#'+id+' td:first-child').trigger('click');
                    });
                });
            });



            // -------------------------------------------------------------------
            // LOADING SUBJECTS
            // -------------------------------------------------------------------
            $scope.model = {
                allSubjects     : undefined,
                filteredSubjects: undefined
            };

            // Load data when period changes
            function loadSubjects () {
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
            }, 50);


            $scope.$watch('selectedFilters', debouncedFilter, true);
            // $scope.$watch('selectedFilters.hbMax', debouncedFilter, true);
            // $scope.$watch('selectedFilters.diabetesTypes', filter, true);
            // $scope.$watch('selectedFilters.additional', filter, true);
            $scope.$watch('model.allSubjects', filter, true);

        }]);
