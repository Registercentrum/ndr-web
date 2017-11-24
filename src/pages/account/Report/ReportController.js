'use strict';

angular.module('ndrApp')
    .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };

        $scope.clear = function () {
          $('html, body').animate({scrollTop: 0}, 500, function () {
			var socinput = document.getElementById('socialnumber-input');
			if (socinput != null)
				window.document.getElementById('socialnumber-input').focus();
          });
          $modalInstance.dismiss('cancel');
		  
		  $scope.__proto__.subject = null;
		  $scope.__proto__.socialnumber = null;

        };
    }]);

angular.module('ndrApp')
  .controller('ReportController', [
                 '$scope', '$stateParams', '$state', '$modal', '$filter', 'dataService',
        function ($scope,   $stateParams,   $state,   $modal,  $filter, dataService) {

        //var account = $scope.accountModel;
		
		//console.log("from report", account);
        console.log('ReportController: Init',  $stateParams.patientID);
		
        $scope.socialnumber = '',//'19121212-1212'; //för test
        $scope.subjectID         = $stateParams.patientID;
        $scope.view              = 0; // 0 = new view, 1 = report, 2 = incidence
        $scope.contactToUpdate   = {};
        $scope.subject           = null;
        $scope.serverSubjectError = null;
        $scope.method            = 'POST';
        $scope.optionalQuestions = [];
		
        $scope.filterValue = function($event){
            if(isNaN(String.fromCharCode($event.keyCode)) && $event.keyCode !== 44 && $event.keyCode !== 46){
                $event.preventDefault();
            }
        };

        if ($scope.subjectID) {
            dataService.getSubjectById($scope.subjectID).then(function (subject) {
				if (subject.socialNumber != undefined) {
					$scope.socialnumber = subject.socialNumber;
					$scope.getSubject(true);	
				}
            });
        }

        $scope.getSubject = function (newSocialnumber) {
			$scope.minYear			  = $scope.socialnumber.substring(0,4);
            $scope.serverSubjectError = null;
            $scope.serverSaveErrors   = [];
			
			$scope.view == null;
			
            dataService.getSubjectBySocialNumber($scope.socialnumber)
                .then(function (data) {
					
					if (data.status) { //something has gone wrong
						$scope.subject=null;
						$scope.serverSubjectError = 'Ingen patient hittades. Kontrollera personnummer.';
						return;
					} else {
						$scope.serverSubjectError = null;
					}

                    $scope.subject = data;
					$scope.view = 0;
					
					setTimeout(function(){ window.document.getElementById('bnNewContact').focus(); }, 100);

                    //Välj det senast kompletterade/skapade besöket
                    /*if (!newSocialnumber) {
                        $scope.contactToUpdate = $scope.getContactFromContactDate($scope.subject.contacts, $scope.contactModel.contactDate);
                        $scope.setContact($scope.contactToUpdate);
                    } else {
						$scope.contactModel = null;
                    }*/
					
                })
                ['catch'](function(data, status, headers, config) {
                    $scope.subject = null;
					$scope.serverSubjectError = 'Ett okänt fel inträffade';
                });
        };
		
        $scope.setContact = function (contactToUpdate) {
			$scope.contactToUpdate = contactToUpdate;
			$scope.view = 1;
			
        };
		$scope.setIncidence = function() {
			$scope.view = 2;
		}
		
		
		/*$scope.calculateAge = function(birthDate, contactDate) {
		  var age;

		  var timeDiff = contactDate.valueOf() - birthDate.valueOf();
		  var milliInDay = 24*60*60*1000;
		  var noOfDays = timeDiff / milliInDay;
		  var daysInYear = 365.242; //exact days in year
		  age =  ( noOfDays / daysInYear ) ;

		  return age;
		};*/
	
	//Todo, this could use an overview
	/*$scope.validateContactDateInput = function() {
		var date = $scope.contactModel.contactDate.$viewValue;
		var isValid = true;
		
		if ($scope.contactModel.contactDate === undefined) {
			isValid = false;
		}
		
		isValid = $scope.validateDate(date);
				
		$scope.contactForm.contactDate.$setValidity('checkInput',isValid);
		
		return isValid;
		
	};*/
		/*$scope.validatePreviousContacts = function() {
			
			var isValid = true;
			var dateToCheck = $scope.getStringDate($scope.contactModel.contactDate);
			var m = $scope.contactModel;
			
			$scope.contactModel.contactDate = dateToCheck.replace('.','-');

			var compare = function(thisDate, thatDate) {
			
				if (thisDate == thatDate) {
					return false;
				}
					return true;
			};

			if (!($scope.subject.contacts  === undefined)) {
				for (var i = 0; i < $scope.subject.contacts.length; i++) {

					var c = $scope.subject.contacts[i];

					if($scope.contactToUpdate != null) {
						if (!(c.contactID == m.contactID)) {
							isValid = compare(c.contactDate.split('T')[0],dateToCheck)
						}
						} else {
							if ($scope.subject.contacts[i].contactDate.split('T')[0] == dateToCheck) {
							isValid = compare(c.contactDate.split('T')[0],dateToCheck)
						}
					}

					if(!isValid)
						break;

				}
			}

			$scope.contactForm.contactDate.$setValidity('checkContactDate', isValid);
			
			return isValid;
			
		};*/
		/*$scope.getStringDate = function(date) {

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
		};*/

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

  }])

/*angular.module("ndrApp")
  .service('List', ['$http', 'APIconfigService', function($http, APIconfigService) {

      this.lists = null;

      var self = this;

      $http.get(APIconfigService.baseURL + 'ContactAttribute?APIKey=' + APIconfigService.APIKey).success(function(data) {
        self.lists = _.indexBy(data, "columnName");
		//console.log('lists fetched');
      });

      this.getLists = function() {
        return self.lists;
      }
      this.getList = function(listName) {
        return this.lists[listName];
      }

    }]);*/



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