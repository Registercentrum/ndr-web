'use strict';

angular.module('ndrApp')
  .controller('SurveyController', [
                 '$window', '$scope', '$stateParams', '$state', '$filter', '$modal', 'List', 'dataService', 'accountService',
        function ($window,   $scope,   $stateParams,   $state,   $filter,   $modal,   List,   dataService,   accountService) {

        var account = $scope.accountModel;
        console.log('SurveyController: Init');


        $scope.model = {
          loading : true,
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
            format: "ÖPPEN TILL yyyy-MM-dd",
            minDate: new Date(),
            dateOptions: {
              formatYear: 'yy',
              startingDay: 1
            }
          },
          datePickerNew: {
            format: "yyyy-MM-dd",
          },
          invites: {
            all      : [], // all the invites
            displayed: [], // currently shown in the interface, can be set to new or declined
            new      : [], // answered but not signed yet
            declined : [],  // declined to answer
			open:      [],
			closed:    [],
			submitted: [],
			unsigned:  []
          },
          socialNumberFilter: null,
          filterType: "all",
          selectedInvite: null,
		  itemsByPage: [],
		  pageSize: 15,
		  currentPage: 0
        };

        var modalInstance = null;
		
		function paged (valLists, pageSize) {
			var valLength, retVal;

			if (!valLists) return;

			valLength = valLists.length;
			retVal = [];

			for (var i = 0; i < valLength; i++) {
				if (i % pageSize === 0) {
					retVal[Math.floor(i / pageSize)] = [valLists[i]];
				} else {
					retVal[Math.floor(i / pageSize)].push(valLists[i]);
				}
			}				
			return retVal;
		}
		
		$scope.sort = function() {
			//$filter('orderBy')(collection, expression, reverse, comparator)
			var list = $scope.model.invites.displayed;
			var rev = $scope.model.sortReverse;
			var prop = $scope.model.sortType;
			var aVal, bVal;
			
			list = list.sort(function(a,b) {
			
				if (prop === 'subject.socialNumber') {
					aVal = a.subject.socialNumber;
					bVal = b.subject.socialNumber;
				}
				else {
					aVal = (a[prop] || (rev ? '' : 'ww')); //make empty sort last
					bVal = (b[prop] || (rev ? '' : 'ww')); //make empty sort last
				}
			
				return  (rev ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal));
			});
			
			$scope.model.invites.displayed = list;
			$scope.pagination();
		};
		
		$scope.pagination = function () {
			$scope.model.itemsByPage = paged($scope.model.invites.displayed, $scope.model.pageSize);
		};
		
		$scope.setPage = function () {
			$scope.currentPage = this.n;
		};

		$scope.firstPage = function () {
			$scope.currentPage = 0;
		};

		$scope.lastPage = function () {
			$scope.currentPage = $scope.model.itemsByPage.length - 1;
		};

		$scope.range = function (input, total) {
			var ret = [];
			if (!total) {
				total = input;
				input = 0;
			}
			for (var i = input; i < total; i++)
				if (i !== 0 && i !== total - 1) ret.push(i);
			return ret;
		};
		
        $scope.printThis = function(){
          $(".modal-body").printThis({
            debug: false,
            importCSS: true,
            importStyle: true,
            printContainer: true,
            // loadCSS: "../css/style.css",
            pageTitle: "NDR",
            removeInline: false,
            printDelay: 100,
            header: null,
            formValues: true
          });
        }

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

        function getInvites () {
          dataService.getInvites()
            .then(function (response) {

				$scope.model.loading = false;
				
				$scope.model.invites.all = response.data;

				$scope.model.invites.all.map(function (invite) {
					invite = $scope.setCalculatedValues(invite);
				})

				$scope.setLists();
				$scope.firstPage();
				
				$scope.buildChart($scope.model.invites);
            });
			
        }
		$scope.setInvitesOnlyOneYearBack = function() {
		
			var now = new Date();
			var oneYearBack = now.setMonth(now.getMonth() - 12);
			
			return invites.filter(function(i) {
				return !moment(i.openUntil).isBefore(oneYearBack)
			});
		};
		
		$scope.setCalculatedValues = function(invite) {
			var statusCodes = ["isExpired", "isDeclined", "isOpen", "isInitiated", "isSigned", "isSubmitted"];

			invite.isExpired = moment(invite.openUntil).isBefore(new Date()) && !invite.isDeclined && !invite.submittedAt;
			invite.isDeclined = invite.isDeclined;
			invite.isOpen = _.isNull(invite.initiatedAt) && !invite.isDeclined && !invite.submittedAt && !invite.isExpired;
			invite.isClosed = _.isNull(invite.initiatedAt) && !invite.isDeclined && !invite.submittedAt  && invite.isExpired;;
			invite.isInitiated = !_.isNull(invite.initiatedAt) && !invite.submittedAt && !invite.isDeclined;
			invite.isSubmitted = !_.isNull(invite.submittedAt);
			invite.isUnsigned = invite.submittedAt && !invite.isApprovedNDR;
			invite.isSigned = invite.submittedAt && invite.isApprovedNDR;
			
			var status = statusCodes[_.findIndex([invite.isExpired, invite.isDeclined, invite.isOpen, invite.isInitiated, invite.isSigned, invite.isSubmitted], function(d){ return d == true })]

			invite.status = status;
			
			if(status === 'isSubmitted' && invite.isSigned)
				console.log(invite);

            invite.datePicker = {
              minDate: new Date(invite.createdAt),
              opened: false
            };
			
			return invite;
		}
		
		$scope.setSubsets = function() {
		
			var invites = $scope.model.invites.all;
			
		  $scope.model.invites.new = _.filter(invites, function (invite) {
			return invite.submittedAt && !invite.isApprovedNDR;
		  });
		  
		  $scope.model.invites.current = _.filter(invites, function (invite) {
			return invite.isCurrent;
		  });
		  
		  $scope.model.invites.declined = _.filter(invites, function (invite) {
			return invite.isDeclined;
		  });
		  
		  $scope.model.invites.open = _.filter(invites, function (invite) {
			return invite.isOpen;
		  });
		  
		  $scope.model.invites.closed = _.filter(invites, function (invite) {
			return invite.isClosed;
		  });
		  
		  $scope.model.invites.submitted = _.filter(invites, function (invite) {
			return invite.isSubmitted;
		  });
		};
		
		$scope.buildChart = function(model) {
		
			$scope.chart = Highcharts.chart('chart', {
				chart: {
					height: 120,
					type: 'bar'
				},
				title: {
					text: '',
					style: {
						display: 'none'
					}
				},
				subtitle: {
					text: '',
					style: {
						display: 'none'
					}
				},
				yAxis: {
					min: 0,
					visible: false,
					title: {
						text: '',
						style: {
							display: 'none'
						}
					},
					gridLineWidth: 0,
					lineWidth: 0,
					labels: {
						enabled: false,
					}
				},
				xAxis: {
					visible: false,
					 lineWidth: 0, 
					tickWidth: 0,
					labels: {
						enabled: false,
					}
				},
				/*tooltip: {
					formatter: function() {
						return '<b>' + this.y + '</b>'
					}
				},*/
				credits: {
					enabled: false
				},
				legend: {
					reversed: true,
					padding: 0
				},
				plotOptions: {
					series: {
						stacking: 'percent',
						enableMouseTracking: false
					},
					bar: {
						dataLabels: {
							enabled: true,
							//distance : -50,
							formatter: function() {
								/*var dlabel = this.series.name + '<br/>';*/
								var dlabel = Math.round(this.percentage) + ' %';
									return dlabel
							 },
							style: {
								fontSize: '14px'
							},
						},
						
					}
				},
				series: [
					{
						name: 'Avböjda',
						data: [parseInt((100*(model.declined.length/model.all.length)).toFixed(0))],
						color: '#a6a6a6'
					},
					{
						name: 'Stängda',
						data: [parseInt((100*(model.closed.length/model.all.length)).toFixed(0))],
						color: '#bfbfbf'
					},
					{
						name: 'Ännu ej besv.',
						data: [parseInt((100*(model.open.length/model.all.length)).toFixed(0))],
						color: '#d9d9d9'
					},
					{
						name: 'Besvarade',
						data: [parseInt((100*(model.submitted.length/model.all.length)).toFixed(0))],
						color: '#f2f2f2'
					}
				]
			});
		}
		
		$scope.updateInviteLocal = function(id, invite) {
			invite = $scope.setCalculatedValues(invite);

			for (var i = 0; i < $scope.model.invites.all.length; i++) { 
				if ($scope.model.invites.all[i].inviteID === id) {
					$scope.model.invites.all[i] = invite;
					break;
				}
			}
		}
		
		$scope.removeInviteLocal = function(id) {
			for (var i = 0; i < $scope.model.invites.all.length; i++) { 
				if ($scope.model.invites.all[i].id == id) {
					$scope.model.invites.all.splice(i, 1);
					break;
				}
			}
		}
		
		$scope.setStat = function() {
						
			var answered = invites.filter(function(i) {
				return i.submittedAt;
			});
			
			var declined = invites.filter(function(i) {
				return i.isDeclined;
			});
			
			return {
				created: invites.length,
				answered: answered.length,
				declined: declined.length,
				notAnswered: (invites.length - answered.length)
			};
		}
		
		$scope.setLists = function() {
			$scope.setSubsets(); 
			$scope.setDisplayed();
		};
		
        $scope.setDisplayed = function (type) {
		
          $scope.model.filterType = (type || $scope.model.filterType);
			
			console.log($scope.model.filterType);
			
          if (type === "socialnumber") {
            $scope.model.invites.displayed =
              _.filter($scope.model.invites.all, function (invite) {
                return invite.subject.socialNumber.replace("-", "")
                      .indexOf($scope.model.socialNumberFilter.replace("-", "")) !== -1
              });
          } else {
            $scope.model.invites.displayed = $scope.model.invites[$scope.model.filterType];
          }
			$scope.sort();
		  
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

              // var series = invite.outcomes.map(function (outcome, index) {
              //   return {name : outcome.dimension.desc, y : outcome.outcome, prevOutcome : invite.prevOutcomes ? invite.prevOutcomes.outcomes[index] : '' }
              // })
              //
              // // prevOutcomes.outcomes[$index].difference < 0

              // $scope.model.selectedInviteData = series;


              var latestInvite = invite;

              var prevInvites = _.filter($scope.model.invites.all, function (i) {
                return i.subject.subjectID === invite.subject.subjectID &&
                  i.inviteID !== invite.inviteID &&
                  i.submittedAt &&
                  new Date(i.submittedAt) <= new Date(invite.submittedAt);
              })
              

              var previousInvite = prevInvites[prevInvites.length-2]

              var categories = [];

              var latest = {
                name : "Senaste enkätsvar",
                data : latestInvite.outcomes.map(function (outcome, index) {
                  categories.push(outcome.dimension.desc);
                  return outcome.outcome;
                }),
                color : "#5EBCDC"
              }

              var previous = {
                name : "Tidigare enkätsvar",
                data : previousInvite ? previousInvite.outcomes.map(function (outcome, index) {
                  return outcome.outcome;
                }) : null,
                color : "#ECECEC"
              }

              $scope.model.categories = categories;
              $scope.model.selectedInviteData = [latest, previous];



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
          invite.signed = true;

          var signedInvite = angular.copy(invite)
          delete signedInvite.datePicker;
          delete signedInvite.copyText;
          delete signedInvite.prevOutcomes;

          dataService.updateInvite(invite.inviteID, signedInvite)
            .then(function (response) {
              invite.signed = true;
			  $scope.updateInviteLocal(invite.inviteID, response.data);
			  $scope.setLists();
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
			  $scope.deleteInviteLocal(inviteID);
			  $scope.setLists();
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
				console.log(response.data);
			  $scope.updateInviteLocal(invite.inviteID, response.data);
			  $scope.setLists();
              
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
              }
                else if (err && err.data && err.data.code === 7){
                $scope.model.newInviteError = "Du kan endast bjuda enkäter till personer med rapporterade besök på din enhet.";
              }
                else {
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