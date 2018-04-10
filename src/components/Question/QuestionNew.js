angular.module('ndrApp')
    .directive('ndrQuestionNew', [function() {

		return {
			restrict: 'A',
			template: ['<div class="questionfield" ng-class="getQuestionClass(form.{{ question.columnName}}.$invalid, model[question.columnName] != null)">',
                    '<div ndr-Question-List-New ng-if="question.domain.isEnumerated" question="question" model="model" methods="methods" subject="subject"></div>',
                    '<div ndr-Question-Numeric-New ng-if="question.domain.domainID == 101" question="question" model="model" methods="methods" subject="subject"></div>',
                    '<div ndr-Question-Decimal-New ng-if="[102,103,109].indexOf(question.domain.domainID) !== -1" question="question" model="model" methods="methods" subject="subject"></div>',
                    '<div ndr-Question-String-New ng-if="question.domain.domainID == 106" question="question" model="model" methods="methods" subject="subject"></div>',
                    '<div ndr-Question-Date-New ng-if="question.domain.domainID == 105" question="question" model="model" methods="methods" subject="subject"></div>',
  		              '<p ng-show="question.isIterated && !model.id && model && form.{{question.columnName}}.$pristine && model[question.columnName]" class="Report-formItemHelp help-block iteration">OBS Förifyllt från tidigare rapportering</p>',
                    '<p ng-if="question.id == 120" class="Report-formItemHelp help-block iteration">Om fältet lämnas tomt så beräknas LDL, om möjligt, när formuläret sparas.</p>',
                    '<p ng-show="form.{{question.columnName}}.$error.min || form.{{ question.columnName}}.$error.max" class="Report-formItemHelp help-block iteration">{{question.question}} kan anta värden mellan {{question.minValue}} och {{question.maxValue}}</p>',
                    '<p ng-show="question.errorMessage != null" class="Report-formItemHelp help-block iteration">{{question.errorMessage}}</p>',
                    '<p ng-show="form.{{question.columnName}}.$error.pattern && question.domain.domainID == 105" class="Report-formItemHelp help-block iteration">Datum på formen ÅÅÅÅ-MM-DD.</p>',
                    '<p ng-show="form.{{question.columnName}}.$error.pattern && question.domain.domainID != 105" class="Report-formItemHelp help-block iteration">{{question.question}} kan anta värden mellan {{question.minValue}} och {{question.maxValue}}</p>',
                '</div>'].join(''),
			require:"^form", //inject parent form as the forth parameter to the link function
			link: function(scope, iElement, iAttrs, form) {
				scope.form = form;
        /*DomainID	Name
        101	Integer
        102	Decimal1 form.{{ question.columnName}}.$invalid && !form.{{ question.columnName}}.$pristine
        103	Decimal2
        104	Float
        105	Date
        106	Text
        107	Bool
        108	DatumTid
        109	Decimal3
        <div ng-show="contactForm.contactDate.$error.checkContactDate" class="has-error">
          <p class="Report-formItemHelp help-block" >Det finns redan ett besök på detta datum! Komplettera det befintliga besöket eller skriv in ett nytt datum.</p>
        </div>
        */
        scope.getQuestionClass = function(hasError, hasValue) {
            if (hasError) return 'has-error';

						return hasValue ? 'has-value' : 'has-no-error';
				};
			},
			replace: true,
			scope: {
				question: "=",
        model: "=",
        methods: "=",
        subject: "=",
        unitType: '='
			}
		}
}]);
angular.module('ndrApp')
    .directive('ndrQuestionListNew', ['calcService',  function(calcService) {
		//template: '<select id="{{ question.columnName }}" name="{{ question.columnName }}" placeholder="{{question.question}}" ng-model="question.value" class="form-control" ng-options="type.code as type.text for type in question.domain.domainValues"><option value="">-- välj --</option></select>',
		return {
			restrict: 'A',
      template: '<select name="{{question.columnName}}" ng-model-options="JSON.stringify(str)" ng-disabled="question.isCalculated" ng-change="onChange()" class="form-control" ng-model="model[question.columnName]" ng-options="type.code as type.text for type in values"><option value=""></option></select>',
      require:"^form",
			link: function(scope, iElement, iAttrs, form) {
				scope.form = form;
        scope.options = "{ 'updateOn': '$inherit' }";

        //divides active and not active values
        scope.getValues = function() {

          var ret = [];
          var notActive = [];

          scope.question.domain.domainValues.map(function(v) {
            if (v.isActive) {
              ret.push(v);
            } else {
              v.text = v.text + ' (inaktiv idag)'
              notActive.push(v);
            }
          });

          ret = ret.concat(notActive);

          return ret;
        }
        scope.values = scope.getValues();


        scope.onChange = function() {
          if(scope.question.onChange) {
            scope.question.onChange(scope);
          }
          scope.model.isValid = form.$valid;
        }
			},
			replace: true,
			scope: {
				question: "=",
        model: "=",
        methods: "=",
        subject: "="
			}
		}
}]);
angular.module('ndrApp')
    .directive('ndrQuestionDecimalNew', ['calcService',  function(calcService) {
		//template: '<select id="{{ question.columnName }}" name="{{ question.columnName }}" placeholder="{{question.question}}" ng-model="question.value" class="form-control" ng-options="type.code as type.text for type in question.domain.domainValues"><option value="">-- välj --</option></select>',
		return {
			restrict: 'A',
      template: '<div style="display: flex"><input style="flex:1" parse-commas ng-keypress="filterValue($event)" ng-pattern="pattern" name="{{question.columnName}}" ng-disabled="question.isCalculated" ng-change="onChange()" type="text" decimals="{{decimals}}" class="form-control" data-ng-model="model[question.columnName]" /><span style="margin: 8px 3px 0; width:68px;" ng-show="question.measureUnit">{{question.measureUnit}}</span>',
      require: '^form',
			link: function(scope, iElement, iAttrs, form) {

        scope.form = form;

        scope.pattern = (function() {
            return {
                test: function(input) {
                    if(input < scope.question.minValue || input > scope.question.maxValue){
                        return false;
                    } else{
                        return true;
                    }
                }
            };
        })();

        scope.filterValue = function($event){
            if(isNaN(String.fromCharCode($event.keyCode)) && $event.keyCode !== 44 && $event.keyCode !== 46){
                $event.preventDefault();
            }
        };

        scope.onChange = function() {

          if (scope.model[scope.question.columnName] === '') scope.model[scope.question.columnName] = null;

          if(scope.question.onChange) {
            scope.question.onChange(scope);
          }
          scope.model.isValid = form.$valid;
        }

        //ng-model-options="updateOn"
        scope.$watch('question', function(newValue) {
          switch(scope.question.domain.domainID) {
              case 102:
                  scope.decimals = 1;
                  break;
              case 103:
                  scope.decimals = 2;
                  break;
              case 109:
                  scope.decimals = 4;
                  break;
              default:
                  scope.decimals = 0;
          }

        });

			},
			replace: true,
			scope: {
				question: "=",
        model: "=",
        methods: "=",
        subject: "="
			}
		}
}]);

