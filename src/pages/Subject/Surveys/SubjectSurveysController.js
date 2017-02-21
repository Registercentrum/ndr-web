angular.module("ndrApp")
  .controller('SubjectSurveysController',
            ['$scope', '$state', '$timeout', '$modal', 'accountService', 'dataService',
    function ($scope,   $state,   $timeout,   $modal,   accountService,   dataService) {

    $scope.accountService = accountService;

    $scope.model = {
      survey: $scope.accountModel.PROMSubject ||
              _.find(
                $scope.accountModel.subject.invites,
                function (invite) { return !invite.submittedAt; }),
                // function (invite) { return !invite.submittedAt && !invite.isDeclined; }),
      statusBarFixed: true,
      questionsCount: 0,
      activeQuestion: null,
      unansweredQuestions: []
    };
    $scope.model.answers = $scope.model.survey && $scope.model.survey.prom ?
                           $scope.model.survey.prom :
                           {};
    $scope.model.answersCount = getAnswersCount();

    // needed to unselect the answers
    var answers = $scope.model.answers ? _.clone($scope.model.answers) : {};

    var declineModalInstance = null;
    var confirmModalInstance = null;

    dataService.getPROMFormMeta()
      .then(function (response) {
        $scope.model.PROMFormMeta = response.data;
        $scope.model.questionsCount = getQuestionsCount();
        $scope.model.unansweredQuestions = getUnansweredQuestions();
      });

    $scope.handleAnswerChange = function ($event) {
      var name = $event.target.name;
      var value = $event.target.value;
      var model = $scope.model;

      answers[name] = +answers[name] === +value ? null : value;
      model.answers[name] = answers[name];

      model.answersCount = getAnswersCount();
      model.unansweredQuestions = getUnansweredQuestions();

      if (model.activeQuestion !== model.questionsCount)
        $timeout(function () {
          $scope.setActiveQuestion(model.activeQuestion + 1);
        }, 250);

      dataService.savePROMForm($scope.model.survey.inviteID, model.answers);
    };

    $scope.submitForm = function () {
      var answers = $scope.model.answers;
      answers.isSubmitted = true;
      dataService.savePROMForm($scope.model.survey.inviteID, answers)
        .then(function (response) {
          confirmModalInstance = $modal.open({
            templateUrl: "confirmModalTmpl",
            backdrop   : true,
            scope      : $scope,
            size       : "lg"
          });
        })
    };

    $scope.showDeclineModal = function () {
      declineModalInstance = $modal.open({
        templateUrl: "declineModalTmpl",
        backdrop   : true,
        scope      : $scope,
        size       : "lg"
      });
    }

    $scope.closeAndLogout = function (stateName) {
      if (!stateName) stateName = "main.home";

      accountService.logOut();
      $state.go(stateName, {}, {reload: true});

      if (confirmModalInstance) confirmModalInstance.dismiss("cancel");
      if (declineModalInstance) declineModalInstance.dismiss("cancel");
    };

    $scope.declineForm = function () {
      var answers = $scope.model.answers;
      answers.isDeclined = true;
      dataService.savePROMForm($scope.model.survey.inviteID, answers)
        .then(function (response) {
          accountService.logOut();
          $state.go("main.home", {}, {reload: true});
          declineModalInstance.dismiss("cancel");
        });
    };

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
    };

    function getQuestionsCount () {
      var count = 0;
      $scope.model.PROMFormMeta.forEach(function (mainGroup) {
        mainGroup.questiongroups.forEach(function (group) {
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

    function getUnansweredQuestions () {
      var questions = [];
      $scope.model.PROMFormMeta.forEach(function (mainGroup) {
        mainGroup.questiongroups.forEach(function (group) {
          group.questions.forEach(function (q) {
            if (_.isEmpty($scope.model.answers) ||
                $scope.model.answers[q.columnName] === null)
              questions.push(q.questionID);
          });
        });
      });
      return questions;
    }

    $scope.$on("$destroy", function () {
      $(window).off("scroll.statusBar");
    });

    $(window).on("scroll.statusBar", function () {
      var windowHeight = $(window).height();
      var scrollMiddle = $(document).scrollTop() + (windowHeight / 2);
      var scrollBottom = $(document).scrollTop() + windowHeight;
      var positions = [];
      var index = 0;

      var surveyFormBottom =
        $("#SurveyForm").offset().top + $("#SurveyForm").outerHeight()

      $('.question-holder').each(function(){
        var $this = $(this);
        positions.push({
          position: $this.offset().top + $this.outerHeight() / 2,
          id: +this.id.split("-")[1]
        });
      });

      for (var i = positions.length - 1; i >= 0; i--) {
        if (Math.abs(scrollMiddle - positions[i].position) < Math.abs(scrollMiddle - positions[index].position)) {
          index = i;
        }
      }

      if (positions.length) {
        $scope.$apply(function () {
          $scope.model.activeQuestion = +positions[index].id;
          $scope.model.statusBarFixed = scrollBottom - surveyFormBottom <= 0;
        });
      }
    });
  }]);


