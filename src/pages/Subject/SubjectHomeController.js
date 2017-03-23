angular.module("ndrApp")
  .controller('SubjectHomeController',
            ['$scope', 'dataService',
    function ($scope,   dataService) {

    $scope.model = { survey: null };
    // make sure invites aren't stale on the model
    dataService.getInvites()
      .then(function (response) {
        $scope.model.survey = $scope.accountModel.PROMSubject ||
                              _.find(response.data, function (i) {
                                return !i.submittedAt && !i.isDeclined; })
      });
  }]);
