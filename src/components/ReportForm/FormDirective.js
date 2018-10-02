'use strict';

angular.module('ndrApp')
    .directive('form', ['$q','dataService','calcService','$state', '$modal', '$filter', function($q, dataService, calcService, $state, $modal, $filter) {

        function link (scope, element, attrs) {

          scope.getErrorClass = function(hasError) {
            return hasError ? 'has-error' : 'has-no-error';
          }
          scope.init = function() {
            if (scope.subject) {
              scope.setModel();
              scope[scope.name].$setPristine();
              scope.setIteration();
              scope.setOnChange();
              scope.setVisibility();
              scope.setHiddenToNull();
            }
          }
          scope.setHiddenToNull = function() {
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
                    if (scope.config.iterateCondition[q.columnName]) {
                      q.isIterated = scope.config.iterateCondition[q.columnName](scope.unitType)
                    } else {
                      q.isIterated = true;
                    }
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
                if ((scope.questions[i].isIterated && scope.iterateEntity) || (scope.subject[scope.questions[i].columnName]))
                {
                    
                    //Try iterate from subject first
                    if (scope.subject[scope.questions[i].columnName]) {
                      ret[scope.questions[i].columnName] = scope.subject[scope.questions[i].columnName];
                    } //Then normal iteration from contact
                    else if (scope.iterateEntity[scope.questions[i].columnName] != null) {
                      ret[scope.questions[i].columnName] = scope.iterateEntity[scope.questions[i].columnName];
                    } 

                    //Normal iteration from contact firstly, from subject secondly 
                    /*if (scope.iterateEntity[scope.questions[i].columnName] != null) {
                      ret[scope.questions[i].columnName] = scope.iterateEntity[scope.questions[i].columnName];
                    } else if (scope.subject[scope.questions[i].columnName]) {
                      ret[scope.questions[i].columnName] = scope.subject[scope.questions[i].columnName];
                    }*/

                    //Exception iterate from incidence
                    if (scope.questions[i].columnName == 'yearOfOnset') {
                      if (scope.subject.incidence != null) {
                        if (scope.subject.incidence.incDate != null) {
                          ret[scope.questions[i].columnName] = parseInt(scope.subject.incidence.incDate.substring(0, 4));
                        }
                      }
                    }
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
            scope.model = ret;
          }
          scope.getQuestionClass = function(hasError, hasValue) {
              if (hasError) return 'has-error';

  						return hasValue ? 'has-value' : 'has-no-error';
  				};

          scope.$watch('subject', function(newValue) {
            scope.init();
          });
          scope.$watch('updateEntity', function(newValue) {
            if (scope.subject) scope.init();
          });
          /*scope.$watch('newIndex', function(newValue) {
            if (scope.subject) scope.init();
          });*/
        }
        return {
          restrict : 'A',
          templateUrl: 'src/components/ReportForm/Form.html',
          link: link,
          scope: {
            name : '=',
            subject 		: '=',
		        updateEntity	: '=',
            iterateEntity : '=',
            refModels : '=',
            questions : '=',
            config : '=',
            newIndex : '=',
            model: '=',
            unitType: '='
          }
        };
    }]);
