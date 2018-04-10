'use strict';

angular.module('ndrApp')
    .directive('incidenceForm', ['$q', 'dataService', 'calcService', '$state', '$modal', '$filter', function($q, dataService, calcService, $state, $modal, $filter) {

        function link(scope, element, attrs) {

            scope.activeAccount = scope.accountModel.activeAccount;
            scope.serverSaveErrors = [];
            scope.isLoaded = false;
            scope.age = null;
            scope.config = {
                onChange: {
                    incHeight: function(qscope) {
                        var isValid = (qscope.model.incHeight >= qscope.question.minValue && qscope.model.incHeight <= qscope.question.maxValue);
                        qscope.model.incBMI = isValid ? qscope.methods.tryCalculateBMI(qscope.model.incWeight, qscope.model.incHeight) : null;
                        qscope.model.incBMISDS = isValid ? qscope.methods.tryCalculateBMISDS(qscope.model.incBMI, qscope.model.incDate, qscope.subject) : null;
                    },
                    incWeight: function(qscope) {
                        var isValid = (qscope.model.incWeight >= qscope.question.minValue && qscope.model.incWeight <= qscope.question.maxValue);
                        qscope.model.incBMI = isValid ? qscope.methods.tryCalculateBMI(qscope.model.incWeight, qscope.model.incHeight) : null;
                        qscope.model.incBMISDS = isValid ? qscope.methods.tryCalculateBMISDS(qscope.model.incBMI, qscope.model.incDate, qscope.subject) : null;
                    }
                },
                methods: {
                    tryCalculateBMI: function(height, weight) {
                        if (weight > 0 && height > 0) {
                            return calcService.calcBMI(height, weight, 1);
                        }

                        return null;
                    },
                    tryCalculateBMISDS: function(bmi, date, subject) {
                        if (bmi > 0 && date) {
                            var age = calcService.calcAge(subject.socialNumber, date)
                            return calcService.calcBMISDS(bmi, subject.sex, age, 1); //bmi, sex, age, precision
                        }

                        return null;
                    },
                    tryCalculateBPSystolicSDS: function() {

                        if (!scope.model.incBPSystolic || !scope.subject.sex || !scope.age || !scope.model.incHeight) return null;

                        scope.model.incBPSystolicSDS = calcService.calcSystSDS(scope.model.incBPSystolic, scope.subject.sex, scope.age, scope.model.incHeight, 1); //bpSystolic, sex, age, height, precision

                    },
                    tryCalculateIncBPDiastolicSDS: function() {
                        if (!scope.model.incBPDiastolic || !scope.subject.sex || !scope.age || !scope.model.incHeight) return null;

                        scope.model.incBPDiastolicSDS = calcService.calcDiastSDS(scope.model.incBPDiastolic, scope.subject.sex, scope.age, scope.model.incHeight, 1); //bpSystolic, sex, age, height, precision
                    }

                }
            };


            scope.$on('newUser', scope.load);

            scope.$watch('subject', function(newValue) {
                scope.init();
            });

            scope.init = function() {
                scope.setOnChange();
                scope.setModel();
                scope.setGroups();
                scope.incidenceForm.$setPristine();
            };

            scope.setOnChange = function() {
                for (var qc in scope.config.onChange) {
                    scope.questions.forEach(function(q) {
                        if (q.columnName == qc) {
                            q.onChange = scope.config.onChange[qc];
                        }
                    });
                }
            }

            scope.setGroups = function() {

                var groups = [
                    {
                        header: null,
                        columnNames: ['incDate', 'incDiagnosisSweden','incHeight', 'incWeight', 'incBMI', 'incBMISDS', 'incBPSystolic', 'incBPDiastolic'],
                        questions: []
                    },
                    {
                        header: 'Insjuknandesymtom',
                        columnNames: ['incPolyuri', 'incPolydipsi', 'incWeightloss', 'incAcantosisNigricans'],
                        questions: []
                    },
                    {
                        header: 'Prover första dygnet',
                        columnNames: ['incFDPH', 'incFDSB', 'incFDPG', 'incFDHbA1c', 'incFDBK', 'incHap1', 'incHap2', 'incGAD', 'incOCell', 'incCPep', 'incIAA', 'incIA2RBA', 'incZnt8A'],
                        questions: []
                    }
                ];

                groups.forEach(function(g) {
                  g.columnNames.forEach(function(c) {
                    scope.questions.forEach(function(q) {
                        if (c == q.columnName) g.questions.push(q);
                    });
                  });
                });
                console.log('groups',groups);
                scope.groups = groups;
            }

            scope.getQuestionClass = function(hasError, hasValue) {
                if (hasError) return 'has-error';

                return hasValue ? 'has-value' : 'has-no-error';
            };

            scope.setModel = function() {
                scope.model = scope.subject ? scope.getModel(scope.subject.incidence, scope.subject.socialNumber, scope.subject.subjectID) : scope.getModel();
                scope.setAge();
                scope.setIncBPSystolicSDS();
                scope.setIncBPDiastolicSDS();
            };

            scope.filterValue = function($event) {
                if (isNaN(String.fromCharCode($event.keyCode)) && $event.keyCode !== 44 && $event.keyCode !== 46) {
                    $event.preventDefault();
                }
            };

            scope.setAge = function() {
                scope.age = scope.model.incDate ? calcService.calcAge(scope.subject.socialNumber, scope.model.incDate) : null;
            }

            //todo build model dynamically
            scope.getModel = function(incidence, socialNumber, subjectID) {
                return {
                    socialNumber: socialNumber,
                    subjectID: subjectID,
                    incDate: (incidence ? incidence.incDate : null),
                    incDiagnosisSweden: (incidence ? incidence.incDiagnosisSweden : null),
                    incPolyuri: (incidence ? incidence.incPolyuri : null),
                    incPolydipsi: (incidence ? incidence.incPolydipsi : null),
                    incWeightloss: (incidence ? incidence.incWeightloss : null),
                    incAcantosisNigricans: (incidence ? incidence.incAcantosisNigricans : null),
                    incHeight: (incidence ? incidence.incHeight : null),
                    incWeight: (incidence ? incidence.incWeight : null),
                    incBMI: (incidence ? incidence.incBMI : null),
                    incBMISDS: (incidence ? incidence.incBMISDS : null),
                    incBPSystolic: (incidence ? incidence.incBPSystolic : null),
                    incBPDiastolic: (incidence ? incidence.incBPDiastolic : null),
                    incFDPH: (incidence ? incidence.incFDPH : null),
                    incFDSB: (incidence ? incidence.incFDSB : null),
                    incFDBE: (incidence ? incidence.incFDBE : null),
                    incFDPG: (incidence ? incidence.incFDPG : null),
                    incFDHbA1c: (incidence ? incidence.incFDHbA1c : null),
                    incFDBK: (incidence ? incidence.incFDBK : null),
                    incDone: (incidence != null ? incidence.incDone : false),
                    incGAD: (incidence ? incidence.incGAD : null),
                    incOCell: (incidence ? incidence.incOCell : null),
                    incCPep: (incidence ? incidence.incCPep : null),
                    incHap1: (incidence ? incidence.incHap1 : null),
                    incHap2: (incidence ? incidence.incHap2 : null),
                    incIAA: (incidence ? incidence.incIAA : null),
                    incIA2RBA: (incidence ? incidence.incIA2RBA : null),
                    incZnt8A: (incidence ? incidence.incZnt8A : null)

                    //incBPSystolicSDS: null,
                    //incBPDiastolicSDS: null,
                };
            };
            scope.setIncBPSystolicSDS = function() {

                if (!scope.model.incBPSystolic || !scope.subject.sex || !scope.age || !scope.model.incHeight) return null;

                scope.model.incBPSystolicSDS = calcService.calcSystSDS(scope.model.incBPSystolic, scope.subject.sex, scope.age, scope.model.incHeight, 1); //bpSystolic, sex, age, height, precision

            }
            scope.setIncBPDiastolicSDS = function() {
                if (!scope.model.incBPDiastolic || !scope.subject.sex || !scope.age || !scope.model.incHeight) return null;

                scope.model.incBPDiastolicSDS = calcService.calcDiastSDS(scope.model.incBPDiastolic, scope.subject.sex, scope.age, scope.model.incHeight, 1); //bpSystolic, sex, age, height, precision
            }
            scope.tryCalculateBMI = function() {

                if (scope.model.incWeight > 0 && scope.model.incHeight > 0) {

                    scope.model.incBMI = calcService.calcBMI(scope.model.incWeight, scope.model.incHeight, 1);
                    //Calc BMISDS
                    console.log('bmi', scope.model.incBMI);

                    if (scope.model.incBMI && scope.age) {
                        scope.model.incBMISDS = calcService.calcBMISDS(scope.model.incBMI, scope.subject.sex, scope.age, 1); //bmi, gender, age, precision
                    }

                } else {
                    scope.model.incBMI = null;
                }
            };

            //START datePicker example
            scope.today = function() {
                scope.contactModel.incidenceDate = new Date();
            };

            scope.clear = function() {
                scope.contactModel.incidenceDate = null;
            };

            scope.datePickers = {
                incDate: {
                    //date: $filter('date')(new Date(), scope.format),
                    opened: false
                }
            };

            // Disable future dates
            scope.disabled = function(date, mode) {
                var d = new Date();
                return date >= d.setDate(d.getDate() + 1) //no future
            };

            scope.toggleMin = function() {
                scope.minDate = scope.minDate ? null : new Date();
            };
            scope.toggleMin();

            scope.openPicker = function($event, dateField) {
                $event.preventDefault();
                $event.stopPropagation();
                scope.datePickers[dateField].opened = true;
            };

            scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };

            scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'yyyy.MM.dd', 'shortDate'];
            scope.format = scope.formats[0];
            //END datePicker

            //Todo, this could use an overview
            scope.validateContactDateInput = function() {
                var date = scope.incidenceForm.incidenceDate.$viewValue;
                var isValid = true;

                if (scope.contactModel.incidenceDate === undefined) {
                    isValid = false;
                }

                isValid = scope.validateDate(date);

                scope.incidenceForm.incidenceDate.$setValidity('checkInput', isValid);

                return isValid;

            };

            scope.validateDate = function(viewVal) {
                var isValid = true;

                if (typeof viewVal === 'string')
                    if (viewVal.length !== 10)
                        isValid = false;

                return isValid;
            };

            scope.getStringDate = function(date) {

                if (typeof date === 'string')
                    return date;
                if (date === undefined)
                    return;
                if (date === null)
                    return;
                if (!(date instanceof Date && !isNaN(date.valueOf())))
                    return

                var yyyy = date.getFullYear().toString();
                var mm = (date.getMonth() + 1).toString(); // getMonth() is zero-based
                var dd = date.getDate().toString();

                return (yyyy + '-' + (mm[1] ? mm : "0" + mm[0]) + '-' + (dd[1] ? dd : "0" + dd[0]));
            };

            scope.setDateValues = function() {
                scope.model.incDate = scope.getStringDate(scope.model.incDate);
            };

            scope.saveForm = function() {

                scope.serverSaveErrors = [];
                scope.isSaving = true;

                //Dates are javascript dates until saved, here converted to string dates, better idea?
                scope.setDateValues();
                dataService.saveIncidence(scope.model, scope.subject.incidence)
                    .then(function(response) {

                        //scope.getSubject(false);
                        scope.isSaving = false;

                        $modal.open({
                            templateUrl: 'myModalContent.html',
                            controller: 'ModalInstanceCtrl',
                            backdrop: true,
                            scope: scope
                        });
                    })['catch'](function(response) {
                        //todo behöver utökas

                        var data = response.data;

                        if (data.ModelState != null) {
                            for (var prop in data.ModelState) {
                                if (data.ModelState.hasOwnProperty(prop)) scope.serverSaveErrors.push(data.ModelState[prop][0]);
                            }
                        } else {
                            scope.serverSaveErrors.push('Ett okänt fel inträffade. Var god försök igen senare.');
                        }

                        scope.isSaving = false;
                    });
            };

            scope.removeItemFromArray = function(array, id) {
                return $filter('filter')(scope.subject.contacts, function(d) {
                    return d.contactID !== id;
                });
            };

            scope.init();
        }

        return {
            restrict: 'A',
            templateUrl: 'src/components/IncidenceForm/IncidenceForm.html',
            link: link,
            scope: {
                accountModel: '=',
                subject: '=',
                questions: '='
            }
        };
    }]);