angular.module('ndrApp')
    .directive('ndrQuestionNumericNew', ['calcService',  function(calcService) {
		//template: '<select id="{{ question.columnName }}" name="{{ question.columnName }}" placeholder="{{question.question}}" ng-model="question.value" class="form-control" ng-options="type.code as type.text for type in question.domain.domainValues"><option value="">-- välj --</option></select>',
		return {
			restrict: 'A',
      template: '<div style="display: flex"><input style="flex:1" name="{{question.columnName}}" ng-disabled="question.isCalculated" ng-change="onChange()" type="number" decimals="{{decimals}}" step="{{step}}" min="{{question.minValue || 0}}" max="{{question.maxValue || 1000}}" class="form-control" data-ng-model="model[question.columnName]" /><span class="measureUnit" ng-show="question.measureUnit">{{question.measureUnit}}</span>',
      require: '^form',
			link: function(scope, iElement, iAttrs, form) {

        scope.form = form;

        scope.onChange = function() {

          if (scope.model[scope.question.columnName] === '') scope.model[scope.question.columnName] = null;

          if(scope.question.onChange) {
            scope.question.onChange(scope);
          }
          scope.model.isValid = form.$valid;
        }

        //ng-model-options="updateOn"
        /*scope.$watch('question', function(newValue) {
          switch(scope.question.domain.domainID) {
              case 102:
                  scope.step = 0.1;
                  scope.decimals = 1;
                  break;
              case 103:
                  scope.step = 0.01;
                  scope.decimals = 2;
                  break;
              case 109:
                  scope.step = 0.001;
                  scope.decimals = 4;
                  break;
              default:
                  scope.step = 1;
                  scope.decimals = 0;
          }

        });*/

			},
			replace: true,
			scope: {
				question: "=",
        model: "=",
        methods: "=",
        subject: "="
			}
		}
}]);
angular.module('ndrApp')
    .directive('ndrQuestionDateNew', [function() {
		//template: '<select id="{{ question.columnName }}" name="{{ question.columnName }}" placeholder="{{question.question}}" ng-model="question.value" class="form-control" ng-options="type.code as type.text for type in question.domain.domainValues"><option value="">-- välj --</option></select>',
		return {
			restrict: 'A',
      template: '<input name="{{question.columnName}}" placeholder="ÅÅÅÅ-MM-DD" ng-required="question.isMandatory" ng-pattern="/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/" ng-change="onChange()" class="form-control" data-ng-model="model[question.columnName]">',
      require:"^form",
			link: function(scope, iElement, iAttrs, form) {

        //iAttrs.ngModelOptions="{ updateOn: 'blur' }"
				scope.form = form;

        scope.onChange = function(once) {

          //if (scope.model[scope.question.columnName] == '') scope.model[scope.question.columnName] = null;

          if(scope.question.onChange) {
            scope.question.onChange(scope);
          }
          scope.model.isValid = form.$valid;

        }
			},
			replace: true,
			scope: {
				question: "=",
        model: "=",
        methods: "=",
        subject: "="
			}
		}
}]);

