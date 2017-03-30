angular.module("ndrApp")
  .controller('SubjectSurveysController', [ '$scope', function ($scope) {
    $scope.model = {
      survey: $scope.accountModel.PROMSubject ||
              _.filter(
                $scope.accountModel.subject.invites,
                function (i) { return !i.submittedAt && !i.isDeclined; }),
    };
  }]);
