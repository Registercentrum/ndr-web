'use strict';

angular.module('ndrApp')
    .directive('statReporting', ['$q','dataService', function($q, dataService) {

        function link (scope) {
		
			var localModel = {
				reportList : [],
				reportSort : {
					level: 3,
					desc: true
				},
				unitType: scope.model.activeAccount.unit.typeID
			};
			
			scope.model = jQuery.extend(scope.model, localModel);
		
			scope.sortRepList = function(list, sort) {
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
		
			scope.handleSortClick = function(level){
				if(level == scope.model.reportSort.level) {
					scope.model.reportSort.desc = !scope.model.reportSort.desc;
				} else {
					scope.model.reportSort = {
						level: level,
						desc: true
					};
				}
				scope.model.reportList = scope.sortRepList(scope.model.reportList,scope.model.reportSort);
			};
			
			scope.getShare = function(d,n) {
				return parseInt(((d/n)*100).toFixed(0));
			};
			
			scope.getValueGroup = function(v) {
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
			
			dataService.getReportingStatistics(scope.model.activeAccount.accountID, function(d) {
			
				if (scope.model.unitType == 1)
					d.fields = d.fields.filter(function(f) {
						return !(f.columnName === 'cgm' || f.columnName === 'pumpOngoing')
					});
				
				var list = d.fields.map(function(f){
			
					var denom;
					
					//Exception presentation question smoker
					if (f.id == 137) //Smoker is presented as question SmokingHabits
						f.question = 'Rökvanor';
					
					//Fields with different denominator
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
							value: scope.getShare(d.counts[3][f.columnName], d.counts[3][denom]),
							group: null,
						},
						countyShare: {
							value: scope.getShare(d.counts[2][f.columnName], d.counts[2][denom]),
							group: null,
						},
						sweShare: {
							value: scope.getShare(d.counts[1][f.columnName], d.counts[1][denom]),
							group: null
						}
					};
					
					o.unitShare.group = scope.getValueGroup(o.unitShare.value);
					o.countyShare.group = scope.getValueGroup(o.countyShare.value);
					o.sweShare.group = scope.getValueGroup(o.sweShare.value);
					
					return o;
				});
							
				scope.model.reportList = scope.sortRepList(list,scope.model.reportSort);
			});
			
        }
        return {
            restrict : 'A',
            templateUrl: 'src/components/StatReporting/StatReporting.html',
            link: link,
            scope: {
                model : '=',
            }
        };
    }]);