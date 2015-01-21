angular.module('ndrApp')
    .controller('PatientsController', [
        '$scope', '$http', '$stateParams', '$state', '$log', '$filter', 'DTOptionsBuilder', 'DTColumnDefBuilder',
        function ($scope, $http, $stateParams, $state, $log, $filter, DTOptionsBuilder, DTColumnDefBuilder) {
            $log.debug('PatientsController: Init');

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
                DTColumnDefBuilder.newColumnDef(5).notSortable()
            ];

            function format (visits) {
                var template = [];
                _.forEach(visits, function (visit) {
                    var tmp = [
                        '<tr class="visit-detail">',
                        '<td colspan="2"></td>',
                        '<td>' + $filter('date')(new Date(visit.contactDate), 'yyyy-MM-dd') + '</td>',
                        '<td>' + ((visit.bpDiastolic === null) ? '-' : visit.bpDiastolic) + '</td>',
                        '<td>' + ((visit.hba1c === null) ? '-' : visit.hba1c) + '</td>',
                        '<td></td>',
                        '</tr>'
                    ].join('');
                    template.push(tmp);
                });
                return $(template.join(''));
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
                        row.child(format(visits)).show();
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


            // Filters, copied from the API, augmented with display texts
            $scope.additionalFilters = {"diagnosisWorseSeeingEye": { "options": [{"id":2,"text":"Simplex retinopati"},{"id":3,"text":"PPDR"},{"id":4,"text":"KSM"},{"id":5,"text":"PDR"}], "text": "Diagnosis Worse Seeing Eye"},"treatment": { "options": [{"id":1,"text":"Enbart kost"},{"id":2,"text":"Tabletter"},{"id":3,"text":"Insulin"},{"id":4,"text":"Tabl. och insulin"},{"id":5,"text":"Okänd"},{"id":6,"text":"Injektion (GLP-1 analog)"},{"id":8,"text":"Inj. GLP-1 + tabletter"},{"id":9,"text":"Inj. GLP-1 + insulin"},{"id":10,"text":"Inj. GLP-1 + tabl och insulin"}], "text": "Treatment"},"insulinMethod": { "options": [{"id":1,"text":"Injektion"},{"id":2,"text":"Insulinpump"}], "text": "Insulin Method"},"pump": { "options": [{"id":1,"text":"AccuChek Combo"},{"id":2,"text":"AccuChek D-Tron"},{"id":3,"text":"AccuChek Spirit"},{"id":4,"text":"Animas 1200"},{"id":5,"text":"Animas 2010"},{"id":6,"text":"Animas 2012"},{"id":7,"text":"Animas 2020"},{"id":8,"text":"Animas Vibe"},{"id":9,"text":"Cozmo"},{"id":10,"text":"Dana R"},{"id":11,"text":"Dana IIS"},{"id":12,"text":"Minimed 504"},{"id":13,"text":"Minimed 508"},{"id":14,"text":"Omnipod"},{"id":15,"text":"Paradigm 511"},{"id":16,"text":"Paradigm 512"},{"id":17,"text":"Paradigm 515"},{"id":18,"text":"Paradigm 522"},{"id":19,"text":"Paradigm 523"},{"id":20,"text":"Paradigm VEO 554"},{"id":21,"text":"Paradigm 712"},{"id":22,"text":"Paradigm 722"},{"id":23,"text":"Paradigm VEO 754"},{"id":24,"text":"Paradigm VEO (Använd alt ovan)"},{"id":25,"text":"Paradigm 715"}], "text": "Pump"},"pumpIndication": { "options": [{"id":1,"text":"Glukossvängningar"},{"id":2,"text":"Högt HbA1c (ej inom patientens målområde)"},{"id":3,"text":"Frekventa hypoglykemier"},{"id":4,"text":"Fysisk aktivitet"},{"id":5,"text":"Gryningsfenomen"},{"id":6,"text":"”unawareness”"},{"id":7,"text":"Patientens önskemål"},{"id":8,"text":"Förenklad glukosbehandling (barnklinik)"}], "text": "Pump Indication"},"pumpClosureReason": { "options": [{"id":1,"text":"Bristande följsamhet/handhavande"},{"id":2,"text":"Patientens Önskemål"}], "text": "Pump Closure Reason"},"sex": { "options": [{"id":1,"text":"Man"},{"id":2,"text":"Kvinna"}], "text": "Sex"},"physicalActivity": { "options": [{"id":1,"text":"Aldrig    "},{"id":2,"text":"<1 ggr/vecka"},{"id":3,"text":"Regelbundet 1-2 ggr/vecka"},{"id":4,"text":"Regelbundet 3-5 ggr/vecka"},{"id":5,"text":"Dagligen"}], "text": "Physical Activity"},"hypoglycemiaSevere": { "options": [{"id":1,"text":"Ingen"},{"id":2,"text":"1-2"},{"id":3,"text":"3-5"},{"id":4,"text":">5"}], "text": "Hypoglycemia Severe"},"microscopicProteinuria": { "options": [{"id":1,"text":"Ja"},{"id":0,"text":"Nej"},{"id":2,"text":"Normaliserat värde"}], "text": "Microscopic Proteinuria"},"waran": { "options": [{"id":1,"text":"Ja"},{"id":0,"text":"Nej"}], "text": "Waran"},"footRiscCategory": { "options": [{"id":1,"text":"Frisk fot"},{"id":2,"text":"Neuropati, angiopati"},{"id":3,"text":"Tidigare diabetssår"},{"id":4,"text":"Pågående allvarlig fotsjukdom"}], "text": "Foot Risc Category"},"smokingHabit": { "options": [{"id":1,"text":"Aldrig varit rökare"},{"id":2,"text":"Röker dagligen"},{"id":3,"text":"Röker, men ej dagligen"},{"id":4,"text":"Slutat röka"}], "text": "Smoking Habit"}};
            // Get filter types with ids
            $scope.additionalFilterTypes = _.map($scope.additionalFilters, function (filter, index) { return {text: filter.text, id: index }; });

            $scope.selectedAdditionalFilter = null;
            $scope.selectedAdditionalFilters = {};

            $scope.$watch('selectedAdditionalFilter', function (newVal, oldVal) {
                if (newVal !== null) {
                    $scope.selectedAdditionalFilters[newVal] = $scope.additionalFilters[newVal];
                    $scope.selectedAdditionalFilter = null;
                }
            });

            $scope.removeAdditionalFIlter = function (key) {
                delete $scope.selectedAdditionalFilters[key];
                delete $scope.selectedFilters.additional[key];
            };

            // Active filters
            $scope.activeFilters = {
                diabetesTypes: [{
                    id: 0,
                    text: 'Alla typer'
                }, {
                    id: 1,
                    text: 'Typ 1 diabetes (inkl LADA)'
                }, {
                    id: 2,
                    text: 'Typ 2 diabetes (inkl MODY)'
                }, {
                    id: 3,
                    text: 'Sekundär diabetes (t ex pancreatit)'
                }, {
                    id: 4,
                    text: 'Oklart'
                }, {
                    id: 5,
                    text: 'Prediabetes'
                }]
            };

            $scope.selectedFilters = {
                diabetesTypes: 0,
                hbMin        : 0,
                hbMax        : 200,
                additional   : {}
            };

            _.each($scope.additionalFilterTypes, function (filter, index) {
                console.log(index);
                $scope.selectedFilters.additional[filter.id] = {};
            });

            $scope.model = {
                allSubjects     : undefined,
                filteredSubjects: undefined
            };

            var debouncedFilter = _.debounce(function () {
                $scope.$apply(function () {
                    filter();
                })
            }, 50);

            $scope.$watch('datePickers.to.date', loadSubjects);
            $scope.$watch('datePickers.from.date', loadSubjects);

            $scope.$watch('selectedFilters.hbMin', debouncedFilter, true);
            $scope.$watch('selectedFilters.hbMax', debouncedFilter, true);
            $scope.$watch('selectedFilters.diabetesTypes', filter, true);
            $scope.$watch('selectedFilters.additional', filter, true);
            $scope.$watch('model.allSubjects', filter, true);


            function filter () {

                $log.debug('Changed Filters');

                var selectedFilters = $scope.selectedFilters,
                    subjects        = angular.copy($scope.model.allSubjects);

                if ('hbMin' in selectedFilters) {
                    subjects = _.filter(subjects, function (d) {
                        return d.aggregatedProfile.hba1c > selectedFilters.hbMin && d.aggregatedProfile.hba1c < selectedFilters.hbMax;
                    });
                }

                if ('diabetesTypes' in selectedFilters && selectedFilters.diabetesTypes != 0) {
                    subjects = _.filter(subjects, function (d) {
                        $log.debug(d.aggregatedProfile.subject);
                        if (d.aggregatedProfile.subject.diabetesType == null) return;
                        return d.aggregatedProfile.subject.diabetesType.id == selectedFilters.diabetesTypes;
                    });
                }

                // Check additional filters
                _.each(selectedFilters.additional, function (filter, prop, list) {
                    subjects = _.filter(subjects, function (subject) {
                        var value;
                        // if filter.undef is true it means that option for searching undefined values is checked
                        // so return only those that have null specified for this option
                        if (filter.undef) {
                            return subject[prop] === null || subject.aggregatedProfile[prop] === null;
                        } else if (filter.value !== null && typeof filter.value !== 'undefined') {
                            value = parseInt(filter.value, 10);
                            // prop may sit directly on the subject (sex) or on aggregatedProfile
                            // also, it can have 'code' or 'id' as the prop name, so check for both
                            return (subject[prop] && (subject[prop].id === value || subject[prop].code === value)) ||
                                (subject.aggregatedProfile[prop] && (subject.aggregatedProfile[prop].id === value || subject.aggregatedProfile[prop].code === value));
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
        }]);