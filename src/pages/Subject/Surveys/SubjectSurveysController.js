angular.module("ndrApp")
  .controller('SubjectSurveysController',
    ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', 'APIconfigService',
    function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http, APIconfigService) {

    var survey = $scope.accountModel.subject.invites[0];

    console.log("ssss", survey);

    dataService.getPROMFormMeta()
      .then(function (response) {
        $scope.PROMFormMeta = response.data;
        console.log("mmmm", response.data);
      });
}])

