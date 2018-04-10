angular.module("ndrApp")
  .controller('SubjectSurveyController',
            ['$scope', '$state', '$stateParams', '$timeout', '$modal', 'accountService', 'dataService',
    function ($scope,   $state, $stateParams,   $timeout,   $modal,   accountService,   dataService) {


    $scope.accountService = accountService;

    var survey = $scope.accountModel.PROMSubject ||
        _.find(
          $scope.accountModel.subject.invites,
          function (invite) { return !invite.submittedAt && !invite.isDeclined; });

    if($stateParams.inviteID){
      survey = _.find(
        $scope.accountModel.subject.invites,
        function (invite) { return invite.inviteID == $stateParams.inviteID; });
    }

    $scope.model = {
      survey: survey,
      statusBarFixed: true,
      questionsCount: 0,
      activeQuestion: null,
      unansweredQuestions: []
    };


      $(".Panel").bind("keydown", function (e) {
        if (e.keyCode == 38 || e.keyCode == 40) {
          e.preventDefault();
        }

        if (e.keyCode == 38){
          $timeout(function () {
            $scope.setActiveQuestion($scope.model.activeQuestion - 1);
          }, 250);
        }

        if (e.keyCode == 40){
          $timeout(function () {
            $scope.setActiveQuestion($scope.model.activeQuestion + 1);
          }, 250);
        }
      })


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

      console.log('event fired',value);

      answers[name] = value ? value : null;
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
          // clean the model from PROMSubject

          delete accountService.accountModel.PROMSubject
          // update subject model so there's no lingering messages about
          // survey to answer
          var submittedInvite = accountService.accountModel.subject.invites.find(function (i) {
            return $scope.model.survey.inviteID === i.inviteID;
          });
          if (submittedInvite) submittedInvite.submittedAt = moment().format("YYYY-MM-DD");
        });
    };

    $scope.showDeclineModal = function () {
      declineModalInstance = $modal.open({
        templateUrl: "declineModalTmpl",
        backdrop   : true,
        scope      : $scope,
        size       : "lg"
      });
    }

    $scope.showInfoModal = function () {
      infoModalInstance = $modal.open({
        templateUrl: "infoModalTmpl",
        backdrop   : true,
        scope      : $scope,
        size       : "lg"
      });
    }

    $scope.closeAndLogout = function (stateName) {
      if (!stateName) {
        stateName = "main.home";
        accountService.logOut();
      }

      $state.go(stateName, { tab: 'besvarade-enkater' }, {reload: true});

      if (confirmModalInstance) confirmModalInstance.dismiss("cancel");
      if (declineModalInstance) declineModalInstance.dismiss("cancel");
    };

    $scope.declineForm = function () {
      var answers = $scope.model.answers;
      answers.isDeclined = true;

      dataService.savePROMForm($scope.model.survey.inviteID, answers)
        .then(function (response) {
          accountService.logOut();

          // clean the model from PROMSubject
          delete accountService.accountModel.PROMSubject;
          // update subject model so there's no lingering messages about
          // survey to answer

			if (accountService.accountModel.visitor.principal != null) {
				var declinedInvite = accountService.accountModel.subject.invites.find(function (i) {
					return $scope.model.survey.inviteID === i.inviteID;
				});

				if (declinedInvite) declinedInvite.isDeclined = true;

				$state.go("main.subject.home", {}, {reload: true});

				return;
			} else {
				$state.go('main.home', {}, {reload: true});
			}

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

      console.log("answers", $scope.model.answers)

      for (var q in $scope.model.answers) {
        if ($scope.model.answers[q] !== null) count += 1;
      }
      return count;
    }

    function getUnansweredQuestions () {
      var questions = [];
      $scope.model.PROMFormMeta.forEach(function (mainGroup) {
        mainGroup.questiongroups.forEach(function (group) {
          group.questions.forEach(function (q) {
            if ($scope.model.answers[q.columnName] === null ||
                $scope.model.answers[q.columnName] === undefined)
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
