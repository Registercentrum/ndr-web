angular.module("ndrApp")
  .controller('SubjectSurveysController',
    ['$scope', 'dataService', function ($scope, dataService) {

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
        $scope.model.questionsCount = getQuestionsCount(response.data);
      });

    $scope.handleAnswerChange = function ($event) {
      var name = $event.target.name;
      var value = $event.target.value;
      $scope.model.answers[name] = +$scope.model.answers[name] === +value ? null : value;
      $scope.model.answersCount = getAnswersCount()
      $scope.setActiveQuestion($scope.model.activeQuestion + 1)
      dataService.savePROMForm(survey.inviteID, survey.key, $scope.model.answers);
    }

    $scope.setActiveQuestion = function (id) {

      var $el = $("#question-" + id);
      $("html, body").animate({
          scrollTop: $el.offset().top + ($el.outerHeight() / 2) - ($(window).height() / 2)
        },
        500,
        function () {
          $scope.$apply(function () {
            $scope.model.activeQuestion = id;
          });
        });
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

    $(window).scroll(function () {
      var scrollTop = $(document).scrollTop() + ($(window).height() / 2);
      var positions = [];
      var index = 0;

      $('.question-holder').each(function(){
        var $this = $(this);
        positions.push({
          position: $this.offset().top + $this.outerHeight() / 2,
          id: +this.id.split("-")[1]
        });
      });

      for (var i = positions.length - 1; i >= 0; i--) {
        if (Math.abs(scrollTop - positions[i].position) < Math.abs(scrollTop - positions[index].position)) {
          index = i;
        }
      }

      $scope.$apply(function () {
        $scope.model.activeQuestion = +positions[index].id;
      })
    });
  }])

