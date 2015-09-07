'use strict';

angular.module('ndrApp')
    .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };

        $scope.cancel = function () {
          $('html, body').animate({scrollTop: 0}, 500, function () {
            window.document.getElementById('socialnumber-input').select();
          });
          $modalInstance.dismiss('cancel');
        };
    }]);

angular.module('ndrApp')
  .controller('ReportController', [
                 '$scope', '$stateParams', '$state', '$modal', '$filter', 'List', 'dataService',
        function ($scope,   $stateParams,   $state,   $modal,  $filter,   List, dataService) {

        var account = $scope.accountModel;
        console.log('ReportController: Init',  $stateParams.patientID);


        $scope.socialnumber = '',//'19121212-1212'; //för test
        $scope.subjectID         = $stateParams.patientID;
        $scope.view              = 0;
        $scope.contactModel      = null;
        $scope.contactToUpdate   = null;
        $scope.subject           = null;
        $scope.serverSaveErrors  = [];
        $scope.method            = 'POST';
		$scope.minYear          = null; //Används för "År rökslut"
        $scope.maxYear          = new Date().getFullYear(); //Används för "År rökslut"
        $scope.optionalQuestions = [];


        $scope.getOptionalQuestions = function() {
            dataService.getOptionalQuestionsMeta(account.activeAccount.accountID, function (data) {
                $scope.optionalQuestions = data;
            });
        };


        $scope.$on('newUser', $scope.getOptionalQuestions);

        if (account.activeAccount) $scope.getOptionalQuestions();

        if ($scope.subjectID) {
            dataService.getSubjectById($scope.subjectID).then(function (subject) {
                $scope.socialnumber = subject.socialNumber;
                $scope.getSubject(true);
            });
        }


        $scope.getSubject = function (newSocialnumber) {
			$scope.minYear			  = $scope.socialnumber.substring(0,4);
            $scope.lists              = List.getLists();
            $scope.serverSubjectError = null;
            $scope.serverSaveErrors   = [];

            dataService.getSubjectBySocialNumber($scope.socialnumber)
                .then(function (subject) {
                    $scope.subject = subject;

                    //Välj det senast kompletterade/skapade besöket
                    if (!newSocialnumber) {
                        $scope.contactToUpdate = $scope.getContactFromContactDate($scope.subject.contacts, $scope.contactModel.contactDate);
                        $scope.setContact($scope.contactToUpdate);
                    } else {
                        $scope.contactModel = $scope.getNewContactModel();
                    }
                })
                ['catch'](function(data, status, headers, config) {
                    $scope.subject = null;

                    if (status === 400) {
                        window.alert('Ingen patient hittades');
                        $scope.serverSubjectError = data;
                    } else {
                        $scope.serverSubjectError = 'Ett okänt fel inträffade';
                    }
                });
        };


        $scope.deleteContact = function (contactID) {
            dataService.deleteContact(contactID)
                .then(function () {
                    $scope.subject.contacts = $scope.removeItemFromArray($scope.subject.contacts, contactID);
                    $scope.contactModel     = $scope.getNewContactModel();
                });
        };


        $scope.setContact = function (contactToUpdate) {
            $scope.method = !contactToUpdate ?  'POST' : 'PUT';

            //senaste kontakt bara intressant vid nybesök
            $scope.lastContact = !contactToUpdate ? $scope.subject.contacts[0] : null;

            //Skapa modell
            $scope.contactModel = !contactToUpdate ? $scope.getNewContactModel() : $scope.getUpdateModel();

            $scope.showPumpProblem = $scope.contactModel.pumpProblemKeto || $scope.contactModel.pumpProblemHypo || $scope.contactModel.pumpProblemSkininfection || $scope.contactModel.pumpProblemSkinreaction;
            $scope.showPumpClosureReason = $scope.contactModel.pumpClosureReason > 0;
            $scope.contactDateChanged();
        };


        $scope.getNewContactModel = function () {
            $scope.contactForm.$setPristine();
            return $scope.getNewModel($scope.lastContact);
        };


        $scope.togglePumpProblem = function () {
            $scope.showPumpProblem = !$scope.showPumpProblem;
        };


        $scope.togglePumpClosureReason = function () {
            $scope.showPumpClosureReason = !$scope.showPumpClosureReason;
        };


        $scope.insulinMethodChanged = function () {
            if ($scope.contactModel.insulinMethod !== 2) {
                $scope.contactModel.pumpNew = null;
            }
        };


        $scope.calculateLDL = function () {
            var calculatedLDL = parseFloat(parseFloat($scope.contactModel.cholesterol - $scope.contactModel.hdl - 0.45 * $scope.contactModel.triglyceride).toFixed(1));
            $scope.contactModel.ldl = calculatedLDL;
        };


        $scope.tryCalculateBMI = function () {
            if ($scope.contactModel.weight > 0 && $scope.contactModel.height > 0) {
                $scope.contactModel.bmi = parseFloat(($scope.contactModel.weight / Math.pow($scope.contactModel.height/100,2)).toFixed(1));
            } else {
                $scope.contactModel.bmi = null;
            }
        };

    $scope.tryCalculateGFR = function() {

      if ($scope.contactModel.creatinine == null || $scope.contactModel.contactDate == null) {
        $scope.contactModel.gfr = null;
        return;
      }

      var femaleFactor = 0.742;
      var contactDate = $scope.contactModel.contactDate;//new Date($scope.contactModel.contactDate.substring(0,4),$scope.contactModel.contactDate.substring(5,7)-1,$scope.contactModel.contactDate.substring(8,10));
      var birthDate = new Date($scope.subject.socialNumber.substring(0,4),$scope.subject.socialNumber.substring(4,6)-1,$scope.subject.socialNumber.substring(6,8));
      var age = $scope.calculateAge(birthDate, contactDate);
      var gfr = 175*Math.pow(($scope.contactModel.creatinine/88.4),-1.154)*Math.pow(age,-0.203)*($scope.subject.sex == 2 ? femaleFactor : 1);

      $scope.contactModel.gfr = parseFloat(gfr.toFixed(2));

    };
    $scope.calculateAge = function(birthDate, contactDate) {
      var age;

      var timeDiff = contactDate.valueOf() - birthDate.valueOf();
      var milliInDay = 24*60*60*1000;
      var noOfDays = timeDiff / milliInDay;
      var daysInYear = 365.242; //exact days in year
      age =  ( noOfDays / daysInYear ) ;

      return age;
    };

    //START datePicker example
    $scope.today = function() {
      $scope.contactModel.contactDate = new Date();
    };

    $scope.clear = function () {
      $scope.contactModel.contactDate = null;
    };

    $scope.datePickers = {
      contactDate: {
        //date: $filter('date')(new Date(), $scope.format),
        opened: false
      },
      fundusExaminationDate: {
        //date: $filter('date')(new Date(), $scope.format),
        opened: false
      },
      footExaminationDate: {
        //date: $filter('date')(new Date(), $scope.format),
        opened: false,
      }
    };

    // Disable future dates
    $scope.disabled = function(date, mode) {

      var d = new Date();

      return date >= d.setDate(d.getDate() + 1) //no future
    };

    $scope.toggleMin = function() {
      $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.openPicker = function($event, dateField) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.datePickers[dateField].opened = true;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1
    };

    $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    //END datePicker

    $scope.contactDateChanged = function() {

      var valid = true;
      var m = $scope.contactModel;
      var dateToCheck = $scope.getStringDate($scope.contactModel.contactDate)

      var compare = function(thisDate, thatDate) {
        if (thisDate == thatDate) {
          return false;
        }
        return true;
      }

      if ($scope.subject.contacts  == undefined)
        valid = true
      else {
        for (var i = 0; i < $scope.subject.contacts.length; i++) {

          var c = $scope.subject.contacts[i];

          if($scope.contactToUpdate != null) {
            if (!(c.contactID == m.contactID)) {
              valid = compare(c.contactDate.split('T')[0],dateToCheck)
            }
          } else {
            if ($scope.subject.contacts[i].contactDate.split('T')[0] == dateToCheck) {
              valid = compare(c.contactDate.split('T')[0],dateToCheck)
            }
          }

          if(!valid)
            break;

        }
      }

      $scope.contactForm.contactDate.$setValidity('checkContactDate', valid);
	  
	if (valid)
		$scope.maxYear = $scope.getStringDate($scope.contactModel.contactDate).substring(0,4);
	else
		$scope.maxYear = new Date().getFullYear()
	
    }
    $scope.getStringDate = function(date) {

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

    //not needed for now
     //$scope.$watch('contactModel.contactDate', function(date){

      //if (date === undefined)
      //  return;

      //if (date === null)
      //  return;

      //$scope.contactModel.contactDate = $scope.getStringDate(date);

      // console.log(date);
      // $scope.contactModel.contactDate = $scope.getStringDate(date);
      // console.log(d);
      // if (typeof d === 'string')
        // return;
      // if (d === undefined)
        // return;
      // if (d === null)
        // return;

      // var yyyy = d.getFullYear().toString();
      // var mm = (d.getMonth()+1).toString(); // getMonth() is zero-based
      // var dd  = d.getDate().toString();

      // $scope.contactModel.contactDate = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
     //});
    $scope.pumpOngoingChanged = function() {
      $scope.contactModel.pumpOngoingSerial = null;
    };
    $scope.pumpNewChanged = function() {
      $scope.contactModel.pumpNewSerial = null;
    };
    $scope.setOptionalQuestionsValue = function() {
      angular.forEach($scope.optionalQuestions, function(q) {
        q.value = "";
        if ($scope.contactToUpdate != null) {
          if ($scope.contactToUpdate.optionals != null) {
            if ($scope.contactToUpdate.optionals[q.columnName] != undefined)
              q.value = $scope.contactToUpdate.optionals[q.columnName];
          }
        }

      });
    }
    $scope.getUpdateModel = function() {

      $scope.setOptionalQuestionsValue();

      return {
        contactID: $scope.contactToUpdate.contactID,
        socialNumber: $scope.subject.socialNumber,
        diabetesType: $scope.subject.diabetesType,
        yearOfOnset: $scope.subject.yearOfOnset,
        contactDate: $scope.contactToUpdate.contactDate.split('T')[0],
        hba1c: $scope.contactToUpdate.hba1c,
        treatment: $scope.contactToUpdate.treatment,
        insulinMethod: $scope.contactToUpdate.insulinMethod,
        pumpIndication: $scope.contactToUpdate.pumpIndication,
        pumpOngoing: $scope.contactToUpdate.pumpOngoing,
        pumpOngoingSerial: $scope.contactToUpdate.pumpOngoingSerial,
        pumpNew: $scope.contactToUpdate.pumpNew,
        pumpNewSerial: $scope.contactToUpdate.pumpNewSerial,
        pumpProblemKeto: $scope.contactToUpdate.pumpProblemKeto>0,
        pumpProblemHypo: $scope.contactToUpdate.pumpProblemHypo>0,
        pumpProblemSkininfection: $scope.contactToUpdate.pumpProblemSkininfection>0,
        pumpProblemSkinreaction: $scope.contactToUpdate.pumpProblemSkinreaction>0,
        pumpProblemPumperror: $scope.contactToUpdate.PumpProblemPumperror>0,
        pumpClosureReason: $scope.contactToUpdate.pumpClosureReason,
        height: $scope.contactToUpdate.height,
        weight: $scope.contactToUpdate.weight,
        waist: $scope.contactToUpdate.waist,
        bmi: $scope.contactToUpdate.bmi,
        bpSystolic: $scope.contactToUpdate.bpSystolic,
        bpDiastolic: $scope.contactToUpdate.bpDiastolic,
        antihypertensives: $scope.contactToUpdate.antihypertensives,
        lipidLoweringDrugs: $scope.contactToUpdate.lipidLoweringDrugs,
        aspirin: $scope.contactToUpdate.aspirin,
        waran: $scope.contactToUpdate.waran,
        macroscopicProteinuria: $scope.contactToUpdate.macroscopicProteinuria,
        microscopicProteinuria: $scope.contactToUpdate.microscopicProteinuria,
        creatinine: $scope.contactToUpdate.creatinine,
        gfr: $scope.contactToUpdate.gfr,
        cholesterol: $scope.contactToUpdate.cholesterol,
        triglyceride: $scope.contactToUpdate.triglyceride,
        hdl: $scope.contactToUpdate.hdl,
        ldl: $scope.contactToUpdate.ldl,
        ischemicHeartDisease: $scope.contactToUpdate.ischemicHeartDisease,
        cerebrovascularDisease: $scope.contactToUpdate.cerebrovascularDisease,
        fundusExaminationDate: $scope.contactToUpdate.fundusExaminationDate != null ? $scope.contactToUpdate.fundusExaminationDate.split('T')[0] : null,
        diagnosisWorseSeeingEye: $scope.contactToUpdate.diagnosisWorseSeeingEye,
        visualLoss: $scope.contactToUpdate.visualLoss,
        laserTreatment: $scope.contactToUpdate.laserTreatment,
        footExaminationDate: $scope.contactToUpdate.footExaminationDate != null ? $scope.contactToUpdate.footExaminationDate.split('T')[0] : null,
        footRiscCategory: $scope.contactToUpdate.footRiscCategory,
        diabeticRetinopathy: $scope.contactToUpdate.diabeticRetinopathy,
        smokingHabit: $scope.contactToUpdate.smokingHabit,
        smokingEndYear: $scope.contactToUpdate.smokingEndYear,
        physicalActivity: $scope.contactToUpdate.physicalActivity,
        hypoglycemiaSevere: $scope.contactToUpdate.hypoglycemiaSevere,
        optionals: null
      }
    };
    $scope.getNewModel = function(lastContact) {

      $scope.setOptionalQuestionsValue();

      return {
        contactID: null,
        socialNumber: $scope.subject != null ? $scope.subject.socialNumber : null,
        diabetesType: $scope.subject != null ? $scope.subject.diabetesType : null,
        yearOfOnset: $scope.subject != null ? $scope.subject.yearOfOnset : null,
        contactDate: null,
        hba1c: null,
        treatment: lastContact != null ? lastContact.treatment : null,
        insulinMethod: lastContact != null ? lastContact.insulinMethod : null,
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
        waran: lastContact != null ? lastContact.waran : null,
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
        smokingHabit: lastContact != null ? lastContact.smokingHabit : null,
        smokingEndYear: null,
        physicalActivity: null,
        hypoglycemiaSevere: null,
        optionals: null
      }
    };
    $scope.setDateValues = function() {
      $scope.contactModel.contactDate = $scope.getStringDate($scope.contactModel.contactDate);
      $scope.contactModel.fundusExaminationDate = $scope.getStringDate($scope.contactModel.fundusExaminationDate);
      $scope.contactModel.footExaminationDate = $scope.getStringDate($scope.contactModel.footExaminationDate);
    };

    $scope.saveContact = function () {

      $scope.serverSaveErrors = [];
      $scope.isSaving = true;

      //Dates are javascript dates until saved, here converted to string dates, better idea?
      $scope.setDateValues();
      $scope.contactModel.optionals = $scope.getOptionals();

      console.log($scope.contactModel);

      dataService.saveContact($scope.contactModel)
        .then(function () {
            $scope.getSubject(false);
            $scope.isSaving = false;

            $modal.open({
              templateUrl: 'myModalContent.html',
              controller : 'ModalInstanceCtrl',
              backdrop   : true,
              scope      : $scope
            });
        })
        ['catch'](function (data) {
            //todo behöver utökas
            if (data.ModelState != null) {
              for (var prop in data.ModelState) {
                if (data.ModelState.hasOwnProperty(prop)) $scope.serverSaveErrors.push(data.ModelState[prop][0]);
              }
            } else {
              $scope.serverSaveErrors.push('Ett okänt fel inträffade. Var god försök igen senare.');
            }
        });
    };

    $scope.removeItemFromArray = function(array, id) {
      return $filter('filter')($scope.subject.contacts, function (d)
      {
        return d.contactID !== id;
      });
    };
    $scope.getContactFromContactDate = function(array, date) {
      return $filter('filter')($scope.subject.contacts, function (d)
      {
        return d.contactDate.split('T')[0] == date;
      })[0];
    };
    $scope.macroChanged = function() {
      if ($scope.contactModel.macroscopicProteinuria == 1)
        $scope.contactModel.microscopicProteinuria = 1;
      else
        $scope.contactModel.microscopicProteinuria = null;
    };
    $scope.retinopathyChanged = function() {
		if ($scope.contactModel.diabeticRetinopathy != 1)
			if ($scope.contactModel.diagnosisWorseSeeingEye != null)
				$scope.contactModel.diagnosisWorseSeeingEye = null;
    };
    $scope.getOptionals = function() {

      var optionals = null;

      if ($scope.optionalQuestions.length == 0)
        return null;

      angular.forEach($scope.optionalQuestions, function(q) {
        if (q.value != null)
          if (q.value != "") {
            if (optionals == null)
              optionals = {};

            optionals[q.columnName] = q.value;
          }
      });

      return optionals;
    };

  }])

angular.module("ndrApp")
  .service('List', ['$http', 'APIconfigService', function($http, APIconfigService) {

      this.lists = null;

      var self = this;

      $http.get(APIconfigService.baseURL + 'ContactAttribute?APIKey=' + APIconfigService.APIKey).success(function(data) {
        self.lists = _.indexBy(data, "columnName");
      });

      this.getLists = function() {
        return self.lists;
      }
      this.getList = function(listName) {
        return this.lists[listName];
      }

    }]);



angular.module("ndrApp")
  .directive('decimals', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ngModel) {


      if (!ngModel)
        return;

      ngModel.$render = function () {
        elm.val(ngModel.$viewValue);
        return true;
      }

      elm.bind('blur', function() {
        scope.$apply(read);
        ngModel.$render();
      });

      read();

      function read() {
        if (elm.val()>0)
          ngModel.$setViewValue(parseFloat(elm.val()).toFixed(attrs.decimals));
      }

    }
  };
});