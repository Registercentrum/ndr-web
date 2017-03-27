'use strict';

angular.module('ndrApp')
  .controller('SurveyController', [
                 '$window', '$scope', '$stateParams', '$state', '$filter', '$modal', 'List', 'dataService', 'accountService',
        function ($window,   $scope,   $stateParams,   $state,   $filter,   $modal,   List,   dataService,   accountService) {

        var account = $scope.accountModel;
        console.log('SurveyController: Init');

        $scope.model = {
          sortType: "createdAt",
          sortReverse: true,
          createdInvites: [],
          newInvite: {
            socialnumber: null,
            subjectID: null,
            openUntil: moment().add(3, "months").format("YYYY-MM-DD"),
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

        var modalInstance = null;

        // *********************************************************************
        // List Tab
        // *********************************************************************

        getInvites();

        function getPrevOutcomes(invite) {
          if (invite.prevOutcomes) return invite.prevOutcomes;

          var prevOutcomes = _.filter($scope.model.invites.all, function (i) {
            return i.subject.subjectID === invite.subject.subjectID &&
                   i.inviteID !== invite.inviteID &&
                   i.submittedAt &&
                   new Date(i.submittedAt) <= new Date(invite.submittedAt);
          })

          if (prevOutcomes.length) {
            prevOutcomes = _.sortBy(prevOutcomes, function (i) {
              return new Date(i.submittedAt);
            });

            return {
              submittedAt: prevOutcomes[0].submittedAt,
              outcomes: _.map(prevOutcomes[0].outcomes, function (o, i) {
                if (_.isNumber(o.outcome) && _.isNumber(invite.outcomes[i].outcome))
                  o.difference = invite.outcomes[i].outcome - o.outcome;
                return o;
              })
            };
          }

          return null;
        }

        function parseInvites(invites) {
          return _.map(invites, function (invite) {
            invite.datePicker = {
              minDate: new Date(invite.createdAt),
              opened: false
            };
            return invite;
          });
        }

        function getInvites () {
          dataService.getInvites()
            .then(function (response) {
              var invites = parseInvites(response.data)
              $scope.model.invites.all = invites.slice();
              $scope.model.invites.displayed = invites.slice();
              $scope.model.invites.new = _.filter(invites, function (invite) {
                return invite.submittedAt && !invite.isApprovedNDR;
              });
              $scope.model.invites.declined = _.filter(invites, function (invite) {
                return invite.isDeclined;
              });
            });
        }

        $scope.setDisplayed = function (type) {
          $scope.model.filterType = type;

          if (type === "socialnumber") {
            $scope.model.invites.displayed =
              _.filter($scope.model.invites.all, function (invite) {
                return invite.subject.socialNumber.replace("-", "")
                      .indexOf($scope.model.socialNumberFilter.replace("-", "")) !== -1
              });
          } else {
            $scope.model.invites.displayed = $scope.model.invites[type];
          }
        }

        $scope.showAnswersModal = function (invite) {
          invite.prevOutcomes = getPrevOutcomes(invite);
          invite.copyText = _.reduce(invite.outcomes, function (p, n) {
            var prevOutcome = invite.prevOutcomes &&
                              _.find(invite.prevOutcomes.outcomes, function (i) {
                                return i.dimension.id === n.dimension.id
                              });
            var changeSinceLast = prevOutcome && prevOutcome.difference ?
                                  prevOutcome.difference :
                                  "saknas"

            var outcome = n.outcome || "saknas"

            return p + n.dimension.desc + ' | ' + outcome  + ' | ' + changeSinceLast + '\n';
          }, "");

          invite.copyText = "Dimension | Värde | Förändring\n" + invite.copyText;

          dataService.getPROMFormMeta()
            .then(function (response) {
              $scope.model.formMeta = response.data;
              $scope.model.selectedInvite = invite;
              modalInstance = $modal.open({
                templateUrl: "answersModalTmpl",
                backdrop   : true,
                scope      : $scope,
                size       : "lg"
              });
            });
        }

        $scope.showInviteModal = function (invite) {
          $scope.model.selectedInvite = invite;

          modalInstance = $modal.open({
            templateUrl: "inviteModalTmpl",
            backdrop   : true,
            scope      : $scope,
            size       : "lg"
          });
        }

        $scope.goToPrintView = function (invite) {
          if (invite) $scope.model.selectedInvite = invite

          if (!$scope.model.selectedInvite) return false;
          if (modalInstance) modalInstance.dismiss("cancel");

          var url = $state.href("surveyPrint", {
            unitName: $scope.model.selectedInvite.unit.name,
            socialNumber: $scope.model.selectedInvite.subject.socialNumber,
            key: $scope.model.selectedInvite.key
          })

          $window.open(url, "_blank");
        }


        $scope.selectCopyView = function () {
          setTimeout(function() {
            document.getElementById("copy-view").select();
          }, 10);
        }

        $scope.signInvite = function (invite) {
          invite.isApprovedNDR = true;

          var signedInvite = angular.copy(invite)
          delete signedInvite.datePicker;
          delete signedInvite.copyText;
          delete signedInvite.prevOutcomes;

          dataService.updateInvite(invite.inviteID, signedInvite)
            .then(function (response) {
              invite.signed = true;
            })
            ["catch"](function (error) {
              modalInstance = $modal.open({
                template   : "<p>Något gick fel, vänligen försök igen.</p>",
                backdrop   : true,
              });
            });
        }

        $scope.goToSubjectProfile = function(subject) {
          if (modalInstance) modalInstance.dismiss("cancel");
          $state.go("main.account.patient", { patientID: subject.subjectID})
        }

        $scope.showDeleteModal = function (invite) {
          $scope.model.selectedInvite = invite;

          modalInstance = $modal.open({
            templateUrl: "deleteModalTmpl",
            backdrop   : true,
            scope      : $scope,
          });
        }

        $scope.deleteInvite = function (inviteID) {
          dataService.deleteInvite(inviteID)
            .then(function (response) {
              getInvites()
              modalInstance.dismiss("cancel");
            })
            ["catch"](function (error) {
              console.log(error)
              modalInstance = $modal.open({
                template   : "<p>Något gick fel, vänligen försök igen.</p>",
                backdrop   : true,
              });
            })
        }

        $scope.openDatePickerEdit = function ($event, invite) {
            $event.preventDefault();
            $event.stopPropagation();
            invite.datePicker.opened = true;
        };

        $scope.openUntilEdited = function (invite) {
          // make o copy, without the datepicker settings
          invite = angular.copy(invite)
          delete invite.datePicker;
          invite.openUntil = moment(invite.openUntil).format("YYYY-MM-DD")

          dataService.updateInvite(invite.inviteID, invite)
            .then(function (response) {
              console.log(response);
            })
            ["catch"](function (error) {
              console.log(error)
              modalInstance = $modal.open({
                template   : "<p>Något gick fel, vänligen försök igen.</p>",
                backdrop   : true,
              });
            });
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
            openUntil: moment(invite.openUntil).format("YYYY-MM-DD"),
            tag: invite.tag,
            diabetesTypeAs : invite.selectedDiabetesTypeCode,
          })
            .then(function (response) {
              $scope.model.createdInvites.push(response.data);
              $scope.model.newInvite = {
                socialnumber: null,
                subjectID: null,
                openUntil: moment().add(3, "months").format("YYYY-MM-DD"),
                tag: null,
                currentDiabetesType: null
              };
              getInvites();
            })
            ["catch"](function (err) {
              if (err && err.data && err.data.code === 2) {
                $scope.model.newInviteError = "Personen har redan en öppen inbjudan.";
              } else {
                $scope.model.newInviteError = "Något gick fel, vänligen försök igen.";
              }
            });
        }


        $scope.fetchSubject = function () {
          var sn = $scope.model.newInvite.socialnumber

          if (!sn || !sn.match(accountService.helpers.pnrRegex)) return false;

          $scope.model.newInviteError = null;
          $scope.model.newInviteDiabetesMissing = false;
          $scope.model.newInvite.subjectID = null;
          $scope.model.newInvite.currentDiabetesType = null;
          $scope.model.newInvite.selectedDiabetesType = null;

          dataService.getSubjectBySocialNumber(sn)
            .then(function (subject) {
              if (!subject.subjectID) {
                $scope.model.newInviteError = "Personnummer är felaktigt eller hittas inte i folkbokföringen.";
                return false;
              }

              if (subject.diabetesType != 1 && subject.diabetesType != 2) {
                $scope.model.newInviteDiabetesMissing = true;

                $scope.model.newInvite.currentDiabetesTypeCode = subject.diabetesType;
                $scope.model.newInvite.currentDiabetesType = subject.diabetesTypeText;
                $scope.model.newInvite.selectedDiabetesTypeCode = undefined;

              } else {
                $scope.model.newInvite.currentDiabetesTypeCode = subject.diabetesType;
                $scope.model.newInvite.currentDiabetesType = subject.diabetesTypeText;
                $scope.model.newInvite.selectedDiabetesTypeCode = subject.diabetesType;
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
  }]);