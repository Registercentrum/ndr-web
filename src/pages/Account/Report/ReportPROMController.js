'use strict';
angular.module('ndrApp')
  .controller('ReportPROMController', [
                 '$scope', '$stateParams', '$state', '$modal', '$filter', '$timeout', 'List', 'dataService',
        function ($scope,   $stateParams,   $state,   $modal,  $filter, $timeout,   List, dataService) {
			
			$scope.model = {
				form: null,
				props: [],
				answers: {},
				missingAnswers: [],
				highlightedQuestion: null
			};
			
			$scope.showNotAnswered = function() {
				var props;
				
				$scope.model.missingAnswers = [];
				
				for (var i = 0; i < $scope.model.props.length; i++) { 
					if (!$scope.model.answers[ $scope.model.props[i]]) {
						$scope.model.missingAnswers.push(
							{
								no: i+1,
								columnName:  $scope.model.props[i]
							}
						);
					}
				}
				
			};
			
			$scope.setProps = function() {
				$scope.model.props =  []

				for (var i = 0; i < $scope.model.form.length; i++) { 
					for (var j = 0; j < $scope.model.form[i].questiongroups.length; j++) { 
						for (var k = 0; k < $scope.model.form[i].questiongroups[j].questions.length; k++) { 
							$scope.model.props.push($scope.model.form[i].questiongroups[j].questions[k].columnName);
						}
					}
				}
				
			};
			
			$scope.init = function() {
				$scope.setProps();
				$scope.showNotAnswered();
			};
			
			dataService.getPROMFormMeta(function(d) {
				$scope.model.form = d;
				$scope.init();
			});
			
			$scope.click = function(columnName, val) {
				$scope.model.answers[columnName] = ($scope.model.answers[columnName] == val ? null : val);
				$scope.showNotAnswered();
			};
			
			$scope.save = function () {
				$modal.open({
				  templateUrl: 'myModalContent.html',
				  controller : 'ModalInstanceCtrl',
				  backdrop   : true,
				  scope      : $scope
				});
			};
			
			$scope.gotoAnchor = function(x) {
				
				var elm = document.getElementById('anchor' + x);
				
				$('html, body').animate({
					scrollTop: $(elm).offset().top-15 + 'px'
				}, 'fast');
				
				console.log(x);
				
				$scope.model.highlightedQuestion = x;
                $timeout(function () { $scope.model.highlightedQuestion = null; }, 2000);

			};
			
			/*$scope.cancel = function () {
				console.log('go to start');
			};*/
  }]);

