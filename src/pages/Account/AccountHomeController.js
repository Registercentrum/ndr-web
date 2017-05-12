angular.module("ndrApp")
    .controller('AccountHomeController', ['$scope', '$q', '$stateParams', '$state', '$log', '$filter', 'dataService', '$timeout', '$http', 'APIconfigService', function ($scope,   $q,   $stateParams,   $state,   $log,   $filter,   dataService, $timeout, $http, APIconfigService) {

		var Account = $scope.accountModel;

		$scope.subject = undefined;
		$scope.socialnumber = undefined;
		//$scope.unitInIQV = undefined;
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
			},
			allDTTypes: [
				{ id: 0, name: 'Alla'},
				{ id: 1, name: 'Typ 1 diabetes'},
				{ id: 2, name: 'Typ 2 diabetes'},
				{ id: 3, name: 'Sekundär'},
				{ id: 5, name: 'Oklar' },
				{ id: 9, name: 'Typ saknas'}
			],
			unitDTTypes: [],
			activeDTType: null,
			charStatistics: null
		};
		
		//$scope.activeTab = dataService.getActiveOverviewTab();
		
		$scope.setActiveTab= function(id) {
			//dataService.GetactiveOverviewTab(id);
			//$scope.activeTab = id;
			console.log(id);
		};
		
		$scope.setDisplayedDTType = function(id) {
			$scope.model.activeDTType = _.find($scope.model.unitDTTypes, function(d) {
				return id === d.id;
			});
		},
		
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

		dataService.getPatientsStatistics(Account.activeAccount.accountID, function(d) {
			

			$scope.model.charStatistics = d;
			
			//om primärvårdsenhet så skall endast Alla visas
			if (Account.activeAccount.unit.typeID  == 1 ) {
				$scope.model.unitDTTypes.push($scope.model.allDTTypes[0]);
				$scope.model.activeDTType = $scope.model.unitDTTypes[0];
				console.log($scope.model.unitDTTypes);
			} //om medicinklinik så skall de typer som finns på enheten 
			else {
			
				for (p in d) {
					if (d[p][3] != null) {
						$scope.model.unitDTTypes.push(_.find($scope.model.allDTTypes, function(d){					
							return d.id == p;
						}))
					}
				}
				
				//av de typer som finns på enheten visa bara Alla, Typ1, Typ2
				$scope.model.unitDTTypes = $scope.model.unitDTTypes.filter(function(d) {
					return [0,1,2].indexOf(d.id) > -1;
				});
				
				//sätt typ 1 som default
				$scope.model.activeDTType = $scope.model.unitDTTypes[1];
			}
				
			//$scope.model.activeDTType = Account.activeAccount.unit.typeID == 2 ? $scope.model.allDTTypes[1] : $scope.model.allDTTypes[0];
			
			$scope.model.charConfig = [
				{
					header: 'Kön',
					hiddenIfDTTypes: [],
					fields: [
						{ name: 'male', header: 'män' },
						{ name: 'female', header: 'kvinnor'}
					],
					defaultDenom: 'total'
				},
				{
					header: 'Ålder',
					hiddenIfDTTypes: [],
					fields: [
						{ name: 'ageLT30', header: '18-29 år' },
						{ name: 'age30to64', header: '30-64 år'},
						{ name: 'age65to79', header: '65-79 år' },
						{ name: 'ageGT80', header: '80- år'}					
					],
					defaultDenom: 'total'
				},
				{
					header: 'Duration',
					hiddenIfDTTypes: [],
					fields: [
						{ name: 'durLT10', header: '0-9 år' },
						{ name: 'dur10to20', header: '10-19 år'},
						{ name: 'dur20to29', header: '20-29 år' },
						{ name: 'dur30to39', header: '30-39 år'},
						{ name: 'dur40to49', header: '40-49 år'},
						{ name: 'durGT50', header: '50- år'}				
					],
					defaultDenom: 'dur'
				},
				{
					header: 'Diabetesbehandling',
					hiddenIfDTTypes: [1],
					fields: [
						{ name: 'treat1', header: 'enbart kost' },
						{ name: 'treat2', header: 'tabletter'},
						{ name: 'treat3', header: 'insulin' },
						{ name: 'treat4', header: 'tablett + insulin'},
						{ name: 'treatglp1', header: 'GLP1'},						
					],
					defaultDenom: 'treat'
				},
				{
					header: 'Metod att ge insulin',
					hiddenIfDTTypes: [0,2,3,4,5,9],
					fields: [
						{ name: 'imInjection', header: 'injektion' },
						{ name: 'imPump', header: 'pump'}
					],
					defaultDenom: 'total'
				},
				{
					header: 'CGM',
					hiddenIfDTTypes: [0,2,3,4,5,9],
					fields: [
						{ name: 'cgmYes', header: 'använder CGM', denom: 'insulin', helpText: 'Nämnaren är satt till alla insulinbehandlade.'},
						{ name: 'fgm', header: 'använder FGM', denom: 'cgmYes', helpText: 'Nämnaren är satt till alla som använder CGM.' }
					],
					defaultDenom: 'cgmYes'
				}
			];
		});
		
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

        dataService.getList("news", "?excludePublic=true").then(function (data){

            data = data.splice(0,4);

            angular.forEach(data, function(item) {
                item.link = "#/nyheter/" + item.newsID;
                item.categoryNames = [];
                angular.forEach(item.categories, function(category){
                    item.categoryNames.push(category.name);
                });
            });

            $scope.model.newsList = {
                data : data
            }

            setTimeout(function (){
                jQuery('.Intro--equalHeights').matchHeight(true);
            },100);

        })
		
        /*dataService.getAny("News", "?excludePublic=true").then(function (data){

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

            $scope.model.newsList = { data: data };
        })*/


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

