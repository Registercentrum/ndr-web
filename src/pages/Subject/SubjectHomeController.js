angular.module("ndrApp")
  .controller('SubjectHomeController', [ '$scope', function ($scope) {
    $scope.model = {
      survey: $scope.accountModel.PROMSubject ||
              _.find(
                $scope.accountModel.subject.invites,
                function (i) { return !i.submittedAt && !i.isDeclined; }),
    };
  }]);
