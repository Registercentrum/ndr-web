angular.module("ndrApp")
    .controller('AccountHomeController', ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', 'APIconfigService', function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http, APIconfigService) {

        var Account = $scope.accountModel;

        $scope.subject = undefined;
        $scope.socialnumber = undefined;
				$scope.unitInIQV = undefined;
        

				$scope.unitInIQV = dataService.isInProject('iqv');
		
			$scope.model = {
            id : Account.activeAccount.unit.unitID,
						activeAccount: Account.activeAccount,
            geoType : "unit",
            unitType : Account.activeAccount.unit.typeID,
            diabetesType : Account.activeAccount.unit.typeID === 1 ? 0 : 1,
						reportList : [],
						reportSort : {
						level: 3,
						desc: true
			}
        };

		$scope.getShare = function(d,n) {
			return parseInt(((d/n)*100).toFixed(0));
		};
		
		$scope.handleSortClick = function(level){
			if(level == $scope.model.reportSort.level) {
				$scope.model.reportSort.desc = !$scope.model.reportSort.desc;
			} else {
				$scope.model.reportSort = {
					level: level,
					desc: true
				};
			}
			
			$scope.model.reportList = $scope.sortRepList($scope.model.reportList,$scope.model.reportSort);
		};
		$scope.getValueGroup = function(v) {
			switch(true) {
				case (v>=90):
					return 4;
					break;
				case (v>=80):
					return 3;
					break;
				case (v>=70):
					return 2;
					break;
				default:
					return 1;
			}
		};
		$scope.sortRepList = function(list, sort) {
			//Riket = 1, County=2, Unit=3
			var sortField;
			
			switch(sort.level) {
				case 1:
					sortField = 'sweShare';
					break;
				case 2:
					sortField = 'countyShare';
					break;
				case 3:
					sortField = 'unitShare';
					break;
				default:
					sortField = 'question';
					break;
			}
			
			var getSortFunction = function(level,sortField) {
				
				if(level)
					return function(a,b) { return sort.desc ? a[sortField].value - b[sortField].value : b[sortField].value - a[sortField].value; };
				else
					return function(a,b) { return sort.desc ? a[sortField].localeCompare(b[sortField]) : b[sortField].localeCompare(a[sortField]) };
			};
						
			list.sort(getSortFunction(sort.level, sortField));
			
			return list;			
		};
		
		dataService.getReportingStatistics(Account.activeAccount.accountID, function(d) {
			
			var unitType = Account.activeAccount.unit.typeID;
			
			if (unitType == 1)
				d.fields = d.fields.filter(function(f) {
					return !(f.columnName === 'cgm' || f.columnName === 'pumpOngoing')
				});
			
			var list = d.fields.map(function(f){
			
				//var d = f.columnName
				var denom;
				
				switch(f.columnName) {
					case 'pumpOngoing':
						denom = 'pumpUsing';
						break;
					case 'cgm':
						denom = 'insulinTreated';
						break;
					case 'diagnosisWorseSeeingEye':
						denom = 'hasRetinopathy';
						break;
					default:
						denom = 'total'
				}
			
				var o = {
					question: f.question,
					unitShare: {
						value: $scope.getShare(d.unitCounts[f.columnName], d.unitCounts[denom]),
						group: null,
					},
					countyShare: {
						value: $scope.getShare(d.countyCounts[f.columnName], d.countyCounts[denom]),
						group: null,
					},
					sweShare: {
						value: $scope.getShare(d.sweCounts[f.columnName], d.sweCounts[denom]),
						group: null
					}
				};
				
				o.unitShare.group = $scope.getValueGroup(o.unitShare.value);
				o.countyShare.group = $scope.getValueGroup(o.countyShare.value);
				o.sweShare.group = $scope.getValueGroup(o.sweShare.value);
				
				return o;
			});
						
			$scope.model.reportList = $scope.sortRepList(list,$scope.model.reportSort);
		});

        dataService.getAny("News", "?excludePublic=true").then(function (data){

            data.sort(function (a,b){
                return new Date(b.publishedFrom) - new Date(a.publishedFrom);
            })

            data = data.splice(0,4);

            angular.forEach(data, function(item) {
                item.categoryNames = [];
                angular.forEach(item.categories, function(category){
                    item.categoryNames.push(category.name);
                });
            });

            $scope.model.newsList = data;
        })


        $scope.gotoProfile = function () {
            console.log("Social", $scope.socialnumber);

            $http({
                url: APIconfigService.baseURL + 'Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey=' + APIconfigService.APIKey,
                method: "POST",
                data: {socialNumber: $scope.socialnumber}
            })
                .success(function (data) {
                    $state.go("main.account.patient", {patientID: data.subjectID})
                })
                .error(function (data, status, headers, config) {
                    console.log("ERROR");
                });

        }

        $scope.gotoReport = function () {
            console.log("Social", $scope.socialnumber);

            $http({
                url: APIconfigService.baseURL + 'Subject?AccountID=' + Account.activeAccount.accountID + '&APIKey=' + APIconfigService.APIKey,
                method: "POST",
                data: {socialNumber: $scope.socialnumber}
            })
            .success(function (data) {
                $state.go("main.account.report", {patientID: data.subjectID})
            })
            .error(function (data, status, headers, config) {
                console.log("ERROR");
            });
        }

}])

