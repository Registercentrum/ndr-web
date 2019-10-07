angular.module("ndrApp")
    .controller('VariablesController',['$scope', '$stateParams', 'dataService', 'commonService', function($scope, $stateParams, dataService, commonService) {

        $scope.state = {
            metafields: [],
            filtered: [],
            countShowDomainValues: 2,
            displayInFull: {},
            columns: [
                { name: 'register', header: 'Register', type: String
                    ,showFn: function(query) { 
                        return query.register === 0;
                    },
                    setFn: function(m) {
                        if (m.isChildcareExclusive) { return "Swediabkids" }
                        if (m.isAdultcareExclusive) { return "NDR" }
                        return 'Alla'
                    }
                },
                { name: 'form', header: 'Formulär', type: String 
                    ,setFn: function(m) {
                        switch(m.formID) {
                            case 1:
                                return 'Bas'
                            case 2:
                                return 'Incidens'
                            default:
                                return '';
                        }
                    }
                },
                { name: 'question', header: 'Variabel', type: String },
                { name: 'statisticsName', header: 'Statistiknamn', type: String 
                    ,setFn: function(m) {
                        return m.statisticsName ? m.statisticsName : m.columnName;
                    }
                },
                { name: 'domain', header: 'Utfall', type: String, isCompressed: true
                    ,compressIf: function(m) {
                        return m.domain.isEnumerated && m.domain.domainValues.length>2
                    }
                    ,setFn2: function(m, asCSV) {

                        if (!m.domain.isEnumerated) return m.domain.description;

                        var ret = '';
                        var delimeter = !!asCSV ? ',' : '<br>';

                        m.domain.domainValues
                            .sort(function(a,b) {
                                return a.code - b.code;
                            })
                            .forEach(function(dv) {
                                ret += (dv.code + ' = ' + dv.text + delimeter);
                            });

                        return ret;
                    }
                },
                { name: 'measureUnit', header: 'Enhet', type: String },
                { name: 'minValue', header: 'Min', type: Number },
                { name: 'maxValue', header: 'Max', type: Number },
                { name: 'isCalculated', header: 'Beräknas', type: Boolean },
                { name: 'dateOfPublication', header: 'Tillagd', type: Date },
                { name: 'dateOfRemoval', header: 'Borttagen', type: Date 
                    , showFn: function(query) { 
                        return query.inActive;
                    } 
                },
                { name: 'helpNote', header: 'Hjälptext', type: String, isCompressed: true }
            ],
            meta: {
                registers: [
                    { id: 0, desc: 'Alla' },
                    { id: 1, desc: 'NDR' },
                    { id: 2, desc: 'Swediabkids'}
                ]
            },
            query: {
                register: 0,
                inActive: false,
                search: ''
            },
            sort: {
                column: null, //default sort set below
                asc: true
            }
        }

        $scope.$watch('state.query', function() {
            $scope.filter();
        },true);

        $scope.state.sort.column = $scope.state.columns[2]; //=Variabelnamn

        $scope.setCalculatedAttributes = function(columns,metafields)  {
               
            return metafields.map(function(m) {
                columns.forEach(function(c) {
                    if (c.setFn) m[c.name] = c.setFn(m);
                });
                return m;
            });
        }

        dataService.getMetaFields(null,null,true).then(function(data) {
            $scope.state.metafields = dataService.getValue('metafields');
            $scope.state.metafields = $scope.setCalculatedAttributes($scope.state.columns,$scope.state.metafields);           
            $scope.filter();
        })

        $scope.getContentHeaders = function(columns,delimeter,newLine) {
            return columns.map(function(c) {
                return $scope.getColContent(c.header);
            }).join(delimeter)+newLine;
        }

        $scope.showHideTag = function(displayInFull) {
            return '<a>' + (displayInFull ? 'Dölj' : 'Visa') + '</a>';
        },
        $scope.displayVal = function(m,c,asCSV) {
                        
            var v = m[c.name];

            if (!v) {
                return '';
            }
            
            //Show as expandlink - text "Visa"
            if (!asCSV && c.isCompressed) {
                if (!c.compressIf || c.compressIf(m)) {
                    if (!$scope.state.displayInFull[m.columnName] || !!!$scope.state.displayInFull[m.columnName][c.name])
                        return $scope.showHideTag(false)
                }
            }
            
            if(c.displayFn) return c.displayFn(m); 

            if(c.name === 'domain') {
                //if (m.isEnumerated)
                return $scope.displayDomain(m,asCSV); 
            }
            
            switch(c.type) {
                case Boolean:
                    return v ? 'Ja' : ''
                case Date:
                    return v ? v.split('T')[0].split('-').join('').substring(2) : ''
                default:
                    return v === null ? '' : v;
            } 
        }
        $scope.displayDomain = function(m,asCSV) {

            if (!m.domain.isEnumerated) return m.domain.description;

            var ret = '';
            var delimeter = !!asCSV ? ',' : '<br>';

            ret = m.domain.domainValues
                .sort(function(a,b) {
                    return a.code - b.code;
                })
                .map(function(dv) {
                    return (dv.code + ' = ' + dv.text)
                })
            
            if (!asCSV) {
                var  showCount = $scope.state.countShowDomainValues
                if (ret.length > showCount) {
                    ret.push($scope.showHideTag(true))
                } 
            }


            ret = ret.join(delimeter);

            return ret;
        }

        $scope.toggleDisplayInFull = function(v,c) {

            if (!$scope.state.displayInFull[v.columnName])
                $scope.state.displayInFull[v.columnName] = {}
            
            $scope.state.displayInFull[v.columnName][c.name] = !!!$scope.state.displayInFull[v.columnName][c.name]                    
        }

        $scope.getContentData = function(rows, columns, delimeter, newLine) {

            var ret = ''
            rows.map(function(m) {
                var arr = [];
                columns.map(function(c) {
                    arr.push($scope.getColContent($scope.displayVal(m,c,true)));
                });
                ret += arr.join(delimeter) + newLine;
            });

            return ret;
        }
        $scope.getContentQuery = function(query, newLine) {
            var ret = $scope.getColContent("NDR Variabellista") + newLine;

            if (query.inActive) {
                ret += $scope.getColContent("Enbart inaktiva variabler") + newLine
            }

            ret += $scope.getColContent("Delregister: " + $scope.state.meta.registers.filter(function(r) {
                return r.id === query.register;
            })[0].desc) + newLine;

            if (query.search) {
                ret = $scope.getColContent("Sökord: " + query.search) + newLine;
            }

            return ret + newLine;

        }
        $scope.getColContent = function(s) {
            return '"'+ s + '"'
        }
        $scope.exportToCSV = function() {
            var content = "\ufeff"; //to work with åäö
            var delimeter = ";"
            var newLine =  "\n"
            var columns = $scope.state.columns;
            var rows = $scope.state.filtered;
            var query = $scope.state.query;
            var fileName = 'NDR_Variabler_' + commonService.getTimeStamp() + '.csv';

            content += $scope.getContentQuery(query, newLine);
            content += $scope.getContentHeaders(columns,delimeter,newLine);
            content += $scope.getContentData(rows,columns,delimeter,newLine);

            commonService.downloadCSV(content,fileName);
        }

        $scope.setQuery = function(key,val) {
            $scope.state.query[key] = val;
        }

        $scope.toggleInactive = function() {
            $scope.state.query.inActive = !$scope.state.query.inActive;
        }

        $scope.getSortVal = function(v,f) {
            switch(f.type) {
                case String:
                    return v === null ? '' : v.toString().toLowerCase();
                case Number:
                    return v === null ? -999999 : v
                default:
                    return v;
            } 
        }

        $scope.sort = function(c)
        {
            var sort = $scope.state.sort;
            
            sort.asc = sort.column.name === c.name ? !sort.asc : true;
            sort.column = c;
            $scope.filter();
        }

        $scope.filter = function() {

            var query = $scope.state.query;
            var sort = $scope.state.sort;
            var fields = $scope.state.metafields;
            
            //filter by IsActive
            fields = fields.filter(function(f) {
                return f.isActive == !query.inActive;
            });

            //filter by register
            fields = fields.filter(function(f) {
                if(query.register === 1)
                    return !f.isChildcareExclusive
                if(query.register === 2)
                    return !f.isAdultcareExclusive

                return true;
            });

            //filter by search
            var searchFields = ['question','helpNote','measureUnit','statisticsName','form']; //obs only stringfields
            fields = fields.filter(function(f) {
                var searchString = searchFields.map(function(sf) {
                    return f[sf] === null ? '' : f[sf].toLowerCase();
                }).join(' ');

                if (searchString.indexOf(query.search)>-1)
                    return true;

                return false;
            });

            //and sort
            fields = fields.sort(function(a,b) {

                var x = $scope.getSortVal(a[sort.column.name],sort.column);
                var y = $scope.getSortVal(b[sort.column.name],sort.column);

                if (sort.asc) {
                    //if (x === null) return 0;
                    return (x>y ? 1 : (x<y ? -1 : null));
                }   
                else {
                    //if (x === null) return 0;
                    return (x<y ? 1 : (x>y ? -1 : null));
                }
                    
            });

            $scope.state.filtered = fields;
        }

    }]);

