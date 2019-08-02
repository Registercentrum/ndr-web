'use strict';

angular.module('ndrApp')
    .service('dataService', ['$q', '$http', '$window', 'Restangular', 'accountService', 'APIconfigService',
        function($q, $http, $window, Restangular, accountService, APIconfigService) {

            var self = this;

            this.data = {
                units: [],
                counties: [],
                indicators: [],
                indicators2017: [],
                preparedGeoList: [],
                subjectInfo:{},
                promFormMeta: null,
                attributesLists: null,
                koo: null,
                kas: null,
                homeActiveTab: 1,
                promAdmFilter: null,
                optionalQuestions: null,
                metafields: null,
                domains: null
            };

            /* RESTANGULAR CONFIG */
            Restangular.setBaseUrl(APIconfigService.baseURL);
            Restangular.setDefaultRequestParams({
                APIKey: APIconfigService.APIKey
            });

            //START getters and setters for store
            this.setValue = function(key, val) {
                this.data[key] = val;
            }
            this.getValue = function(key) {
                return this.data[key];
            }
            //END getters and setters for store

            /* RESTANGULAR OBJECTS */
            var endpoints = {
                indicator: Restangular.one('indicator'),
                indicator2017: Restangular.one('indicator2017'),
                indicatorresult: Restangular.one('indicatorresult'),
                contactAttributes: Restangular.one('ContactAttribute'),
                units: Restangular.all('unit'),
                counties: Restangular.all('county'),
                news: Restangular.all('news'),
                publications: Restangular.all('publication'),
                contacts: Restangular.all('Contact'),
                subject: Restangular.all('subject'),
                promForm: Restangular.all('PROMForm'),
                koo: Restangular.all('KOO'),
                kas: Restangular.all('KAS')
            };

            this.projects = [{
                name: 'IQV',
                units: [
                    26, //Kvarnbyn Väst
                    718, //Mitt Hjärta i Bergslagen AB
                    1302, //LäkarGruppen Boris Klanger
                    1071, //Ullvi-Tuna Vårdcentral
                    1174, //Oxbacken Skultuna Vårdcentral
                    831, //CityPraktiken
                    1200, //Hallstahammar Vårdcentral
                    1130, //Capio vårdcentral Vallby
                    985, //HerrgärdetsVårdcentral
                    1221, //Ängsgårdens Vårdcentral
                    1004, //Viksäng-Irsta familjeläkarmottagning
                    1199, //Hemdal Vårdcentral
                    1260, //Sala Väsby Vårdcentral
                    1254, //Odensvi Familjeläkarmottagning
                    1222, //Prima Familjeläkarmottagning
                    1231, //Capio Vårdcentral Västerås City
                    1184, //Grindberga familjeläkarenhet
                    1292, //Familjeläkarna Önsta-Gryta
                    1006, //Servicehälsan i Västerås
                    1056, //Byjordens familjeläkarmottagning
                    910, //Åbågens Vårdcentral
                    1325, //Kungsörs Vårdcentral
                    1193, //Achima Care Sala Vårdcentral
                    1363, //Kolbäcks familjeläkarmottagning
                    696, //Norbergs Vårdcentral
                    1229, //Skinnskattebergs Vårdcentral
                    1265, //Bäckby familjeläkarmottagning
                    1082, //Achima Care Köping Vårdcentral
                    1270, //Kolsva Vårdcentral
                    1376 //Asyl och Integrationshälsan
                ]
            }];

            /**
             * Get the list of possible choices for filtering option
             * @param  {Object} filter Object with filter ids to include or exclude from the result
             * @return {Array} Array with filter options
             */


            this.getContactFields = function() {

                if (!this.data.metafields) {
                    return null;
                }

                return this.data.metafields.filter(function(m) {
                    return (m.formID == null && !m.isChildcareExclusive);
                });
            }

            this.optionalQuestions = function() {

                if (!this.data.metafields) {
                    return null;
                }

                return this.data.metafields.filter(function(m) {
                    return m.isOptional;
                });
            }

            this.getFormFields = function(formID, unitType) {

                if (!this.data.metafields) return null;

                var ret = this.data.metafields.filter(function(m) {
                    var ret = true;
                    if (formID)
                        ret = (m.formID === formID);
                    if (unitType) {
                        var isAdult = (unitType === 1 || unitType === 2)
                        if (isAdult) {
                            ret = (ret && !m.isChildcareExclusive);
                        } else {
                            ret = (ret && !m.isAdultcareExclusive);
                        }
                    }

                    return ret;
                });

                return ret;
            }

            this.getFieldByKey = function(keys) {

                var ret = [];

                for (var i = 0; i < this.data.metafields.length; i++) { 

                    if (keys.indexOf(this.data.metafields[i].columnName) != -1) {
                        ret.push(this.data.metafields[i]);
                    }
                    if (ret.length == keys.length) {
                        break;
                    }
                }


                return ret;
            }

            this.getOptionalFields = function() {

                if (!this.data.metafields) {
                    return null;
                }

                return this.data.metafields.filter(function(m) {
                    return m.isOptional;
                });
            }

            this.getUserProjects = function() {

                if (!accountService.accountModel.activeAccount) {
                    return [];
                }

                var unitID = accountService.accountModel.activeAccount.unit.unitID
                var projects = _.filter(this.projects, function(d) {
                    return d.units.indexOf(unitID) !== -1;
                });

                return projects;
            };

            this.isInProject = function(name) {

                var userProjects = this.getUserProjects();
                var ret = false;

                ret = _.filter(userProjects, function(d) {
                    return d.name.toLowerCase() === name.toLowerCase();
                }).length > 0;

                return ret;
            };

            this.getFilterFields = function(filter, unitTypeID) {


                var filtered = [];
                var data = this.getFormFields(1, unitTypeID) //function(formID, unitTypeID)


                // Filter the data set by the column names…
                if (filter) {
                    if (filter.include) {
                        filtered = filtered.concat(_.filter(data.plain(), function(d) {
                            return _.indexOf(filter.include, d.columnName) !== -1;
                        }));
                    }

                    if (filter.exclude) {
                        filtered = filtered.concat(_.filter(data.plain(), function(d) {
                            return _.indexOf(filter.exclude, d.columnName) === -1;
                        }));
                    }

                    return filtered;

                    // …or just return the clean data set, without all the stuff from Restangular
                } else {
                    return data.plain();
                }
            }

            this.getContactAttributes = function(filter, data) {

                return endpoints.contactAttributes.get({
                        'AccountID': accountService.accountModel.activeAccount ? accountService.accountModel.activeAccount.accountID : undefined
                    })
                    .then(function(data) {
                        var filtered = [];

                        // Filter the data set by the column names…
                        if (filter) {
                            if (filter.include) {
                                filtered = filtered.concat(_.filter(data.plain(), function(d) {
                                    return _.indexOf(filter.include, d.columnName) !== -1;
                                }));
                            }

                            if (filter.exclude) {
                                filtered = filtered.concat(_.filter(data.plain(), function(d) {
                                    return _.indexOf(filter.exclude, d.columnName) === -1;
                                }));
                            }

                            return filtered;

                            // …or just return the clean data set, without all the stuff from Restangular
                        } else {
                            return data.plain();
                        }
                    })['catch'](function(error) {
                        return error;
                    });
            };


            this.getSubjectById = function(id) {
                var url = APIconfigService.baseURL + 'Subject/' + id +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;


                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'GET'
                };

                return $http(query)
                    .then(function(response) {
                        return response.data;
                    })['catch'](function(error) {
                        return error;
                    });
            };


            this.getSubjectBySocialNumber = function(socialNumber) {
                var url = APIconfigService.baseURL + 'Subject' +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;


                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'POST',
                    data: {
                        socialNumber: socialNumber
                    }
                };

                return $http(query)
                    .then(function(response) {
                        return response.data;
                    })['catch'](function(error) {
                        return error;
                    });
            };


            this.deleteContact = function(id) {
                var url = APIconfigService.baseURL + 'Contact/' + id +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'DELETE'
                };

                return $http(query)
                    .then(function(response) {
                        return response.data;
                    })['catch'](console.error.bind(console));
            };


            this.saveContact = function(data) {
                var url = APIconfigService.baseURL + 'Contact/' + (data.contactID || '') +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: data.contactID ? 'PUT' : 'POST',
                    data: data
                };

                return $http(query);

            };

            this.saveContactNew = function(data) {
                var url = APIconfigService.baseURL + 'Contact/' + (data.id || '') +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: data.id ? 'PUT' : 'POST',
                    data: data
                };

                return $http(query);

            };

            this.saveIncidence = function(data, update) {
                var url = APIconfigService.baseURL + 'Incidence/' + (update ? data.subjectID : '') +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: update ? 'PUT' : 'POST',
                    data: data
                };

                return $http(query);

            };

            this.getInvites = function() {
                var url = APIconfigService.baseURL + 'prominvite' +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'GET'
                }

                return $http(query);

            };

            this.getInvite = function(inviteID) {
                var url = APIconfigService.baseURL + 'prominvite/' + inviteID +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'GET'
                }

                return $http(query);
            };

            this.createInvite = function(data) {
                data.unitID = accountService.accountModel.activeAccount.unit.unitID;
                var url = APIconfigService.baseURL + 'prominvite/' +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'POST',
                    data: data
                }

                return $http(query);
            };

            this.updateInvite = function(inviteId, updatedInvite) {
                var url = APIconfigService.baseURL + 'prominvite/' + inviteId +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'PUT',
                    data: updatedInvite
                }

                return $http(query);
            };

            this.deleteInvite = function(inviteId) {
                var url = APIconfigService.baseURL + 'prominvite/' + inviteId +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'DELETE'
                }

                return $http(query);
            };


            this.savePROM = function(data) {
                var url = APIconfigService.baseURL + 'PROM/' +
                    '?AccountID=' + accountService.accountModel.activeAccount.accountID +
                    '&APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'POST',
                    data: data
                };

                return $http(query);
                //.then(function (response) { return response.data; })
                //['catch'](console.error.bind(console));

            };
            this.getFile = function(textfile) {

                /*Example Textfile
                    var textFile = {
                        content: 'This is the content of the file ....',
                        name: 'NDR-lista',
                        fileType: 'csv'
                    };
                */

                $http({
                    method: 'POST',
                    url: 'API/Textfile/',
                    data: textfile
                }).then(function successCallback(response) {
                    var id = response.data;
                    $window.location = 'API/Textfile/?id=' + id;
                }, function errorCallback(response) {

                });
            };

            this.getContacts = function(query) {
                query = query || {};
                query.AccountID = accountService.accountModel.activeAccount.accountID;

                return endpoints.contacts.getList(query)
                    .then(function(data) {
                        return data.plain();
                    })['catch'](function(error) {
                        return error;
                    });
            };

            this.getPROMFormMeta = function() {
                var url = APIconfigService.baseURL + 'promform' +
                    '?APIKey=' + APIconfigService.APIKey;
                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'GET'
                }

                if (!this.data.promFormMeta)
                    this.data.promFormMeta = $http(query);

                return this.data.promFormMeta;
            };

            this.savePROMForm = function(inviteID, data) {
                var url = APIconfigService.baseURL + 'prom/' + inviteID +
                    '?APIKey=' + APIconfigService.APIKey;

                if (accountService.accountModel.PROMSubject &&
                    accountService.accountModel.PROMSubject.key) {
                    url += '&PROMKey=' + accountService.accountModel.PROMSubject.key;
                }

                var query = {
                    url: APIconfigService.constructUrl(url),
                    method: 'POST',
                    data: data
                }

                return $http(query);
            };

            this.getKOO = function(callback) {
                var query = query || {};
                var self = this;
                query.APIKey = APIconfigService.APIKey;

                if (this.data.koo != null)
                    callback(this.data.koo);
                else {
                    $.ajax({
                        url: APIconfigService.constructUrl(APIconfigService.baseURL + 'KOO'),
                        data: query,
                        type: 'GET',
                        dataType: 'json',
                        success: function(d) {
                            self.data.koo = d;
                            callback(d);
                        }
                    });
                }
            };

            this.getKAS = function(callback) {
                var query = query || {};
                var self = this;
                query.APIKey = APIconfigService.APIKey;

                if (this.data.kas != null)
                    callback(this.data.kas);
                else {
                    $.ajax({
                        url: APIconfigService.constructUrl(APIconfigService.baseURL + 'KAS'),
                        data: query,
                        type: 'GET',
                        dataType: 'json',
                        success: function(d) {
                            self.data.kas = d;
                            callback(d);
                        }
                    });
                }
            };

            this.getUnits = function(callback) {
                var query = query || {};
                query.APIKey = APIconfigService.APIKey;

                $.ajax({
                    url: APIconfigService.constructUrl(APIconfigService.baseURL + 'Unit'),
                    data: query,
                    type: 'GET',
                    dataType: 'json',
                    success: callback
                });
            };

            this.getPatientsStatistics = function(accountID, callback) {
                var query = query || {};
                query.APIKey = APIconfigService.APIKey;
                query.AccountID = accountID;

                $.ajax({
                    url: APIconfigService.baseURL + 'CharStatistics',
                    data: query,
                    type: 'GET',
                    dataType: 'json',
                    success: callback
                });
            };

            this.getReportingStatistics = function(accountID, callback) {
                var query = query || {};
                query.APIKey = APIconfigService.APIKey;
                query.AccountID = accountID;

                $.ajax({
                    url: APIconfigService.baseURL + 'ReportingStatistics',
                    data: query,
                    type: 'GET',
                    dataType: 'json',
                    success: callback
                });
            };

            this.getPROMStatistics = function(accountID, query) {
                var query = query || {};
                query.APIKey = APIconfigService.APIKey;
                query.AccountID = accountID;

                return $.ajax({
                    url: APIconfigService.baseURL + 'PROMStatistics?dt=' + query.dt + '&sex=' + query.sex,
                    data: query,
                    type: 'GET',
                    dataType: 'json'
                });
            };

            this.getOptionalQuestions = function(accountID) {
                var query = query || {};
                var cache = this.data;
                query.APIKey = APIconfigService.APIKey;
                query.AccountID = accountID;

                return $.ajax({
                    url: APIconfigService.constructUrl(APIconfigService.baseURL + 'ContactOptionalMeta'),
                    data: query,
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        cache.optionalQuestions = data;
                    }
                });
            };
            this.getSubjectInfo = function(snr) {
                if (this.data.subjectInfo[snr])
                    return this.data.subjectInfo[snr];
                else
                    return null;
            }
            this.fetchSubjectsInfo = function(subjectsToFetch,accountID) {

                var requests = [];
                var deferred = $q.defer();
                for (var i = 0; i < subjectsToFetch.length; i++) { 
                    requests.push(self.fetchSubjectInfo(accountID,subjectsToFetch[i].snr));
                }
                //console.log('requests',requests);
                $q.all(requests)
                .then(
                function(results) {
                  deferred.resolve(
                   JSON.stringify(results)) 
                },
                function(errors) {
                  deferred.reject(errors);
                },
                function(updates) {
                  deferred.update(updates);
                });
                return deferred.promise;
            },
            this.fetchSubjectInfo = function(accountID, snr) {
                
                var query = query || {};
                var cache = this.data;
                query.APIKey = APIconfigService.APIKey;
                query.AccountID = accountID;
                query.socialNumber = snr;

                return $.ajax({
                    url: APIconfigService.constructUrl(APIconfigService.baseURL + 'Navet'),
                    data: query,
                    type: 'POST',
                    dataType: 'json',
                    success: function(data) {
                        cache.subjectInfo[snr] = data;
                    },
                    error: function(data) {
                        //console.log(data);
                        alert('Ingen information kunde hittas för personnummer ' + snr + ' i folkbokföringen');
                    }
                });

            }

            this.getMetaFields = function(accountID, unitType) {
                var query = query || {};
                var cache = this.data;
                query.APIKey = APIconfigService.APIKey;
                query.AccountID = accountID;
                var self = this;

                //surfaceexceptions för kids domains
                var setTreatmentDomain = function(domain) {
                    domain.domainValues = [
                        {
                            text: "Insulin",
                            code: 3,
                            XMLText: "Insulin",
                            isActive: true
                        },
                        {
                            text: "Tabletter",
                            code: 2,
                            XMLText: "Tabletter",
                            isActive: true
                        },
                        {
                            text: "Tabl. och insulin",
                            code: 4,
                            XMLText: "TabletterOchInsulin",
                            isActive: true
                        },
                        {
                            text: "Enbart kost",
                            code: 1,
                            XMLText: "EnbartKost",
                            isActive: true
                        }
                    ];
                }

                var polishDomainsForKids = function(metafields) {
                    for (var i = 0; i < metafields.length; i++) {
                        if (metafields[i].recAgeFrom != null) {
                            var noteToAdd = "Enligt riktlinje från " + metafields[i].recAgeFrom + " år."
                            metafields[i].helpNote = (metafields[i].helpNote ? metafields[i].helpNote + ' ' + noteToAdd : noteToAdd)
                        }
                        if (metafields[i].columnName === 'sex') {
                            metafields[i].domain.domainValues[0].text = 'Pojke'
                            metafields[i].domain.domainValues[1].text = 'Flicka'
                        }
                        if (metafields[i].columnName === 'diabetesType') {
                            metafields[i].domain.domainValues[0].text = 'Typ 1';
                        }
                        if (metafields[i].columnName === 'albuminuria') {
                            metafields[i].helpNote = ['För diagnos krävs förhöjd alb/kreatininratio i 2 av 3 prov av morgonurin inom 6 månader. '
                            ,'-Mikroalbuminuri: flickor 3,5-25 mg/mmol, pojkar 2,5-25 mg/mmol.'
                            ,'-Makroalbuminuri: >25 mg/mmol. - Normaliserat värde: efter farmakologisk behandling.'].join('')
                        }
                        if (['lipidLoweringDrugs','cholesterol','triglyceride','ldl','hdl'].indexOf(metafields[i].columnName) > -1) {
                            var noteToAdd = 'Lipidkontroll bör genomföras tidigt efter diabetesdebuten hos alla över 10 år och redan efter 2 års ålder om det finns ärftlighet för tidig utveckling av hjärt-och kärlsjukdom eller familjära blodfettsrubbningar';
                            metafields[i].helpNote = (metafields[i].helpNote ? metafields[i].helpNote + ' ' + noteToAdd : noteToAdd);
                        }
                        
                        if (metafields[i].columnName == 'treatment') {
                            setTreatmentDomain(metafields[i].domain);
                        }
                    }
                    return metafields;
                };
                var polishDomainsForAdults = function(metafields) {
                    for (var i = 0; i < metafields.length; i++) {
                        if (metafields[i].columnName == 'albuminuria') {
                            metafields[i].helpNote = ['- Mikroalbuminuri: för diagnos krävs kvantifiering där 2 av 3 prov tagna inom 1 år skall vara positiva, dvs. alb/kreatininratio 3-30 mg/mmol (eller U-alb 20-200 µg/min eller 20-300 mg/l).'
                            ,'-Makroalbuminuri: för diagnos krävs kvantifiering  dvs. alb/kreatininratio >30 mg/mmol (eller >200 µg/min eller >300 mg/l).'
                            ,'-Normaliserat värde: efter farmakologisk behandling.'].join('')
                            break;
                        }
                    }
                    return metafields;
                };

                return $.ajax({
                    url: APIconfigService.constructUrl(APIconfigService.baseURL + 'MetaField'),
                    data: query,
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        if (unitType == 3) {
                            data = polishDomainsForKids(data);
                        } else {
                            data = polishDomainsForAdults(data);
                        }
                        cache.metafields = data;
                    }
                });
            };


            this.getAttributesLists = function(accountID) {
                var query = query || {};
                var cache = this.data;
                query.APIKey = APIconfigService.APIKey;
                query.AccountID = accountID;

                return $.ajax({
                    url: APIconfigService.constructUrl(APIconfigService.baseURL + 'ContactAttribute'),
                    data: query,
                    type: 'GET',
                    dataType: 'json',
                    success: function(data) {
                        cache.attributesLists = _.indexBy(data, "columnName");
                    }
                });
            }

            this.getSubjects = function(query) {
                query = query || {};
                query.AccountID = accountService.accountModel.activeAccount.accountID;
                query.APIKey = APIconfigService.APIKey;

                return $.ajax({
                    url: APIconfigService.constructUrl(APIconfigService.baseURL + 'subject'),
                    data: query,
                    type: 'GET',
                    dataType: 'json'
                });
            };


            /* METHODS - returns promises */
            this.getList = function(type) {
                return endpoints[type].getList();
            };
            this.getAny = function(type, params) {
                return Restangular.all(type).get(params);
            };
            this.getOne = function(type, id) {
                return Restangular.one(type, id).get();
            };


            this.getStats = function(params) {
                return endpoints.indicatorresult.get(params).then(function(data) {
                    return data.plain();
                });
            };

            this.prepareGeoList = function() {
                var preparedGeoList = [];
                
                _.each(self.data.units, function(obj, key) {
                    
                    if (!obj.isForTest) {
                        var o = {
                            type: 'unit',
                            name: obj.name,
                            id: 'unit_' + obj.unitID
                        };

                        preparedGeoList.push(o);
                    }

                });

                _.each(self.data.counties, function(obj, key) {
                    var o = {
                        type: 'county',
                        name: obj.name,
                        id: 'county_' + obj.code
                    };
                    preparedGeoList.push(o);
                });

                self.data.preparedGeoList = preparedGeoList;
            };


            this.queryFactory = function(params) {
                var defaults = {
                    level: 1,
                    countyCode: 0,
                    unitID: 0,
                    indicatorID: null,
                    fromYear: 2018,
                    fromQuartal: 0,
                    fromMonth: 0,
                    toYear: 2018,
                    toQuartal: 0,
                    toMonth: 0,
                    diabetesType: 0,
                    sex: 0,
                    unitType: 0,
                    fromAge: 0,
                    toAge: 0,
                    interval: null,
                    recalculate: false,
                    outdatedDays: 1
                    //dTH :
                };

                return angular.extend(defaults, params);
            };


            // Store the state of the selected filters for the search list
            // so the user is able to come back to the page from the user profile
            // and get the same state of the search list
            var dateOffset = (24 * 60 * 60 * 1000) * 365; //365

            var preSelectedSearchFilters = {
                values: {
                    s: {
                        value: null
                    },
                    dateFrom: new Date(new Date() - dateOffset),
                    dateTo: new Date(),
                }
            };

            var selectedSearchFilters = preSelectedSearchFilters;

            this.setSearchFilters = function(prop, value) {

                // If no prop and value, reset the object
                if (!prop && !value) {
                    selectedSearchFilters = selectedSearchFilters;
                } else {
                    selectedSearchFilters[prop] = value;
                }
            };

            this.getSearchFilters = function(prop) {
                return prop ? selectedSearchFilters[prop] : selectedSearchFilters;
            };

            this.bootstrap = function() {

                var useStaticUnits = false;

                if (!useStaticUnits) {
                    return $q.all([
                        endpoints.units.getList({
                            exposeMode: 'minified',
                            isActive: true,
                            useCache: true
                        }),
                        endpoints.counties.getList(),
                        endpoints.indicator.get(),
                        endpoints.indicator2017.get()
                    ]).then(function(data) {
                        //console.log("data2", data[0].plain());

                        self.data.units = data[0].plain();
                        self.data.counties = data[1].plain();
                        self.data.indicators = data[2].plain();
                        self.data.indicators2017 = data[3].plain();

                        self.prepareGeoList();
                    });
                } else {
                    return $q.all([
                        //endpoints.indicator.get()
                    ]).then(function(data) {
                        self.data.units = units;
                        self.data.counties = counties;
                        self.data.indicators = indicators;
                        self.data.indicators2017 = indicators2017;

                        self.prepareGeoList();
                    });
                }
            };
        }
    ]);