angular.module("ndrApp")
  .controller('SubjectSurveysController',
            ['$scope', '$state', '$timeout', '$modal', 'accountService', 'dataService',
    function ($scope,   $state,   $timeout,   $modal,   accountService,   dataService) {

    $scope.accountService = accountService;


    $scope.model = {
      survey: $scope.accountModel.PROMSubject ||
              _.find(
                $scope.accountModel.subject.invites,
                function (invite) { return !invite.submittedAt && !invite.isDeclined; }),
    };
  }]);
