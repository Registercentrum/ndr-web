'use strict';

angular.module('ndrApp')
  .controller('ReportPROMController', [
                 '$scope', '$stateParams', '$state', '$modal', '$filter', 'List', 'dataService',
        function ($scope,   $stateParams,   $state,   $modal,  $filter,   List, dataService) {
		
			console.log('init');
			console.log($scope.model);
			
			$scope.model = {
				form: null,
				answers: {}
			};
			
			dataService.getPROMFormMeta(function(d) {
				$scope.model.form = d;
			});
			
			$scope.click = function(columnName, val) {
				$scope.model.answers[columnName] = ($scope.model.answers[columnName] == val ? null : val);
				console.log($scope.model.answers);
			};
			
			$scope.save = function () {
				
			};
  }]);

