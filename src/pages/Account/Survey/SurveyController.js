'use strict';

angular.module('ndrApp')
  .controller('SurveyController', [
                 '$scope', '$stateParams', '$state', '$filter', '$modal', 'List', 'dataService', 'accountService',
        function ($scope,   $stateParams,   $state,   $filter,   $modal,   List,   dataService,   accountService) {

        var account = $scope.accountModel;
        console.log('SurveyController: Init');

        $scope.model = {
          createdInvite: null,
          newInvite: {
            socialnumber: null,
            subjectID: null,
            openUntil: null,
            tag: null,
            diabetesType: null,
          },
          datePicker: {
            opened: false,
            format: "yyyy-MM-dd",
            minDate: new Date(),
            dateOptions: {
              formatYear: 'yy',
              startingDay: 1
            }
          },
          invites: {
            all      : [], // all the invites
            displayed: [], // currently shown in the interface, can be set to new or declined
            new      : [], // answered but not signed yet
            declined : []  // declined to answer
          },
          socialNumberFilter: null,
          filterType: "all",
          selectedInvite: null
        };

        // *********************************************************************
        // List Tab
        // *********************************************************************

        getInvites();

        function getInvites () {
          dataService.getInvites()
            .then(function (response) {
              $scope.model.invites.all = response.data.slice();
              $scope.model.invites.displayed = response.data.slice();
              $scope.model.invites.new = _.filter(response.data, function (invite) {
                return invite.submittedAt && !invite.approvedNDR;
              });
              $scope.model.invites.declined = _.filter(response.data, function (invite) {
                return invite.declined;
              });
            });
        }

        $scope.setDisplayed = function (type) {
          $scope.model.filterType = type;

          if (type === "socialnumber") {
            $scope.model.invites.displayed =
              _.filter($scope.model.invites.all, function (invite) {
                return invite.subject.socialNumber.indexOf($scope.model.socialNumberFilter) !== -1
              });
          } else {
            $scope.model.invites.displayed = $scope.model.invites[type];
          }
        }

        $scope.showAnswersModal = function (invite) {
          invite.copyText = _.reduce(invite.outcomes, function (p, n) {
            return p + n.dimension.desc + ',' + n.outcome + ',' + (n.changeSinceLast || 'n/a') + '\n';
          }, "");

          $scope.model.selectedInvite = invite;

          dataService.getPROMFormMeta()
            .then(function (response) {
              $scope.model.formMeta = response.data;
              $modal.open({
                templateUrl: "answersModalTmpl",
                backdrop   : true,
                scope      : $scope,
                size       : "lg"
              });
            })
        }

        $scope.showInviteModal = function (invite) {
          $scope.model.selectedInvite = invite;

          $modal.open({
            templateUrl: "inviteModalTmpl",
            backdrop   : true,
            scope      : $scope,
            size       : "lg"
          });
        }

        $scope.signInvite = function (invite) {
          invite.approvedNDR = invite.approvedNDR ? 0 : 1;

          dataService.updateInvite(invite.inviteID, invite)
            .then(function (response) {
              console.log(response);
            })
            ["catch"](function (error) {
              console.log(error)
              $modal.open({
                template   : "<p>Något gick fel, vänligen försök igen.</p>",
                backdrop   : true,
              });
            });
        }

        $scope.deleteInvite = function (inviteID) {
          dataService.deleteInvite(inviteID)
            .then(function (response) {
              getInvites()
            })
            ["catch"](function (error) {
              console.log(error)
              $modal.open({
                template   : "<p>Något gick fel, vänligen försök igen.</p>",
                backdrop   : true,
              });
            })
        }


        // *********************************************************************
        // New Invite Tab
        // *********************************************************************

        $scope.createInvite = function () {
          var invite = $scope.model.newInvite;

          if (!invite.subjectID || !invite.openUntil) return false;

          $scope.model.newInviteError = "";

          dataService.createInvite({
            subjectID: invite.subjectID,
            openUntil: moment(invite.openUntil).format("YYYY-MM-DD")
          })
            .then(function (response) {
              $scope.model.createdInvite = response.data;
              $scope.model.newInvite ={
                socialnumber: null,
                subjectID: null,
                openUntil: null,
                tag: null,
                diabetesType: null
              };
              getInvites();
            })
            ["catch"](function (error) {
              $scope.model.newInviteError = "Något gick fel, vänligen försök igen.";
            });
        }


        $scope.fetchSubject = function (index) {
          var sn = $scope.model.newInvite.socialnumber

          if (!sn || !sn.match(accountService.helpers.pnrRegex)) return false;

          $scope.model.newInviteError = null;
          $scope.model.newInviteDiabetesMissing = false;
          $scope.model.newInvite.subjectID = null;
          $scope.model.newInvite.diabetesType = null;

          dataService.getSubjectBySocialNumber(sn)
            .then(function (subject) {
              if (!subject.subjectID) {
                $scope.model.newInviteError = "Personnummer är felaktigt eller hittas inte i folkbokföringen.";
                return false;
              }

              if (subject.diabetesType === null) {
                $scope.model.newInviteDiabetesMissing = true;
              } else {
                $scope.model.newInvite.diabetesType = subject.diabetesTypeText;
              }

              $scope.model.newInvite.subjectID = subject.subjectID;
            })
            ["catch"](function (error) {
              $scope.model.newInviteError = "Något gick fel, vänligen försök igen.";
            });
        };

        $scope.openDatePicker = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.model.datePicker.opened = true;
        };

  }])