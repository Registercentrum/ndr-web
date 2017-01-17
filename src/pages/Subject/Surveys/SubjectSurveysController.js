angular.module("ndrApp")
  .controller('SubjectSurveysController',
    ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', 'APIconfigService',
    function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http, APIconfigService) {

    var survey = $scope.accountModel.subject.invites[0];

    console.log("ssss", survey);

    $scope.model = {
      questionsCount: 0,
      activeQuestion: null,
      answers: survey.prom || {}
    };
    $scope.model.answersCount = getAnswersCount();

    dataService.getPROMFormMeta()
      .then(function (response) {
        $scope.model.PROMFormMeta = response.data;
        $scope.model.activeQuestion =
          response.data[0].questiongroups[0].questions[0].questionID
        $scope.model.questionsCount = getQuestionsCount(response.data);
        console.log("cccc", $scope.model.questionsCount)
        console.log("mmmm", response.data);
      });

    $scope.handleAnswerChange = function (name, value) {
      // console.log($scope.model.answers[name], value)
      // if (+$scope.model.answers[name] === +value) {
      //   console.log(name, value)
      //   $scope.model.answers[name] = null;
      // }
      // console.log($scope.model.answers);
      $scope.model.answersCount = getAnswersCount()
      $scope.setActiveQuestion(
        $scope.model.activeQuestion + 1
      )
      dataService.savePROMForm(survey.inviteID, survey.key, $scope.model.answers);
    }

    $scope.setActiveQuestion = function (id) {
      $scope.model.activeQuestion = id;
      $("html, body").animate({
        scrollTop: $("#question-" + id).offset().top - 20
      }, 500);
    }

    function getQuestionsCount (meta) {
      var count = 0;
      meta.forEach(function (mainGroup) {
        mainGroup.questiongroups.forEach(function (group) {
          console.log("count", count, group.questions.length)
          count += group.questions.length;
        });
      });
      return count;
    }

    function getAnswersCount () {
      var count = 0;
      for (q in $scope.model.answers) {
        if ($scope.model.answers[q] !== null) count += 1;
      }
      return count;
    }
}])

