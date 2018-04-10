angular.module('ndrApp')
    .directive('ndrQuestion', [function() {
		
		return {
			restrict: 'A',
			template: [	'<div class="row Report-formGroup" ><div class="col-md-5 Report-formGroup-form">',
						'<label>{{ question.question }}</label><i class="fa fa-question-circle helpNote" ng-show="question.helpNote != null" tooltip="{{question.helpNote}}"></i>',
						'<div ndr-Question-List ng-if="question.domain.isEnumerated" question="question"></div>',
						'<div ndr-Question-Numeric ng-if="question.domain.domainID == 101" question="question"></div>',
						'<div ndr-Question-Decimal1 ng-if="question.domain.domainID == 102" question="question"></div>',
						'<div ndr-Question-Decimal2 ng-if="question.domain.domainID == 103" question="question"></div>',
						'<p ng-show="question.iterate && form.{{question.columnName}}.$pristine && question.value != null" class="Report-formItemHelp help-block iteration">OBS Förifyllt från tidigare rapportering</p>',
						'</div></div>'].join(''),
			require:"^form", //inject parent form as the forth parameter to the link function
			link: function(scope, iElement, iAttrs, form) {
				scope.form = form;				
			},
			replace: true,
			scope: {
				question: "="
			}
		}

    }]);
angular.module('ndrApp')
    .directive('ndrQuestionList', [function() {
		//template: '<select id="{{ question.columnName }}" name="{{ question.columnName }}" placeholder="{{question.question}}" ng-model="question.value" class="form-control" ng-options="type.code as type.text for type in question.domain.domainValues"><option value="">-- välj --</option></select>',
		return {
			restrict: 'A',
			template: '<select id="{{ question.columnName }}" name="{{ question.columnName }}" placeholder="{{question.question}}" ng-model="question.value" class="form-control"><option value="">-- välj --</option><option ng-repeat="domainvalue in question.domain.domainValues" value="{{domainvalue.code}}">{{domainvalue.text}}</option></select>',
			require:"^form",
			link: function(scope, iElement, iAttrs, form) {
				scope.form = form;
			},
			replace: true,
			scope: {
				question: "="
			}
		}

    }]);
angular.module('ndrApp')
    .directive('ndrQuestionNumeric', [function() {
		
		return {
			restrict: 'A',
			template: '<div ng-class="getErrorClass(form.{{ question.columnName}}.$invalid && !form.{{ question.columnName}}.$pristine)"><input name="{{question.columnName}}" type="number" min="{{question.minValue || 0}}" max="{{question.maxValue || 1000}}" class="form-control" placeholder="{{question.question}}" ng-model="question.value" decimals="0" ><p class="Report-formItemHelp help-block" ng-show="form.{{ question.columnName}}.$error.min || form.{{ question.columnName}}.$error.max"">{{ question.question}} kan anta ett värde mellan {{question.minValue}} och {{question.maxValue}}.</p></div>',
			require:"^form",
			link: function(scope, iElement, iAttrs, form) {
				scope.form = form;
				scope.getErrorClass = function(hasError) {
					if(hasError)
						return 'has-error';
					else
						return 'has-no-error';
				};
			},
			replace: true,
			scope: {
				question: "="
			}
		}

    }]);
angular.module('ndrApp')
    .directive('ndrQuestionDecimal1', [function() {
		
		return {
			restrict: 'A',
			template: '<div ng-class="getErrorClass(form.{{ question.columnName}}.$invalid && !form.{{ question.columnName}}.$pristine)"><input name="{{question.columnName}}" type="number" min="{{question.minValue || 0}}" max="{{question.maxValue || 1000}}" class="form-control has-error" placeholder="{{question.question}}" ng-model="question.value" decimals="1" ><p class="Report-formItemHelp help-block" ng-show="form.{{ question.columnName}}.$error.min || form.{{ question.columnName}}.$error.max"">{{ question.question}} kan anta ett värde mellan {{question.minValue}} och {{question.maxValue}}.</p></div>',
			require:"^form",
			link: function(scope, iElement, iAttrs, form) {
				scope.form = form;
				scope.getErrorClass = function(hasError) {
					if(hasError)
						return 'has-error';
					else
						return 'has-no-error';
				};
			},
			replace: true,
			scope: {
				question: "=",
				value: "="
			}
		}

    }]);
angular.module('ndrApp')
    .directive('ndrQuestionDecimal2', [function() {
		
		return {
			restrict: 'E',
			template: '<div ng-class="getErrorClass(form.{{ question.columnName}}.$invalid && !form.{{ question.columnName}}.$pristine)"><input name="{{question.columnName}}" type="number" min="{{question.minValue || 0}}" max="{{question.maxValue || 1000}}" class="form-control has-error" placeholder="{{question.question}}" ng-model="question.value" decimals="2" ><p class="Report-formItemHelp help-block" ng-show="form.{{ question.columnName}}.$error.min || form.{{ question.columnName}}.$error.max"">{{ question.question}} kan anta ett värde mellan {{question.minValue}} och {{question.maxValue}}.</p></div>',
			require:"^form",
			link: function(scope, iElement, iAttrs, form) {
				scope.form = form;
				scope.getErrorClass = function(hasError) {
					if(hasError)
						return 'has-error';
					else
						return 'has-no-error';
				};
			},
			replace: true,
			scope: {
				question: "=",
				value: "="
			}
		}

    }]);