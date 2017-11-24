'use strict';

angular.module('ndrApp')
    .directive('incidenceForm', ['$q','dataService','$state', '$modal', '$filter', function($q, dataService, $state, $modal, $filter) {

        function link (scope, element, attrs) {
		
			scope.activeAccount = scope.accountModel.activeAccount;
			scope.serverSaveErrors  = [];
			scope.questions = null;
			scope.isLoaded = false;
			scope.$on('newUser', scope.load);
			
            scope.$watch('subject', function(newValue) {
				console.log('new subject', newValue);
				scope.init();
            });
			
			scope.init = function() {
				if (scope.isLoaded) {
					console.log('questions=',scope.questions);
					scope.setModel();
					scope.incidenceForm.$setPristine();
				}
				else {
					scope.load();
				}
			};

			scope.setModel = function () {
				console.log('subject=', scope.subject);
				scope.incidenceModel = scope.subject ? scope.getModel(scope.subject.incidence,scope.subject.subjectID) : scope.getModel();
			};
			
			scope.load = function() {
				scope.getQuestions();
			};
			
			//Start
			scope.filterValue = function($event){
				if(isNaN(String.fromCharCode($event.keyCode)) && $event.keyCode !== 44 && $event.keyCode !== 46){
					$event.preventDefault();
				}
			};
			
			scope.getQuestions = function() {
			
				scope.data = dataService.getFormFields(2);
				
				if (!scope.questions) {
					dataService.getMetaFields(scope.activeAccount.accountID).then(function (data) {
						scope.setQuestions(data);
						scope.isLoaded = true;
						return;
					});
				} else {
					scope.setQuestions(data);
				}
			};	
			
			scope.setQuestions = function(data) {
				scope.questions = _.indexBy(dataService.getFormFields(2), "columnName");
			};
			
			scope.getModel = function(incidence, subjectID) {
				return {
					subjectID: subjectID,
					incDate: (incidence ? incidence.incDate : null),
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
					incFDBK: (incidence ? incidence.incFDBK : null)
				};
			};

			scope.tryCalculateBMI = function () {
			
				console.log('calcBMI',scope.incidenceModel);
				if (scope.incidenceModel.incWeight > 0 && scope.incidenceModel.incHeight > 0) {
					scope.incidenceModel.incBMI = parseFloat((scope.incidenceModel.incWeight / Math.pow(scope.incidenceModel.incHeight/100,2)).toFixed(1));
				} else {
					scope.incidenceModel.incBMI = null;
				}
			};

			//START datePicker example
			scope.today = function() {
			  scope.contactModel.incidenceDate = new Date();
			};

			scope.clear = function () {
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
						
				scope.incidenceForm.incidenceDate.$setValidity('checkInput',isValid);
				
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
			  var mm = (date.getMonth()+1).toString(); // getMonth() is zero-based
			  var dd  = date.getDate().toString();

			  return (yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]));
			};

			scope.setDateValues = function() {
			  scope.incidenceModel.incDate = scope.getStringDate(scope.incidenceModel.incDate);
			};

			scope.saveForm = function () {

			  scope.serverSaveErrors = [];
			  scope.isSaving = true;

			  //Dates are javascript dates until saved, here converted to string dates, better idea?
			  scope.setDateValues();
				console.log(scope.incidenceModel);
			  dataService.saveIncidence(scope.incidenceModel, scope.subject.incidence)
				.then(function (response) {
				
					//scope.getSubject(false);
					scope.isSaving = false;

					$modal.open({
					  templateUrl: 'myModalContent.html',
					  controller : 'ModalInstanceCtrl',
					  backdrop   : true,
					  scope      : scope
					});
				})
				['catch'](function (response) {
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
			  return $filter('filter')(scope.subject.contacts, function (d)
			  {
				return d.contactID !== id;
			  });
			};
			
			scope.init();

			/*incHeight	30	240
			incWeight	0,4	200
			incBMI	5	60
			incBMISDS	-20	20*/
	
			
			scope.patternBMI = (function() {
				return {
					test: function(input) {
						if(input < 5 || input > 60){
							return false;
						} else{
							return true;
						}
					}
				};
			})();
			
			scope.patternHbA1c = (function() {
				return {
					test: function(input) {
						if(input < 20 || input > 177){
							return false;
						} else{
							return true;
						}
					}
				};
			})();
			
			scope.patternWeight = (function() {
				return {
					test: function(input) {
						if(input < 0.4 || input > 200){
							return false;
						} else{
							return true;
						}
					}
				};
			})();
			
			scope.patternHeight = (function() {
				return {
					test: function(input) {
						if(input < 30 || input > 240){
							return false;
						} else{
							return true;
						}
					}
				};
			})();

        }
        return {
            restrict : 'A',
            templateUrl: 'src/components/IncidenceForm/IncidenceForm.html',
            link: link,
            scope: {
				accountModel 	: '=',
                subject 		: '='
            }
        };
    }]);