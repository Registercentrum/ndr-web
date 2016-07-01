'use strict';
angular.module('ndrApp')
  .controller('KASController', [
                 '$scope', '$stateParams', '$state', '$modal', '$timeout', 'dataService',
        function ($scope,   $stateParams,   $state,   $modal, $timeout, dataService) {
			
			$scope.model = {
				counties: null,
			};

			$scope.init = function() {

			};
			
			dataService.getKAS(function(d) {
				console.log(d);
				$scope.model.counties = d;
			});		
			
  }]);

