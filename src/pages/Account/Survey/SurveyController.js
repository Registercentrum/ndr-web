'use strict';

angular.module('ndrApp')
  .controller('SurveyController', [
                 '$scope', '$stateParams', '$state', '$filter', '$modal', 'List', 'dataService',
        function ($scope,   $stateParams,   $state,   $filter,   $modal,   List,   dataService) {

        var account = $scope.accountModel;
        console.log('SurveyController: Init');

        $scope.model = {
          socialnumbers: [],
          prominvites: {
            all      : [], // all the invites
            displayed: [], // currently shown in the interface, can be set to new or declined
            new      : [], // answered but not signed yet
            declined : []  // declined to answer
          },
          socialNumberFilter: null,
          filterType: "all",
          selectedInvite: null
        };

        dataService.getInvites()
          .then(function (response) {
            $scope.model.prominvites.all = response.data.slice();
            $scope.model.prominvites.displayed = response.data.slice();
            $scope.model.prominvites.new = _.filter(response.data, function (invite) {
              return invite.submittedAt && !invite.approvedNDR;
            });
            $scope.model.prominvites.declined = _.filter(response.data, function (invite) {
              return invite.declined;
            });
          });

        $scope.setDisplayed = function (type) {
          $scope.model.filterType = type;

          if (type === "socialnumber") {
            $scope.model.prominvites.displayed =
              _.filter($scope.model.prominvites.all, function (invite) {
                return invite.subject.socialNumber.indexOf($scope.model.socialNumberFilter) !== -1
              });
          } else {
            $scope.model.prominvites.displayed = $scope.model.prominvites[type];
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
              console.log(response)
              // var invites = _.filter($scope.model.prominvites.all, function (invite) {
              //   return inviteID !== invite.inviteID;
              // });
              // $scope.model.prominvites.all = invites;
              // $scope.model.prominvites.new = _.filter(invites, function (invite) {
              //   return invite.submittedAt && !invite.approvedNDR;
              // });
              // $scope.model.prominvites.declined = _.filter(invites, function (invite) {
              //   return invite.declined;
              // });
              // $scope.setDisplayed($scope.model.filterType);
            })
            ["catch"](function (error) {
              console.log(error)
              $modal.open({
                template   : "<p>Något gick fel, vänligen försök igen.</p>",
                backdrop   : true,
              });
            })
        }


        $scope.fetchSubject = function (index) {
          var sn = $scope.model.socialnumbers[index]

          if (!sn || sn.length !== 12) return false;

          dataService.getSubjectBySocialNumber(sn)
            .then(function (subject) {
              console.log(subject)
            })
        };
  }])