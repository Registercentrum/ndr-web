'use strict';

angular.module('ndrApp')
    .directive('reportForm', ['$q','dataService','$state', '$modal', '$filter', function($q, dataService, $state, $modal, $filter) {

        function link (scope, element, attrs) {
		
			console.log(scope.contactToUpdate);
			console.log(scope.accountModel.activeAccount);

			scope.activeAccount = scope.accountModel.activeAccount;
			scope.serverSaveErrors  = [];
			scope.minYear          = null; //Används för "År rökslut"
			scope.maxYear          = new Date().getFullYear(); //Används för "År rökslut"
			scope.optionalQuestions = null;
			scope.lists              = null;
			
			scope.$on('newUser', scope.load);
			
            scope.$watch('contactToUpdate', function(newValue) {
				console.log('new contactToUpdate', newValue);
				scope.init();
            });
			
			scope.init = function() {
				if (scope.isLoaded) {
					scope.setContact();
				}
				else {
					scope.load();
				}
			};

			scope.setContact = function () {
				if (scope.subject) {
					scope.lastContact = scope.subject.contacts.length>0 ? scope.subject.contacts[0] : null;
					scope.setOptionalQuestionsValue();
					scope.contactModel = !scope.contactToUpdate ? scope.getNewContactModel() : scope.getUpdateModel();
					scope.showPumpProblem = scope.contactModel.pumpProblemKeto || scope.contactModel.pumpProblemHypo || scope.contactModel.pumpProblemSkininfection || scope.contactModel.pumpProblemSkinreaction  || scope.contactModel.pumpProblemPumperror;
					scope.showPumpClosureReason = scope.contactModel.pumpClosureReason > 0;
					scope.contactDateChanged();
					
					scope.contactForm.$setPristine();
					scope.contactOptionalForm.$setPristine();
				}
			};
			
			scope.load = function() {
				scope.getOptionalQuestions();
				scope.getContactAttributes();
			};
			
			/*scope.getList = function(listName) {
				return this.lists[listName];
			}*/
			
			scope.tryIsLoaded = function() {
				if (scope.lists && scope.optionalQuestions) {
					scope.isLoaded = true
					scope.init();
					return;
				}
				
				scope.isLoaded = false
			};
			//Start
			scope.filterValue = function($event){
				if(isNaN(String.fromCharCode($event.keyCode)) && $event.keyCode !== 44 && $event.keyCode !== 46){
					$event.preventDefault();
				}
			};		
			
			
			/*$scope.newContact = function () {
				//$scope.setContact(0);
				$scope.contactToUpdate = null;
				$scope.view = 'ReportForm';
				//$scope.contactModel = $scope.getNewContactModel();
			};*/
			
			/*scope.getOptionalQuestions = function() {
				dataService.getOptionalQuestionsMeta(scope.activeAccount.accountID, function (data) {
					scope.optionalQuestions = data;
				});
			};

			scope.$on('newUser', scope.getOptionalQuestions);

			if (scope.activeAccount) scope.getOptionalQuestions();*/

			scope.getOptionalQuestions = function() {
			
				scope.optionalQuestions = dataService.getValue('optionalQuestions');
				
				if (!scope.optionalQuestions) {
					dataService.getOptionalQuestions(scope.activeAccount.accountID).then(function (data) {
						scope.optionalQuestions = dataService.getValue('optionalQuestions');
						scope.tryIsLoaded();
						return;
					});
				} else {
					scope.tryIsLoaded();
				}
				
			};	
			
			scope.getContactAttributes = function() {
			
				scope.lists = dataService.getValue('attributesLists');
				
				if (!scope.optionalQuestions) {
					dataService.getAttributesLists(scope.activeAccount.accountID).then(function (data) {
						scope.lists = dataService.getValue('attributesLists');
						scope.tryIsLoaded();
						return;
					});
				} else {
					scope.setOptionalQuestionsValue();
					scope.tryIsLoaded();
				}
			};	
			
		   scope.setOptionalQuestionsValue = function() {
			  
			  var iterateAttributes = ['dal','das'];
			  
			  angular.forEach(scope.optionalQuestions, function(q) {
				q.value = "";
				
				if (scope.contactToUpdate) { //update contact
				  if (scope.contactToUpdate.optionals) {
					if (scope.contactToUpdate.optionals[q.columnName] != undefined) {
						q.iterate = false;
						q.value = scope.contactToUpdate.optionals[q.columnName];
					}
				  }
				} else { //new contact => iterate values
					if (iterateAttributes.indexOf(q.columnName) != -1) {
						if (scope.lastContact != null)
							if (scope.lastContact.optionals != null)
								if (scope.lastContact.optionals[q.columnName] != undefined) {
									q.iterate = true;
									q.value = scope.lastContact.optionals[q.columnName];
								}
					}
				}
			  });
			}
			
			scope.getNewContactModel = function () {
				return scope.getNewModel(scope.lastContact);
			};
			
			scope.getUpdateModel = function() {

			  return {
				contactID: scope.contactToUpdate.contactID,
				socialNumber: scope.subject.socialNumber,
				diabetesType: scope.subject.diabetesType,
				yearOfOnset: scope.subject.yearOfOnset,
				contactDate: scope.contactToUpdate.contactDate.split('T')[0],
				hba1c: scope.contactToUpdate.hba1c,
				cgm: scope.contactToUpdate.cgm,
				cgmType: scope.contactToUpdate.cgmType,
				treatment: scope.contactToUpdate.treatment,
				insulinMethod: scope.contactToUpdate.insulinMethod,
				pumpIndication: scope.contactToUpdate.pumpIndication,
				pumpOngoing: scope.contactToUpdate.pumpOngoing,
				pumpOngoingSerial: scope.contactToUpdate.pumpOngoingSerial,
				pumpNew: scope.contactToUpdate.pumpNew,
				pumpNewSerial: scope.contactToUpdate.pumpNewSerial,
				pumpProblemKeto: scope.contactToUpdate.pumpProblemKeto>0,
				pumpProblemHypo: scope.contactToUpdate.pumpProblemHypo>0,
				pumpProblemSkininfection: scope.contactToUpdate.pumpProblemSkininfection>0,
				pumpProblemSkinreaction: scope.contactToUpdate.pumpProblemSkinreaction>0,
				pumpProblemPumperror: scope.contactToUpdate.pumpProblemPumperror>0,
				pumpClosureReason: scope.contactToUpdate.pumpClosureReason,
				height: scope.contactToUpdate.height,
				weight: scope.contactToUpdate.weight,
				waist: scope.contactToUpdate.waist,
				bmi: scope.contactToUpdate.bmi,
				bpSystolic: scope.contactToUpdate.bpSystolic,
				bpDiastolic: scope.contactToUpdate.bpDiastolic,
				antihypertensives: scope.contactToUpdate.antihypertensives,
				lipidLoweringDrugs: scope.contactToUpdate.lipidLoweringDrugs,
				aspirin: scope.contactToUpdate.aspirin,
				macroscopicProteinuria: scope.contactToUpdate.macroscopicProteinuria,
				microscopicProteinuria: scope.contactToUpdate.microscopicProteinuria,
				creatinine: scope.contactToUpdate.creatinine,
				gfr: scope.contactToUpdate.gfr,
				cholesterol: scope.contactToUpdate.cholesterol,
				triglyceride: scope.contactToUpdate.triglyceride,
				hdl: scope.contactToUpdate.hdl,
				ldl: scope.contactToUpdate.ldl,
				ischemicHeartDisease: scope.contactToUpdate.ischemicHeartDisease,
				cerebrovascularDisease: scope.contactToUpdate.cerebrovascularDisease,
				fundusExaminationDate: scope.contactToUpdate.fundusExaminationDate != null ? scope.contactToUpdate.fundusExaminationDate.split('T')[0] : null,
				diagnosisWorseSeeingEye: scope.contactToUpdate.diagnosisWorseSeeingEye,
				visualLoss: scope.contactToUpdate.visualLoss,
				laserTreatment: scope.contactToUpdate.laserTreatment,
				footExaminationDate: scope.contactToUpdate.footExaminationDate != null ? scope.contactToUpdate.footExaminationDate.split('T')[0] : null,
				footRiscCategory: scope.contactToUpdate.footRiscCategory,
				diabeticRetinopathy: scope.contactToUpdate.diabeticRetinopathy,
				smokingHabit: scope.contactToUpdate.smokingHabit,
				smokingEndYear: scope.contactToUpdate.smokingEndYear,
				physicalActivity: scope.contactToUpdate.physicalActivity,
				hypoglycemiaSevere: scope.contactToUpdate.hypoglycemiaSevere,
				optionals: null
			  }
			};
			
			scope.getNewModel = function(lastContact) {
			  
			  return {
				contactID: null,
				socialNumber: scope.subject != null ? scope.subject.socialNumber : null,
				diabetesType: scope.subject != null ? scope.subject.diabetesType : null,
				yearOfOnset: scope.subject != null ? scope.subject.yearOfOnset : null,
				contactDate: $filter('date')(new Date(), scope.format),
				hba1c: null,
				cgm: lastContact != null ? lastContact.cgm : null,
				cgmType: lastContact != null ? lastContact.cgmType : null,
				treatment: lastContact != null ? lastContact.treatment : null,
				insulinMethod: lastContact != null ? (lastContact.treatment == 3 || lastContact.treatment == 9) ? lastContact.insulinMethod : null : null,
				pumpIndication: lastContact != null ? lastContact.pumpIndication : null,
				pumpOngoing: lastContact != null ? (lastContact.pumpNew != null ? lastContact.pumpNew : lastContact.pumpOngoing) : null,
				pumpOngoingSerial: lastContact != null ? (lastContact.pumpNew != null ? lastContact.pumpNewSerial : lastContact.pumpOngoingSerial) : null,
				pumpNew: null,
				pumpNewSerial: null,
				pumpProblemKeto: null,
				pumpProblemHypo: null,
				pumpProblemSkininfection: null,
				pumpProblemSkinreaction: null,
				pumpProblemPumperror: null,
				pumpClosureReason: lastContact != null ? lastContact.pumpClosureReason : null,
				height: lastContact != null ? lastContact.height : null,
				weight: null,
				waist: null,
				bmi: null,
				bpSystolic: null,
				bpDiastolic: null,
				antihypertensives: lastContact != null ? lastContact.antihypertensives : null,
				lipidLoweringDrugs: lastContact != null ? lastContact.lipidLoweringDrugs : null,
				aspirin:  lastContact != null ? lastContact.aspirin : null,
				macroscopicProteinuria: lastContact != null ? lastContact.macroscopicProteinuria : null,
				microscopicProteinuria: lastContact != null ? lastContact.microscopicProteinuria : null,
				creatinine: null,
				gfr: null,
				cholesterol: null,
				triglyceride: null,
				hdl: null,
				ldl: null,
				ischemicHeartDisease: lastContact != null ? lastContact.ischemicHeartDisease : null,
				cerebrovascularDisease: lastContact != null ? lastContact.cerebrovascularDisease : null,
				fundusExaminationDate: lastContact != null ? lastContact.fundusExaminationDate != null ? lastContact.fundusExaminationDate.split('T')[0] : null : null,
				diagnosisWorseSeeingEye: lastContact != null ? lastContact.diagnosisWorseSeeingEye : null,
				visualLoss: lastContact != null ? lastContact.visualLoss : null,
				laserTreatment: lastContact != null ? lastContact.laserTreatment : null,
				footExaminationDate: lastContact != null ? lastContact.footExaminationDate != null ? lastContact.footExaminationDate.split('T')[0] : null : null,
				footRiscCategory: null,
				diabeticRetinopathy: lastContact != null ? lastContact.diabeticRetinopathy : null,
				smokingHabit: lastContact != null ? (lastContact.smokingHabit == 1 ? 1 : null ): null,
				smokingEndYear: null,
				physicalActivity: null,
				hypoglycemiaSevere: null,
				optionals: null
			  }
			};
			
			scope.deleteContact = function (contactID) {
				dataService.deleteContact(contactID)
					.then(function () {
						scope.subject.contacts = scope.removeItemFromArray(scope.subject.contacts, contactID);
						scope.contactModel     = scope.getNewContactModel();
					});
			};

			scope.togglePumpProblem = function () {
				scope.showPumpProblem = !scope.showPumpProblem;
			};

			scope.togglePumpClosureReason = function () {
				scope.showPumpClosureReason = !scope.showPumpClosureReason;
			};

			scope.insulinMethodChanged = function () {
				if (scope.contactModel.insulinMethod !== 2) {
					scope.contactModel.pumpNew = null;
				}
			};

			scope.treatmentChanged = function () {
				if (!(scope.contactModel.treatment == 3 || scope.contactModel.treatment == 4 || scope.contactModel.treatment == 9 || scope.contactModel.treatment == 10)) {
					scope.contactModel.insulinMethod = null;
					scope.contactModel.cgm = null;
					scope.contactModel.cgmType = null;
				}
			};

			scope.calculateLDL = function () {
				var calculatedLDL = parseFloat(parseFloat(scope.contactModel.cholesterol - scope.contactModel.hdl - 0.45 * scope.contactModel.triglyceride).toFixed(1));
				scope.contactModel.ldl = calculatedLDL;
			};

			scope.tryCalculateBMI = function () {
				if (scope.contactModel.weight > 0 && scope.contactModel.height > 0) {
					scope.contactModel.bmi = parseFloat((scope.contactModel.weight / Math.pow(scope.contactModel.height/100,2)).toFixed(1));
				} else {
					scope.contactModel.bmi = null;
				}
			};

			scope.tryCalculateGFR = function() {
				
			  if (scope.contactModel.creatinine == null || scope.contactModel.contactDate == null) {
				scope.contactModel.gfr = null;
				return;
			  }

			  var femaleFactor = 0.742;
			  var contactDate = new Date(scope.contactModel.contactDate.substring(0,4),scope.contactModel.contactDate.substring(5,7)-1,scope.contactModel.contactDate.substring(8,10));
			  var birthDate = new Date(scope.subject.socialNumber.substring(0,4),scope.subject.socialNumber.substring(4,6)-1,scope.subject.socialNumber.substring(6,8));
			  var age = Math.floor(scope.calculateAge(birthDate, contactDate));
			  var gfr = 175*Math.pow((scope.contactModel.creatinine/88.4),-1.154)*Math.pow(age,-0.203)*(scope.subject.sex == 2 ? femaleFactor : 1);

			  scope.contactModel.gfr = parseFloat(gfr.toFixed(2));

			};
			
			scope.calculateAge = function(birthDate, contactDate) {
			  var age;

			  var timeDiff = contactDate.valueOf() - birthDate.valueOf();
			  var milliInDay = 24*60*60*1000;
			  var noOfDays = timeDiff / milliInDay;
			  var daysInYear = 365.242; //exact days in year
			  age =  ( noOfDays / daysInYear ) ;

			  return age;
			};

			//START datePicker example
			scope.today = function() {
			  scope.contactModel.contactDate = new Date();
			};

			scope.clear = function () {
			  scope.contactModel.contactDate = null;
			};

			scope.datePickers = {
			  contactDate: {
				//date: $filter('date')(new Date(), scope.format),
				opened: false
			  },
			  fundusExaminationDate: {
				//date: $filter('date')(new Date(), scope.format),
				opened: false
			  },
			  footExaminationDate: {
				//date: $filter('date')(new Date(), scope.format),
				opened: false,
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
				var date = scope.contactForm.contactDate.$viewValue;
				var isValid = true;
				
				if (scope.contactModel.contactDate === undefined) {
					isValid = false;
				}
				
				isValid = scope.validateDate(date);
						
				scope.contactForm.contactDate.$setValidity('checkInput',isValid);
				
				return isValid;
				
			};	
			
			scope.validatePreviousContacts = function() {
			
				var isValid = true;
				var dateToCheck = scope.getStringDate(scope.contactModel.contactDate);
				var m = scope.contactModel;
				
				scope.contactModel.contactDate = dateToCheck.replace('.','-');

				var compare = function(thisDate, thatDate) {
				
						if (thisDate == thatDate) {
							return false;
						}
							return true;
				};

				if (!(scope.subject.contacts  === undefined)) {
					for (var i = 0; i < scope.subject.contacts.length; i++) {

						var c = scope.subject.contacts[i];

						if(scope.contactModel.contactID) {
							if (!(c.contactID == m.contactID)) {
								isValid = compare(c.contactDate.split('T')[0],dateToCheck)
							}
							} else {
								if (scope.subject.contacts[i].contactDate.split('T')[0] == dateToCheck) {
								isValid = compare(c.contactDate.split('T')[0],dateToCheck)
							}
						}

						if(!isValid)
							break;

					}
				}

				scope.contactForm.contactDate.$setValidity('checkContactDate', isValid);
				return isValid;
			
			};
			
			scope.setMaxYear = function() {
				scope.maxYear = scope.getStringDate(scope.contactModel.contactDate).substring(0,4);
			}
			
			scope.contactDateChanged = function() {

				if (!scope.validateContactDateInput())
					return;

				if (!scope.validatePreviousContacts())
					return;
			
			};
			
			scope.validateDate = function(viewVal) {
				var isValid = true;
						
				if (typeof viewVal === 'string')
					if (viewVal.length !== 10)
						isValid = false;
				
				return isValid;
			};
			
			scope.validateFootDate = function(e) {

				var date = scope.contactForm.footExaminationDate.$viewValue;
				var isValid = scope.validateDate(date)  || (date === '');

				scope.contactForm.footExaminationDate.$setValidity('errorInputformat',isValid);
			};
			
			scope.validateFundusDate = function(e) {

				var date = scope.contactForm.fundusExaminationDate.$viewValue;
				var isValid = scope.validateDate(date) || (date === '');

				scope.contactForm.fundusExaminationDate.$setValidity('errorInputformat',isValid);	
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

			scope.pumpOngoingChanged = function() {
			  scope.contactModel.pumpOngoingSerial = null;
			};
			
			scope.pumpNewChanged = function() {
			  scope.contactModel.pumpNewSerial = null;
			};
			
			scope.setOptionalQuestionsValue = function() {
			  
			  var iterateAttributes = ['dal','das'];
			  
			  angular.forEach(scope.optionalQuestions, function(q) {
				q.value = "";
				
				if (scope.contactToUpdate != null) { //update contact
				  if (scope.contactToUpdate.optionals != null) {
					if (scope.contactToUpdate.optionals[q.columnName] != undefined) {
						q.iterate = false;
						q.value = scope.contactToUpdate.optionals[q.columnName];
					}
				  }
				} else { //new contact => iterate values
					if (iterateAttributes.indexOf(q.columnName) != -1) {
						if (scope.lastContact != null)
							if (scope.lastContact.optionals != null)
								if (scope.lastContact.optionals[q.columnName] != undefined) {
									q.iterate = true;
									q.value = scope.lastContact.optionals[q.columnName];
								}
					}
				}
			  });
			}
		
			//hardcoded since this is the ony need variable with need for this functionality in report form
			scope.getSmokingHabitText = function(code) {
				
				switch(code) {
					case 1:
						return "Aldrig varit rökare"
					case 2:
						return "Röker dagligen"
					case 3:
						return "Röker, men ej dagligen"
					case 4:
						return "Slutat röka"
				}
				
			};

			scope.setDateValues = function() {
			  scope.contactModel.contactDate = scope.getStringDate(scope.contactModel.contactDate);
			  scope.contactModel.fundusExaminationDate = scope.getStringDate(scope.contactModel.fundusExaminationDate);
			  scope.contactModel.footExaminationDate = scope.getStringDate(scope.contactModel.footExaminationDate);
			};

			scope.saveContact = function () {

			  scope.serverSaveErrors = [];
			  scope.isSaving = true;

			  //Dates are javascript dates until saved, here converted to string dates, better idea?
			  scope.setDateValues();
			  scope.contactModel.optionals = scope.getOptionals();
			  console.log('optionals',scope.getOptionals());

			  var dfd = dataService.saveContact(scope.contactModel)
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
			
			scope.getContactFromContactDate = function(array, date) {
			  return $filter('filter')(scope.subject.contacts, function (d)
			  {
				return d.contactDate.split('T')[0] == date;
			  })[0];
			};
			
			scope.macroChanged = function() {
			  if (scope.contactModel.macroscopicProteinuria == 1)
				scope.contactModel.microscopicProteinuria = 0;
			  else
				scope.contactModel.microscopicProteinuria = null;
			};
			
			scope.retinopathyChanged = function() {
				if (scope.contactModel.diabeticRetinopathy != 1)
					if (scope.contactModel.diagnosisWorseSeeingEye != null)
						scope.contactModel.diagnosisWorseSeeingEye = null;
			};
			
			scope.cgmChanged = function() {
			
			
				if (scope.contactModel.cgm != 1)
					if (scope.contactModel.cgmType != null)
						scope.contactModel.cgmType = null;
			};
			
			scope.init();
			

			scope.patternTriglyceride = (function() {
				return {
					test: function(input) {
						if(input < 0.1 || input > 40){
							return false;
						} else{
							return true;
						}
					}
				};
			})();

			scope.patternBMI = (function() {
				return {
					test: function(input) {
						if(input < 15 || input > 62){
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
						if(input < 1 || input > 350){
							return false;
						} else{
							return true;
						}
					}
				};
			})();

			scope.patternCholesterol = (function() {
				return {
					test: function(input) {
						if(input < 1 || input > 20){
							return false;
						} else{
							return true;
						}
					}
				};
			})();

			scope.patternHDL = (function() {
				return {
					test: function(input) {
						if(input < 0.1 || input > 5){
							return false;
						} else{
							return true;
						}
					}
				};
			})();

			scope.patternLDL = (function() {
				return {
					test: function(input) {
						if(input < 0.5 || input > 10){
							return false;
						} else{
							return true;
						}
					}
				};
			})();
			
			scope.getOptionals = function() {

			  var optionals = null;

			  if (scope.optionalQuestions.length == 0)
				return null;

			  angular.forEach(scope.optionalQuestions, function(q) {
				if (q.value != null)
				  if (q.value != "") {
					if (optionals == null)
					  optionals = {};

					optionals[q.columnName] = q.value;
				  }
			  });

			  return optionals;
			};

        }
        return {
            restrict : 'A',
            templateUrl: 'src/components/ReportForm/ReportForm.html',
            link: link,
            scope: {
				accountModel 	: '=',
                subject 		: '=',
				contactToUpdate	: '=',
            }
        };
    }]);