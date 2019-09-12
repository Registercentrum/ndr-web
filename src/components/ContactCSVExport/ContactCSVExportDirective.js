'use strict';
angular.module('ndrApp')
    .directive('contactCsvExport', ['$q', 'dataService', 'accountService','commonService', '$modal', '$filter', function($q, dataService, accountService, commonService, $modal,$filter) {
		
        function link(scope, element, attrs) {

            var dateOffset = (24 * 60 * 60 * 1000) * 364; //365
            var format = 'yyyy-MM-dd';

            scope.query = {
                dateFrom: $filter('date')(new Date(new Date() - dateOffset),format),
                dateTo: $filter('date')(new Date(),format),
            };

            scope.showForm = false;
            
            
            scope.openModalSelectPeriod = function() {
                $modal.open({
                    templateUrl: 'modalSelectPeriod.html',
                    controller : 'ModalInstanceCtrl',
                    backdrop   : true,
                    scope      : scope
                  });
            }

            scope.getContentMeta = function(period,unit,user,timeStamp,newLine) {  
                var ret = '';
                
                ret += scope.getColContent('Grunddata från NDR') + newLine
                ret += scope.getColContent('Vårdenhet: ' + unit.name) + newLine
                ret += scope.getColContent('Period: ' + period.dateFrom + ' - ' + period.dateTo) + newLine
                ret += scope.getColContent('Filen nedladdad av: ' + user.firstName + ' ' + user.lastName) + newLine
                ret += scope.getColContent('Tidpunkt: ' + timeStamp) + newLine
                ret += newLine
        
                return ret;
            }

            scope.getContentHeaders = function(fields,delimeter,newLine) {
                console.log(fields);
                return fields.map(function(f) {
                    return scope.getColContent(f.question + (f.measureUnit != null ? ' (' + f.measureUnit + ')' : ''));
                }).join(delimeter)+newLine;
            }

            scope.getContentData = function(contacts, fields, delimeter, newLine) {

                var ret = ''
                contacts.map(function(m) {
                    var arr = [];
                    fields.map(function(f) {

                        var v = f.isSubjectBound ? m.subject[f.columnName] :  m[f.columnName];

                        arr.push(commonService.getMetafieldLabel(v,f,'',true));
                    });
                    ret += arr.join(delimeter) + newLine;
                });
    
                return ret;
            }

            scope.getColContent = function(s) {
                return '"'+ s + '"'
            }

            scope.createCSVContent = function(contacts,fields) {
                var content = "\ufeff"; //to work with åäö
                var delimeter = ";"
                var newLine =  "\n"
                var query = scope.query;
                var fileName = 'Besöksdata_' + commonService.getTimeStamp() + '.csv';
                var timeStamp = $filter('date')(new Date(),"yyyy-MM-dd HH:mm");
                var accountModel = accountService.accountModel;
                console.log(accountModel);
                var user = accountModel.user;
                var unit = accountModel.activeAccount.unit;
    
                content += scope.getContentMeta(query,unit,user,timeStamp,newLine); //period,unit,user,dateStamp,newLine
                content += scope.getContentHeaders(fields,delimeter,newLine);
                content += scope.getContentData(contacts,fields,delimeter,newLine);
    
                commonService.downloadCSV(content,fileName);
            }

            scope.initDownload = function() {

                var unitTypeID = accountService.accountModel.activeAccount.unit.typeID;
                var accountID = accountService.accountModel.activeAccount.accountID;
                
                var requests = [];
                requests.push(dataService.fetchUnitPeriodContacts(scope.query));
                requests.push(dataService.getMetaFields(accountID,unitTypeID,false));
                

                $q.all(requests)
                .then(function(results) {
                    console.log(results);

                    var contacts = results[0].data;
                    var fields = results[1];

                    console.log('contacts',contacts);
                    console.log('fields', fields);

                    fields = fields.filter(function(f){
                        return (f.formID === 1 || f.isSubjectBound);
                    })

                    scope.createCSVContent(contacts,fields)
                })

                console.log('should download');
            }

        }

        return {
			restrict: 'A',
			templateUrl: 'src/components/ContactCSVExport/contactCSVExport.html',
			link: link,
			replace: true,
			scope: {
				question: "="
			}
		}

    }]);
