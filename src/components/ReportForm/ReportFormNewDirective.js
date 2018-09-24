'use strict';

angular.module('ndrApp')
    .directive('reportFormNew', ['$q','dataService','calcService','$state', '$modal', '$filter', function($q, dataService, calcService, $state, $modal, $filter) {

        function link (scope, element, attrs) {

          console.log(scope.accountModel.user.isAdministrator);

          scope.formConfig = {
            iterateQuestions: ['height','pumpOngoing','pumpOngoingSerial','cgm','carbohydrate','treatment','insulinMethod','pumpIndication','pumpClosureReason','diabeticRetinopathy','smokingHabit','snuffingHabit','footExaminationDate','laserTreatment','visualLoss','diagnosisWorseSeeingEye','fundusExaminationDate','cerebrovascularDisease','ischemicHeartDisease','microscopicProteinuria','macroscopicProteinuria','aspirin','lipidLoweringDrugs','antihypertensives','height','yearOfOnset','diabetesType', 'thyreoidea','celiaki'],
            iterateCondition: {
              height: function(unitType) {
                return (unitType != 3);
              },
              smokingHabit: function(unitType) {
                return (unitType != 3);
              },
              snuffingHabit: function(unitType) {
                return (unitType != 3);
              }
            },
            defaults: {
              contactDate: function() {
                return calcService.getStringDate(new Date());
              }
            },
            onChange: {
              height: function(qscope) {
                var isValid = (qscope.model.height >= qscope.question.minValue && qscope.model.height <= qscope.question.maxValue);
                qscope.model.bmi = isValid ? qscope.methods.tryCalculateBMI(qscope.model.weight, qscope.model.height) : null;
                qscope.model.bmiSDS = qscope.methods.tryCalculateBMISDS(qscope.subject, qscope.model.contactDate, qscope.model.bmi);
                qscope.model.isoBMI = qscope.methods.tryCalculateIsoBMI(qscope.subject, qscope.model.contactDate, qscope.model.bmi);
              },
              weight: function(qscope) {
                var isValid = (qscope.model.weight >= qscope.question.minValue && qscope.model.weight <= qscope.question.maxValue);
                qscope.model.bmi = isValid ? qscope.methods.tryCalculateBMI(qscope.model.weight, qscope.model.height) : null;
                qscope.model.isoBMI = qscope.methods.tryCalculateIsoBMI(qscope.subject, qscope.model.contactDate, qscope.model.bmi);
                qscope.model.bmiSDS = qscope.methods.tryCalculateBMISDS(qscope.subject, qscope.model.contactDate, qscope.model.bmi);
                qscope.model.eKgPerDay = isValid ? qscope.methods.tryCalculateE24Kg(qscope.model.weight, qscope.model.noInsDosePerDay) : null;
              },
              bmi: function(qscope) {
                qscope.model.isoBMI = qscope.methods.tryCalculateIsoBMI(qscope.subject, qscope.model.contactDate, qscope.model.bmi);
                qscope.model.bmiSDS = qscope.methods.tryCalculateBMISDS(qscope.subject, qscope.model.contactDate, qscope.model.bmi);
              },
              noInsDosePerDay: function(qscope) {
                var isValid = (qscope.model.noInsDosePerDay>0) //(qscope.model.noInsDosePerDay >= qscope.question.minValue && qscope.model.noInsDosePerDay <= qscope.question.maxValue);
                qscope.model.eKgPerDay = isValid ? qscope.methods.tryCalculateE24Kg(qscope.model.weight, qscope.model.noInsDosePerDay) : null;
              },
              hdl: function(qscope) {
                qscope.model.ldl = qscope.methods.tryCalculateLDL(qscope.model.hdl, qscope.model.cholesterol, qscope.model.triglyceride);
              },
              diabeticRetinopathy: function(qscope) {
                if (qscope.model.diabeticRetinopathy != 1) qscope.model.retinopathyDiagnosis = null;
              },
              cholesterol: function(qscope) {
                qscope.model.ldl = qscope.methods.tryCalculateLDL(qscope.model.hdl, qscope.model.cholesterol, qscope.model.triglyceride);
              },
              triglyceride: function(qscope) {
                qscope.model.ldl = qscope.methods.tryCalculateLDL(qscope.model.hdl, qscope.model.cholesterol, qscope.model.triglyceride);
              },
              treatment: function(qscope) {
                if (!(qscope.model.treatment === 3 || qscope.model.treatment === 4 || qscope.model.treatment === 9 || qscope.model.treatment === 10)) {
                  qscope.model.insulinMethod = null;
                  qscope.model.pumpIndication = null;
                  qscope.model.pumpClosureReason = null;
                  qscope.model.pumpOngoing = null;
                  qscope.model.pumpOngoingSerial = null;
                }
              },
              insulinMethod: function(qscope) {
                if (qscope.model.insulinMethod != 2) {
                  qscope.model.pumpIndication = null;
                  qscope.model.pumpClosureReason = null;
                  qscope.model.pumpOngoing = null;
                  qscope.model.pumpOngoingSerial = null;
                }
              },
              creatinine: function(qscope) {
                qscope.model.gfr = qscope.methods.tryCalculateGFR(qscope.subject,  qscope.model.contactDate,  qscope.model.creatinine);
              },
              contactDate: function(qscope) {

                qscope.model.gfr = qscope.methods.tryCalculateGFR(qscope.subject,  qscope.model.contactDate,  qscope.model.creatinine);
                qscope.model.hypertension = qscope.methods.tryCalculateHypertension(qscope.model.bpSystolic,qscope.model.bpDiastolic,qscope.subject,qscope.model.contactDate);
                qscope.model.isoBMI = qscope.methods.tryCalculateIsoBMI(qscope.subject, qscope.model.contactDate, qscope.model.bmi);
                qscope.model.bmiSDS = qscope.methods.tryCalculateBMISDS(qscope.subject, qscope.model.contactDate, qscope.model.bmi);


                //check future dates
                var isValid = !qscope.methods.isFuture(qscope.model.contactDate) ;
                qscope.question.errorMessage = !isValid ? 'Besök i framtiden kan inte läggas in' : null;
                qscope.form.contactDate.$setValidity('checkContactDate', isValid);

                if (!isValid) return;

                //check other contactDates
                isValid = qscope.methods.validateNotEqualOtherContactDates(qscope);
                qscope.question.errorMessage = !isValid ? 'Det finns redan ett besök denna dag' : null;
                qscope.form.contactDate.$setValidity('checkContactDate', isValid);

              },
              bpSystolic: function(qscope) {
                if (typeof qscope.model.hypertension != "undefined") qscope.model.hypertension = qscope.methods.tryCalculateHypertension(qscope.model.bpSystolic,qscope.model.bpDiastolic,qscope.subject,qscope.model.contactDate);
              },
              bpDiastolic: function(qscope) {
                if (typeof qscope.model.hypertension != "undefined") qscope.model.hypertension = qscope.methods.tryCalculateHypertension(qscope.model.bpSystolic,qscope.model.bpDiastolic,qscope.subject,qscope.model.contactDate);
              }
            },
            visibility: {
              pumpOngoing: function(model) {
                return ((model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10) && (model.insulinMethod == 2))
              },
              pumpOngoingSerial: function(model) {
                return ((model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10) && (model.insulinMethod == 2))
              },
              pumpIndication: function(model) {
                return ((model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10) && (model.insulinMethod == 2))
              },
              pumpClosureReason: function(model) {
                return ((model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10) && (model.insulinMethod == 2))
              },
              insulinMethod: function(model) {
                return (model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10)
              },
              cgm: function(model) {
                return (model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10);
              },
              cgmType: function(model) {
                return (model.cgm == 1)
              },
              retinopathyDiagnosis: function(model) {
                return (model.diabeticRetinopathy == 1)
              },
              smokingHabit: function(model, subject) {

                if (model.contactDate)
                  return (calcService.calcAge(subject.socialNumber, model.contactDate)>=13)

                return true;
              },
              snuffingHabit: function(model, subject) {

                if (model.contactDate)
                  return (calcService.calcAge(subject.socialNumber, model.contactDate)>=13)

                return true;
              },
              smokingEndYear: function(model) {
                return (model.smokingHabit == 4)
              },
              snuffingEndYear: function(model) {
                return (model.snuffingHabit == 4)
              },
              diagnosisWorseSeeingEye: function(model) {
                return (model.diabeticRetinopathy == 1)
              },
              noInsDosePerDay: function(model) {
                return (model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10)
              },
              noUnitsBasePerDay: function(model) {
                return (model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10)
              },
              noUnitsLongPerDay: function(model) {
                return (model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10)
              },
              ekgPerDay: function(model) {
                return (model.treatment == 3 || model.treatment == 4 || model.treatment == 9 || model.treatment == 10)
              }
            },
            methods: {
              tryCalculateHypertension: function(bpSystolic, bpDiastolic, subject, contactDate) {
                if ((bpSystolic > 0 || bpDiastolic > 0) && contactDate) {
                  var age = calcService.calcAge(subject.socialNumber, contactDate)
                  if (age > 0 && age < 18) return calcService.calcHypertension(subject.sex, age, bpSystolic, bpDiastolic);
                }

                return null;
              },
              tryCalculateLDL: function(hdl, cholesterol, triglyceride) {
                if (hdl > 0 && cholesterol > 0 && triglyceride > 0) {
                  return calcService.calcLDL(hdl, cholesterol, triglyceride, 1);
                }

                return null;
              },
              tryCalculateIsoBMI: function(subject, contactDate, bmi) {
                if (bmi && contactDate) {
                  var age = calcService.calcAge(subject.socialNumber, contactDate, 1, 0.5);
                  return calcService.calcIsoBMI(subject.sex, age, bmi);
                }
                return null;
              },
              tryCalculateBMISDS: function(subject, contactDate, bmi) {
                if (bmi && contactDate) {
                  var age = calcService.calcAge(subject.socialNumber, contactDate);
                  return calcService.calcBMISDS(bmi,subject.sex, age, 1);
                }
                return null;
              },
              tryCalculateBMI: function(height, weight) {
                if (weight > 0 && height > 0) {
                  return calcService.calcBMI(height, weight, 1);
                }

                return null;
              },
              tryCalculateE24Kg: function(weight, doses) {
                if (weight > 0 && doses > 0) {
                  return calcService.calcE24Kg(weight, doses, 2);
                }

                return null;
              },
              tryCalculateGFR: function(subject, contactDate, creatinine) {

                if (creatinine > 0 && contactDate.length == 10) {
                  var age = calcService.calcAge(subject.socialNumber, contactDate)
                  return calcService.calcGFR(age, creatinine, subject.sex, 1); //age, creatinine, sex, precision
                }

                return null;
              },
              isFuture: function(stringDate) {
                return (stringDate > this.getTodayAsString())
              },
              getTodayAsString: function() {
                var today = new Date();
                return this.getStringDate(today);
              },
              getStringDate: function(date) {
                var mm = date.getMonth() + 1; // getMonth() is zero-based
                var dd = date.getDate();

                return [date.getFullYear(),
                        (mm>9 ? '' : '0') + mm,
                        (dd>9 ? '' : '0') + dd
                      ].join('-');
              },
              validateNotEqualOtherContactDates: function(qscope) {

                var thedate = qscope.model.contactDate;
                var isValid = true;

        				if (qscope.subject.contacts) {
        					for (var i = 0; i < qscope.subject.contacts.length; i++) {
        						var c = qscope.subject.contacts[i];
        						if(qscope.model.id) { //
        							if (!(c.contactID == qscope.model.id)) {
        								isValid =  !(c.contactDate == thedate)
        							}
      							} else {
      								if (c.contactDate == thedate) {
        								isValid = false
        							}
						        }
        					}
        				}

        				return isValid;

        			}
            }
          }

          scope.delete = function() {
            if (confirm("Vill du ta bort detta besök?")) dataService.deleteContact(scope.model.contactModel.id)
            $state.go('main.account.reportone', { patientID: scope.subject.subjectID }, {reload: true});
          }

          scope.formOptionalsConfig = {
            iterateQuestions: ['dal','das'],
            iterateCondition: {

            },
            defaults: {

            },
            onChange: {

            },
            /*validation: {
              contactDate: function(qscope) {

              }
            },*/
            visibility: {

            },
            methods: {

            }
          }


          scope.model = {
            activeAccount: scope.accountModel.activeAccount,
            isLoading: false,
            refContacts: [],
            refContactsOptionals: [],
            iterateEntity: null,
            formName: 'contactForm',
            formOptionalsName: 'contactOptionalForm',
            refContactCount: 2,
            contactModel: null,
            contactOptionalsModel: null,
            refIndex: 0

            /*accountModel 	: '=',
            subject 		: '=',
		        updateEntity	: '=',
            iterateEntity : '=',
            refModels : '=',
            questions : '=',
            config : '=',
            newIndex : '='*/

          }
          scope.setModelInitial = function() {
            scope.questions.forEach(function(q) { //sets all not visible questions to null
              if (q.visible) {
                var isVisible = q.visible(scope.model, scope.subject);
                if (!isVisible) {
                  scope.model[q.columnName] = null;
                }
              }
            });
          }

          scope.isVisible = function(question) {

            if(question.visible) {
              return question.visible(scope.model, scope.subject);
            }
            return true;
          }

          scope.setVisibility = function() {
            for(var qc in scope.config.visibility) {
              scope.questions.forEach(function(q) {
                if (q.columnName == qc) {
                  q.visible = scope.config.visibility[qc];
                }
              });
            }
          }

          scope.setOnChange = function() {
            for(var qc in scope.config.onChange) {
              scope.questions.forEach(function(q) {
                if (q.columnName == qc) {
                  q.onChange = scope.config.onChange[qc];
                }
              });
            }
          }

          scope.setIteration = function() {
            scope.config.iterateQuestions.forEach(function(qi) {
                scope.questions.forEach(function(q) {
                  if (q.columnName === qi) {
                    q.isIterated = true;
                  }
                });
            });
          }

          scope.viewVal = function(question, contact, subject) {

            var val = contact[question.columnName];
            //if (!val) val = subject[question.columnName]

            var d = question.domain;

            switch(true) {
                case (d.isEnumerated):
                  return scope.getListVal(question.domain, val);
                case (d.domainID == 105):
                    return val ? val.split('T')[0] : null;
                default:
                    return val != null ? val.toString().replace('.',',') : null;
            }
          }

          scope.getListVal = function(domain, val) {
            for (var i = 0; i < domain.domainValues.length; i++) {
              if (domain.domainValues[i].code == val) {
                return domain.domainValues[i].text;
              }
            }
          }

          scope.setModel = function() {
            var ret = {};

            ret.socialNumber = scope.subject.socialNumber;

            for (var i = 0; i < scope.questions.length; i++) {
              ret[scope.questions[i].columnName] = null;
              if (!scope.updateEntity) { //new!

                // set default values
                if (scope.config.defaults[scope.questions[i].columnName]) {
                  ret[scope.questions[i].columnName] = scope.config.defaults[scope.questions[i].columnName]();
                }

                //set iterated values
                if (scope.questions[i].isIterated && scope.iterateEntity)
                {
                    ret[scope.questions[i].columnName] = (scope.iterateEntity[scope.questions[i].columnName] || scope.subject[scope.questions[i].columnName]);
                }
              } else { //update!
                ret.id = scope.updateEntity.contactID;
                var val = (scope.updateEntity[scope.questions[i].columnName] != null ? scope.updateEntity[scope.questions[i].columnName] : null);

                if (!val == null)
                  val = scope.subject[scope.questions[i].columnName]

                ret[scope.questions[i].columnName] = val;
              }
            }

            //set default valid
            ret.isValid = true;
            console.log('updateEntity=',scope.updateEntity);
            console.log('inital model=', ret);
            scope.model = ret;
          }
          scope.getQuestionClass = function(hasError, hasValue) {
              if (hasError) return 'has-error';

              return hasValue ? 'has-value' : 'has-no-error';
          };
          scope.init = function() {
            scope.serverSaveErrors = [];
            scope.model.refIndex = scope.getDefaultRefIndex();
            scope.setContacts(scope.model.refIndex);



          }
          scope.later = function() {
            scope.model.refIndex++;
            scope.setContacts(scope.model.refIndex);
          }
          scope.sooner = function() {
            scope.model.refIndex--;
            scope.setContacts(scope.model.refIndex);
          }
          scope.getDefaultRefIndex = function() {

            if (!scope.contactToUpdate) {
              return 0;
            }

            var i;
            var loops = (scope.subject.contacts.length);//-scope.model.refContactCount);

            for (i = 0; i <= loops; i++) {
                if (scope.subject.contacts[i].contactID == scope.contactToUpdate.contactID) {
                  return i+1;
                }
            }

          }
          scope.setContacts = function(index) {

            var arr = [];
            var arrOpt = [];

            if (scope.model.refContactCount) {
              for (var j = 0; j < scope.model.refContactCount; j++) {
                if (scope.subject.contacts[j+index]) {
                  arr.push(scope.subject.contacts[j+index]);
                  arrOpt.push(scope.subject.contacts[j+index].optionals || {});
                }
                else
                  break;
              }
            }
            scope.model.lastContact = scope.contactToUpdate ? null : arr[0];
            scope.model.refContacts = arr;
            scope.model.refContactsOptionals = arrOpt;
          }

          scope.saveContact = function () {

            if (scope.accountModel.activeAccount.unit.typeID == 3) {
               if (scope.model.contactModel.hypoglycemiaKids == null) {
                 var hi= confirm("Du har glömt att spara in uppgift om Hypoglykemi? Vill du spara ändå?");
                 if (hi == false) return;
               }
               if (scope.model.contactModel.ketoKids == null) {
                 var hi= confirm("Du har glömt att spara in uppgift om Ketoacidos? Vill du spara ändå?");
                 if (hi == false) return;
               }
            }


			      scope.serverSaveErrors = [];
    			  scope.isSaving = true;
    			  scope.model.contactModel.optionals = scope.model.contactOptionalsModel;

            console.log('saving', scope.model.contactModel);

    			  var dfd = dataService.saveContactNew(scope.model.contactModel)

    				.then(function (response) {
              console.log('after save',response);
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

              console.log(response);

    					var data = response.data;

              //validation variable errors
    					if (data.ModelState != null) {
    					  for (var prop in data.ModelState) {
					        if (data.ModelState.hasOwnProperty(prop)) scope.serverSaveErrors.push(data.ModelState[prop][0]);
    					  }
              }  //validation overall contactDate
              else {
                if(response.statusText) scope.serverSaveErrors.push(response.statusText);
                else scope.serverSaveErrors.push('Ett okänt fel inträffade. Var god försök igen senare.');
    					}

    					scope.isSaving = false;
    				});
    			};

          scope.$watch('subject', function(newValue) {
            scope.init();
          });
          /*scope.$watch('contactToUpdate', function(newValue) {
            scope.init();
          });*/
          scope.$watch('newIndex', function(newValue) {
            scope.init();
          });

        }
        return {
              restrict : 'A',
              templateUrl: 'src/components/ReportForm/ReportFormNew.html',
              link: link,
              scope: {
    	          accountModel 	: '=',
                subject 		: '=',
    		        contactToUpdate	: '=',
                newIndex : '=',
                questions : '=',
                optionalQuestions : '='
              }
        };
    }]);