angular.module('ndrApp')
    .directive('ndrQuestionStringNew', [function() {
		//template: '<select id="{{ question.columnName }}" name="{{ question.columnName }}" placeholder="{{question.question}}" ng-model="question.value" class="form-control" ng-options="type.code as type.text for type in question.domain.domainValues"><option value="">-- välj --</option></select>',
		return {
			restrict: 'A',
      template: '<input name="{{question.columnName}}" ng-required="question.isMandatory" ng-change="onChange()" class="form-control" data-ng-model="model[question.columnName]">',
      require:"^form",
			link: function(scope, iElement, iAttrs, form) {

        //iAttrs.ngModelOptions="{ updateOn: 'blur' }"
				scope.form = form;

        scope.onChange = function() {

          if (scope.model[scope.question.columnName] == '') scope.model[scope.question.columnName] = null;

          if(scope.question.onChange) {
            scope.question.onChange(scope);
          }
          scope.model.isValid = form.$valid;

        }
			},
			replace: true,
			scope: {
				question: "=",
        model: "=",
        methods: "=",
        subject: "="
			}
		}
}]);

// Here is where the magic works
angular.module('ndrApp')
  .directive('date', function (dateFilter) {
      return {
          require:'ngModel',
          link:function (scope, elm, attrs, ctrl) {

              var dateFormat = attrs['date'] || 'yyyy-MM-dd';

              ctrl.$formatters.unshift(function (modelValue) {
                  return dateFilter(modelValue, dateFormat);
              });
          }
      };
  });
