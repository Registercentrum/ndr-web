angular.module('ndrApp')
    .controller('ModalInstanceCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {
    
        $scope.ok = function () {
            $modalInstance.close($scope.selected.item);
        };
    
        $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
        };
    }]);
    
    angular.module('ndrApp')
        .controller('ReportController', [
                     '$scope', '$http', '$stateParams', '$state', '$modal', 'List', 'dataService',
            function ($scope,   $http,   $stateParams,   $state,   $modal,   List, dataService) {
    
            console.log("ReportController: Init",  $scope.accountModel);
    
            $scope.subjectID = false || $stateParams.patientID;

    
           // $scope.socialnumber = '19121212-1212'; //fÃ¶r test
            $scope.view = 0;
            $scope.contactModel =  null;
            $scope.contactToUpdate = null;
            $scope.subject = null;
            $scope.serverSaveErrors = [];
            $scope.method = 'POST';
    
            var Account = $scope.accountModel;
    
            var server = {
                baseURL: 'https://ndr.registercentrum.se',
                APIKey: 'LkUtebH6B428KkPqAAsV'
            }
    
            if($scope.subjectID){
                dataService.getSubject($scope.subjectID).then(function (subject) {
                    $scope.socialnumber = subject.socialNumber;
                    $scope.getSubject(true);
                });
            }
    
            $scope.getSubject = function(newSocialnumber) {
    
                newSocialnumber = newSocialnumber || false;
                var self = $scope;

                $scope.lists = List.getLists();
                $scope.serverSubjectError = null;
                $scope.serverSaveErrors = [];

                $http({
                    url: server.baseURL + '/api/Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey=' + server.APIKey,
                    method: "POST",
                    data: { socialNumber: $scope.socialnumber }
                })
                    .success(function(data) {
                        self.subject = data;
                        //Välj det senast uppdaterade/skapade besöket
                        if (!newSocialnumber) {
                            self.contactToUpdate = self.getContactFromContactDate(self.subject.contacts, self.contactModel.contactDate)
                            self.setContact(self.contactToUpdate);
                        }
                        else
                            self.contactModel = self.getNewContactModel();
    
                    })
                    .error(function(data, status, headers, config) {
                        self.subject = null;
    
                        switch (status) {
                            case 400:
                                alert("Ingen patient hittades");
                                $scope.serverSubjectError = data;
                                break;
                            default:
                                $scope.serverSubjectError = 'Ett okänt fel inträffade';
                        }
                    });
    
            };
    
    
            $scope.deleteContact = function(contactID) {
                var self = $scope;
                var server = Server.getServer();
    
                $http({
                    url: server.baseURL + '/api/Contact/' + contactID + '?AccountID=' + Account.activeAccount.accountID + '&APIKey=' + server.APIKey,
                    method: "DELETE"
                }).success(function(data) {
                    $scope.subject.contacts = $scope.removeItemFromArray($scope.subject.contacts, contactID);
                    $scope.contactModel = $scope.getNewContactModel();
                });
            };
            $scope.setContact = function(contactToUpdate) {
    
                $scope.method = contactToUpdate == null ?  'POST' : 'PUT';
                //senaste kontakt bara intressant vid nybesök
                $scope.lastContact = contactToUpdate == null ?  ($scope.subject.contacts[0] || null) : null;
    
                //Skapa modell
                $scope.contactModel = contactToUpdate == null ?  $scope.getNewContactModel() : $scope.getUpdateModel();
    
                $scope.showPumpProblem = $scope.contactModel.pumpProblemKeto || $scope.contactModel.pumpProblemHypo || $scope.contactModel.pumpProblemSkininfection || $scope.contactModel.pumpProblemSkinreaction;
                $scope.showPumpClosureReason = $scope.contactModel.pumpClosureReasonID>0;
            };
            $scope.getNewContactModel = function() {
    
                $scope.contactForm.$setPristine();
                return $scope.getNewModel($scope.lastContact);
            };
            $scope.togglePumpProblem = function() {
                $scope.showPumpProblem = !$scope.showPumpProblem;
            }
            $scope.togglePumpClosureReason = function() {
                $scope.showPumpClosureReason = !$scope.showPumpClosureReason;
            };
            $scope.insulinMethodChanged = function() {
                if ($scope.contactModel.insulinMethodID != 2) {
                    $scope.contactModel.pumpNewID = null;
    
                }
            };
            $scope.calculateLDL = function() {
    
                var calculatedLDL = parseFloat(parseFloat($scope.contactModel.cholesterol-$scope.contactModel.hdl-0.45*$scope.contactModel.triglyceride).toFixed(1));
                $scope.contactModel.ldl = calculatedLDL;
            };
            $scope.tryCalculateBMI = function() {
    
                if ($scope.contactModel.weight>0 && $scope.contactModel.height>0) {
                    $scope.contactModel.bmi = parseFloat(($scope.contactModel.weight / Math.pow($scope.contactModel.height/100,2)).toFixed(1));;
                } else {
                    $scope.contactModel.bmi = null;
                }
            };
            $scope.tryCalculateGFR = function() {
    
                if ($scope.contactModel.serumCreatinine == null || $scope.contactModel.contactDate == null) {
                    $scope.contactModel.gfr = null;
                    return;
                }
    
                var femaleFactor = 0.742;
                var contactDate = new Date($scope.contactModel.contactDate.substring(0,4),$scope.contactModel.contactDate.substring(5,7)-1,$scope.contactModel.contactDate.substring(8,10));
                var birthDate = new Date($scope.subject.socialNumber.substring(0,4),$scope.subject.socialNumber.substring(4,6)-1,$scope.subject.socialNumber.substring(6,8));
                var age = $scope.calculateAge(birthDate, contactDate);
                var gfr = 175*Math.pow(($scope.contactModel.serumCreatinine/88.4),-1.154)*Math.pow(age,-0.203)*($scope.subject.sex.code == 2 ? femaleFactor : 1);
    
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
    
            // Disable weekend selection
            $scope.disabled = function(date, mode) {
                return date>new Date();
                //return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
            };
    
            $scope.toggleMin = function() {
                $scope.minDate = $scope.minDate ? null : new Date();
            };
            //$scope.toggleMin();
    
            $scope.open = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.opened = true;
            };
    
            $scope.dateOptions = {
                formatYear: 'yy',
                startingDay: 1
            };
    
            $scope.formats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];
            //END datePicker
            $scope.checkDate = function(ctrl) {
    
    
                //if ($scope.subject != null) {
    
                var valid = true;
                var m = $scope.contactModel;
                var compare = function(thisDate, thatDate) {
                    if (thisDate == thatDate) {
                        return false;
                    }
                    return true;
                }
    
                if ($scope.subject.contacts  == undefined)
                    valid = true
                else {
                    for (i = 0; i < $scope.subject.contacts.length; i++) {
    
                        var c = $scope.subject.contacts[i];
    
                        if($scope.contactToUpdate != null) {
                            if (!(c.contactID == m.contactID)) {
                                valid = compare(c.contactDate.split('T')[0],m.contactDate)
                            }
                        } else {
                            if ($scope.subject.contacts[i].contactDate.split('T')[0] == m.contactDate) {
                                valid = compare(c.contactDate.split('T')[0],m.contactDate)
                            }
                        }
    
                        if(!valid)
                            break;
    
                    }
                }
                ctrl.$setValidity('checkDate', valid);
            }
            $scope.setDateFormat = function() {
    
                var d = $scope.contactModel.contactDate;
    
                if (typeof d === 'string')
                    return;
                if (d === undefined)
                    return;
                if (d === null)
                    return;
    
                var yyyy = d.getFullYear().toString();
                var mm = (d.getMonth()+1).toString(); // getMonth() is zero-based
                var dd  = d.getDate().toString();
    
                $scope.contactModel.contactDate = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
            };
    
    
            //sets value after datepicker select
            $scope.$watch('contactModel.contactDate', function(d){
    
                if (typeof d === 'string')
                    return;
                if (d === undefined)
                    return;
                if (d === null)
                    return;
    
                var yyyy = d.getFullYear().toString();
                var mm = (d.getMonth()+1).toString(); // getMonth() is zero-based
                var dd  = d.getDate().toString();
    
                $scope.contactModel.contactDate = yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
            });
            $scope.pumpOngoingChanged = function() {
                $scope.contactModel.pumpOngoingSerial = null;
            };
            $scope.pumpNewChanged = function() {
                $scope.contactModel.pumpNewSerial = null;
            };
            $scope.getUpdateModel = function() {
    
                return {
                    contactID: $scope.contactToUpdate.contactID,
                    socialNumber: $scope.subject != null ? $scope.subject.socialNumber : null,
                    diabetesTypeID: $scope.subject != null ? $scope.subject.diabetesType != null ? $scope.subject.diabetesType.id : null : null,
                    yearOfOnset: $scope.subject != null ? $scope.subject.yearOfOnset : null,
                    contactDate: $scope.contactToUpdate.contactDate.split('T')[0],
                    hba1c: $scope.contactToUpdate.hba1c,
                    treatmentID: $scope.contactToUpdate.treatment != null ? $scope.contactToUpdate.treatment.id : null,
                    insulinMethodID: $scope.contactToUpdate.insulinMethod != null ? $scope.contactToUpdate.insulinMethod.id : null,
                    pumpIndicationID: $scope.contactToUpdate.pumpIndication != null ? $scope.contactToUpdate.pumpIndication.id : null,
                    pumpOngoingID: $scope.contactToUpdate.pumpOngoing != null ? $scope.contactToUpdate.pumpOngoing.id : null,
                    pumpOngoingSerial: $scope.contactToUpdate.pumpOngoingSerial,
                    pumpNewID: $scope.contactToUpdate.pumpNew != null ? $scope.contactToUpdate.pumpNew.id : null,
                    pumpNewSerial: $scope.contactToUpdate.pumpNewSerial,
                    pumpProblemKeto: $scope.contactToUpdate.pumpProblemKeto,
                    pumpProblemHypo: $scope.contactToUpdate.pumpProblemHypo,
                    pumpProblemSkininfection: $scope.contactToUpdate.pumpProblemSkininfection,
                    pumpProblemSkinreaction: $scope.contactToUpdate.pumpProblemSkinreaction,
                    pumpClosureReasonID: $scope.contactToUpdate.pumpClosureReason != null ? $scope.contactToUpdate.pumpClosureReason.id : null,
                    height: $scope.contactToUpdate.height,
                    weight: $scope.contactToUpdate.weight,
                    waist: $scope.contactToUpdate.waist,
                    bmi: $scope.contactToUpdate.bmi,
                    bpSystolic: $scope.contactToUpdate.bpSystolic,
                    bpDiastolic: $scope.contactToUpdate.bpDiastolic,
                    antihypertensivesCode: $scope.contactToUpdate.antihypertensives != null ? $scope.contactToUpdate.antihypertensives.code : null,
                    lipidLoweringDrugsCode: $scope.contactToUpdate.lipidLoweringDrugs != null ? $scope.contactToUpdate.lipidLoweringDrugs.code : null,
                    aspirinCode: $scope.contactToUpdate.aspirin != null ? $scope.contactToUpdate.aspirin.code : null,
                    waranCode: $scope.contactToUpdate.waran != null ? $scope.contactToUpdate.waran.code : null,
                    macroscopicProteinuriaCode: $scope.contactToUpdate.macroscopicProteinuria != null ? $scope.contactToUpdate.macroscopicProteinuria.code : null,
                    microscopicProteinuriaCode: $scope.contactToUpdate.microscopicProteinuria != null ? $scope.contactToUpdate.microscopicProteinuria.code : null,
                    serumCreatinine: $scope.contactToUpdate.serumCreatinine,
                    gfr: $scope.contactToUpdate.gfr,
                    cholesterol: $scope.contactToUpdate.cholesterol,
                    triglyceride: $scope.contactToUpdate.triglyceride,
                    hdl: $scope.contactToUpdate.hdl,
                    ldl: $scope.contactToUpdate.ldl,
                    ischemicHeartDiseaseCode: $scope.contactToUpdate.ischemicHeartDisease != null ? $scope.contactToUpdate.ischemicHeartDisease.code : null,
                    cerebrovascularDiseaseCode: $scope.contactToUpdate.cerebrovascularDisease != null ? $scope.contactToUpdate.cerebrovascularDisease.code : null,
                    fundusExaminationDate: $scope.contactToUpdate.fundusExaminationDate != null ? $scope.contactToUpdate.fundusExaminationDate.split('T')[0] : null,
                    diabeticRetinopathyCode: $scope.contactToUpdate.diabeticRetinopathy != null ? $scope.contactToUpdate.diabeticRetinopathy.code : null,
                    diagnosisWorseSeeingEyeID: $scope.contactToUpdate.diagnosisWorseSeeingEye != null ? $scope.contactToUpdate.diagnosisWorseSeeingEye.id : null,
                    visualLossCode: $scope.contactToUpdate.visualLoss != null ? $scope.contactToUpdate.visualLoss.code : null,
                    laserTreatmentCode: $scope.contactToUpdate.laserTreatment != null ? $scope.contactToUpdate.laserTreatment.code : null,
                    footExaminationDate: $scope.contactToUpdate.footExaminationDate != null ? $scope.contactToUpdate.footExaminationDate.split('T')[0] : null,
                    footRiscCategoryID: $scope.contactToUpdate.footRiscCategory != null ? $scope.contactToUpdate.footRiscCategory.id : null,
                    diabeticRetinopathyCode: $scope.contactToUpdate.diabeticRetinopathy != null ? $scope.contactToUpdate.diabeticRetinopathy.code : null,
                    smokingHabitID: $scope.contactToUpdate.smokingHabit != null ? $scope.contactToUpdate.smokingHabit.id : null,
                    smokingEndYear: $scope.contactToUpdate.smokingEndYear,
                    physicalActivityID: $scope.contactToUpdate.physicalActivity != null ? $scope.contactToUpdate.physicalActivity.id : null,
                    hypoglycemiaSevereID: $scope.contactToUpdate.hypoglycemiaSevere != null ? $scope.contactToUpdate.hypoglycemiaSevere.id : null
                }
            };
            $scope.getNewModel = function(lastContact) {
    
                return {
                    contactID: null,
                    socialNumber: $scope.subject != null ? $scope.subject.socialNumber : null,
                    diabetesTypeID: $scope.subject != null ? $scope.subject.diabetesType != null ? $scope.subject.diabetesType.id : null : null,
                    yearOfOnset: $scope.subject != null ? $scope.subject.yearOfOnset : null,
                    contactDate: null,
                    hba1c: null,
                    treatmentID: lastContact != null ? lastContact.treatment != null ? lastContact.treatment.id : null : null,
                    insulinMethodID: lastContact != null ? lastContact.insulinMethod != null ? lastContact.insulinMethod.id == 2 ? lastContact.insulinMethod.id : null : null : null,
                    pumpIndicationID: lastContact != null ? lastContact.pumpIndication != null ? lastContact.pumpIndication.id : null : null,
                    pumpOngoingID: lastContact != null ? lastContact.pumpOngoing != null ? lastContact.pumpOngoing.id : null : null,
                    pumpOngoingSerial: lastContact != null ? lastContact.pumpOngoingSerial : null,
                    pumpNewID: null,
                    pumpNewSerial: null,
                    pumpProblemKeto: null,
                    pumpProblemHypo: null,
                    pumpProblemSkininfection: null,
                    pumpProblemSkinreaction: null,
                    pumpClosureReasonID: lastContact != null ? lastContact.pumpClosureReason != null ? lastContact.pumpClosureReason.id : null : null,
                    height: lastContact != null ? lastContact.height : null,
                    weight: null,
                    waist: null,
                    bmi: null,
                    bpSystolic: null,
                    bpDiastolic: null,
                    antihypertensivesCode: lastContact != null ? lastContact.antihypertensives != null ? lastContact.antihypertensives.code == 1 ? lastContact.antihypertensives.code : null : null : null,
                    lipidLoweringDrugsCode: lastContact != null ? lastContact.lipidLoweringDrugs != null ? lastContact.lipidLoweringDrugs.code == 1 ? lastContact.lipidLoweringDrugs.code : null : null : null,
                    aspirinCode:  lastContact != null ? lastContact.aspirin != null ? lastContact.aspirin.code == 1 ? lastContact.aspirin.code : null : null : null,
                    waranCode: lastContact != null ? lastContact.waran != null ? lastContact.waran.code == 1 ? lastContact.waran.code : null : null : null,
                    macroscopicProteinuriaCode: lastContact != null ? lastContact.macroscopicProteinuria != null ? lastContact.macroscopicProteinuria.code == 1 ? lastContact.macroscopicProteinuria.code : null : null : null,
                    microscopicProteinuriaCode: lastContact != null ? lastContact.microscopicProteinuria != null ? lastContact.microscopicProteinuria.code == 1 ? lastContact.microscopicProteinuria.code : null : null : null,
                    serumCreatinine: null,
                    gfr: null,
                    cholesterol: null,
                    triglyceride: null,
                    hdl: null,
                    ldl: null,
                    ischemicHeartDiseaseCode: lastContact != null ? lastContact.ischemicHeartDisease != null ? lastContact.ischemicHeartDisease.code == 1 ? lastContact.ischemicHeartDisease.code : null : null : null,
                    cerebrovascularDiseaseCode: lastContact != null ? lastContact.cerebrovascularDisease != null ? lastContact.cerebrovascularDisease.code == 1 ? lastContact.cerebrovascularDisease.code : null : null : null,
                    fundusExaminationDate: lastContact != null ? lastContact.fundusExaminationDate != null ? lastContact.fundusExaminationDate.split('T')[0] : null : null,
                    diabeticRetinopathyCode: null,
                    diagnosisWorseSeeingEyeID: lastContact != null ? lastContact.diagnosisWorseSeeingEye != null ? lastContact.diagnosisWorseSeeingEye.id : null : null,
                    visualLossCode: lastContact != null ? lastContact.visualLoss != null ? lastContact.visualLoss.code == 1 ? lastContact.visualLoss.code : null : null : null,
                    laserTreatmentCode: lastContact != null ? lastContact.laserTreatment != null ? lastContact.laserTreatment.code == 1 ? lastContact.laserTreatment.code : null : null : null,
                    footExaminationDate: lastContact != null ? lastContact.footExaminationDate != null ? lastContact.footExaminationDate.split('T')[0] : null : null,
                    footRiscCategoryID: null,
                    diabeticRetinopathyCode: lastContact != null ? lastContact.diabeticRetinopathy != null ? lastContact.diabeticRetinopathy.code == 1 ? lastContact.diabeticRetinopathy.code : null : null : null,
                    smokingHabitID: lastContact != null ? lastContact.smokingHabit != null ? lastContact.smokingHabit.id == 1 ? lastContact.smokingHabit.id : null : null : null,
                    smokingEndYear: null,
                    physicalActivityID: null,
                    hypoglycemiaSevereID: null
                }
            };
            $scope.saveContact = function() {
    
                $scope.serverSaveErrors = [];
    
                var httpConfig = {
                    method: $scope.method,
                    data: $scope.contactModel
                };
    
                console.log($scope.contactModel);
    
                if ($scope.method == 'PUT')
                    httpConfig.url = server.baseURL + '/api/Contact/' + $scope.contactModel.contactID + '?AccountID=' + Account.activeAccount.accountID + '&APIKey=' + server.APIKey;
                else
                    httpConfig.url = server.baseURL + '/api/Contact/?AccountID=' + Account.activeAccount.accountID + '&APIKey=' + server.APIKey;
    
                $http(httpConfig).success(function(data) {
                    $scope.getSubject(false);
    
                    var modalInstance = $modal.open({
                        templateUrl: 'myModalContent.html',
                        controller: 'ModalInstanceCtrl',
                        backdrop : true,
                        scope : $scope,
                    });
    
    
                }).error(function(data, status, headers, config) {
                    //todo behÃ¶ver utÃ¶kas
                    if (data.ModelState != null) {
                        for(var propertyName in data.ModelState) {
                            $scope.serverSaveErrors.push(data.ModelState[propertyName][0])
                        }
                    } else {
                        $scope.serverSaveErrors.push('Ett okÃ¤nt fel intrÃ¤ffade. Var god fÃ¶rsÃ¶k igen senare.');
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
                if ($scope.contactModel.macroscopicProteinuriaCode == 1)
                    $scope.contactModel.microscopicProteinuriaCode = 1;
                else
                    $scope.contactModel.microscopicProteinuriaCode = null;
            };
    
    
        }])
    
    angular.module("ndrApp")
        .service('List', ['$http', function($http) {
            
                this.lists = null;

                var self = this;
            
                $http.get("https://ndr.registercentrum.se" + '/api/ContactAttribute?APIKey=LkUtebH6B428KkPqAAsV').success(function(data) {
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