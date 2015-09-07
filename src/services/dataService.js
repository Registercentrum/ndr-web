'use strict';

angular.module('ndrApp')
    .service('dataService',
                ['$q', '$http', 'Restangular', 'accountService', 'APIconfigService',
        function ($q,   $http,   Restangular,   accountService,   APIconfigService) {

        var self = this;

        this.data = {
            units          : [],
            counties       : [],
            indicators     : [],
            preparedGeoList: []
        };


        /* RESTANGULAR CONFIG */
        Restangular.setBaseUrl(APIconfigService.baseURL);
        Restangular.setDefaultRequestParams({
            APIKey : APIconfigService.APIKey
        });


        /* RESTANGULAR OBJECTS */
        var endpoints = {
            indicator        : Restangular.one('indicator'),
            indicatorresult  : Restangular.one('indicatorresult'),
            contactAttributes: Restangular.one('ContactAttribute'),
            units            : Restangular.all('unit'),
            counties         : Restangular.all('county'),
            news             : Restangular.all('news'),
            researchproject  : Restangular.all('researchproject'),
            contacts         : Restangular.all('Contact'),
            subject          : Restangular.all('subject')
        };



        /**
         * Get the list of possible choices for filtering option
         * @param  {Object} filter Object with filter ids to include or exclude from the result
         * @return {Array} Array with filter options
         */
        this.getContactAttributes = function (filter) {
            return endpoints.contactAttributes.get()
                .then(function (data) {
                    var filtered = [];

                    // Filter the data set by the column names…
                    if (filter) {
                        if (filter.include) {
                            filtered = filtered.concat(_.filter(data.plain(), function (d) { return _.indexOf(filter.include, d.columnName) !== -1; }));
                        }

                        if (filter.exclude) {
                            filtered = filtered.concat(_.filter(data.plain(), function (d) { return _.indexOf(filter.exclude, d.columnName) === -1; }));
                        }

                        return filtered;

                    // …or just return the clean data set, without all the stuff from Restangular
                    } else {
                        return data.plain();
                    }
                })
                ['catch'](function (error) {
                    return error;
                });
        };


        this.getSubjectById = function (id) {
            return Restangular.one('Subject', id).get({'AccountID': accountService.accountModel.activeAccount.accountID})
                .then(function(subject) {
                    return subject.plain();
                })
                ['catch'](function(error) {
                    return error;
                });
        };


        this.getSubjectBySocialNumber = function (socialNumber) {
            var query = {
                url: 'https://ndr.registercentrum.se/api/Subject?AccountID=' + accountService.accountModel.activeAccount.accountID + '&APIKey=' + APIconfigService.APIKey,
                method: 'POST',
                data: {socialNumber: socialNumber}
            };

            return $http(query)
                .then(function (response) { return response.data; })
                ['catch'](console.error.bind(console));
        };


        this.deleteContact = function (id) {
            var query = {
                url: APIconfigService.baseURL + 'Contact/' + id + '?AccountID=' + accountService.accountModel.activeAccount.accountID + '&APIKey=' + APIconfigService.APIKey,
                method: 'DELETE'
            };

            return $http(query)
                .then(function (response) { return response.data; })
                ['catch'](console.error.bind(console));
        };


        this.saveContact = function (data) {
            var query = {
              url: APIconfigService.baseURL + 'Contact/' + (data.contactID || '') + '?AccountID=' + accountService.accountModel.activeAccount.accountID + '&APIKey=' + APIconfigService.APIKey,
              method: data.contactID ? 'PUT' : 'POST',
              data: data
            };

            return $http(query)
                .then(function (response) { return response.data; })
                ['catch'](console.error.bind(console));

        };


        this.getContacts = function (query) {
            query = query || {};
            query.AccountID = accountService.accountModel.activeAccount.accountID;

            return endpoints.contacts.getList(query)
                .then(function (data) {
                    return data.plain();
                })
                ['catch'](function (error) {
                    return error;
                });
        };


        this.getUnits = function (callback) {
            var query = query || {};
            query.APIKey = APIconfigService.APIKey;

            $.ajax({
                url     : APIconfigService.baseURL + 'Unit',
                data    : query,
                type    : 'GET',
                dataType: 'json',
                success : callback
            });
        };


        this.getOptionalQuestionsMeta = function (accountID, callback) {
            var query = query || {};
            query.APIKey = APIconfigService.APIKey;
            query.AccountID = accountID;

            $.ajax({
                url     : APIconfigService.baseURL + 'ContactOptionalMeta',
                data    : query,
                type    : 'GET',
                dataType: 'json',
                success : callback
            });
        };


        this.getSubjects = function (query, callback) {
            query = query || {};
            query.AccountID = accountService.accountModel.activeAccount.accountID;
            query.APIKey = APIconfigService.APIKey;

            $.ajax({
                url: APIconfigService.baseURL + 'subject',
                data: query,
                type: 'GET',
                dataType: 'json',
                success: callback
            });
        };


        /* METHODS - returns promises */
        this.getList = function (type) { return endpoints[type].getList(); };
        this.getAny  = function (type, params) { return Restangular.all(type).get(params); };
        this.getOne  = function (type, id) { return Restangular.one(type, id).get(); };


        this.getStats = function (params) {
            return endpoints.indicatorresult.get(params).then(function (data) {
                return data.plain();
            });
        };


        this.prepareGeoList = function () {
            var preparedGeoList = [];

            _.each(self.data.units, function (obj, key) {
                //if(obj.isActive) {
                    var o = {
                        type: 'unit',
                        name: obj.name,
                        id  : 'unit_' + obj.unitID
                    };
                    preparedGeoList.push(o);
                //}
            });

            _.each(self.data.counties, function (obj, key) {
                var o = {
                    type: 'county',
                    name: obj.name,
                    id  : 'county_' + obj.code
                };
                preparedGeoList.push(o);
            });

            self.data.preparedGeoList = preparedGeoList;
        };


        this.queryFactory = function (params) {
            var defaults = {
                level       : 1,
                countyCode  : 0,
                unitID      : 0,
                indicatorID : null,
                fromYear    : 2014,
                fromQuartal : 0,
                fromMonth   : 0,
                toYear      : 2014,
                toQuartal   : 0,
                toMonth     : 0,
                diabetesType: 0,
                sex         : 0,
                unitType    : 0,
                fromAge     : 0,
                toAge       : 0,
                interval    : null,
                recalculate : false,
                outdatedDays: 14
                //dTH :
            };

            return angular.extend(defaults, params);
        };


        // Store the state of the selected filters for the search list
        // so the user is able to come back to the page from the user profile
        // and get the same state of the search list
        var selectedSearchFilters = {};
        this.setSearchFilters = function (prop, value) {
            // If no prop and value, reset the object
            if (!prop && !value) {
                selectedSearchFilters = {};
            } else {
                selectedSearchFilters[prop] = value;
            }
        };

        this.getSearchFilters = function (prop) {
            return prop ? selectedSearchFilters[prop] : selectedSearchFilters;
        };


        this.bootstrap = function () {

            var useStaticUnits = false;

            if(!Modernizr.svg) {
                useStaticUnits = true;
                var units = [
                    {
                        unitID: 1082,
                        name: "Achima Care Köping Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "731 81",
                        lng: 16.00267791748047,
                        lat: 59.50910568237305
                    },
                    {
                        unitID: 1193,
                        name: "Achima Care Sala Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "733 38",
                        lng: 16.60005760192871,
                        lat: 59.925453186035156
                    },
                    {
                        unitID: 801,
                        name: "Achima Care Trollhättans vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "461 32",
                        lng: 12.290271759033203,
                        lat: 58.273712158203125
                    },
                    {
                        unitID: 1083,
                        name: "Achima Care Uddevalla vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "451 34",
                        lng: 11.950719833374023,
                        lat: 58.347984313964844
                    },
                    {
                        unitID: 86,
                        name: "Acima Care Vårdcentral Älmhult",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "343 32",
                        lng: 14.141155242919922,
                        lat: 56.54752731323242
                    },
                    {
                        unitID: 1446,
                        name: "Adina Hälsans Vårdcentral Nol",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "449 42",
                        lng: 12.066285133361816,
                        lat: 57.916954040527344
                    },
                    {
                        unitID: 1449,
                        name: "Adina Hälsans Vårdcentral Sävedalen",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "433 63",
                        lng: 12.072646141052246,
                        lat: 57.732505798339844
                    },
                    {
                        unitID: 1045,
                        name: "Adolfbergs VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "702 30",
                        lng: 15.160722732543945,
                        lat: 59.23907470703125
                    },
                    {
                        unitID: 1626,
                        name: "Adviva HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "982 82",
                        lng: 20.688079833984375,
                        lat: 67.13185119628906
                    },
                    {
                        unitID: 52,
                        name: "Akademiska sjukhuset Uppsala",
                        countyCode: 3,
                        typeID: 2,
                        postalCode: "751 85",
                        lng: 17.63840103149414,
                        lat: 59.85022735595703
                    },
                    {
                        unitID: 1576,
                        name: "Akutläkarna Vårdcentralen Stampen",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "411 01",
                        lng: 11.978700637817383,
                        lat: 57.70772171020508
                    },
                    {
                        unitID: 1560,
                        name: "Akutläkarna Västra Frölunda",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "421 50",
                        lng: 11.903304100036621,
                        lat: 57.65425491333008
                    },
                    {
                        unitID: 1070,
                        name: "Alby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "145 59",
                        lng: 17.84465980529785,
                        lat: 59.237998962402344
                    },
                    {
                        unitID: 1669,
                        name: "Aleris Barncentrum och Vårdcentral Uppsala",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "752 26",
                        lng: 17.63571548461914,
                        lat: 59.86014175415039
                    },
                    {
                        unitID: 1031,
                        name: "Aleris HC Bollnäs",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "821 31",
                        lng: 16.360950469970703,
                        lat: 61.35390853881836
                    },
                    {
                        unitID: 1084,
                        name: "Aleris Näsby Parks Husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "183 54",
                        lng: 18.095291137695312,
                        lat: 59.430442810058594
                    },
                    {
                        unitID: 455,
                        name: "Aleris Skarptorps VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "603 80",
                        lng: 16.14756965637207,
                        lat: 58.572914123535156
                    },
                    {
                        unitID: 730,
                        name: "Aleris Stureplan Husläkarmott",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 35",
                        lng: 18.07481575012207,
                        lat: 59.33493423461914
                    },
                    {
                        unitID: 1256,
                        name: "Aleris VallatorpsDoktorn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "187 52",
                        lng: 18.043106079101562,
                        lat: 59.46601104736328
                    },
                    {
                        unitID: 1483,
                        name: "Aleris Vårdcentral Järva",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "163 74",
                        lng: 17.93712043762207,
                        lat: 59.38626480102539
                    },
                    {
                        unitID: 67,
                        name: "Aleris Vårdcentral Kneippen",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "603 36",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 3,
                        name: "Aleris Vårdcentral Nykvarn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "155 30",
                        lng: 17.43320655822754,
                        lat: 59.17759704589844
                    },
                    {
                        unitID: 389,
                        name: "Alfta HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "822 30",
                        lng: 16.069517135620117,
                        lat: 61.34580612182617
                    },
                    {
                        unitID: 393,
                        name: "Alingsås lasarett",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "441 83",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1500,
                        name: "Allékliniken Sleipner Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "503 32",
                        lng: 12.942436218261719,
                        lat: 57.72097396850586
                    },
                    {
                        unitID: 1547,
                        name: "Allemanshälsans vårdcentral Frölunda",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "421 50",
                        lng: 11.904108047485352,
                        lat: 57.653907775878906
                    },
                    {
                        unitID: 1490,
                        name: "Allemanshälsans vårdcentral Jungfruplatsen",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "431 48",
                        lng: 12.000202178955078,
                        lat: 57.658931732177734
                    },
                    {
                        unitID: 1485,
                        name: "Allemanshälsans vårdcentral Landala",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "411 31",
                        lng: 11.969284057617188,
                        lat: 57.695072174072266
                    },
                    {
                        unitID: 1461,
                        name: "Allemanshälsans vårdcentral Lunden",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "541 39",
                        lng: 13.867409706115723,
                        lat: 58.40731430053711
                    },
                    {
                        unitID: 1673,
                        name: "Almö Läkarhus",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "471 60",
                        lng: 11.752033233642578,
                        lat: 58.06245803833008
                    },
                    {
                        unitID: 334,
                        name: "Alnö Vårdcentral",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "865 31",
                        lng: 17.41594123840332,
                        lat: 62.42660140991211
                    },
                    {
                        unitID: 295,
                        name: "Alunda husläkarmottagning",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "747 30",
                        lng: 18.078227996826172,
                        lat: 60.06343460083008
                    },
                    {
                        unitID: 1177,
                        name: "Amadeuskliniken",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 40",
                        lng: 12.806289672851562,
                        lat: 56.658790588378906
                    },
                    {
                        unitID: 1032,
                        name: "Andersbergs HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "802 77",
                        lng: 17.137418746948242,
                        lat: 60.65019989013672
                    },
                    {
                        unitID: 904,
                        name: "Anderstorps VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "931 56",
                        lng: 20.988792419433594,
                        lat: 64.7459716796875
                    },
                    {
                        unitID: 1094,
                        name: "Anderstorps VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "334 33",
                        lng: 13.633532524108887,
                        lat: 57.28364944458008
                    },
                    {
                        unitID: 673,
                        name: "Aneby Vårdcentral",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "578 21",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1711,
                        name: "Angered Care Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "424 65",
                        lng: 12.051254272460938,
                        lat: 57.79680252075195
                    },
                    {
                        unitID: 1495,
                        name: "Angereds Läkarhus",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "424 65",
                        lng: 12.049054145812988,
                        lat: 57.79757308959961
                    },
                    {
                        unitID: 1347,
                        name: "Angereds närsjukhus",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "424 22",
                        lng: 12.051924705505371,
                        lat: 57.79780197143555
                    },
                    {
                        unitID: 1069,
                        name: "Ankarsrums HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "590 90",
                        lng: 16.333555221557617,
                        lat: 57.699562072753906
                    },
                    {
                        unitID: 878,
                        name: "Apalby Familjeläkarenhet",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "722 23",
                        lng: 16.53034019470215,
                        lat: 59.635475158691406
                    },
                    {
                        unitID: 1580,
                        name: "Apladalens VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "331 30",
                        lng: 14.04034423828125,
                        lat: 57.18610763549805
                    },
                    {
                        unitID: 383,
                        name: "Arbrå HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 10",
                        lng: 16.37444496154785,
                        lat: 61.47044372558594
                    },
                    {
                        unitID: 988,
                        name: "Arjeplogs HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "938 31",
                        lng: 17.890838623046875,
                        lat: 66.0500259399414
                    },
                    {
                        unitID: 1599,
                        name: "Arkadens läkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "195 30",
                        lng: 17.85270881652832,
                        lat: 59.61982727050781
                    },
                    {
                        unitID: 1681,
                        name: "Arlanda Sky Clinic",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "190 46",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 29,
                        name: "Aros läkarmottagning",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "752 36",
                        lng: 17.62494468688965,
                        lat: 59.84660720825195
                    },
                    {
                        unitID: 880,
                        name: "Arvidsjaurs HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "933 83",
                        lng: 19.168447494506836,
                        lat: 65.59695434570312
                    },
                    {
                        unitID: 392,
                        name: "Arvika sjukhus",
                        countyCode: 17,
                        typeID: 2,
                        postalCode: "671 80",
                        lng: 12.61609935760498,
                        lat: 59.66541290283203
                    },
                    {
                        unitID: 873,
                        name: "Askersunds Vårdcentral",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "696 31",
                        lng: 14.912925720214844,
                        lat: 58.883872985839844
                    },
                    {
                        unitID: 1175,
                        name: "Asomeda Vallentuna Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "186 31",
                        lng: 18.078266143798828,
                        lat: 59.53553771972656
                    },
                    {
                        unitID: 1324,
                        name: "Astrakanen Nybro Läkarcentrum",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "382 30",
                        lng: 15.912165641784668,
                        lat: 56.74436950683594
                    },
                    {
                        unitID: 1376,
                        name: "Asyl och Integrationshälsan",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "724 60",
                        lng: 16.531282424926758,
                        lat: 59.60592269897461
                    },
                    {
                        unitID: 1541,
                        name: "Attundahälsans familjeläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "191 31",
                        lng: 17.937105178833008,
                        lat: 59.43717956542969
                    },
                    {
                        unitID: 1536,
                        name: "Avonova Kinnekullehälsan Götene",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "533 30",
                        lng: 13.49496841430664,
                        lat: 58.527732849121094
                    },
                    {
                        unitID: 1445,
                        name: "Avonova Kinnekullehälsan Mariestad",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "542 32",
                        lng: 13.841577529907227,
                        lat: 58.70977020263672
                    },
                    {
                        unitID: 1572,
                        name: "Avonova Specialistläkargruppen Värnamo",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "331 30",
                        lng: 14.041495323181152,
                        lat: 57.18550491333008
                    },
                    {
                        unitID: 1525,
                        name: "Avonova vårdcentral Vetlanda",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "574 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1537,
                        name: "Avonova Vårdcentralen City Skövde",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "541 30",
                        lng: 13.845907211303711,
                        lat: 58.389976501464844
                    },
                    {
                        unitID: 596,
                        name: "Axelsbergs Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "129 38",
                        lng: 17.97564125061035,
                        lat: 59.303836822509766
                    },
                    {
                        unitID: 1378,
                        name: "Backa Läkarhus",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "417 22",
                        lng: 11.948395729064941,
                        lat: 57.72116470336914
                    },
                    {
                        unitID: 1441,
                        name: "Backa Läkarhusgruppen Stenungsund",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "444 30",
                        lng: 11.815576553344727,
                        lat: 58.07234191894531
                    },
                    {
                        unitID: 270,
                        name: "Backe HC, Läkarmottagningen",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "880 50",
                        lng: 16.369081497192383,
                        lat: 63.740047454833984
                    },
                    {
                        unitID: 572,
                        name: "Backens HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "901 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1081,
                        name: "Baggängens VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "691 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1543,
                        name: "Balderkliniken",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "662 36",
                        lng: 12.703544616699219,
                        lat: 59.049041748046875
                    },
                    {
                        unitID: 1698,
                        name: "Baldersnäs Din HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "821 43",
                        lng: 16.397130966186523,
                        lat: 61.34934616088867
                    },
                    {
                        unitID: 984,
                        name: "Banérgatans husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "115 53",
                        lng: 18.096099853515625,
                        lat: 59.340091705322266
                    },
                    {
                        unitID: 532,
                        name: "Bankeryds VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "564 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1170,
                        name: "Barkarby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "175 63",
                        lng: 17.867996215820312,
                        lat: 59.4025993347168
                    },
                    {
                        unitID: 1674,
                        name: "Beckomberga VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "162 52",
                        lng: 17.89975357055664,
                        lat: 59.35875701904297
                    },
                    {
                        unitID: 406,
                        name: "Bengt-Ivar Nöjd",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "443 21",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 93,
                        name: "Berga HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "393 52",
                        lng: 16.33988380432129,
                        lat: 56.691680908203125
                    },
                    {
                        unitID: 1151,
                        name: "Berga läkarhus",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "254 52",
                        lng: 12.710844993591309,
                        lat: 56.063880920410156
                    },
                    {
                        unitID: 1162,
                        name: "Bergnäsets HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "972 23",
                        lng: 22.106449127197266,
                        lat: 65.57459259033203
                    },
                    {
                        unitID: 1213,
                        name: "Bergshamra Ulriksdal VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "760 10",
                        lng: 18.03486442565918,
                        lat: 59.381553649902344
                    },
                    {
                        unitID: 1092,
                        name: "Bergshamra VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "760 10",
                        lng: 18.653047561645508,
                        lat: 59.637672424316406
                    },
                    {
                        unitID: 624,
                        name: "Bergsjö Din HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 70",
                        lng: 17.054933547973633,
                        lat: 61.978416442871094
                    },
                    {
                        unitID: 832,
                        name: "Birka VC",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "352 41",
                        lng: 14.829057693481445,
                        lat: 56.878482818603516
                    },
                    {
                        unitID: 1054,
                        name: "Bjurholms HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "916 31",
                        lng: 19.206806182861328,
                        lat: 63.92928695678711
                    },
                    {
                        unitID: 499,
                        name: "Bjuråkers HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 62",
                        lng: 16.37755012512207,
                        lat: 61.99528121948242
                    },
                    {
                        unitID: 1136,
                        name: "Bjästa Vårdcentral",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "893 30",
                        lng: 18.49993324279785,
                        lat: 63.20119094848633
                    },
                    {
                        unitID: 367,
                        name: "Björkhagens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "121 53",
                        lng: 18.1175479888916,
                        lat: 59.290218353271484
                    },
                    {
                        unitID: 1142,
                        name: "Björknäs HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "961 64",
                        lng: 21.68214988708496,
                        lat: 65.82763671875
                    },
                    {
                        unitID: 1308,
                        name: "Björkskatans HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "976 27",
                        lng: 22.171192169189453,
                        lat: 65.61444091796875
                    },
                    {
                        unitID: 1060,
                        name: "Blackeberg VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "168 47",
                        lng: 17.882410049438477,
                        lat: 59.3480339050293
                    },
                    {
                        unitID: 839,
                        name: "Blekingesjukhuset Karlshamn",
                        countyCode: 10,
                        typeID: 2,
                        postalCode: "374 80",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 471,
                        name: "Blekingesjukhuset Karlskrona",
                        countyCode: 10,
                        typeID: 2,
                        postalCode: "371 85",
                        lng: 15.605542182922363,
                        lat: 56.181236267089844
                    },
                    {
                        unitID: 1017,
                        name: "Blomstermåla HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "384 31",
                        lng: 16.333093643188477,
                        lat: 56.98097229003906
                    },
                    {
                        unitID: 1066,
                        name: "Blå Kustens HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "572 51",
                        lng: 16.424419403076172,
                        lat: 57.263221740722656
                    },
                    {
                        unitID: 795,
                        name: "Bodafors vårdcentral Bra Liv",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "571 62",
                        lng: 14.703263282775879,
                        lat: 57.50593566894531
                    },
                    {
                        unitID: 1420,
                        name: "Bohuspraktiken",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "445 37",
                        lng: 12.016348838806152,
                        lat: 57.851593017578125
                    },
                    {
                        unitID: 1058,
                        name: "Bolidens VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "936 31",
                        lng: 20.38490104675293,
                        lat: 64.86166381835938
                    },
                    {
                        unitID: 554,
                        name: "Bollmora VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "135 40",
                        lng: 18.22888946533203,
                        lat: 59.24646759033203
                    },
                    {
                        unitID: 378,
                        name: "Bollnäs sjukhus",
                        countyCode: 21,
                        typeID: 2,
                        postalCode: "821 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1705,
                        name: "Boländernas VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "754 50",
                        lng: 17.689680099487305,
                        lat: 59.855464935302734
                    },
                    {
                        unitID: 488,
                        name: "Boo VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "132 30",
                        lng: 18.259614944458008,
                        lat: 59.32828903198242
                    },
                    {
                        unitID: 100,
                        name: "Borgholms HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "387 21",
                        lng: 16.66299819946289,
                        lat: 56.88117980957031
                    },
                    {
                        unitID: 157,
                        name: "Brahehälsan Löberöd",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "241 62",
                        lng: 13.520421028137207,
                        lat: 55.775577545166016
                    },
                    {
                        unitID: 627,
                        name: "Brandbergens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "136 60",
                        lng: 18.170082092285156,
                        lat: 59.17216110229492
                    },
                    {
                        unitID: 1252,
                        name: "Bredängs VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "127 32",
                        lng: 17.93480110168457,
                        lat: 59.295188903808594
                    },
                    {
                        unitID: 1057,
                        name: "Brickebackens VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "702 35",
                        lng: 15.242961883544922,
                        lat: 59.23834991455078
                    },
                    {
                        unitID: 549,
                        name: "Brickegårdens VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "691 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1658,
                        name: "BrommaAkuten VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "168 36",
                        lng: 17.93891143798828,
                        lat: 59.33841323852539
                    },
                    {
                        unitID: 1307,
                        name: "Brommaplans VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "168 76",
                        lng: 17.939905166625977,
                        lat: 59.338836669921875
                    },
                    {
                        unitID: 1564,
                        name: "Brukshälsan",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "815 75",
                        lng: 17.244916915893555,
                        lat: 60.38277816772461
                    },
                    {
                        unitID: 493,
                        name: "Brunnsgårdens VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "374 37",
                        lng: 14.869139671325684,
                        lat: 56.17145538330078
                    },
                    {
                        unitID: 1548,
                        name: "Bräcke Diakoni Vårdcentralen Centralhälsan",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "521 43",
                        lng: 13.553854942321777,
                        lat: 58.167335510253906
                    },
                    {
                        unitID: 1439,
                        name: "Bräcke Diakoni Vårdcentralen Centrum",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "441 30",
                        lng: 12.53002643585205,
                        lat: 57.930580139160156
                    },
                    {
                        unitID: 321,
                        name: "Bräcke Hälsocentral",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "840 60",
                        lng: 15.425952911376953,
                        lat: 62.74828338623047
                    },
                    {
                        unitID: 620,
                        name: "Bräkne Hoby VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "372 62",
                        lng: 15.116567611694336,
                        lat: 56.22731018066406
                    },
                    {
                        unitID: 1480,
                        name: "Brämhults Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "507 30",
                        lng: 13.004056930541992,
                        lat: 57.725921630859375
                    },
                    {
                        unitID: 349,
                        name: "Bureå Vårdcentral",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "932 51",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 874,
                        name: "Burträsk HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "937 31",
                        lng: 20.654376983642578,
                        lat: 64.51756286621094
                    },
                    {
                        unitID: 1056,
                        name: "Byjordens familjeläkarmottagning",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "731 33",
                        lng: 15.9832124710083,
                        lat: 59.51515579223633
                    },
                    {
                        unitID: 899,
                        name: "Byske HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "930 47",
                        lng: 21.20608901977539,
                        lat: 64.95125579833984
                    },
                    {
                        unitID: 1632,
                        name: "BålstaDoktorn",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "746 31",
                        lng: 17.537935256958008,
                        lat: 59.557899475097656
                    },
                    {
                        unitID: 1387,
                        name: "Båstad Bjäre Läkarpraktik",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "269 31",
                        lng: 12.852063179016113,
                        lat: 56.42571258544922
                    },
                    {
                        unitID: 1265,
                        name: "Bäckby familjeläkarmottagning",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "724 73",
                        lng: 16.476736068725586,
                        lat: 59.59991455078125
                    },
                    {
                        unitID: 1646,
                        name: "Capio Cityklinik Bunkeflo Hylje",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "218 40",
                        lng: 12.93634033203125,
                        lat: 55.55741500854492
                    },
                    {
                        unitID: 1134,
                        name: "Capio Citykliniken",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "372 38",
                        lng: 15.286138534545898,
                        lat: 56.2033576965332
                    },
                    {
                        unitID: 126,
                        name: "Capio Citykliniken Broby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "280 60",
                        lng: 14.073661804199219,
                        lat: 56.25202560424805
                    },
                    {
                        unitID: 129,
                        name: "Capio Citykliniken Båstad",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "269 31",
                        lng: 12.842507362365723,
                        lat: 56.42936706542969
                    },
                    {
                        unitID: 1414,
                        name: "Capio Citykliniken Clemenstorget",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "222 21",
                        lng: 13.188080787658691,
                        lat: 55.7066650390625
                    },
                    {
                        unitID: 187,
                        name: "Capio Citykliniken Halmstad",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 42",
                        lng: 12.854644775390625,
                        lat: 56.67445755004883
                    },
                    {
                        unitID: 1090,
                        name: "Capio Citykliniken Helsingborg",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 52",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1283,
                        name: "Capio Citykliniken Klippan",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "264 33",
                        lng: 13.13429069519043,
                        lat: 56.13483810424805
                    },
                    {
                        unitID: 1164,
                        name: "Capio Citykliniken Kristianstad",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "291 54",
                        lng: 14.178044319152832,
                        lat: 56.02903747558594
                    },
                    {
                        unitID: 789,
                        name: "Capio Citykliniken Landskrona",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "261 34",
                        lng: 12.833373069763184,
                        lat: 55.870479583740234
                    },
                    {
                        unitID: 686,
                        name: "Capio Citykliniken Limhamn",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "216 16",
                        lng: 12.932528495788574,
                        lat: 55.5800666809082
                    },
                    {
                        unitID: 1194,
                        name: "Capio Citykliniken Malmö Centrum",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "211 38",
                        lng: 13.004523277282715,
                        lat: 55.603485107421875
                    },
                    {
                        unitID: 1635,
                        name: "Capio Citykliniken Mariastaden",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "254 51",
                        lng: 12.686668395996094,
                        lat: 56.082088470458984
                    },
                    {
                        unitID: 1386,
                        name: "Capio Citykliniken Olympia",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 23",
                        lng: 12.70104694366455,
                        lat: 56.046627044677734
                    },
                    {
                        unitID: 1639,
                        name: "Capio Citykliniken Singelgatan",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "212 28",
                        lng: 13.039579391479492,
                        lat: 55.60148620605469
                    },
                    {
                        unitID: 1638,
                        name: "Capio Citykliniken Västra Hamnen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "211 19",
                        lng: 12.98912525177002,
                        lat: 55.61381530761719
                    },
                    {
                        unitID: 1505,
                        name: "Capio Citykliniken Ängelholm",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "262 35",
                        lng: 12.870245933532715,
                        lat: 56.247886657714844
                    },
                    {
                        unitID: 48,
                        name: "Capio Enköping Vårdcentral",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "749 49",
                        lng: 17.08313751220703,
                        lat: 59.63851547241211
                    },
                    {
                        unitID: 1299,
                        name: "Capio Familjeläkarna Söderbro Skrea",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "311 74",
                        lng: 12.491076469421387,
                        lat: 56.89942932128906
                    },
                    {
                        unitID: 583,
                        name: "Capio Gävle HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "801 30",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1384,
                        name: "Capio Göingekliniken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "281 31",
                        lng: 13.765054702758789,
                        lat: 56.15920639038086
                    },
                    {
                        unitID: 883,
                        name: "Capio Haga Vårdcentral",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "700 14",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1241,
                        name: "Capio Husläkaremottagning Serafen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "112 83",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1035,
                        name: "Capio Husläkarna Kungsbacka",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "434 35",
                        lng: 12.076109886169434,
                        lat: 57.48581314086914
                    },
                    {
                        unitID: 1481,
                        name: "Capio Husläkarna Vallda",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "434 92",
                        lng: 12.008197784423828,
                        lat: 57.48172378540039
                    },
                    {
                        unitID: 518,
                        name: "Capio Hälsocentral Brynäs",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "802 84",
                        lng: 17.16581153869629,
                        lat: 60.67142105102539
                    },
                    {
                        unitID: 953,
                        name: "Capio Hälsocentral Dragonen",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "903 52",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1717,
                        name: "Capio Hälsocentral Wasahuset",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "803 20",
                        lng: 17.13837432861328,
                        lat: 60.67436981201172
                    },
                    {
                        unitID: 370,
                        name: "Capio Högdalens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "124 54",
                        lng: 18.037975311279297,
                        lat: 59.264183044433594
                    },
                    {
                        unitID: 712,
                        name: "Capio Lekebergs VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "716 31",
                        lng: 14.864720344543457,
                        lat: 59.175384521484375
                    },
                    {
                        unitID: 949,
                        name: "Capio Lundby Närsjukhus",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "417 17",
                        lng: 11.936973571777344,
                        lat: 57.72116470336914
                    },
                    {
                        unitID: 402,
                        name: "Capio Läkargruppen AB",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "701 46",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 24,
                        name: "Capio St Görans sjukhus",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "112 81",
                        lng: 18.02069854736328,
                        lat: 59.3343391418457
                    },
                    {
                        unitID: 1246,
                        name: "Capio StadshusDoktorn Lidingö",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "181 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1370,
                        name: "Capio VC Vårberg",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "127 43",
                        lng: 17.889354705810547,
                        lat: 59.27621078491211
                    },
                    {
                        unitID: 1457,
                        name: "Capio Vårdcentral Amhult",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "423 37",
                        lng: 11.780698776245117,
                        lat: 57.708961486816406
                    },
                    {
                        unitID: 1227,
                        name: "Capio Vårdcentral Axess",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "413 01",
                        lng: 11.957839965820312,
                        lat: 57.69963073730469
                    },
                    {
                        unitID: 423,
                        name: "Capio Vårdcentral Berga",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "587 35",
                        lng: 15.642524719238281,
                        lat: 58.39231872558594
                    },
                    {
                        unitID: 1540,
                        name: "Capio Vårdcentral Billdal",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "436 55",
                        lng: 11.9498291015625,
                        lat: 57.59833908081055
                    },
                    {
                        unitID: 421,
                        name: "Capio vårdcentral Bro",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "197 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 989,
                        name: "Capio vårdcentral Farsta",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "123 47",
                        lng: 18.09235191345215,
                        lat: 59.24229431152344
                    },
                    {
                        unitID: 1201,
                        name: "Capio vårdcentral Grästorp",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "467 31",
                        lng: 12.677029609680176,
                        lat: 58.33042526245117
                    },
                    {
                        unitID: 1007,
                        name: "Capio vårdcentral Gubbängen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "122 45",
                        lng: 18.082958221435547,
                        lat: 59.262168884277344
                    },
                    {
                        unitID: 1344,
                        name: "Capio vårdcentral Gullmarsplan",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "121 40",
                        lng: 18.080358505249023,
                        lat: 59.29826736450195
                    },
                    {
                        unitID: 1513,
                        name: "Capio Vårdcentral Gårda",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "416 64",
                        lng: 11.995206832885742,
                        lat: 57.71064758300781
                    },
                    {
                        unitID: 853,
                        name: "Capio Vårdcentral Hagsätra",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "124 73",
                        lng: 18.014455795288086,
                        lat: 59.2626838684082
                    },
                    {
                        unitID: 847,
                        name: "Capio Vårdcentral Hovshaga",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "352 61",
                        lng: 14.798417091369629,
                        lat: 56.90932846069336
                    },
                    {
                        unitID: 1371,
                        name: "Capio Vårdcentral Lidingö",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "181 32",
                        lng: 18.136850357055664,
                        lat: 59.36546325683594
                    },
                    {
                        unitID: 362,
                        name: "Capio vårdcentral Liljeforstorg",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "754 31",
                        lng: 17.65865707397461,
                        lat: 59.87016296386719
                    },
                    {
                        unitID: 593,
                        name: "Capio Vårdcentral Lina Hage",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 55",
                        lng: 17.592004776000977,
                        lat: 59.21031188964844
                    },
                    {
                        unitID: 1444,
                        name: "Capio Vårdcentral Lundby",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "417 17",
                        lng: 11.93683910369873,
                        lat: 57.721160888671875
                    },
                    {
                        unitID: 211,
                        name: "Capio Vårdcentral Mölndal",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "431 30",
                        lng: 12.015554428100586,
                        lat: 57.65611267089844
                    },
                    {
                        unitID: 229,
                        name: "Capio vårdcentral Noltorp",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "441 55",
                        lng: 12.519344329833984,
                        lat: 57.93871307373047
                    },
                    {
                        unitID: 709,
                        name: "Capio Vårdcentral Orust",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "473 34",
                        lng: 11.680695533752441,
                        lat: 58.23781967163086
                    },
                    {
                        unitID: 371,
                        name: "Capio Vårdcentral Ringen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "104 60",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 373,
                        name: "Capio Vårdcentral Rågsved",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "124 65",
                        lng: 18.0275936126709,
                        lat: 59.25754165649414
                    },
                    {
                        unitID: 841,
                        name: "Capio vårdcentral Skogås",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "142 40",
                        lng: 18.155864715576172,
                        lat: 59.217952728271484
                    },
                    {
                        unitID: 1396,
                        name: "Capio Vårdcentral Solna",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "171 68",
                        lng: 17.997940063476562,
                        lat: 59.35710525512695
                    },
                    {
                        unitID: 1132,
                        name: "Capio Vårdcentral Sävedalen",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "433 65",
                        lng: 12.070112228393555,
                        lat: 57.72010040283203
                    },
                    {
                        unitID: 40,
                        name: "Capio vårdcentral Sävja",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "757 54",
                        lng: 17.702167510986328,
                        lat: 59.81016159057617
                    },
                    {
                        unitID: 675,
                        name: "Capio Vårdcentral Södermalm",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "118 50",
                        lng: 18.05771827697754,
                        lat: 59.316078186035156
                    },
                    {
                        unitID: 1377,
                        name: "Capio Vårdcentral Taptogatan",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "115 21",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1130,
                        name: "Capio vårdcentral Vallby",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "724 80",
                        lng: 16.502994537353516,
                        lat: 59.62291717529297
                    },
                    {
                        unitID: 967,
                        name: "Capio Vårdcentral Wasa",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 61",
                        lng: 17.585763931274414,
                        lat: 59.19581985473633
                    },
                    {
                        unitID: 562,
                        name: "Capio Vårdcentral Viksjö",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "175 45",
                        lng: 17.800792694091797,
                        lat: 59.41175842285156
                    },
                    {
                        unitID: 1161,
                        name: "Capio Vårdcentral Väsby",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "194 33",
                        lng: 17.910083770751953,
                        lat: 59.51930236816406
                    },
                    {
                        unitID: 1231,
                        name: "Capio Vårdcentral Västerås City",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "722 13",
                        lng: 16.548961639404297,
                        lat: 59.610923767089844
                    },
                    {
                        unitID: 882,
                        name: "Capio Vårdcentral Årsta",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "120 54",
                        lng: 18.05011558532715,
                        lat: 59.29834747314453
                    },
                    {
                        unitID: 1421,
                        name: "Capio Vårdcentral Östermalm",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 53",
                        lng: 18.085670471191406,
                        lat: 59.33481979370117
                    },
                    {
                        unitID: 1675,
                        name: "Capio Vårdcentralen Slussen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "118 46",
                        lng: 18.070524215698242,
                        lat: 59.31947326660156
                    },
                    {
                        unitID: 777,
                        name: "Capio vårdcentrall Simrishamn",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "272 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 909,
                        name: "Carema hälsocentral Bomhus",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "804 30",
                        lng: 17.214496612548828,
                        lat: 60.67433547973633
                    },
                    {
                        unitID: 1612,
                        name: "Carema Sjukvård",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "272 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1538,
                        name: "Cederkliniken",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "941 33",
                        lng: 21.477617263793945,
                        lat: 65.31946563720703
                    },
                    {
                        unitID: 635,
                        name: "Cementa FHV",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "620 30",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 87,
                        name: "Centrallasarettet Växjö",
                        countyCode: 7,
                        typeID: 2,
                        postalCode: "351 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 236,
                        name: "Centralsjukhuset Karlstad",
                        countyCode: 17,
                        typeID: 2,
                        postalCode: "651 85",
                        lng: 13.480315208435059,
                        lat: 59.37482452392578
                    },
                    {
                        unitID: 141,
                        name: "Centralsjukhuset Kristianstad RoDEoN",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "291 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1168,
                        name: "Centrumkliniken",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "11134",
                        lng: 18.0609130859375,
                        lat: 59.338653564453125
                    },
                    {
                        unitID: 156,
                        name: "Centrumkliniken Trelleborg",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "231 51",
                        lng: 13.155267715454102,
                        lat: 55.381622314453125
                    },
                    {
                        unitID: 1415,
                        name: "Centrumläkarna Adolfsberg",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "256 62",
                        lng: 12.74471664428711,
                        lat: 56.045082092285156
                    },
                    {
                        unitID: 541,
                        name: "Centrumpraktiken",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "442 34",
                        lng: 11.975469589233398,
                        lat: 57.8758430480957
                    },
                    {
                        unitID: 1122,
                        name: "Cerotto AB c/o Derbykliniken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "212 35",
                        lng: 13.065196990966797,
                        lat: 55.57848358154297
                    },
                    {
                        unitID: 1731,
                        name: "Christian Rosqvist Läkarmottagning",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "506 35",
                        lng: 12.94680404663086,
                        lat: 57.730560302734375
                    },
                    {
                        unitID: 1683,
                        name: "CityAkutens Husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "111 37",
                        lng: 18.06146240234375,
                        lat: 59.33561706542969
                    },
                    {
                        unitID: 1666,
                        name: "CityDiabetes",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "111 57",
                        lng: 18.06396484375,
                        lat: 59.334537506103516
                    },
                    {
                        unitID: 1187,
                        name: "CityHeart",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "11157",
                        lng: 18.06396484375,
                        lat: 59.334537506103516
                    },
                    {
                        unitID: 460,
                        name: "Cityhälsan Centrum",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "601 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 454,
                        name: "Cityhälsan Norr",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "602 15",
                        lng: 16.163650512695312,
                        lat: 58.605552673339844
                    },
                    {
                        unitID: 428,
                        name: "Cityhälsan Söder VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "601 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 775,
                        name: "Cityläkarna",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "931 31",
                        lng: 20.95106315612793,
                        lat: 64.75102233886719
                    },
                    {
                        unitID: 1650,
                        name: "Cityläkarna Borås",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "504 35",
                        lng: 12.92867374420166,
                        lat: 57.72112274169922
                    },
                    {
                        unitID: 1714,
                        name: "Cityläkarna i Kalmar AB",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "392 31",
                        lng: 16.361291885375977,
                        lat: 56.6602897644043
                    },
                    {
                        unitID: 1549,
                        name: "Citymottagningen",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "903 27",
                        lng: 20.264198303222656,
                        lat: 63.8283576965332
                    },
                    {
                        unitID: 831,
                        name: "CityPraktiken",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "722 12",
                        lng: 16.544872283935547,
                        lat: 59.60934829711914
                    },
                    {
                        unitID: 1163,
                        name: "CitysjukhusetPlus7",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "411 21",
                        lng: 11.957927703857422,
                        lat: 57.705440521240234
                    },
                    {
                        unitID: 1739,
                        name: "Cleopatra Medical Center",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "417 03",
                        lng: 11.94476318359375,
                        lat: 57.719398498535156
                    },
                    {
                        unitID: 1728,
                        name: "Crama Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "435 35",
                        lng: 12.117116928100586,
                        lat: 57.65617370605469
                    },
                    {
                        unitID: 971,
                        name: "CURA-kliniken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "200 74",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1514,
                        name: "Curera Farsta",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "12347",
                        lng: 18.09235191345215,
                        lat: 59.24229431152344
                    },
                    {
                        unitID: 719,
                        name: "Curera Söder Hornstulls VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "117 28",
                        lng: 18.0354061126709,
                        lat: 59.31524658203125
                    },
                    {
                        unitID: 106,
                        name: "Dackekliniken",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "570 80",
                        lng: 15.585199356079102,
                        lat: 57.28947067260742
                    },
                    {
                        unitID: 687,
                        name: "Dalarömottagningen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "130 54",
                        lng: 18.408601760864258,
                        lat: 59.13338088989258
                    },
                    {
                        unitID: 782,
                        name: "Dalbo VC",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "352 37",
                        lng: 14.798164367675781,
                        lat: 56.890682220458984
                    },
                    {
                        unitID: 368,
                        name: "Dalens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "121 87",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 292,
                        name: "Danderyds sjukhus",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "182 88",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 400,
                        name: "Delsbo Friggesunds HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 60",
                        lng: 16.557340621948242,
                        lat: 61.80049514770508
                    },
                    {
                        unitID: 1408,
                        name: "Diabetesmottagningen Sophiahemmet",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 86",
                        lng: 18.07547950744629,
                        lat: 59.345375061035156
                    },
                    {
                        unitID: 1506,
                        name: "Din Doktor Arlanda stad",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "195 86",
                        lng: 17.897470474243164,
                        lat: 59.607994079589844
                    },
                    {
                        unitID: 377,
                        name: "Din Hälsocentral Söderhamn",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "826 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1482,
                        name: "Din Klinik",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "412 62",
                        lng: 11.988987922668457,
                        lat: 57.680110931396484
                    },
                    {
                        unitID: 366,
                        name: "Din Vårdcentral Bagarmossen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "128 45",
                        lng: 18.135684967041016,
                        lat: 59.27639389038086
                    },
                    {
                        unitID: 576,
                        name: "Distrikstsköterskemottag",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "247 62",
                        lng: 13.491235733032227,
                        lat: 55.63423156738281
                    },
                    {
                        unitID: 1074,
                        name: "Distriktsmottagningen Timmersdala",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "540 16",
                        lng: 13.758533477783203,
                        lat: 58.526283264160156
                    },
                    {
                        unitID: 1148,
                        name: "Djursholms HLM",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "182 05",
                        lng: 18.08681869506836,
                        lat: 59.398040771484375
                    },
                    {
                        unitID: 1366,
                        name: "DjursholmsDoktorn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "182 64",
                        lng: 18.060386657714844,
                        lat: 59.40040588378906
                    },
                    {
                        unitID: 601,
                        name: "Djurö VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "130 40",
                        lng: 18.7039794921875,
                        lat: 59.3116340637207
                    },
                    {
                        unitID: 708,
                        name: "DLM Hälsan 2",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "551 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1609,
                        name: "Doktorteam CeMax AB",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "132 30",
                        lng: 18.259634017944336,
                        lat: 59.32828903198242
                    },
                    {
                        unitID: 1605,
                        name: "Domus Medica",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 23",
                        lng: 12.693617820739746,
                        lat: 56.04611587524414
                    },
                    {
                        unitID: 433,
                        name: "Dorotea VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "917 31",
                        lng: 16.41813087463379,
                        lat: 64.2593765258789
                    },
                    {
                        unitID: 1643,
                        name: "Dr Anders Blombergs mottagning",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "411 25",
                        lng: 11.96668529510498,
                        lat: 57.69900894165039
                    },
                    {
                        unitID: 1412,
                        name: "Dr Hans Thulin, Gruppläkarmottagningen",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "553 20",
                        lng: 14.170506477355957,
                        lat: 57.78192901611328
                    },
                    {
                        unitID: 1230,
                        name: "Dr Johnny Nielsens mottagning",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "274 50",
                        lng: 13.571338653564453,
                        lat: 55.425235748291016
                    },
                    {
                        unitID: 1176,
                        name: "Dr K Hedlunds mottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "162 68",
                        lng: 17.870948791503906,
                        lat: 59.364463806152344
                    },
                    {
                        unitID: 1160,
                        name: "Dr Nina Clausen Sjöbom",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "117 36",
                        lng: 18.03087615966797,
                        lat: 59.317481994628906
                    },
                    {
                        unitID: 1064,
                        name: "Dr Radomskas mottagning",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "415 15",
                        lng: 12.040884971618652,
                        lat: 57.762596130371094
                    },
                    {
                        unitID: 495,
                        name: "Dr Wahlunds Läkarmottagning",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "745 27",
                        lng: 17.07805633544922,
                        lat: 59.645755767822266
                    },
                    {
                        unitID: 1530,
                        name: "E Ehnevids Läkarmottagning",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "273 30",
                        lng: 13.953458786010742,
                        lat: 55.54547119140625
                    },
                    {
                        unitID: 889,
                        name: "Eda Vårdcentral",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "673 32",
                        lng: 12.307483673095703,
                        lat: 59.882564544677734
                    },
                    {
                        unitID: 1198,
                        name: "Edsberg VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "192 05",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1333,
                        name: "Edö Äldreboende",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "123 72",
                        lng: 18.109840393066406,
                        lat: 59.234371185302734
                    },
                    {
                        unitID: 1616,
                        name: "Efoel husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "111 35",
                        lng: 18.06128692626953,
                        lat: 59.3350944519043
                    },
                    {
                        unitID: 1702,
                        name: "E-Hälsan Mitt Hjärta",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "826 40",
                        lng: 17.017019271850586,
                        lat: 61.29425811767578
                    },
                    {
                        unitID: 1730,
                        name: "EIRA Hälsocentral",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "802 50",
                        lng: 17.147607803344727,
                        lat: 60.672752380371094
                    },
                    {
                        unitID: 1645,
                        name: "Ekeby Hälsocenter",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "752 75",
                        lng: 17.60694122314453,
                        lat: 59.8482551574707
                    },
                    {
                        unitID: 58,
                        name: "Ekeby VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "623 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1364,
                        name: "Ekeby vårdcentral AchiMa Care AB",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "267 76",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1418,
                        name: "Ekenhälsan",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "428 36",
                        lng: 12.04250431060791,
                        lat: 57.607688903808594
                    },
                    {
                        unitID: 946,
                        name: "Ekensbergs VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "611 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 885,
                        name: "Ekerö VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "178 31",
                        lng: 17.81068229675293,
                        lat: 59.28929901123047
                    },
                    {
                        unitID: 10,
                        name: "Ektorps VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "131 83",
                        lng: 18.19692039489746,
                        lat: 59.31189727783203
                    },
                    {
                        unitID: 95,
                        name: "Emmaboda HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "361 00",
                        lng: 15.536665916442871,
                        lat: 56.63309860229492
                    },
                    {
                        unitID: 1718,
                        name: "Emmakliniken",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "361 13",
                        lng: 15.540671348571777,
                        lat: 56.631202697753906
                    },
                    {
                        unitID: 16,
                        name: "Enebybergs VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "182 04",
                        lng: 18.038883209228516,
                        lat: 59.43247985839844
                    },
                    {
                        unitID: 1332,
                        name: "Engelbrektskliniken",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 26",
                        lng: 18.075946807861328,
                        lat: 59.34235763549805
                    },
                    {
                        unitID: 49,
                        name: "Enköpings Husläkarcentrum",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "745 25",
                        lng: 17.06894302368164,
                        lat: 59.62925338745117
                    },
                    {
                        unitID: 53,
                        name: "Enköpings lasarett",
                        countyCode: 3,
                        typeID: 2,
                        postalCode: "745 25",
                        lng: 17.0697021484375,
                        lat: 59.629173278808594
                    },
                    {
                        unitID: 1402,
                        name: "Enköpingshälsan",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "745 31",
                        lng: 17.07664680480957,
                        lat: 59.64597702026367
                    },
                    {
                        unitID: 32,
                        name: "Eriksbergs VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "752 43",
                        lng: 17.600574493408203,
                        lat: 59.840702056884766
                    },
                    {
                        unitID: 1052,
                        name: "Erikslids VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "931 30",
                        lng: 20.957414627075195,
                        lat: 64.75019073486328
                    },
                    {
                        unitID: 1219,
                        name: "Erikslunds Hälsocentral",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "961 67",
                        lng: 21.728498458862305,
                        lat: 65.82974243164062
                    },
                    {
                        unitID: 966,
                        name: "Ersboda HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "906 26",
                        lng: 20.3177433013916,
                        lat: 63.85654830932617
                    },
                    {
                        unitID: 417,
                        name: "Ersta Sjukhus",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "116 91",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1062,
                        name: "Esplanadens HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "539 21",
                        lng: 16.640535354614258,
                        lat: 57.753448486328125
                    },
                    {
                        unitID: 1251,
                        name: "Essinge VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "112 67",
                        lng: 18.006799697875977,
                        lat: 59.32297897338867
                    },
                    {
                        unitID: 1078,
                        name: "Fagerängens VC",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "231 34",
                        lng: 13.18974781036377,
                        lat: 55.3721923828125
                    },
                    {
                        unitID: 1664,
                        name: "Falu Vårdcentral",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "791 70",
                        lng: 15.620722770690918,
                        lat: 60.612937927246094
                    },
                    {
                        unitID: 769,
                        name: "Familjedoktorn",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "753 14",
                        lng: 17.628007888793945,
                        lat: 59.860904693603516
                    },
                    {
                        unitID: 1523,
                        name: "Familjehälsan Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "415 26",
                        lng: 12.01332950592041,
                        lat: 57.7288818359375
                    },
                    {
                        unitID: 1413,
                        name: "Familjehälsan Åstorp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "265 34",
                        lng: 12.94735336303711,
                        lat: 56.13764953613281
                    },
                    {
                        unitID: 925,
                        name: "Familjeläkargruppen Odenplan",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "113 22",
                        lng: 18.04336166381836,
                        lat: 59.34080505371094
                    },
                    {
                        unitID: 1310,
                        name: "Familjeläkarmottagningen",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "730 50",
                        lng: 16.425798416137695,
                        lat: 59.71974563598633
                    },
                    {
                        unitID: 1610,
                        name: "Familjeläkarna i City",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "111 35",
                        lng: 18.06128692626953,
                        lat: 59.3350944519043
                    },
                    {
                        unitID: 1262,
                        name: "Familjeläkarna i Forserum",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "571 77",
                        lng: 14.477651596069336,
                        lat: 57.70273971557617
                    },
                    {
                        unitID: 1641,
                        name: "Familjeläkarna i Husby",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "164 32",
                        lng: 17.927560806274414,
                        lat: 59.40857696533203
                    },
                    {
                        unitID: 1587,
                        name: "Familjeläkarna i Olofström",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "293 34",
                        lng: 14.531238555908203,
                        lat: 56.277191162109375
                    },
                    {
                        unitID: 1352,
                        name: "Familjeläkarna i Saltsjöbaden",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "133 34",
                        lng: 18.281044006347656,
                        lat: 59.28558349609375
                    },
                    {
                        unitID: 1565,
                        name: "Familjeläkarna i Sverige AB",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "332 30",
                        lng: 13.541990280151367,
                        lat: 57.302947998046875
                    },
                    {
                        unitID: 1274,
                        name: "Familjeläkarna vid Torget",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "312 30",
                        lng: 13.044593811035156,
                        lat: 56.5136833190918
                    },
                    {
                        unitID: 1292,
                        name: "Familjeläkarna Önsta-Gryta",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "722 44",
                        lng: 16.539329528808594,
                        lat: 59.64849853515625
                    },
                    {
                        unitID: 1684,
                        name: "Feelgood vårdcentral Grevturegatan",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 38",
                        lng: 18.079627990722656,
                        lat: 59.340641021728516
                    },
                    {
                        unitID: 8,
                        name: "Fem Husläkare Sollentuna sjukhus",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "191 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 659,
                        name: "Filialmottagning Mockfjärd",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "780 40",
                        lng: 14.963988304138184,
                        lat: 60.47515869140625
                    },
                    {
                        unitID: 1527,
                        name: "Filipstads Nya VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "682 30",
                        lng: 14.170510292053223,
                        lat: 59.712669372558594
                    },
                    {
                        unitID: 589,
                        name: "Filipstads VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "682 27",
                        lng: 14.178327560424805,
                        lat: 59.71221160888672
                    },
                    {
                        unitID: 72,
                        name: "Finspångs lasarett",
                        countyCode: 5,
                        typeID: 2,
                        postalCode: "612 25",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 397,
                        name: "Fisksätra VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "133 04",
                        lng: 18.25718879699707,
                        lat: 59.29362487792969
                    },
                    {
                        unitID: 1225,
                        name: "Fittja Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "145 51",
                        lng: 17.859872817993164,
                        lat: 59.24879455566406
                    },
                    {
                        unitID: 1103,
                        name: "Fjällhälsan Hede Vemdalen",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "840 93",
                        lng: 13.298199653625488,
                        lat: 62.47574996948242
                    },
                    {
                        unitID: 584,
                        name: "Fjärdhundra VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "740 83",
                        lng: 16.90656089782715,
                        lat: 59.772621154785156
                    },
                    {
                        unitID: 1153,
                        name: "Fjärås VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "439 71",
                        lng: 12.171509742736816,
                        lat: 57.4616584777832
                    },
                    {
                        unitID: 1261,
                        name: "Flemingsbergs Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "141 52",
                        lng: 17.937314987182617,
                        lat: 59.223663330078125
                    },
                    {
                        unitID: 443,
                        name: "Flens VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "642 28",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1245,
                        name: "Flogsta VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "751 25",
                        lng: 17.583608627319336,
                        lat: 59.851078033447266
                    },
                    {
                        unitID: 631,
                        name: "Fornhöjdens vårdcentrum AB",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "152 58",
                        lng: 17.665172576904297,
                        lat: 59.19126510620117
                    },
                    {
                        unitID: 476,
                        name: "Forshaga VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "667 32",
                        lng: 13.489583015441895,
                        lat: 59.53006362915039
                    },
                    {
                        unitID: 438,
                        name: "Forums VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "131 53",
                        lng: 18.16614532470703,
                        lat: 59.30907440185547
                    },
                    {
                        unitID: 1553,
                        name: "Fredriksdals Läkarhus",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "412 63",
                        lng: 11.999946594238281,
                        lat: 57.6831169128418
                    },
                    {
                        unitID: 727,
                        name: "Freja Vårdcentral",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "718 30",
                        lng: 15.363574981689453,
                        lat: 59.46686935424805
                    },
                    {
                        unitID: 1689,
                        name: "Fridhemsplans VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "112 42",
                        lng: 18.032119750976562,
                        lat: 59.331878662109375
                    },
                    {
                        unitID: 1217,
                        name: "Fruängens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "129 52",
                        lng: 17.96654510498047,
                        lat: 59.285614013671875
                    },
                    {
                        unitID: 993,
                        name: "Fränsta VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "840 12",
                        lng: 16.166492462158203,
                        lat: 62.50090789794922
                    },
                    {
                        unitID: 223,
                        name: "Frölunda specialistsjukhus",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "421 22",
                        lng: 11.912342071533203,
                        lat: 57.65060043334961
                    },
                    {
                        unitID: 799,
                        name: "Fröslunda VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "631 88",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 854,
                        name: "Frösö Hälsocentral",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "832 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1224,
                        name: "Furunäsets HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "941 52",
                        lng: 21.486175537109375,
                        lat: 65.29443359375
                    },
                    {
                        unitID: 862,
                        name: "Fålhagens VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "543 23",
                        lng: 17.656782150268555,
                        lat: 59.855384826660156
                    },
                    {
                        unitID: 579,
                        name: "Färila/Los HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 41",
                        lng: 15.8454008102417,
                        lat: 61.79740524291992
                    },
                    {
                        unitID: 98,
                        name: "Färjestadens HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "386 34",
                        lng: 16.47607421875,
                        lat: 56.64081954956055
                    },
                    {
                        unitID: 266,
                        name: "Föllinge HC",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 60",
                        lng: 14.613842964172363,
                        lat: 63.67411804199219
                    },
                    {
                        unitID: 863,
                        name: "Företagshälsovården i Enköping AB",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "745 31",
                        lng: 17.079736709594727,
                        lat: 59.63694381713867
                    },
                    {
                        unitID: 1357,
                        name: "Företagshälsovården Smurfit Kappa Craftliner",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "941 86",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1620,
                        name: "Försäkringsmottagningen Sophiahemmet",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 86",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 107,
                        name: "Gamleby Hälsocentral",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "594 23",
                        lng: 16.399404525756836,
                        lat: 57.89769744873047
                    },
                    {
                        unitID: 1342,
                        name: "Gammelstads HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "954 22",
                        lng: 22.014371871948242,
                        lat: 65.64143371582031
                    },
                    {
                        unitID: 1676,
                        name: "Geria VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "614 34",
                        lng: 16.32816505432129,
                        lat: 58.480594635009766
                    },
                    {
                        unitID: 401,
                        name: "Gillebergets Vårdcentral",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "856 30",
                        lng: 17.341014862060547,
                        lat: 62.40046310424805
                    },
                    {
                        unitID: 44,
                        name: "Gimo Vårdcentral",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "747 43",
                        lng: 18.18527603149414,
                        lat: 60.172481536865234
                    },
                    {
                        unitID: 419,
                        name: "Gislaveds VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "332 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1534,
                        name: "Gislehälsan",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "332 30",
                        lng: 13.53852367401123,
                        lat: 57.30149841308594
                    },
                    {
                        unitID: 325,
                        name: "Gnosjö VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "335 32",
                        lng: 13.739899635314941,
                        lat: 57.355804443359375
                    },
                    {
                        unitID: 326,
                        name: "Gottsunda Vårdcentral",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "750 25",
                        lng: 17.630775451660156,
                        lat: 59.81037139892578
                    },
                    {
                        unitID: 1144,
                        name: "Granitens HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "981 28",
                        lng: 20.23822593688965,
                        lat: 67.84999084472656
                    },
                    {
                        unitID: 994,
                        name: "Granlo VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "857 40",
                        lng: 17.254854202270508,
                        lat: 62.40386962890625
                    },
                    {
                        unitID: 976,
                        name: "Granloholms VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "851 86",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1184,
                        name: "Grindberga familjeläkarenhet",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "732 45",
                        lng: 15.834982872009277,
                        lat: 59.39097595214844
                    },
                    {
                        unitID: 1022,
                        name: "Grytnäs HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "952 51",
                        lng: 23.1240177154541,
                        lat: 65.84736633300781
                    },
                    {
                        unitID: 776,
                        name: "Gränna Vårdcentral",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "563 31",
                        lng: 14.467891693115234,
                        lat: 58.02619171142578
                    },
                    {
                        unitID: 1459,
                        name: "Gränsbygdskliniken",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "285 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 929,
                        name: "Gröndals VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "117 65",
                        lng: 18.017208099365234,
                        lat: 59.31389617919922
                    },
                    {
                        unitID: 440,
                        name: "Gustavsbergs VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "134 40",
                        lng: 18.380897521972656,
                        lat: 59.32295608520508
                    },
                    {
                        unitID: 1178,
                        name: "Gällivare sjukhus",
                        countyCode: 25,
                        typeID: 2,
                        postalCode: "982 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1242,
                        name: "Gärdets VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "115 40",
                        lng: 18.105104446411133,
                        lat: 59.347190856933594
                    },
                    {
                        unitID: 242,
                        name: "Gävle sjukhus",
                        countyCode: 21,
                        typeID: 2,
                        postalCode: "801 87",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1619,
                        name: "Gävle Strand Din HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "803 02",
                        lng: 17.163114547729492,
                        lat: 60.678627014160156
                    },
                    {
                        unitID: 1343,
                        name: "Göran Svensson läkarmottagning",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "312 34",
                        lng: 13.033014297485352,
                        lat: 56.498905181884766
                    },
                    {
                        unitID: 694,
                        name: "Habo Vårdcentral",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "566 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1466,
                        name: "Hagaklinikens Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "413 28",
                        lng: 11.948752403259277,
                        lat: 57.69977569580078
                    },
                    {
                        unitID: 864,
                        name: "Hagalunds VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "169 65",
                        lng: 18.008407592773438,
                        lat: 59.36302947998047
                    },
                    {
                        unitID: 887,
                        name: "Hagfors Ekshärad VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "683 60",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1315,
                        name: "Hallonbergens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "174 52",
                        lng: 17.96816635131836,
                        lat: 59.37555694580078
                    },
                    {
                        unitID: 716,
                        name: "Hallsbergs VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "694 36",
                        lng: 15.116718292236328,
                        lat: 59.060386657714844
                    },
                    {
                        unitID: 1200,
                        name: "Hallstahammar Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "734 30",
                        lng: 16.230396270751953,
                        lat: 59.61516189575195
                    },
                    {
                        unitID: 1,
                        name: "Hallstaviks VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "763 34",
                        lng: 18.596229553222656,
                        lat: 60.052833557128906
                    },
                    {
                        unitID: 1133,
                        name: "Hallunda VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "145 01",
                        lng: 17.828182220458984,
                        lat: 59.2447395324707
                    },
                    {
                        unitID: 1319,
                        name: "Hammarby Sjöstads Husläkare",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "120 63",
                        lng: 18.093730926513672,
                        lat: 59.30427551269531
                    },
                    {
                        unitID: 322,
                        name: "Hammarstrands HC",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "840 70",
                        lng: 16.347675323486328,
                        lat: 63.113956451416016
                    },
                    {
                        unitID: 271,
                        name: "Hammerdal Hälsocentral Nya närvården",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 70",
                        lng: 15.35146427154541,
                        lat: 63.58483123779297
                    },
                    {
                        unitID: 1642,
                        name: "Hamnstadens Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "531 30",
                        lng: 13.157856941223145,
                        lat: 58.50677490234375
                    },
                    {
                        unitID: 897,
                        name: "Hamrånge HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "817 40",
                        lng: 17.04220962524414,
                        lat: 60.928260803222656
                    },
                    {
                        unitID: 613,
                        name: "Handens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "136 25",
                        lng: 18.14159393310547,
                        lat: 59.173545837402344
                    },
                    {
                        unitID: 1110,
                        name: "Haparanda Hälsocentral",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "953 22",
                        lng: 24.135107040405273,
                        lat: 65.83822631835938
                    },
                    {
                        unitID: 1497,
                        name: "Harmånger HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 75",
                        lng: 17.219409942626953,
                        lat: 61.9265251159668
                    },
                    {
                        unitID: 1309,
                        name: "Heby VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "744 32",
                        lng: 16.86151885986328,
                        lat: 59.942047119140625
                    },
                    {
                        unitID: 922,
                        name: "Hedesunda HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "810 40",
                        lng: 17.00494956970215,
                        lat: 60.3953971862793
                    },
                    {
                        unitID: 629,
                        name: "Heimdall VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "931 31",
                        lng: 20.948474884033203,
                        lat: 64.75145721435547
                    },
                    {
                        unitID: 175,
                        name: "Helsingsborgs lasarett",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "251 87",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1199,
                        name: "Hemdal Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "721 89",
                        lng: 16.583839416503906,
                        lat: 59.62157440185547
                    },
                    {
                        unitID: 892,
                        name: "Herkules Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "503 31",
                        lng: 12.938715934753418,
                        lat: 57.72279357910156
                    },
                    {
                        unitID: 985,
                        name: "HerrgärdetsVårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "722 14",
                        lng: 16.549943923950195,
                        lat: 59.61448287963867
                    },
                    {
                        unitID: 1186,
                        name: "Hertsöns HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "974 52",
                        lng: 22.231088638305664,
                        lat: 65.58777618408203
                    },
                    {
                        unitID: 1243,
                        name: "Hjorthagens husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "115 42",
                        lng: 18.1019229888916,
                        lat: 59.354759216308594
                    },
                    {
                        unitID: 872,
                        name: "Hjärt & Kärlcentrum",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 72",
                        lng: 17.626007080078125,
                        lat: 59.19587707519531
                    },
                    {
                        unitID: 1277,
                        name: "Hjärtdiagnostik i Sundsvall AB",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "852 32",
                        lng: 17.303813934326172,
                        lat: 62.389591217041016
                    },
                    {
                        unitID: 11,
                        name: "HLM Korallen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "186 36",
                        lng: 18.082965850830078,
                        lat: 59.53548049926758
                    },
                    {
                        unitID: 1710,
                        name: "HND - centrum",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "182 88",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 570,
                        name: "Hofors HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "813 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 600,
                        name: "Holmsunds VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "913 31",
                        lng: 20.35373306274414,
                        lat: 63.70980453491211
                    },
                    {
                        unitID: 1034,
                        name: "Hortlax HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "944 32",
                        lng: 21.41068458557129,
                        lat: 65.28807830810547
                    },
                    {
                        unitID: 1157,
                        name: "Huddinge VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "141 47",
                        lng: 17.981287002563477,
                        lat: 59.23468017578125
                    },
                    {
                        unitID: 1061,
                        name: "Hudiksvalls HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "824 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 491,
                        name: "Hudiksvalls sjukhus",
                        countyCode: 21,
                        typeID: 2,
                        postalCode: "824 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 104,
                        name: "Hultsfred HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "577 30",
                        lng: 15.842211723327637,
                        lat: 57.48814010620117
                    },
                    {
                        unitID: 1575,
                        name: "HumanResurs VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "891 43",
                        lng: 18.699384689331055,
                        lat: 63.31141662597656
                    },
                    {
                        unitID: 1487,
                        name: "Husby Akalla VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "164 32",
                        lng: 17.917327880859375,
                        lat: 59.414310455322266
                    },
                    {
                        unitID: 1630,
                        name: "Husläkarcentrum",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "392 33",
                        lng: 16.358144760131836,
                        lat: 56.665889739990234
                    },
                    {
                        unitID: 565,
                        name: "Husläkare Ingemar Borggren",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "740 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 917,
                        name: "Husläkaren",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "931 32",
                        lng: 20.943233489990234,
                        lat: 64.75260162353516
                    },
                    {
                        unitID: 1736,
                        name: "Husläkaren Lugn och Ro",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "761 30",
                        lng: 18.703105926513672,
                        lat: 59.75938034057617
                    },
                    {
                        unitID: 1372,
                        name: "Husläkarmott i Täby Centrum",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "183 70",
                        lng: 18.069841384887695,
                        lat: 59.44538879394531
                    },
                    {
                        unitID: 1672,
                        name: "Husläkarmottagningen Bryggaregatan ab",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "149 41",
                        lng: 17.952983856201172,
                        lat: 58.912933349609375
                    },
                    {
                        unitID: 1603,
                        name: "Husläkarmottagningen Chapmans torg",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "414 55",
                        lng: 11.919079780578613,
                        lat: 57.693824768066406
                    },
                    {
                        unitID: 1392,
                        name: "Husläkarmottagningen Doktor Kom Hem",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "112 51",
                        lng: 18.005598068237305,
                        lat: 59.33919143676758
                    },
                    {
                        unitID: 347,
                        name: "Husläkarmottagningen Rimbo-Edsbro",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "762 31",
                        lng: 18.370729446411133,
                        lat: 59.7413330078125
                    },
                    {
                        unitID: 1613,
                        name: "Husläkarmottagningen Sophiahemmet",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 86",
                        lng: 18.07510757446289,
                        lat: 59.34611892700195
                    },
                    {
                        unitID: 1354,
                        name: "Husläkarmottagningen Stockholms sjukhem",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "112 26",
                        lng: 18.048843383789062,
                        lat: 59.33258056640625
                    },
                    {
                        unitID: 677,
                        name: "Husläkarna i Margretelund",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "184 60",
                        lng: 18.33077621459961,
                        lat: 59.471744537353516
                    },
                    {
                        unitID: 1114,
                        name: "Husläkarna i Österåker",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "184 50",
                        lng: 18.29588508605957,
                        lat: 59.48005294799805
                    },
                    {
                        unitID: 1568,
                        name: "Husläkarna Varmbadhuset",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "432 44",
                        lng: 12.244318008422852,
                        lat: 57.10575485229492
                    },
                    {
                        unitID: 1593,
                        name: "Husläkarnas HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "903 21",
                        lng: 20.248252868652344,
                        lat: 63.827178955078125
                    },
                    {
                        unitID: 898,
                        name: "Huvudsta VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "171 52",
                        lng: 17.986276626586914,
                        lat: 59.34983444213867
                    },
                    {
                        unitID: 1732,
                        name: "Håstaholmens Hälsocentral",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "824 42",
                        lng: 17.099966049194336,
                        lat: 61.71950149536133
                    },
                    {
                        unitID: 430,
                        name: "Hällefors VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "712 30",
                        lng: 14.521846771240234,
                        lat: 59.779579162597656
                    },
                    {
                        unitID: 1562,
                        name: "Hälsans Hus Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "438 35",
                        lng: 12.198234558105469,
                        lat: 57.68764114379883
                    },
                    {
                        unitID: 1720,
                        name: "Hälsans Vårdcentral Tensta",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "163 64",
                        lng: 17.901737213134766,
                        lat: 59.394615173339844
                    },
                    {
                        unitID: 1602,
                        name: "HälsoBrunnen - vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "52337",
                        lng: 13.409754753112793,
                        lat: 57.80723190307617
                    },
                    {
                        unitID: 1125,
                        name: "Hälsocentralen",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "544 32",
                        lng: 14.285868644714355,
                        lat: 58.30792236328125
                    },
                    {
                        unitID: 9,
                        name: "Hälsocentralen Akka",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "137 38",
                        lng: 18.10181427001953,
                        lat: 59.12138748168945
                    },
                    {
                        unitID: 276,
                        name: "Hälsocentralen Brunflo",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "834 31",
                        lng: 14.833209991455078,
                        lat: 63.082305908203125
                    },
                    {
                        unitID: 335,
                        name: "Hälsocentralen Centrum",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "852 34",
                        lng: 17.312376022338867,
                        lat: 62.39558792114258
                    },
                    {
                        unitID: 1574,
                        name: "Hälsocentralen City",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "802 11",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 390,
                        name: "Hälsocentralen Edsbyn",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "828 33",
                        lng: 15.810400009155273,
                        lat: 61.37991714477539
                    },
                    {
                        unitID: 1491,
                        name: "Hälsocentralen Ellenbogen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "211 35",
                        lng: 13.003430366516113,
                        lat: 55.60560607910156
                    },
                    {
                        unitID: 1073,
                        name: "Hälsocentralen Falken",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 75",
                        lng: 15.653387069702148,
                        lat: 56.976932525634766
                    },
                    {
                        unitID: 263,
                        name: "Hälsocentralen Funäsdalen",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "840 95",
                        lng: 12.805642127990723,
                        lat: 62.66600799560547
                    },
                    {
                        unitID: 323,
                        name: "Hälsocentralen Gäddede",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 90",
                        lng: 14.149030685424805,
                        lat: 64.49014282226562
                    },
                    {
                        unitID: 274,
                        name: "Hälsocentralen Hallen",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 01",
                        lng: 14.089982032775879,
                        lat: 63.177154541015625
                    },
                    {
                        unitID: 1087,
                        name: "Hälsocentralen Höga Kusten",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "870 32",
                        lng: 18.1845703125,
                        lat: 63.014320373535156
                    },
                    {
                        unitID: 1707,
                        name: "Hälsocentralen i Näsum",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "295 74",
                        lng: 14.498361587524414,
                        lat: 56.17137908935547
                    },
                    {
                        unitID: 569,
                        name: "Hälsocentralen Iggesund",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "825 31",
                        lng: 17.075546264648438,
                        lat: 61.64404296875
                    },
                    {
                        unitID: 275,
                        name: "Hälsocentralen Järpen",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 05",
                        lng: 13.45881462097168,
                        lat: 63.34836959838867
                    },
                    {
                        unitID: 267,
                        name: "Hälsocentralen Krokom",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "835 31",
                        lng: 14.452434539794922,
                        lat: 63.327003479003906
                    },
                    {
                        unitID: 947,
                        name: "Hälsocentralen Kälarne",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "840 64",
                        lng: 16.083059310913086,
                        lat: 62.97856140136719
                    },
                    {
                        unitID: 239,
                        name: "Hälsocentralen Linden",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 23",
                        lng: 16.827749252319336,
                        lat: 61.260780334472656
                    },
                    {
                        unitID: 341,
                        name: "Hälsocentralen Lit",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "836 31",
                        lng: 14.849811553955078,
                        lat: 63.318931579589844
                    },
                    {
                        unitID: 277,
                        name: "Hälsocentralen Lugnvik",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "831 51",
                        lng: 14.634742736816406,
                        lat: 63.2039909362793
                    },
                    {
                        unitID: 319,
                        name: "Hälsocentralen Matfors VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "864 31",
                        lng: 17.014423370361328,
                        lat: 62.34852600097656
                    },
                    {
                        unitID: 804,
                        name: "Hälsocentralen Myrviken",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 24",
                        lng: 14.334239959716797,
                        lat: 63.00017166137695
                    },
                    {
                        unitID: 278,
                        name: "Hälsocentralen Odensala",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "831 61",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 268,
                        name: "Hälsocentralen Offerdal",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 51",
                        lng: 14.068779945373535,
                        lat: 63.457767486572266
                    },
                    {
                        unitID: 1431,
                        name: "Hälsocentralen Sankt Hans",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "226 47",
                        lng: 13.203361511230469,
                        lat: 55.72320556640625
                    },
                    {
                        unitID: 838,
                        name: "Hälsocentralen Sollefteå",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "881 30",
                        lng: 17.236574172973633,
                        lat: 63.17412185668945
                    },
                    {
                        unitID: 273,
                        name: "Hälsocentralen Strömsund",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "833 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 995,
                        name: "Hälsocentralen Stöde",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "860 13",
                        lng: 16.58809471130371,
                        lat: 62.41871643066406
                    },
                    {
                        unitID: 264,
                        name: "Hälsocentralen Sveg",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "842 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 261,
                        name: "Hälsocentralen Svenstavik",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "840 40",
                        lng: 14.718578338623047,
                        lat: 62.666812896728516
                    },
                    {
                        unitID: 327,
                        name: "Hälsocentralen Torvalla",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "831 72",
                        lng: 14.743550300598145,
                        lat: 63.1577262878418
                    },
                    {
                        unitID: 342,
                        name: "Hälsocentralen Zätagränd",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "831 30",
                        lng: 14.635879516601562,
                        lat: 63.17764663696289
                    },
                    {
                        unitID: 339,
                        name: "Hälsocentralen Åre",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 14",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 365,
                        name: "HälsocentralenNacksta",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "853 50",
                        lng: 17.255449295043945,
                        lat: 62.39297866821289
                    },
                    {
                        unitID: 1608,
                        name: "Hälsogemenskapen",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "930 55",
                        lng: 20.03986930847168,
                        lat: 65.05946350097656
                    },
                    {
                        unitID: 781,
                        name: "Hälsohuset AB",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "749 49",
                        lng: 17.083799362182617,
                        lat: 59.63352584838867
                    },
                    {
                        unitID: 1555,
                        name: "Hälsohuset för alla",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "371 34",
                        lng: 15.583895683288574,
                        lat: 56.165122985839844
                    },
                    {
                        unitID: 1393,
                        name: "Hälsomedicinskt center Hjärup",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "245 62",
                        lng: 13.14106273651123,
                        lat: 55.66933822631836
                    },
                    {
                        unitID: 1734,
                        name: "Hälsomedicinskt Center Landskrona",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "261 35",
                        lng: 12.837342262268066,
                        lat: 55.867919921875
                    },
                    {
                        unitID: 1712,
                        name: "Hälsomedicinskt center Lomma",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "234 39",
                        lng: 13.061963081359863,
                        lat: 55.677268981933594
                    },
                    {
                        unitID: 1570,
                        name: "Hälsopartner HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "811 39",
                        lng: 16.772794723510742,
                        lat: 60.621158599853516
                    },
                    {
                        unitID: 124,
                        name: "HälsoRingen Bromölla",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "295 35",
                        lng: 14.472285270690918,
                        lat: 56.079105377197266
                    },
                    {
                        unitID: 1335,
                        name: "Hälsoringen Glänninge",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "312 36",
                        lng: 13.05062198638916,
                        lat: 56.502952575683594
                    },
                    {
                        unitID: 850,
                        name: "HälsoRingen Lönsboda",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "280 70",
                        lng: 14.318416595458984,
                        lat: 56.39807891845703
                    },
                    {
                        unitID: 564,
                        name: "Hälsoringen Vård AB Osby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "283 41",
                        lng: 13.996942520141602,
                        lat: 56.38118362426758
                    },
                    {
                        unitID: 1273,
                        name: "HälsoRingen Vård Knäred",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "310 20",
                        lng: 13.314775466918945,
                        lat: 56.521263122558594
                    },
                    {
                        unitID: 1391,
                        name: "Hälsoringen Vård Älmhult",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "343 36",
                        lng: 14.134714126586914,
                        lat: 56.55448913574219
                    },
                    {
                        unitID: 1690,
                        name: "Hälsoteamet Anderstorp",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "334 33",
                        lng: 13.628739356994629,
                        lat: 57.27833938598633
                    },
                    {
                        unitID: 1691,
                        name: "Hälsoteamet Gislaved",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "332 30",
                        lng: 13.541824340820312,
                        lat: 57.30315399169922
                    },
                    {
                        unitID: 1692,
                        name: "Hälsoteamet Mullsjö",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "556 33",
                        lng: 14.169293403625488,
                        lat: 57.68866729736328
                    },
                    {
                        unitID: 1693,
                        name: "Hälsoteamet Smålandsstenar",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "333 31",
                        lng: 13.41378402709961,
                        lat: 57.16194152832031
                    },
                    {
                        unitID: 320,
                        name: "Härnösands sjukhus",
                        countyCode: 22,
                        typeID: 2,
                        postalCode: "871 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1030,
                        name: "Hässelby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "165 55",
                        lng: 17.843233108520508,
                        lat: 59.368228912353516
                    },
                    {
                        unitID: 142,
                        name: "Hässleholms sjukhus",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "281 25",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 359,
                        name: "Höglandssjukhuset Eksjö",
                        countyCode: 6,
                        typeID: 2,
                        postalCode: "575 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 102,
                        name: "Högsby Hälsocentral",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "579 32",
                        lng: 16.025529861450195,
                        lat: 57.171485900878906
                    },
                    {
                        unitID: 1369,
                        name: "Hönö Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "430 91",
                        lng: 11.650774002075195,
                        lat: 57.696468353271484
                    },
                    {
                        unitID: 713,
                        name: "Hörnefors VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "910 20",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1416,
                        name: "Hötorgets Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "111 35",
                        lng: 18.056299209594727,
                        lat: 59.334232330322266
                    },
                    {
                        unitID: 717,
                        name: "Jakobsbergs Akademiska VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "177 31",
                        lng: 17.844573974609375,
                        lat: 59.42251205444336
                    },
                    {
                        unitID: 1235,
                        name: "Johannes husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "113 52",
                        lng: 18.056676864624023,
                        lat: 59.34604263305664
                    },
                    {
                        unitID: 1442,
                        name: "JohannesVården - Vårdcentral och BVC",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "426 55",
                        lng: 11.892488479614258,
                        lat: 57.65266799926758
                    },
                    {
                        unitID: 577,
                        name: "Jokkmokks Hälsocentral",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "962 22",
                        lng: 19.843505859375,
                        lat: 66.6020736694336
                    },
                    {
                        unitID: 551,
                        name: "Jordbro VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "137 64",
                        lng: 18.13239860534668,
                        lat: 59.14122009277344
                    },
                    {
                        unitID: 617,
                        name: "Jämjö VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "373 00",
                        lng: 15.833081245422363,
                        lat: 56.189212799072266
                    },
                    {
                        unitID: 1025,
                        name: "Järna VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "153 30",
                        lng: 17.56611442565918,
                        lat: 59.08885955810547
                    },
                    {
                        unitID: 1422,
                        name: "Järnhälsan",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "413 01",
                        lng: 11.954381942749023,
                        lat: 57.700889587402344
                    },
                    {
                        unitID: 316,
                        name: "Järvsö HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 40",
                        lng: 16.169837951660156,
                        lat: 61.712486267089844
                    },
                    {
                        unitID: 1021,
                        name: "Kalix HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "952 82",
                        lng: 23.158802032470703,
                        lat: 65.85494995117188
                    },
                    {
                        unitID: 1020,
                        name: "Kalix sjukhus",
                        countyCode: 25,
                        typeID: 2,
                        postalCode: "952 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1282,
                        name: "Kallhälls Nya VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "176 72",
                        lng: 17.808488845825195,
                        lat: 59.454769134521484
                    },
                    {
                        unitID: 619,
                        name: "Kallinge VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "372 50",
                        lng: 15.287394523620605,
                        lat: 56.2469596862793
                    },
                    {
                        unitID: 628,
                        name: "Karla VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "703 42",
                        lng: 15.195958137512207,
                        lat: 59.27603530883789
                    },
                    {
                        unitID: 235,
                        name: "Karlskoga lasarett",
                        countyCode: 18,
                        typeID: 2,
                        postalCode: "691 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 891,
                        name: "Karolina VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "691 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 356,
                        name: "Karolinska universitetssjukhuset Huddinge",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "141 86",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 23,
                        name: "Karolinska Universitetssjukhuset Solna",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "171 76",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 526,
                        name: "Kilafors HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "823 30",
                        lng: 16.568809509277344,
                        lat: 61.23065948486328
                    },
                    {
                        unitID: 1583,
                        name: "Kinnekullehälsans VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "671 32",
                        lng: 12.597769737243652,
                        lat: 59.65458679199219
                    },
                    {
                        unitID: 486,
                        name: "Kiruna sjukhus",
                        countyCode: 25,
                        typeID: 2,
                        postalCode: "981 28",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1050,
                        name: "Kista VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "164 91",
                        lng: 17.94438934326172,
                        lat: 59.40315628051758
                    },
                    {
                        unitID: 398,
                        name: "Klinte Vårdcentral",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "621 84",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 852,
                        name: "Klippans VC",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "264 32",
                        lng: 13.12661075592041,
                        lat: 56.13559341430664
                    },
                    {
                        unitID: 1499,
                        name: "Knivsta läkargrupp",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "741 44",
                        lng: 17.79908561706543,
                        lat: 59.71953582763672
                    },
                    {
                        unitID: 442,
                        name: "Knivsta Vårdcentral",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "751 85",
                        lng: 17.784801483154297,
                        lat: 59.724769592285156
                    },
                    {
                        unitID: 932,
                        name: "Knutby VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "740 12",
                        lng: 18.26129722595215,
                        lat: 59.90727996826172
                    },
                    {
                        unitID: 1363,
                        name: "Kolbäcks familjeläkarmottagning",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "734 51",
                        lng: 16.242734909057617,
                        lat: 59.56257247924805
                    },
                    {
                        unitID: 429,
                        name: "Kolmårdens VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "618 30",
                        lng: 16.362621307373047,
                        lat: 58.66893768310547
                    },
                    {
                        unitID: 1270,
                        name: "Kolsva Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "730 30",
                        lng: 15.839180946350098,
                        lat: 59.60003662109375
                    },
                    {
                        unitID: 861,
                        name: "Kopparbergs VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "714 31",
                        lng: 15.003107070922852,
                        lat: 59.87429428100586
                    },
                    {
                        unitID: 1322,
                        name: "Kringlans vårdcentrum",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 73",
                        lng: 17.626750946044922,
                        lat: 59.19375991821289
                    },
                    {
                        unitID: 131,
                        name: "Kristianstadkliniken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "291 31",
                        lng: 14.15769100189209,
                        lat: 56.02942657470703
                    },
                    {
                        unitID: 907,
                        name: "Kristina VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "681 80",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 470,
                        name: "Kristinebergs HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "572 28",
                        lng: 16.466201782226562,
                        lat: 57.25039291381836
                    },
                    {
                        unitID: 1518,
                        name: "Kristinehamns Nya VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "681 43",
                        lng: 14.1268892288208,
                        lat: 59.310142517089844
                    },
                    {
                        unitID: 699,
                        name: "Kullbergska sjukhuset",
                        countyCode: 4,
                        typeID: 2,
                        postalCode: "641 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1086,
                        name: "Kumla Medicinska Praktik AB",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "692 72",
                        lng: 15.189844131469727,
                        lat: 59.11463165283203
                    },
                    {
                        unitID: 920,
                        name: "Kumla vårdcentral, Fylstamottagningen",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "692 34",
                        lng: 15.122599601745605,
                        lat: 59.12864303588867
                    },
                    {
                        unitID: 189,
                        name: "Kungsbacka Närsjukhus",
                        countyCode: 13,
                        typeID: 2,
                        postalCode: "434 40",
                        lng: 12.082858085632324,
                        lat: 57.4942626953125
                    },
                    {
                        unitID: 726,
                        name: "Kungsbacka VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "434 80",
                        lng: 12.083223342895508,
                        lat: 57.49428176879883
                    },
                    {
                        unitID: 396,
                        name: "Kungsgatans vårdcentral Link.",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "582 18",
                        lng: 15.619913101196289,
                        lat: 58.41280746459961
                    },
                    {
                        unitID: 1305,
                        name: "Kungsgårdshälsan",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "262 71",
                        lng: 12.886056900024414,
                        lat: 56.24889373779297
                    },
                    {
                        unitID: 585,
                        name: "Kungsgärdets Vårdcentral",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "752 33",
                        lng: 17.621444702148438,
                        lat: 59.85541915893555
                    },
                    {
                        unitID: 1510,
                        name: "Kungsholmsdoktorn AB",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "112 59",
                        lng: 18.018583297729492,
                        lat: 59.328834533691406
                    },
                    {
                        unitID: 720,
                        name: "Kungshälsans VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "551 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1329,
                        name: "Kungsmarkens VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "371 44",
                        lng: 15.622721672058105,
                        lat: 56.19362258911133
                    },
                    {
                        unitID: 1395,
                        name: "Kungsportsläkarna",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "411 36",
                        lng: 11.976381301879883,
                        lat: 57.69906997680664
                    },
                    {
                        unitID: 670,
                        name: "Kungsängens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "196 30",
                        lng: 17.750839233398438,
                        lat: 59.47972106933594
                    },
                    {
                        unitID: 1325,
                        name: "Kungsörs Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "736 30",
                        lng: 16.09661293029785,
                        lat: 59.41862487792969
                    },
                    {
                        unitID: 328,
                        name: "Kungälvs sjukhus",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "442 25",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 26,
                        name: "Kvarnbyn Väst",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "442 49",
                        lng: 12.015836715698242,
                        lat: 57.888572692871094
                    },
                    {
                        unitID: 27,
                        name: "Kvarnbyn Öst",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "422 49",
                        lng: 11.952428817749023,
                        lat: 57.749176025390625
                    },
                    {
                        unitID: 1016,
                        name: "Kvarnholmens HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "391 26",
                        lng: 16.36313247680664,
                        lat: 56.665706634521484
                    },
                    {
                        unitID: 1207,
                        name: "Kvartersakuten Matteus",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "113 27",
                        lng: 18.050508499145508,
                        lat: 59.34369659423828
                    },
                    {
                        unitID: 1582,
                        name: "Kvartersakuten Mörby Centrum",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "182 33",
                        lng: 18.034730911254883,
                        lat: 59.39963150024414
                    },
                    {
                        unitID: 881,
                        name: "Kvartersakuten Serafen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "112 83",
                        lng: 18.053226470947266,
                        lat: 59.328697204589844
                    },
                    {
                        unitID: 1356,
                        name: "Kvartersakuten Surbrunn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "113 27",
                        lng: 18.050491333007812,
                        lat: 59.34368896484375
                    },
                    {
                        unitID: 911,
                        name: "Kvartersakuten Tegnergatan",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "111 40",
                        lng: 18.060914993286133,
                        lat: 59.3397102355957
                    },
                    {
                        unitID: 1558,
                        name: "Kvarterskliniken Almedal",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "412 63",
                        lng: 11.976287841796875,
                        lat: 57.69915771484375
                    },
                    {
                        unitID: 1473,
                        name: "Kvarterskliniken Husaren",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "411 22",
                        lng: 11.959059715270996,
                        lat: 57.6965217590332
                    },
                    {
                        unitID: 1458,
                        name: "Kvarterskliniken Lorensberg",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "400 14",
                        lng: 11.976381301879883,
                        lat: 57.69906997680664
                    },
                    {
                        unitID: 1430,
                        name: "Kvarterskliniken Tanum",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "457 30",
                        lng: 11.32380485534668,
                        lat: 58.72367477416992
                    },
                    {
                        unitID: 1401,
                        name: "Kåbohälsan",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "752 36",
                        lng: 17.62494468688965,
                        lat: 59.84660720825195
                    },
                    {
                        unitID: 283,
                        name: "Kåge Morö Backe VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "931 51",
                        lng: 21.0267333984375,
                        lat: 64.75336456298828
                    },
                    {
                        unitID: 446,
                        name: "Kärna VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "586 65",
                        lng: 15.507067680358887,
                        lat: 58.42055892944336
                    },
                    {
                        unitID: 170,
                        name: "Kärråkra Vårdcentralen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "241 35",
                        lng: 13.286725044250488,
                        lat: 55.844181060791016
                    },
                    {
                        unitID: 1234,
                        name: "Kävlinge VC",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "244 31",
                        lng: 13.11250114440918,
                        lat: 55.79060363769531
                    },
                    {
                        unitID: 1389,
                        name: "Lagaholmskliniken",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "312 30",
                        lng: 13.041872024536133,
                        lat: 56.51156234741211
                    },
                    {
                        unitID: 447,
                        name: "Lambohovs VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "583 34",
                        lng: 15.563996315002441,
                        lat: 58.3876953125
                    },
                    {
                        unitID: 1532,
                        name: "Landsbro VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "570 12",
                        lng: 14.912371635437012,
                        lat: 57.37061309814453
                    },
                    {
                        unitID: 178,
                        name: "Landskrona lasarett",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "261 36",
                        lng: 12.83868408203125,
                        lat: 55.87648010253906
                    },
                    {
                        unitID: 1106,
                        name: "Laponia HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "982 82",
                        lng: 20.686555862426758,
                        lat: 67.13105773925781
                    },
                    {
                        unitID: 70,
                        name: "Lasarettet i Motala",
                        countyCode: 5,
                        typeID: 2,
                        postalCode: "591 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 176,
                        name: "Lasarettet Ystad",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "271 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1477,
                        name: "Laurentiikliniken Hälsoringen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "222 23",
                        lng: 13.192459106445312,
                        lat: 55.7018928527832
                    },
                    {
                        unitID: 691,
                        name: "Laurentiuskliniken Falkenberg",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "311 75",
                        lng: 12.48867130279541,
                        lat: 56.90303039550781
                    },
                    {
                        unitID: 474,
                        name: "Laxå VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "695 32",
                        lng: 14.630414009094238,
                        lat: 58.97920227050781
                    },
                    {
                        unitID: 333,
                        name: "Lidens Hälsocentral",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "860 41",
                        lng: 16.80301284790039,
                        lat: 62.700408935546875
                    },
                    {
                        unitID: 1267,
                        name: "Lidingödoktorn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "181 59",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1210,
                        name: "Liljeholmens Vårdcentralen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "117 94",
                        lng: 18.022035598754883,
                        lat: 59.30979919433594
                    },
                    {
                        unitID: 1652,
                        name: "Liljeholmskajens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "117 43",
                        lng: 18.028474807739258,
                        lat: 59.30944061279297
                    },
                    {
                        unitID: 798,
                        name: "Lill-Jans Husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 32",
                        lng: 18.07282257080078,
                        lat: 59.34402084350586
                    },
                    {
                        unitID: 851,
                        name: "Lillåns VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "703 75",
                        lng: 15.223374366760254,
                        lat: 59.31922912597656
                    },
                    {
                        unitID: 508,
                        name: "Lindesbergs lasarett",
                        countyCode: 18,
                        typeID: 2,
                        postalCode: "711 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 408,
                        name: "Lindesbergs Vårdcentral",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "711 30",
                        lng: 15.2229585647583,
                        lat: 59.59321212768555
                    },
                    {
                        unitID: 89,
                        name: "Lindsdals HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "393 65",
                        lng: 16.295392990112305,
                        lat: 56.73432922363281
                    },
                    {
                        unitID: 448,
                        name: "Linghems VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "585 65",
                        lng: 15.779526710510254,
                        lat: 58.42555618286133
                    },
                    {
                        unitID: 1279,
                        name: "Lisebergs VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "125 71",
                        lng: 18.030216217041016,
                        lat: 59.284732818603516
                    },
                    {
                        unitID: 543,
                        name: "Ljungby lasarett",
                        countyCode: 7,
                        typeID: 2,
                        postalCode: "341 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 91,
                        name: "Ljungbyholms HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "391 85",
                        lng: 16.172870635986328,
                        lat: 56.63362121582031
                    },
                    {
                        unitID: 449,
                        name: "Ljungsbro VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "590 71",
                        lng: 15.50341796875,
                        lat: 58.50823211669922
                    },
                    {
                        unitID: 503,
                        name: "Ljusdals HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "827 25",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 505,
                        name: "Ljusne HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "820 20",
                        lng: 17.130708694458008,
                        lat: 61.210941314697266
                    },
                    {
                        unitID: 1708,
                        name: "Ljustadalens Hälsocentral Premicare",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "863 34",
                        lng: 17.36878776550293,
                        lat: 62.4363899230957
                    },
                    {
                        unitID: 690,
                        name: "Luna VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 72",
                        lng: 17.62540054321289,
                        lat: 59.195682525634766
                    },
                    {
                        unitID: 1713,
                        name: "Lundens Husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "191 42",
                        lng: 17.96331214904785,
                        lat: 59.410484313964844
                    },
                    {
                        unitID: 1172,
                        name: "Luthagens VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "752 26",
                        lng: 17.623958587646484,
                        lat: 59.86455154418945
                    },
                    {
                        unitID: 1179,
                        name: "Luthagsgården HB Husläkargrupp",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "752 24",
                        lng: 17.617097854614258,
                        lat: 59.86032485961914
                    },
                    {
                        unitID: 618,
                        name: "Lyckeby VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "371 62",
                        lng: 15.649367332458496,
                        lat: 56.19862365722656
                    },
                    {
                        unitID: 450,
                        name: "Lyckornas VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "591 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 552,
                        name: "Lycksele lasarett",
                        countyCode: 24,
                        typeID: 2,
                        postalCode: "921 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 483,
                        name: "Lycksele vårdcentral skall vara 5610035",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "921 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1448,
                        name: "Lysekils Läkarhus",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "453 33",
                        lng: 11.438438415527344,
                        lat: 58.27434158325195
                    },
                    {
                        unitID: 1298,
                        name: "Läjeskliniken",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "432 74",
                        lng: 12.29651165008545,
                        lat: 57.05506134033203
                    },
                    {
                        unitID: 1400,
                        name: "Läkarcentrum Nyponet",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "641 30",
                        lng: 16.2042293548584,
                        lat: 58.99528503417969
                    },
                    {
                        unitID: 1302,
                        name: "LäkarGruppen",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "722 11",
                        lng: 16.541385650634766,
                        lat: 59.607906341552734
                    },
                    {
                        unitID: 923,
                        name: "Läkargruppen Mölndalsbro",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "431 31",
                        lng: 12.015213966369629,
                        lat: 57.65519714355469
                    },
                    {
                        unitID: 1301,
                        name: "Läkargruppen Tre Hjärtan",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 43",
                        lng: 12.858095169067383,
                        lat: 56.67457580566406
                    },
                    {
                        unitID: 1362,
                        name: "Läkargruppen Victoria",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "118 72",
                        lng: 18.07111167907715,
                        lat: 59.314640045166016
                    },
                    {
                        unitID: 1223,
                        name: "Läkarhuset Ellenbogen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "211 36",
                        lng: 13.005566596984863,
                        lat: 55.60484313964844
                    },
                    {
                        unitID: 1634,
                        name: "Läkarhuset Huskvarna",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "561 31",
                        lng: 14.279108047485352,
                        lat: 57.78852844238281
                    },
                    {
                        unitID: 1588,
                        name: "Läkarhuset i Karlshamn",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "374 36",
                        lng: 14.864171981811523,
                        lat: 56.171173095703125
                    },
                    {
                        unitID: 1295,
                        name: "Läkarhuset Jönköping",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "553 23",
                        lng: 14.185511589050293,
                        lat: 57.778011322021484
                    },
                    {
                        unitID: 1226,
                        name: "Läkarhuset Kronan",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "392 33",
                        lng: 16.349735260009766,
                        lat: 56.66511917114258
                    },
                    {
                        unitID: 1636,
                        name: "Läkarhuset Ljungby",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "341 35",
                        lng: 13.932818412780762,
                        lat: 56.83400344848633
                    },
                    {
                        unitID: 1327,
                        name: "Läkarhuset Prima",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "393 55",
                        lng: 15.91093921661377,
                        lat: 56.74404525756836
                    },
                    {
                        unitID: 1330,
                        name: "Läkarhuset Roslunda",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "262 62",
                        lng: 12.87906265258789,
                        lat: 56.25542068481445
                    },
                    {
                        unitID: 1633,
                        name: "Läkarhuset Tranås",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "573 31",
                        lng: 14.97319221496582,
                        lat: 58.03115463256836
                    },
                    {
                        unitID: 1284,
                        name: "Läkarhuset Väster",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "553 16",
                        lng: 14.163254737854004,
                        lat: 57.78208541870117
                    },
                    {
                        unitID: 472,
                        name: "Läkarmottagningen Bjärnum",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "280 20",
                        lng: 13.715675354003906,
                        lat: 56.291778564453125
                    },
                    {
                        unitID: 1289,
                        name: "Läkarmottagningen GrevTure",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 38",
                        lng: 18.079660415649414,
                        lat: 59.340335845947266
                    },
                    {
                        unitID: 1350,
                        name: "Läkarmottagningen Sparta",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "223 63",
                        lng: 13.217308044433594,
                        lat: 55.70996856689453
                    },
                    {
                        unitID: 1038,
                        name: "Läkarpraktiken",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "656 72",
                        lng: 13.674877166748047,
                        lat: 59.413204193115234
                    },
                    {
                        unitID: 1503,
                        name: "Läkehjälpen Olofström AB",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "293 34",
                        lng: 14.529587745666504,
                        lat: 56.27731704711914
                    },
                    {
                        unitID: 1079,
                        name: "Länna Vårdcentral",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "740 11",
                        lng: 17.961217880249023,
                        lat: 59.87484359741211
                    },
                    {
                        unitID: 191,
                        name: "Länssjukhuset Halmstad",
                        countyCode: 13,
                        typeID: 2,
                        postalCode: "301 85",
                        lng: 12.848068237304688,
                        lat: 56.68110275268555
                    },
                    {
                        unitID: 108,
                        name: "Länssjukhuset Kalmar",
                        countyCode: 8,
                        typeID: 2,
                        postalCode: "391 85",
                        lng: 16.33063316345215,
                        lat: 56.65781784057617
                    },
                    {
                        unitID: 78,
                        name: "Länssjukhuset Ryhov",
                        countyCode: 6,
                        typeID: 2,
                        postalCode: "551 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1065,
                        name: "Löttorps HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "380 74",
                        lng: 16.98853874206543,
                        lat: 57.165775299072266
                    },
                    {
                        unitID: 1694,
                        name: "Lövånger HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "930 10",
                        lng: 21.31129264831543,
                        lat: 64.36907958984375
                    },
                    {
                        unitID: 614,
                        name: "Malmens Hälsocentral",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "981 28",
                        lng: 20.23822593688965,
                        lat: 67.84999084472656
                    },
                    {
                        unitID: 444,
                        name: "Malmköpings VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "640 32",
                        lng: 16.733766555786133,
                        lat: 59.13435745239258
                    },
                    {
                        unitID: 671,
                        name: "Malå Sjukstuga",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "930 70",
                        lng: 18.926645278930664,
                        lat: 65.18844604492188
                    },
                    {
                        unitID: 451,
                        name: "Mantorps VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "590 18",
                        lng: 15.287259101867676,
                        lat: 58.349578857421875
                    },
                    {
                        unitID: 1059,
                        name: "Maria Alberts Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "461 32",
                        lng: 12.291935920715332,
                        lat: 58.283416748046875
                    },
                    {
                        unitID: 931,
                        name: "Mariannelunds VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "570 30",
                        lng: 15.568344116210938,
                        lat: 57.53513717651367
                    },
                    {
                        unitID: 452,
                        name: "Mariebergs VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "591 72",
                        lng: 14.999241828918457,
                        lat: 58.53977966308594
                    },
                    {
                        unitID: 407,
                        name: "Mariefreds VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "647 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 597,
                        name: "Mariehems VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "906 51",
                        lng: 20.328018188476562,
                        lat: 63.838623046875
                    },
                    {
                        unitID: 253,
                        name: "Medicin Falun",
                        countyCode: 20,
                        typeID: 2,
                        postalCode: "791 82",
                        lng: 15.642143249511719,
                        lat: 60.60906982421875
                    },
                    {
                        unitID: 254,
                        name: "Medicin Mora",
                        countyCode: 20,
                        typeID: 2,
                        postalCode: "792 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1479,
                        name: "Medicindirekt AB",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "831 40",
                        lng: 14.651172637939453,
                        lat: 63.17649459838867
                    },
                    {
                        unitID: 641,
                        name: "Medicin-Geriatrik Avesta",
                        countyCode: 20,
                        typeID: 2,
                        postalCode: "774 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1596,
                        name: "Medicinkonsulten AB Hälsocentral",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "921 31",
                        lng: 18.67453384399414,
                        lat: 64.59246063232422
                    },
                    {
                        unitID: 639,
                        name: "Medicinmottagningen Ludvika",
                        countyCode: 20,
                        typeID: 2,
                        postalCode: "771 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1236,
                        name: "Medicinmottagningen Sophiahemmet",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 86",
                        lng: 18.07547950744629,
                        lat: 59.345375061035156
                    },
                    {
                        unitID: 1000,
                        name: "Medpro Clinic Brålanda Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "464 61",
                        lng: 12.359559059143066,
                        lat: 58.56132888793945
                    },
                    {
                        unitID: 871,
                        name: "Medpro Clinic Brålanda-Torpa Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "462 36",
                        lng: 12.333396911621094,
                        lat: 58.3675651550293
                    },
                    {
                        unitID: 879,
                        name: "Medpro Clinic Lilla Edet Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "463 30",
                        lng: 12.125114440917969,
                        lat: 58.13452911376953
                    },
                    {
                        unitID: 1743,
                        name: "Medpro Clinic Noltorp Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "441 52",
                        lng: 12.5193510055542,
                        lat: 57.93871307373047
                    },
                    {
                        unitID: 983,
                        name: "Medpro Clinic Stavre Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "461 40",
                        lng: 12.319623947143555,
                        lat: 58.28810119628906
                    },
                    {
                        unitID: 793,
                        name: "Mikaeli VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "703 59",
                        lng: 15.198677062988281,
                        lat: 59.28841781616211
                    },
                    {
                        unitID: 1715,
                        name: "Min Hälsa Hälsocentral",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "913 32",
                        lng: 20.36842918395996,
                        lat: 63.705596923828125
                    },
                    {
                        unitID: 718,
                        name: "Mitt Hjärta i Bergslagen AB",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "737 42",
                        lng: 15.809326171875,
                        lat: 59.99637985229492
                    },
                    {
                        unitID: 858,
                        name: "Mjölkuddens HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "973 41",
                        lng: 22.129789352416992,
                        lat: 65.6011962890625
                    },
                    {
                        unitID: 475,
                        name: "Molkom VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "660 60",
                        lng: 13.726702690124512,
                        lat: 59.598976135253906
                    },
                    {
                        unitID: 666,
                        name: "Mottagning Britsarvet",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "791 35",
                        lng: 15.622740745544434,
                        lat: 60.6208381652832
                    },
                    {
                        unitID: 663,
                        name: "Mottagning Grycksbo",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "790 20",
                        lng: 15.493908882141113,
                        lat: 60.68636703491211
                    },
                    {
                        unitID: 653,
                        name: "Mottagning Svärdsjö",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "790 23",
                        lng: 15.908467292785645,
                        lat: 60.741554260253906
                    },
                    {
                        unitID: 957,
                        name: "Mottagningen Sjöstaden",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "116 41",
                        lng: 18.096097946166992,
                        lat: 59.31057357788086
                    },
                    {
                        unitID: 721,
                        name: "Mullsjö VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "565 31",
                        lng: 13.883502006530762,
                        lat: 57.915653228759766
                    },
                    {
                        unitID: 1660,
                        name: "MultiClinic Skåne",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "215 74",
                        lng: 13.013602256774902,
                        lat: 55.55927276611328
                    },
                    {
                        unitID: 6,
                        name: "Munsö Husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "178 91",
                        lng: 17.580060958862305,
                        lat: 59.38399887084961
                    },
                    {
                        unitID: 286,
                        name: "Mälarsjukhuset Eskilstuna",
                        countyCode: 4,
                        typeID: 2,
                        postalCode: "631 88",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1411,
                        name: "Märsta Läkarhus AB",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "196 47",
                        lng: 17.857637405395508,
                        lat: 59.6259651184082
                    },
                    {
                        unitID: 682,
                        name: "Märsta Närvård",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "195 47",
                        lng: 17.858158111572266,
                        lat: 59.62600326538086
                    },
                    {
                        unitID: 101,
                        name: "Mönsterås HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "383 21",
                        lng: 16.436708450317383,
                        lat: 57.03544998168945
                    },
                    {
                        unitID: 1304,
                        name: "Mörby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "182 11",
                        lng: 18.036640167236328,
                        lat: 59.397865295410156
                    },
                    {
                        unitID: 99,
                        name: "Mörbylånga HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "386 30",
                        lng: 16.396169662475586,
                        lat: 56.522220611572266
                    },
                    {
                        unitID: 103,
                        name: "Mörlunda HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "570 84",
                        lng: 15.863935470581055,
                        lat: 57.31718444824219
                    },
                    {
                        unitID: 1404,
                        name: "Navets VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "432 40",
                        lng: 12.255263328552246,
                        lat: 57.1170654296875
                    },
                    {
                        unitID: 1278,
                        name: "Neptunuskliniken",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "432 44",
                        lng: 12.243895530700684,
                        lat: 57.10774612426758
                    },
                    {
                        unitID: 991,
                        name: "Njurunda VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "862 31",
                        lng: 17.378664016723633,
                        lat: 62.29689025878906
                    },
                    {
                        unitID: 1719,
                        name: "Nockebyhöjdens Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "168 40",
                        lng: 17.913368225097656,
                        lat: 59.33071517944336
                    },
                    {
                        unitID: 1028,
                        name: "Nora VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "713 31",
                        lng: 15.031388282775879,
                        lat: 59.52131271362305
                    },
                    {
                        unitID: 696,
                        name: "Norbergs Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "738 30",
                        lng: 15.928274154663086,
                        lat: 60.060020446777344
                    },
                    {
                        unitID: 485,
                        name: "Nordmalings HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "914 32",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 595,
                        name: "Norra Älvsborgs Länssjukhus",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "461 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1567,
                        name: "Norra Ölands Läkarmottagning",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "387 72",
                        lng: 16.98853874206543,
                        lat: 57.165775299072266
                    },
                    {
                        unitID: 693,
                        name: "Norrahammars VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "556 32",
                        lng: 14.166842460632324,
                        lat: 57.704864501953125
                    },
                    {
                        unitID: 1228,
                        name: "Norrfjärdens Hälsocentral",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "94532",
                        lng: 21.505842208862305,
                        lat: 65.41838073730469
                    },
                    {
                        unitID: 324,
                        name: "Norrlands universitetssjukhus",
                        countyCode: 24,
                        typeID: 2,
                        postalCode: "901 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1544,
                        name: "Norrlandskliniken",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "907 40",
                        lng: 20.321226119995117,
                        lat: 63.80424499511719
                    },
                    {
                        unitID: 92,
                        name: "Norrlidens HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "393 58",
                        lng: 16.35392189025879,
                        lat: 56.7064094543457
                    },
                    {
                        unitID: 1075,
                        name: "Norrtälje Norra Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "761 29",
                        lng: 18.69185447692871,
                        lat: 59.758766174316406
                    },
                    {
                        unitID: 22,
                        name: "Norrtälje sjukhus TioHundra",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "761 29",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1285,
                        name: "Norrtälje Södra husläkarmot Tiohundra",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "761 46",
                        lng: 18.675201416015625,
                        lat: 59.752044677734375
                    },
                    {
                        unitID: 1410,
                        name: "Norrvikens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "192 06",
                        lng: 17.92154884338379,
                        lat: 59.460205078125
                    },
                    {
                        unitID: 1118,
                        name: "Norsjö Vårdcentral",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "935 32",
                        lng: 19.492286682128906,
                        lat: 64.90894317626953
                    },
                    {
                        unitID: 660,
                        name: "Norslund Vårdcentral",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "791 42",
                        lng: 15.668136596679688,
                        lat: 60.5975227355957
                    },
                    {
                        unitID: 806,
                        name: "NOVA-kliniken Borrby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "276 30",
                        lng: 14.180334091186523,
                        lat: 55.45897674560547
                    },
                    {
                        unitID: 509,
                        name: "NovaKliniken Gärsnäs",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "272 61",
                        lng: 14.176300048828125,
                        lat: 55.551143646240234
                    },
                    {
                        unitID: 1494,
                        name: "Novakliniken Missuna",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "271 52",
                        lng: 13.797388076782227,
                        lat: 55.43159103393555
                    },
                    {
                        unitID: 848,
                        name: "NOVAkliniken Rydsgård",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "274 60",
                        lng: 13.589454650878906,
                        lat: 55.4737663269043
                    },
                    {
                        unitID: 1496,
                        name: "Novakliniken Simrishamn",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "272 31",
                        lng: 14.350686073303223,
                        lat: 55.558387756347656
                    },
                    {
                        unitID: 1405,
                        name: "Novakliniken Sjöbo",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "275 30",
                        lng: 13.706419944763184,
                        lat: 55.632728576660156
                    },
                    {
                        unitID: 1380,
                        name: "NovaKliniken Tomelilla",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "273 34",
                        lng: 13.945304870605469,
                        lat: 55.54692077636719
                    },
                    {
                        unitID: 1426,
                        name: "Novakliniken Veberöd",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "247 62",
                        lng: 13.490216255187988,
                        lat: 55.63656997680664
                    },
                    {
                        unitID: 943,
                        name: "NovaKlinikens Läkargrupp AB Ystad",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "271 39",
                        lng: 13.818390846252441,
                        lat: 55.42669677734375
                    },
                    {
                        unitID: 1398,
                        name: "Nya Järva Vårdmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "163 64",
                        lng: 17.901731491088867,
                        lat: 59.394615173339844
                    },
                    {
                        unitID: 1577,
                        name: "Nya Närvården AB",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 80",
                        lng: 16.2078800201416,
                        lat: 64.1143798828125
                    },
                    {
                        unitID: 1697,
                        name: "Nya Närvården NNV AB",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "833 31",
                        lng: 15.549509048461914,
                        lat: 63.85458755493164
                    },
                    {
                        unitID: 1447,
                        name: "Nya Vårdcentralen Kortedala Torg",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "415 10",
                        lng: 12.032389640808105,
                        lat: 57.75151443481445
                    },
                    {
                        unitID: 97,
                        name: "Nybro HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "382 30",
                        lng: 15.911330223083496,
                        lat: 56.74365234375
                    },
                    {
                        unitID: 35,
                        name: "Nyby VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "754 27",
                        lng: 17.64693260192871,
                        lat: 59.877708435058594
                    },
                    {
                        unitID: 1248,
                        name: "Nyhems VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "312 49",
                        lng: 12.879382133483887,
                        lat: 56.666534423828125
                    },
                    {
                        unitID: 64,
                        name: "Nyköpings lasarett",
                        countyCode: 4,
                        typeID: 2,
                        postalCode: "611 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1379,
                        name: "Nynäsakuten",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "149 30",
                        lng: 17.947315216064453,
                        lat: 58.9049186706543
                    },
                    {
                        unitID: 439,
                        name: "Nynäshamns Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "149 25",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1165,
                        name: "Nynäsvård AB Diabetesmott",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "14925",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 197,
                        name: "Närhälsan Angered vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "424 65",
                        lng: 12.0479736328125,
                        lat: 57.797119140625
                    },
                    {
                        unitID: 205,
                        name: "Närhälsan Askim vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "436 43",
                        lng: 11.952286720275879,
                        lat: 57.639278411865234
                    },
                    {
                        unitID: 1112,
                        name: "Närhälsan Backa vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "422 55",
                        lng: 11.986740112304688,
                        lat: 57.74745559692383
                    },
                    {
                        unitID: 308,
                        name: "Närhälsan Bengtsfors vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "666 30",
                        lng: 12.226112365722656,
                        lat: 59.02872848510742
                    },
                    {
                        unitID: 748,
                        name: "Närhälsan Billingen vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "541 40",
                        lng: 13.84032154083252,
                        lat: 58.399993896484375
                    },
                    {
                        unitID: 919,
                        name: "Närhälsan Biskopsgården vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "418 33",
                        lng: 11.893887519836426,
                        lat: 57.71354675292969
                    },
                    {
                        unitID: 201,
                        name: "Närhälsan Bjurslätt vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "417 26",
                        lng: 11.92624282836914,
                        lat: 57.72944641113281
                    },
                    {
                        unitID: 1039,
                        name: "Närhälsan Björkekärr vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "416 80",
                        lng: 12.047195434570312,
                        lat: 57.715484619140625
                    },
                    {
                        unitID: 766,
                        name: "Närhälsan Boda vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "507 42",
                        lng: 12.989126205444336,
                        lat: 57.72941589355469
                    },
                    {
                        unitID: 622,
                        name: "Närhälsan Bollebygd vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "517 36",
                        lng: 12.57199764251709,
                        lat: 57.669593811035156
                    },
                    {
                        unitID: 1654,
                        name: "Närhälsan Brastad vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "454 31",
                        lng: 11.486456871032715,
                        lat: 58.38157653808594
                    },
                    {
                        unitID: 199,
                        name: "Närhälsan Brämaregården vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "417 02",
                        lng: 11.940017700195312,
                        lat: 57.72049331665039
                    },
                    {
                        unitID: 434,
                        name: "Närhälsan Bäckefors vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "668 88",
                        lng: 12.160720825195312,
                        lat: 58.79796600341797
                    },
                    {
                        unitID: 1154,
                        name: "Närhälsan Dagson vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "451 40",
                        lng: 11.933470726013184,
                        lat: 58.348297119140625
                    },
                    {
                        unitID: 888,
                        name: "Närhälsan Dalaberg vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "451 72",
                        lng: 11.934128761291504,
                        lat: 58.3714599609375
                    },
                    {
                        unitID: 306,
                        name: "Närhälsan Dals-Ed vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "668 30",
                        lng: 11.931008338928223,
                        lat: 58.91264724731445
                    },
                    {
                        unitID: 667,
                        name: "Närhälsan Dalsjöfors vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "516 34",
                        lng: 13.096168518066406,
                        lat: 57.7138786315918
                    },
                    {
                        unitID: 527,
                        name: "Närhälsan Dalum vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "520 25",
                        lng: 13.4650239944458,
                        lat: 57.89712142944336
                    },
                    {
                        unitID: 1043,
                        name: "Närhälsan Ekmanska vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "412 74",
                        lng: 12.009477615356445,
                        lat: 57.70073318481445
                    },
                    {
                        unitID: 1563,
                        name: "Närhälsan Eriksberg vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "417 64",
                        lng: 11.915141105651855,
                        lat: 57.70143127441406
                    },
                    {
                        unitID: 587,
                        name: "Närhälsan Fjällbacka vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "457 40",
                        lng: 11.291423797607422,
                        lat: 58.596946716308594
                    },
                    {
                        unitID: 734,
                        name: "Närhälsan Floby vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "521 51",
                        lng: 13.337356567382812,
                        lat: 58.13587188720703
                    },
                    {
                        unitID: 311,
                        name: "Närhälsan Floda vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "448 30",
                        lng: 12.361083030700684,
                        lat: 57.808082580566406
                    },
                    {
                        unitID: 808,
                        name: "Närhälsan Fristad vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "513 33",
                        lng: 13.014854431152344,
                        lat: 57.82805633544922
                    },
                    {
                        unitID: 291,
                        name: "Närhälsan Fritsla vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "511 72",
                        lng: 12.77043342590332,
                        lat: 57.5601806640625
                    },
                    {
                        unitID: 206,
                        name: "Närhälsan Frölunda vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "421 44",
                        lng: 11.910853385925293,
                        lat: 57.650726318359375
                    },
                    {
                        unitID: 1403,
                        name: "Närhälsan Furulund vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "433 47",
                        lng: 12.129125595092773,
                        lat: 57.724464416503906
                    },
                    {
                        unitID: 304,
                        name: "Närhälsan Färgelanda vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "458 32",
                        lng: 11.988027572631836,
                        lat: 58.559791564941406
                    },
                    {
                        unitID: 196,
                        name: "Närhälsan Gamlestadstorget vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "415 02",
                        lng: 12.00660228729248,
                        lat: 57.726871490478516
                    },
                    {
                        unitID: 194,
                        name: "Närhälsan Gibraltargatan vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "411 32",
                        lng: 11.977675437927246,
                        lat: 57.69190216064453
                    },
                    {
                        unitID: 227,
                        name: "Närhälsan Gråbo vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "443 42",
                        lng: 12.299116134643555,
                        lat: 57.83370590209961
                    },
                    {
                        unitID: 742,
                        name: "Närhälsan Guldvingen vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "531 85",
                        lng: 13.166535377502441,
                        lat: 58.49404525756836
                    },
                    {
                        unitID: 736,
                        name: "Närhälsan Gullspång vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "547 25",
                        lng: 14.087201118469238,
                        lat: 58.98015213012695
                    },
                    {
                        unitID: 737,
                        name: "Närhälsan Götene vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "533 22",
                        lng: 13.49465560913086,
                        lat: 58.52779006958008
                    },
                    {
                        unitID: 598,
                        name: "Närhälsan Heimdal vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "503 34",
                        lng: 12.941818237304688,
                        lat: 57.72284698486328
                    },
                    {
                        unitID: 749,
                        name: "Närhälsan Hentorp vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "541 54",
                        lng: 13.82843017578125,
                        lat: 58.370113372802734
                    },
                    {
                        unitID: 611,
                        name: "Närhälsan Herrestad vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "451 75",
                        lng: 11.844964027404785,
                        lat: 58.3503303527832
                    },
                    {
                        unitID: 313,
                        name: "Närhälsan Herrljunga vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "524 23",
                        lng: 13.01475715637207,
                        lat: 58.07601547241211
                    },
                    {
                        unitID: 213,
                        name: "Närhälsan Hindås vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "430 63",
                        lng: 12.448410034179688,
                        lat: 57.703857421875
                    },
                    {
                        unitID: 738,
                        name: "Närhälsan Hjo vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "544 33",
                        lng: 14.30050277709961,
                        lat: 58.31001663208008
                    },
                    {
                        unitID: 803,
                        name: "Närhälsan Hjällbo vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "424 32",
                        lng: 12.019113540649414,
                        lat: 57.76865005493164
                    },
                    {
                        unitID: 344,
                        name: "Närhälsan Horred vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "519 30",
                        lng: 12.474855422973633,
                        lat: 57.35576629638672
                    },
                    {
                        unitID: 207,
                        name: "Närhälsan Högsbo vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "414 80",
                        lng: 11.928196907043457,
                        lat: 57.669944763183594
                    },
                    {
                        unitID: 740,
                        name: "Närhälsan Karlsborg vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "546 30",
                        lng: 14.5159273147583,
                        lat: 58.53004455566406
                    },
                    {
                        unitID: 683,
                        name: "Närhälsan Kinna vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "511 23",
                        lng: 12.7116060256958,
                        lat: 57.511348724365234
                    },
                    {
                        unitID: 209,
                        name: "Närhälsan Krokslätt vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "431 02",
                        lng: 12.008057594299316,
                        lat: 57.67375564575195
                    },
                    {
                        unitID: 679,
                        name: "Närhälsan Kungshamn vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "456 32",
                        lng: 11.255816459655762,
                        lat: 58.360591888427734
                    },
                    {
                        unitID: 1183,
                        name: "Närhälsan Kungshöjd vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "411 18",
                        lng: 11.961328506469727,
                        lat: 57.70281982421875
                    },
                    {
                        unitID: 203,
                        name: "Närhälsan Kungssten vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "414 74",
                        lng: 11.908218383789062,
                        lat: 57.68229293823242
                    },
                    {
                        unitID: 202,
                        name: "Närhälsan Kyrkbyn vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "418 73",
                        lng: 11.907379150390625,
                        lat: 57.70928192138672
                    },
                    {
                        unitID: 346,
                        name: "Närhälsan Källstorp vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "461 59",
                        lng: 12.283109664916992,
                        lat: 58.29377746582031
                    },
                    {
                        unitID: 198,
                        name: "Närhälsan Kärra vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "425 31",
                        lng: 11.995800971984863,
                        lat: 57.79386901855469
                    },
                    {
                        unitID: 212,
                        name: "Närhälsan Landvetter vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "438 32",
                        lng: 12.211113929748535,
                        lat: 57.686866760253906
                    },
                    {
                        unitID: 226,
                        name: "Närhälsan Lerum vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "443 30",
                        lng: 12.265754699707031,
                        lat: 57.76853942871094
                    },
                    {
                        unitID: 210,
                        name: "Närhälsan Lindome vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "437 22",
                        lng: 12.08802604675293,
                        lat: 57.57627868652344
                    },
                    {
                        unitID: 784,
                        name: "Närhälsan Ljungskile vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "459 31",
                        lng: 11.921686172485352,
                        lat: 58.22466278076172
                    },
                    {
                        unitID: 1119,
                        name: "Närhälsan Lysekil vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "453 34",
                        lng: 11.439553260803223,
                        lat: 58.28010940551758
                    },
                    {
                        unitID: 1208,
                        name: "Närhälsan Lövgärdet vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "424 45",
                        lng: 12.040498733520508,
                        lat: 57.81568908691406
                    },
                    {
                        unitID: 1055,
                        name: "Närhälsan Majorna vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "414 58",
                        lng: 11.923368453979492,
                        lat: 57.69734573364258
                    },
                    {
                        unitID: 744,
                        name: "Närhälsan Mariestad vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "542 24",
                        lng: 13.795835494995117,
                        lat: 58.70511245727539
                    },
                    {
                        unitID: 1040,
                        name: "Närhälsan Masthugget vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "413 27",
                        lng: 11.943924903869629,
                        lat: 57.698036193847656
                    },
                    {
                        unitID: 305,
                        name: "Närhälsan Mellerud vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "464 30",
                        lng: 12.453802108764648,
                        lat: 58.70001983642578
                    },
                    {
                        unitID: 591,
                        name: "Närhälsan Munkedal vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "455 30",
                        lng: 11.66911792755127,
                        lat: 58.467620849609375
                    },
                    {
                        unitID: 1233,
                        name: "Närhälsan Mölnlycke vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "435 30",
                        lng: 12.11345386505127,
                        lat: 57.65822982788086
                    },
                    {
                        unitID: 733,
                        name: "Närhälsan Mösseberg vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "521 85",
                        lng: 13.551918983459473,
                        lat: 58.18771743774414
                    },
                    {
                        unitID: 830,
                        name: "Närhälsan Nordmanna vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "442 37",
                        lng: 11.957736015319824,
                        lat: 57.86878204345703
                    },
                    {
                        unitID: 750,
                        name: "Närhälsan Norrmalm vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "541 41",
                        lng: 13.840304374694824,
                        lat: 58.399993896484375
                    },
                    {
                        unitID: 745,
                        name: "Närhälsan Nossebro vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "46531",
                        lng: 12.726758003234863,
                        lat: 58.19110870361328
                    },
                    {
                        unitID: 732,
                        name: "Närhälsan Oden vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "521 85",
                        lng: 13.55255126953125,
                        lat: 58.16403579711914
                    },
                    {
                        unitID: 300,
                        name: "Närhälsan Olskroken vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "416 65",
                        lng: 11.997282028198242,
                        lat: 57.71455001831055
                    },
                    {
                        unitID: 301,
                        name: "Närhälsan Olskroken vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "416 65",
                        lng: 11.997282028198242,
                        lat: 57.71455001831055
                    },
                    {
                        unitID: 1311,
                        name: "Närhälsan Opaltorget vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "421 61",
                        lng: 11.899553298950195,
                        lat: 57.6423225402832
                    },
                    {
                        unitID: 1116,
                        name: "Närhälsan Partille vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "433 23",
                        lng: 12.10506534576416,
                        lat: 57.7391471862793
                    },
                    {
                        unitID: 559,
                        name: "Närhälsan Sandared vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "518 32",
                        lng: 12.798863410949707,
                        lat: 57.709449768066406
                    },
                    {
                        unitID: 516,
                        name: "Närhälsan Sjöbo vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "506 42",
                        lng: 12.944342613220215,
                        lat: 57.749755859375
                    },
                    {
                        unitID: 747,
                        name: "Närhälsan Skara vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "53232",
                        lng: 13.428064346313477,
                        lat: 58.39131546020508
                    },
                    {
                        unitID: 290,
                        name: "Närhälsan Skene vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "511 81",
                        lng: 12.64836311340332,
                        lat: 57.49188232421875
                    },
                    {
                        unitID: 681,
                        name: "Närhälsan Skogslyckan vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "451 60",
                        lng: 11.913302421569824,
                        lat: 58.36036682128906
                    },
                    {
                        unitID: 1005,
                        name: "Närhälsan Slottsskogen vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "413 11",
                        lng: 11.947900772094727,
                        lat: 57.69065475463867
                    },
                    {
                        unitID: 1156,
                        name: "Närhälsan Solgärde vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "442 40",
                        lng: 11.95028305053711,
                        lat: 57.88860321044922
                    },
                    {
                        unitID: 231,
                        name: "Närhälsan Sollebrunn vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "466 30",
                        lng: 12.530482292175293,
                        lat: 58.12007141113281
                    },
                    {
                        unitID: 404,
                        name: "Närhälsan Stenstorp vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "520 50",
                        lng: 13.717399597167969,
                        lat: 58.273719787597656
                    },
                    {
                        unitID: 688,
                        name: "Närhälsan Stenungsund vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "444 30",
                        lng: 11.819000244140625,
                        lat: 58.068870544433594
                    },
                    {
                        unitID: 1508,
                        name: "Närhälsan Stora Höga vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "444 60",
                        lng: 11.831820487976074,
                        lat: 58.016754150390625
                    },
                    {
                        unitID: 1085,
                        name: "Närhälsan Strömstad vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "452 83",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 487,
                        name: "Närhälsan Styrsö vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "430 84",
                        lng: 11.791769027709961,
                        lat: 57.616615295410156
                    },
                    {
                        unitID: 684,
                        name: "Närhälsan Svenljunga vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "512 54",
                        lng: 13.11658763885498,
                        lat: 57.49409866333008
                    },
                    {
                        unitID: 1001,
                        name: "Närhälsan Sylte vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "461 67",
                        lng: 12.277792930603027,
                        lat: 58.25463104248047
                    },
                    {
                        unitID: 289,
                        name: "Närhälsan Sätila vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "510 21",
                        lng: 12.433501243591309,
                        lat: 57.544490814208984
                    },
                    {
                        unitID: 751,
                        name: "Närhälsan Södra Ryd vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "541 64",
                        lng: 13.872583389282227,
                        lat: 58.425628662109375
                    },
                    {
                        unitID: 571,
                        name: "Närhälsan Södra Torget vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "503 36",
                        lng: 12.94216251373291,
                        lat: 57.71805953979492
                    },
                    {
                        unitID: 228,
                        name: "Närhälsan Sörhaga vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "441 83",
                        lng: 12.519269943237305,
                        lat: 57.92906951904297
                    },
                    {
                        unitID: 588,
                        name: "Närhälsan Tanumshede vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "457 30",
                        lng: 11.321784019470215,
                        lat: 58.72406005859375
                    },
                    {
                        unitID: 753,
                        name: "Närhälsan Tibro vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "543 81",
                        lng: 14.164658546447754,
                        lat: 58.42518615722656
                    },
                    {
                        unitID: 754,
                        name: "Närhälsan Tidaholm vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "522 26",
                        lng: 13.95616340637207,
                        lat: 58.17816162109375
                    },
                    {
                        unitID: 755,
                        name: "Närhälsan Tidan vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "549 31",
                        lng: 14.006912231445312,
                        lat: 58.574153900146484
                    },
                    {
                        unitID: 1124,
                        name: "Närhälsan Tjörn vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "471 94",
                        lng: 11.65769100189209,
                        lat: 58.02590560913086
                    },
                    {
                        unitID: 1399,
                        name: "Närhälsan Torpavallen vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "416 73",
                        lng: 12.033764839172363,
                        lat: 57.72398376464844
                    },
                    {
                        unitID: 200,
                        name: "Närhälsan Torslanda vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "423 34",
                        lng: 11.774113655090332,
                        lat: 57.71908950805664
                    },
                    {
                        unitID: 522,
                        name: "Närhälsan Trandared vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "504 50",
                        lng: 12.95257568359375,
                        lat: 57.708194732666016
                    },
                    {
                        unitID: 905,
                        name: "Närhälsan Tranemo vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "514 34",
                        lng: 13.34659194946289,
                        lat: 57.48063278198242
                    },
                    {
                        unitID: 1041,
                        name: "Närhälsan Tuve vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "417 45",
                        lng: 11.92684268951416,
                        lat: 57.75519561767578
                    },
                    {
                        unitID: 756,
                        name: "Närhälsan Töreboda vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "545 21",
                        lng: 14.121938705444336,
                        lat: 58.706729888916016
                    },
                    {
                        unitID: 668,
                        name: "Närhälsan Ulricehamn vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "523 30",
                        lng: 13.416478157043457,
                        lat: 57.79385757446289
                    },
                    {
                        unitID: 757,
                        name: "Närhälsan Vara vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "534 23",
                        lng: 12.965438842773438,
                        lat: 58.264278411865234
                    },
                    {
                        unitID: 403,
                        name: "Närhälsan Vargön vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "468 30",
                        lng: 12.38919734954834,
                        lat: 58.35641860961914
                    },
                    {
                        unitID: 621,
                        name: "Närhälsan Viskafors vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "515 34",
                        lng: 12.865262031555176,
                        lat: 57.6308479309082
                    },
                    {
                        unitID: 312,
                        name: "Närhälsan Vårgårda vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "447 31",
                        lng: 12.810120582580566,
                        lat: 58.034217834472656
                    },
                    {
                        unitID: 805,
                        name: "Närhälsan Vänerparken vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "462 35",
                        lng: 12.320769309997559,
                        lat: 58.374752044677734
                    },
                    {
                        unitID: 364,
                        name: "Närhälsan Åby vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "431 61",
                        lng: 12.016641616821289,
                        lat: 57.64811325073242
                    },
                    {
                        unitID: 743,
                        name: "Närhälsan Ågårdsskogen vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "531 85",
                        lng: 13.136208534240723,
                        lat: 58.49216842651367
                    },
                    {
                        unitID: 309,
                        name: "Närhälsan Åmål vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "662 30",
                        lng: 12.70523738861084,
                        lat: 59.049407958984375
                    },
                    {
                        unitID: 770,
                        name: "Närhälsan Älvängen vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "446 37",
                        lng: 12.154170989990234,
                        lat: 57.9669189453125
                    },
                    {
                        unitID: 230,
                        name: "Närhälsan Ängabo vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "441 50",
                        lng: 12.56800365447998,
                        lat: 57.918121337890625
                    },
                    {
                        unitID: 1135,
                        name: "Närhälsan Öckerö vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "475 31",
                        lng: 11.658461570739746,
                        lat: 57.710113525390625
                    },
                    {
                        unitID: 965,
                        name: "Näsets läkargrupp HB",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "236 51",
                        lng: 12.95176887512207,
                        lat: 55.41831588745117
                    },
                    {
                        unitID: 1297,
                        name: "Näsets Läkargrupp i Skanör",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "239 33",
                        lng: 12.845290184020996,
                        lat: 55.41154098510742
                    },
                    {
                        unitID: 1604,
                        name: "Nässjö Läkarhus",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "571 33",
                        lng: 14.691922187805176,
                        lat: 57.6595344543457
                    },
                    {
                        unitID: 761,
                        name: "Nässjö vårdcentral Bra liv",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "571 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 895,
                        name: "Nättraby VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "370 24",
                        lng: 15.5365571975708,
                        lat: 56.20188903808594
                    },
                    {
                        unitID: 385,
                        name: "Nödinge Vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "449 30",
                        lng: 12.049384117126465,
                        lat: 57.89026641845703
                    },
                    {
                        unitID: 1465,
                        name: "Nötkärnan Bergsjön Vårdcentral och BVC",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "415 19",
                        lng: 12.071165084838867,
                        lat: 57.7559700012207
                    },
                    {
                        unitID: 1464,
                        name: "Nötkärnan Friskväderstorget Vårdcentral och BVC",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "418 38",
                        lng: 11.892411231994629,
                        lat: 57.72488021850586
                    },
                    {
                        unitID: 1471,
                        name: "Nötkärnan Hovås Askim Familjeläkare och BVC",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "436 43",
                        lng: 11.936867713928223,
                        lat: 57.63346862792969
                    },
                    {
                        unitID: 1470,
                        name: "Nötkärnan Kortedala Vårdcentral och BVC",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "415 13",
                        lng: 12.041043281555176,
                        lat: 57.76204299926758
                    },
                    {
                        unitID: 1429,
                        name: "Nötkärnan Kållered Familjeläkare och BVC",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "428 21",
                        lng: 12.04877758026123,
                        lat: 57.61082077026367
                    },
                    {
                        unitID: 1432,
                        name: "Nötkärnan Masthugget Familjeläkare och BVC",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "413 27",
                        lng: 11.940533638000488,
                        lat: 57.69866943359375
                    },
                    {
                        unitID: 1467,
                        name: "Nötkärnan Sävelången Familjeläkare och BVC",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "441 65",
                        lng: 12.457011222839355,
                        lat: 57.846981048583984
                    },
                    {
                        unitID: 529,
                        name: "Oasen Allmänmedicin",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "162 68",
                        lng: 17.871707916259766,
                        lat: 59.36406326293945
                    },
                    {
                        unitID: 1360,
                        name: "Ockelbo familjeläkarmottagning",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "816 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 531,
                        name: "Ockelbo HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "816 30",
                        lng: 16.713682174682617,
                        lat: 60.88883972167969
                    },
                    {
                        unitID: 1044,
                        name: "Odensbackens VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "715 31",
                        lng: 15.526236534118652,
                        lat: 59.15892791748047
                    },
                    {
                        unitID: 1254,
                        name: "Odensvi Familjeläkarmottagning",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "723 42",
                        lng: 16.59372901916504,
                        lat: 59.62314987182617
                    },
                    {
                        unitID: 1128,
                        name: "Okända medicinkliniker",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "",
                        lng: 18.64350128173828,
                        lat: 60.1281623840332
                    },
                    {
                        unitID: 1127,
                        name: "Okända vårdcentraler",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "",
                        lng: 18.64350128173828,
                        lat: 60.1281623840332
                    },
                    {
                        unitID: 921,
                        name: "Olaus Petri VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "703 63",
                        lng: 15.217484474182129,
                        lat: 59.280677795410156
                    },
                    {
                        unitID: 1048,
                        name: "Onsala VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "439 00",
                        lng: 12.012784004211426,
                        lat: 57.4121208190918
                    },
                    {
                        unitID: 357,
                        name: "Oskarshamns sjukhus",
                        countyCode: 8,
                        typeID: 2,
                        postalCode: "572 28",
                        lng: 16.423381805419922,
                        lat: 57.26451873779297
                    },
                    {
                        unitID: 1174,
                        name: "Oxbacken Skultuna Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "724 60",
                        lng: 16.531343460083008,
                        lat: 59.60581588745117
                    },
                    {
                        unitID: 896,
                        name: "Oxelösunds VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "613 30",
                        lng: 17.10169792175293,
                        lat: 58.670989990234375
                    },
                    {
                        unitID: 1406,
                        name: "Oxtorgets HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "826 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1238,
                        name: "Pajala HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "984 31",
                        lng: 23.34296226501465,
                        lat: 67.22362518310547
                    },
                    {
                        unitID: 845,
                        name: "Pilgårdens VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "693 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 926,
                        name: "Piteå HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "941 32",
                        lng: 21.477933883666992,
                        lat: 65.31864166259766
                    },
                    {
                        unitID: 846,
                        name: "Piteå Älvdals sjukhus",
                        countyCode: 25,
                        typeID: 2,
                        postalCode: "941 28",
                        lng: 21.49852180480957,
                        lat: 65.31214141845703
                    },
                    {
                        unitID: 1383,
                        name: "Platsarna läkarmottagning",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "432 44",
                        lng: 12.244903564453125,
                        lat: 57.1041259765625
                    },
                    {
                        unitID: 623,
                        name: "Porsöns HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "977 51",
                        lng: 22.148210525512695,
                        lat: 65.61917114257812
                    },
                    {
                        unitID: 1738,
                        name: "Praktikertjänst Närsjukhuset Dalsland",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "668 88",
                        lng: 12.161624908447266,
                        lat: 58.79826354980469
                    },
                    {
                        unitID: 1741,
                        name: "Praktikertjänst Närsjukhuset Lysekil",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "453 25",
                        lng: 11.440003395080566,
                        lat: 58.28019714355469
                    },
                    {
                        unitID: 1740,
                        name: "Praktikertjänst Närsjukhuset Strömstad",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "452 83",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1222,
                        name: "Prima Familjeläkarmottagning",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "722 11",
                        lng: 16.5386905670166,
                        lat: 59.611019134521484
                    },
                    {
                        unitID: 1428,
                        name: "Primapraktiken",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "461 53",
                        lng: 12.2803955078125,
                        lat: 58.2732048034668
                    },
                    {
                        unitID: 1023,
                        name: "Primärvården Västra Ramsele,Junsele, Näsåker",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "880 40",
                        lng: 16.880647659301758,
                        lat: 63.694705963134766
                    },
                    {
                        unitID: 704,
                        name: "Privatläkarmot i Sävsjö och Vrigstad",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "576 36",
                        lng: 14.656867027282715,
                        lat: 57.406105041503906
                    },
                    {
                        unitID: 520,
                        name: "Privatläkarmottagningen Arken",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "671 31",
                        lng: 12.59665298461914,
                        lat: 59.654640197753906
                    },
                    {
                        unitID: 1281,
                        name: "Privatlälakarna Hälsoval Helsingborg",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 78",
                        lng: 12.693755149841309,
                        lat: 56.04286193847656
                    },
                    {
                        unitID: 1351,
                        name: "Proxima Primärvård/vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "13130",
                        lng: 18.108768463134766,
                        lat: 59.312583923339844
                    },
                    {
                        unitID: 1493,
                        name: "Pålsboda VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "697 30",
                        lng: 15.333209991455078,
                        lat: 59.06938171386719
                    },
                    {
                        unitID: 1469,
                        name: "Quality Care Europe AB",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 51",
                        lng: 18.077346801757812,
                        lat: 59.33427047729492
                    },
                    {
                        unitID: 1419,
                        name: "Ramlösa VC",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "256 58",
                        lng: 12.725665092468262,
                        lat: 56.02842712402344
                    },
                    {
                        unitID: 37,
                        name: "Rasbo husläkarmottagning",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "755 96",
                        lng: 17.87907600402832,
                        lat: 59.94903564453125
                    },
                    {
                        unitID: 606,
                        name: "Reftele VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "330 21",
                        lng: 13.599437713623047,
                        lat: 57.17454147338867
                    },
                    {
                        unitID: 1742,
                        name: "Riddarens Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "164 74",
                        lng: 17.918676376342773,
                        lat: 59.417564392089844
                    },
                    {
                        unitID: 1640,
                        name: "Riddarhusläkarna",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "593 30",
                        lng: 16.641489028930664,
                        lat: 57.75986099243164
                    },
                    {
                        unitID: 1166,
                        name: "Riksby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "167 31",
                        lng: 17.954044342041016,
                        lat: 59.337284088134766
                    },
                    {
                        unitID: 1744,
                        name: "Rimbo Hälsocentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "762 31",
                        lng: 18.36947250366211,
                        lat: 59.74164581298828
                    },
                    {
                        unitID: 1137,
                        name: "Rinkeby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "163 72",
                        lng: 17.92726707458496,
                        lat: 59.388710021972656
                    },
                    {
                        unitID: 586,
                        name: "Rissne VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "174 57",
                        lng: 17.94038963317871,
                        lat: 59.37623977661133
                    },
                    {
                        unitID: 975,
                        name: "Robertsfors Hälsocentral",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "915 21",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 116,
                        name: "Roma VC",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "620 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1647,
                        name: "Ronna VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 53",
                        lng: 17.592622756958008,
                        lat: 59.20377731323242
                    },
                    {
                        unitID: 604,
                        name: "Ronneby VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "372 25",
                        lng: 15.269999504089355,
                        lat: 56.20695495605469
                    },
                    {
                        unitID: 1703,
                        name: "Rosengårdskliniken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "213 73",
                        lng: 13.050501823425293,
                        lat: 55.585609436035156
                    },
                    {
                        unitID: 692,
                        name: "Rosenhälsan",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "551 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 372,
                        name: "Rosenlunds VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "118 69",
                        lng: 18.06206512451172,
                        lat: 59.31092834472656
                    },
                    {
                        unitID: 787,
                        name: "Rosenlunds VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "551 11",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1239,
                        name: "Roslagshälsans HLM",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "761 46",
                        lng: 18.68276596069336,
                        lat: 59.75162887573242
                    },
                    {
                        unitID: 1313,
                        name: "Rotebro VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "192 07",
                        lng: 17.91352653503418,
                        lat: 59.47529602050781
                    },
                    {
                        unitID: 1454,
                        name: "Rudans vårdcentral Praktikertjänst AB",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "136 25",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1018,
                        name: "Runby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "194 46",
                        lng: 17.892658233642578,
                        lat: 59.520198822021484
                    },
                    {
                        unitID: 698,
                        name: "Rydaholms VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "330 17",
                        lng: 14.305009841918945,
                        lat: 56.984657287597656
                    },
                    {
                        unitID: 288,
                        name: "Ryds VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "584 32",
                        lng: 15.560970306396484,
                        lat: 58.40973663330078
                    },
                    {
                        unitID: 381,
                        name: "Råcksta Vällingby närvårdsmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "162 64",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1288,
                        name: "Rådhusläkarna",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "633 40",
                        lng: 16.520984649658203,
                        lat: 59.36836242675781
                    },
                    {
                        unitID: 1507,
                        name: "Råneå HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "955 31",
                        lng: 22.298179626464844,
                        lat: 65.85879516601562
                    },
                    {
                        unitID: 707,
                        name: "Råslätts VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "556 14",
                        lng: 14.150614738464355,
                        lat: 57.738563537597656
                    },
                    {
                        unitID: 513,
                        name: "Råsunda VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "169 35",
                        lng: 17.992734909057617,
                        lat: 59.36359786987305
                    },
                    {
                        unitID: 492,
                        name: "Rävlanda vårdcentral",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "430 65",
                        lng: 12.496932029724121,
                        lat: 57.65351867675781
                    },
                    {
                        unitID: 894,
                        name: "Rödeby VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "370 30",
                        lng: 15.616385459899902,
                        lat: 56.261383056640625
                    },
                    {
                        unitID: 706,
                        name: "S:t Hans Läkarmottagning",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "621 57",
                        lng: 18.291561126708984,
                        lat: 57.63762283325195
                    },
                    {
                        unitID: 221,
                        name: "Sahlgrenska Universitetssjukhuset Mölndal",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "431 80",
                        lng: 12.010464668273926,
                        lat: 57.66069793701172
                    },
                    {
                        unitID: 217,
                        name: "Sahlgrenska Universitetssjukhuset Sahlgrenska",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "413 45",
                        lng: 11.96004867553711,
                        lat: 57.68118667602539
                    },
                    {
                        unitID: 220,
                        name: "Sahlgrenska Universitetssjukhuset Östra",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "416 85",
                        lng: 12.0303413,
                        lat: 57.6974242
                    },
                    {
                        unitID: 1260,
                        name: "Sala Väsby Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "733 25",
                        lng: 16.60005760192871,
                        lat: 59.925453186035156
                    },
                    {
                        unitID: 517,
                        name: "Salems VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "144 30",
                        lng: 17.766658782958984,
                        lat: 59.201393127441406
                    },
                    {
                        unitID: 590,
                        name: "Saltsjöbadens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "133 21",
                        lng: 18.275379180908203,
                        lat: 59.28517150878906
                    },
                    {
                        unitID: 494,
                        name: "Samariterhemmets VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "753 20",
                        lng: 17.647768020629883,
                        lat: 59.8557014465332
                    },
                    {
                        unitID: 1181,
                        name: "Sandens HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "961 33",
                        lng: 21.69154930114746,
                        lat: 65.81951904296875
                    },
                    {
                        unitID: 498,
                        name: "Sandviken Norra - Din HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "811 89",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 536,
                        name: "Sandviken Södra Din HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "811 89",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 332,
                        name: "Sandvikens sjukhus",
                        countyCode: 21,
                        typeID: 2,
                        postalCode: "811 89",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1339,
                        name: "Scania Husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 87",
                        lng: 17.64586067199707,
                        lat: 59.15951156616211
                    },
                    {
                        unitID: 19,
                        name: "Segeltorps VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "141 71",
                        lng: 17.944292068481445,
                        lat: 59.27914047241211
                    },
                    {
                        unitID: 1453,
                        name: "Selmas Läkarhus",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "422 53",
                        lng: 11.987695693969727,
                        lat: 57.750030517578125
                    },
                    {
                        unitID: 1607,
                        name: "Sensia Sjukvård",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "392 31",
                        lng: 16.36026382446289,
                        lat: 56.659385681152344
                    },
                    {
                        unitID: 1006,
                        name: "Servicehälsan i Västerås",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "721 30",
                        lng: 16.554210662841797,
                        lat: 59.61671829223633
                    },
                    {
                        unitID: 17,
                        name: "Sibylleklinikens husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 43",
                        lng: 18.081972122192383,
                        lat: 59.33912658691406
                    },
                    {
                        unitID: 918,
                        name: "Sickla Hälsocenter",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "131 34",
                        lng: 18.133052825927734,
                        lat: 59.30596160888672
                    },
                    {
                        unitID: 1700,
                        name: "Sickla Hälsocenter Danviken",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "131 30",
                        lng: 18.109663009643555,
                        lat: 59.3127326965332
                    },
                    {
                        unitID: 1656,
                        name: "Sidsjö VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "852 40",
                        lng: 17.289154052734375,
                        lat: 62.377323150634766
                    },
                    {
                        unitID: 785,
                        name: "Sigtuna Läkarhus",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "193 30",
                        lng: 17.719905853271484,
                        lat: 59.615753173828125
                    },
                    {
                        unitID: 1528,
                        name: "Sigtuna VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "193 30",
                        lng: 17.72132682800293,
                        lat: 59.6176643371582
                    },
                    {
                        unitID: 1129,
                        name: "Simon Larsson",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "293 38",
                        lng: 14.498451232910156,
                        lat: 56.28230285644531
                    },
                    {
                        unitID: 510,
                        name: "Sjukhuset i Lidköping",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "531 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 317,
                        name: "Sjukhuset i Söderhamn",
                        countyCode: 21,
                        typeID: 2,
                        postalCode: "826 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1677,
                        name: "Sjöstadsdoktorn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "120 66",
                        lng: 18.104591369628906,
                        lat: 59.30238723754883
                    },
                    {
                        unitID: 1331,
                        name: "Skagerns Vård och Hälsoenhet",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "547 31",
                        lng: 14.087031364440918,
                        lat: 58.98041915893555
                    },
                    {
                        unitID: 759,
                        name: "Skaraborgs sjukhus Falköping",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "521 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 391,
                        name: "Skaraborgs sjukhus Skövde",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "541 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 866,
                        name: "Skebäcks VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "702 15",
                        lng: 15.234749794006348,
                        lat: 59.27217102050781
                    },
                    {
                        unitID: 348,
                        name: "Skelleftehamns Hälsocentral",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "932 32",
                        lng: 21.236602783203125,
                        lat: 64.68924713134766
                    },
                    {
                        unitID: 857,
                        name: "Skellefteå lasarett",
                        countyCode: 24,
                        typeID: 2,
                        postalCode: "931 86",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1158,
                        name: "Skepparens läkarmottagning",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "430 91",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 59,
                        name: "Skiftinge VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "631 88",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 76,
                        name: "Skillingaryds VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "568 32",
                        lng: 14.116477012634277,
                        lat: 57.437435150146484
                    },
                    {
                        unitID: 1229,
                        name: "Skinnskattebergs Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "739 31",
                        lng: 15.686668395996094,
                        lat: 59.82767868041992
                    },
                    {
                        unitID: 294,
                        name: "Skutskär VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "814 23",
                        lng: 17.411306381225586,
                        lat: 60.626243591308594
                    },
                    {
                        unitID: 174,
                        name: "Skånes Universitetssjukhus Lund",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "221 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 521,
                        name: "Skånes Universitetssjukhus Malmö",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "205 02",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 458,
                        name: "Skänninge VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "596 33",
                        lng: 15.087984085083008,
                        lat: 58.388450622558594
                    },
                    {
                        unitID: 459,
                        name: "Skärblacka VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "617 32",
                        lng: 15.914158821105957,
                        lat: 58.58066940307617
                    },
                    {
                        unitID: 1171,
                        name: "Skärholmens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "127 48",
                        lng: 17.90811538696289,
                        lat: 59.2746467590332
                    },
                    {
                        unitID: 1218,
                        name: "Sköndals VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "128 07",
                        lng: 18.11493492126465,
                        lat: 59.25524139404297
                    },
                    {
                        unitID: 1659,
                        name: "Slottsbergskliniken",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "421 50",
                        lng: 11.899969100952148,
                        lat: 57.656063079833984
                    },
                    {
                        unitID: 1336,
                        name: "Slottsfjärdens läkarmottagning",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "392 31",
                        lng: 16.360309600830078,
                        lat: 56.6589469909668
                    },
                    {
                        unitID: 607,
                        name: "Slottsgatans HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "572 33",
                        lng: 16.44977378845215,
                        lat: 57.265071868896484
                    },
                    {
                        unitID: 90,
                        name: "Smedby HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "391 85",
                        lng: 16.231943130493164,
                        lat: 56.68159866333008
                    },
                    {
                        unitID: 1628,
                        name: "SmålandsHälsan",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "341 30",
                        lng: 13.940391540527344,
                        lat: 56.83424377441406
                    },
                    {
                        unitID: 420,
                        name: "Smålandsstenars VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "333 31",
                        lng: 13.41502571105957,
                        lat: 57.16218566894531
                    },
                    {
                        unitID: 139,
                        name: "Solbrinken Hässleholm",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "281 40",
                        lng: 13.786866188049316,
                        lat: 56.166690826416016
                    },
                    {
                        unitID: 1614,
                        name: "Solklart vård i Bjuv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "267 31",
                        lng: 12.916109085083008,
                        lat: 56.086429595947266
                    },
                    {
                        unitID: 540,
                        name: "Sollefteå sjukhus",
                        countyCode: 22,
                        typeID: 2,
                        postalCode: "881 04",
                        lng: 17.236783981323242,
                        lat: 63.174381256103516
                    },
                    {
                        unitID: 1484,
                        name: "Solljungahälsan",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "286 37",
                        lng: 13.280991554260254,
                        lat: 56.28159713745117
                    },
                    {
                        unitID: 395,
                        name: "Solna Centrum Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "171 45",
                        lng: 18.000011444091797,
                        lat: 59.35887145996094
                    },
                    {
                        unitID: 1250,
                        name: "Solna läkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "169 34",
                        lng: 17.987037658691406,
                        lat: 59.366058349609375
                    },
                    {
                        unitID: 903,
                        name: "Sorsele sjukstuga",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "924 31",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1427,
                        name: "Sotenäs Vårdcentral i Hunnebostrand",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "456 61",
                        lng: 11.30138111114502,
                        lat: 58.43903732299805
                    },
                    {
                        unitID: 592,
                        name: "Spånga VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "163 52",
                        lng: 17.899045944213867,
                        lat: 59.380680084228516
                    },
                    {
                        unitID: 1196,
                        name: "St Eriks VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "122 82",
                        lng: 18.041208267211914,
                        lat: 59.33353042602539
                    },
                    {
                        unitID: 1733,
                        name: "St Olof Vårdcentral",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "853 53",
                        lng: 17.276611328125,
                        lat: 62.388755798339844
                    },
                    {
                        unitID: 1121,
                        name: "Stadsvikens HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "971 89",
                        lng: 22.153284072875977,
                        lat: 65.59115600585938
                    },
                    {
                        unitID: 1381,
                        name: "Stattena VC",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "254 43",
                        lng: 12.697653770446777,
                        lat: 56.05937957763672
                    },
                    {
                        unitID: 484,
                        name: "Stenbergska vårdcentralen",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "921 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1600,
                        name: "Stenblomman VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "434 37",
                        lng: 12.071479797363281,
                        lat: 57.49895095825195
                    },
                    {
                        unitID: 1296,
                        name: "Stenhamra VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "179 61",
                        lng: 17.680383682250977,
                        lat: 59.33463668823242
                    },
                    {
                        unitID: 88,
                        name: "Stensö HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "391 85",
                        lng: 16.324325561523438,
                        lat: 56.659210205078125
                    },
                    {
                        unitID: 1303,
                        name: "Stiftelsen Stora Sköndal",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "128 85",
                        lng: 18.118398666381836,
                        lat: 59.25358963012695
                    },
                    {
                        unitID: 1206,
                        name: "Stocksunds VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "182 07",
                        lng: 18.057697296142578,
                        lat: 59.38482666015625
                    },
                    {
                        unitID: 1068,
                        name: "Stora Trädgårdsgatans HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "593 42",
                        lng: 16.61220359802246,
                        lat: 57.76646423339844
                    },
                    {
                        unitID: 481,
                        name: "Stortorgets HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "803 20",
                        lng: 17.140439987182617,
                        lat: 60.673709869384766
                    },
                    {
                        unitID: 956,
                        name: "Storumans sjukstuga",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "923 32",
                        lng: 17.12213134765625,
                        lat: 65.09697723388672
                    },
                    {
                        unitID: 557,
                        name: "Storviks HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "812 30",
                        lng: 16.53313636779785,
                        lat: 60.58674240112305
                    },
                    {
                        unitID: 515,
                        name: "Storvreta VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "743 30",
                        lng: 17.70293617248535,
                        lat: 59.96034622192383
                    },
                    {
                        unitID: 1264,
                        name: "Storvretens vårdcentral AB",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "147 50",
                        lng: 17.839004516601562,
                        lat: 59.19301986694336
                    },
                    {
                        unitID: 773,
                        name: "Storå VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "711 76",
                        lng: 15.127925872802734,
                        lat: 59.714149475097656
                    },
                    {
                        unitID: 605,
                        name: "Strömsbro HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "806 46",
                        lng: 17.1627197265625,
                        lat: 60.70619583129883
                    },
                    {
                        unitID: 1716,
                        name: "Strömstad Läkarhus",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "452 83",
                        lng: 11.16960620880127,
                        lat: 58.94049072265625
                    },
                    {
                        unitID: 269,
                        name: "Stugun HC",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "830 76",
                        lng: 15.593482971191406,
                        lat: 63.16777801513672
                    },
                    {
                        unitID: 374,
                        name: "Stureby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "122 64",
                        lng: 18.066125869750977,
                        lat: 59.278160095214844
                    },
                    {
                        unitID: 1266,
                        name: "Stuvsta VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "141 40",
                        lng: 17.997175216674805,
                        lat: 59.25315475463867
                    },
                    {
                        unitID: 944,
                        name: "Sunderby sjukhus",
                        countyCode: 25,
                        typeID: 2,
                        postalCode: "971 89",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1554,
                        name: "Sundets läkargrupp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "237 31",
                        lng: 13.025896072387695,
                        lat: 55.72221374511719
                    },
                    {
                        unitID: 258,
                        name: "Sundsvalls sjukhus",
                        countyCode: 22,
                        typeID: 2,
                        postalCode: "851 86",
                        lng: 17.305646896362305,
                        lat: 62.40840148925781
                    },
                    {
                        unitID: 1209,
                        name: "Sundsvalls vårdcentral Skönsmon",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "854 63",
                        lng: 17.347209930419922,
                        lat: 62.37907791137695
                    },
                    {
                        unitID: 39,
                        name: "Svartbäckens VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "750 16",
                        lng: 17.626628875732422,
                        lat: 59.86896896362305
                    },
                    {
                        unitID: 168,
                        name: "Sveakliniken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "233 35",
                        lng: 13.230467796325684,
                        lat: 55.51820755004883
                    },
                    {
                        unitID: 610,
                        name: "Säffle Nysäter VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "661 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1076,
                        name: "Särö VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "429 41",
                        lng: 11.96542739868164,
                        lat: 57.51984786987305
                    },
                    {
                        unitID: 1306,
                        name: "Säröledens Familjeläkare",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "427 50",
                        lng: 11.961834907531738,
                        lat: 57.5609130859375
                    },
                    {
                        unitID: 715,
                        name: "Sätra HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "806 31",
                        lng: 17.11589241027832,
                        lat: 60.692787170410156
                    },
                    {
                        unitID: 1253,
                        name: "Sätra Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "127 37",
                        lng: 17.92006492614746,
                        lat: 59.28544616699219
                    },
                    {
                        unitID: 1046,
                        name: "Sävar HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "918 31",
                        lng: 20.55085563659668,
                        lat: 63.898014068603516
                    },
                    {
                        unitID: 345,
                        name: "Sävsjö Vårdcentral",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "576 36",
                        lng: 14.656867027282715,
                        lat: 57.406105041503906
                    },
                    {
                        unitID: 1631,
                        name: "Söderhamnsfjärdens HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "826 37",
                        lng: 17.069011688232422,
                        lat: 61.30771255493164
                    },
                    {
                        unitID: 20,
                        name: "Södersjukhuset",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "118 83",
                        lng: 18.055660247802734,
                        lat: 59.30929946899414
                    },
                    {
                        unitID: 637,
                        name: "Södertulls HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "801 30",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 293,
                        name: "Södertälje sjukhus",
                        countyCode: 1,
                        typeID: 2,
                        postalCode: "152 86",
                        lng: 17.633445739746094,
                        lat: 59.199501037597656
                    },
                    {
                        unitID: 843,
                        name: "Södervärns VC",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "214 26",
                        lng: 13.00804615020752,
                        lat: 55.58920669555664
                    },
                    {
                        unitID: 1067,
                        name: "Söderåkra HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "385 51",
                        lng: 16.073806762695312,
                        lat: 56.45016098022461
                    },
                    {
                        unitID: 233,
                        name: "Södra Älvsborgs sjukhus Borås Skene",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "504 55",
                        lng: 12.966071128845215,
                        lat: 57.72011947631836
                    },
                    {
                        unitID: 705,
                        name: "Sölvesborgs Vårdcentral",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "294 32",
                        lng: 14.583232879638672,
                        lat: 56.05609893798828
                    },
                    {
                        unitID: 184,
                        name: "Söndrumskliniken",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 41",
                        lng: 12.806373596191406,
                        lat: 56.66020202636719
                    },
                    {
                        unitID: 992,
                        name: "Söråkers VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "860 35",
                        lng: 17.508434295654297,
                        lat: 62.507118225097656
                    },
                    {
                        unitID: 544,
                        name: "Tallhöjdens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "152 41",
                        lng: 17.62897491455078,
                        lat: 59.20624542236328
                    },
                    {
                        unitID: 461,
                        name: "Tannefors VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "581 91",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 418,
                        name: "Tegs HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "904 20",
                        lng: 20.25355339050293,
                        lat: 63.82050323486328
                    },
                    {
                        unitID: 1591,
                        name: "Telefonplans husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "126 37",
                        lng: 17.99723243713379,
                        lat: 59.296852111816406
                    },
                    {
                        unitID: 1680,
                        name: "Telefonplans VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "126 26",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 4,
                        name: "Telgeakuten",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "152 70",
                        lng: 17.641141891479492,
                        lat: 59.19056701660156
                    },
                    {
                        unitID: 1606,
                        name: "Tenhults VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "560 27",
                        lng: 14.31802749633789,
                        lat: 57.71199417114258
                    },
                    {
                        unitID: 1159,
                        name: "Tensta Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "163 64",
                        lng: 17.90304183959961,
                        lat: 59.394351959228516
                    },
                    {
                        unitID: 1435,
                        name: "Tibra medica AB, Husläkarmott Kista Hälsocenter",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "164 40",
                        lng: 17.948022842407227,
                        lat: 59.403804779052734
                    },
                    {
                        unitID: 43,
                        name: "Tierps VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "815 37",
                        lng: 17.51527976989746,
                        lat: 60.336669921875
                    },
                    {
                        unitID: 996,
                        name: "Timrå VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "861 00",
                        lng: 17.32408332824707,
                        lat: 62.486656188964844
                    },
                    {
                        unitID: 1695,
                        name: "To Care Husläkarmott Solna Sundbyberg",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "171 41",
                        lng: 17.981426239013672,
                        lat: 59.360321044921875
                    },
                    {
                        unitID: 1624,
                        name: "ToCare City",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "114 43",
                        lng: 18.079509735107422,
                        lat: 59.340187072753906
                    },
                    {
                        unitID: 865,
                        name: "Tore Södermark",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "182 73",
                        lng: 18.05230140686035,
                        lat: 59.393463134765625
                    },
                    {
                        unitID: 354,
                        name: "Torsby sjukhus",
                        countyCode: 17,
                        typeID: 2,
                        postalCode: "685 29",
                        lng: 12.998577117919922,
                        lat: 60.13742446899414
                    },
                    {
                        unitID: 680,
                        name: "Torsby VC",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "685 29",
                        lng: 12.998648643493652,
                        lat: 60.138065338134766
                    },
                    {
                        unitID: 1452,
                        name: "Torslanda Läkarhus",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "423 37",
                        lng: 11.783158302307129,
                        lat: 57.708438873291016
                    },
                    {
                        unitID: 13,
                        name: "Torsviks VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "181 50",
                        lng: 18.122264862060547,
                        lat: 59.362152099609375
                    },
                    {
                        unitID: 94,
                        name: "Torsås HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "385 30",
                        lng: 15.996726036071777,
                        lat: 56.41132736206055
                    },
                    {
                        unitID: 634,
                        name: "Tranebergs VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "167 44",
                        lng: 17.978042602539062,
                        lat: 59.33489227294922
                    },
                    {
                        unitID: 75,
                        name: "Tranås Vårdcentum",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "573 83",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 177,
                        name: "Trelleborgs lasarett",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "231 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 437,
                        name: "Trollbäckens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "135 53",
                        lng: 18.201148986816406,
                        lat: 59.22215270996094
                    },
                    {
                        unitID: 511,
                        name: "Trosa VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "619 33",
                        lng: 17.5592041015625,
                        lat: 58.90203857421875
                    },
                    {
                        unitID: 581,
                        name: "Trossö VC",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "371 31",
                        lng: 15.58772087097168,
                        lat: 56.16056823730469
                    },
                    {
                        unitID: 1722,
                        name: "Tryggakliniken Bromölla",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "295 39",
                        lng: 14.468343734741211,
                        lat: 56.06455612182617
                    },
                    {
                        unitID: 1345,
                        name: "Trångsunds VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "142 60",
                        lng: 18.13208770751953,
                        lat: 59.227779388427734
                    },
                    {
                        unitID: 1584,
                        name: "Trädgårdstorgets Vårdcentral",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "582 23",
                        lng: 15.623666763305664,
                        lat: 58.40928268432617
                    },
                    {
                        unitID: 1249,
                        name: "Tudorklinikens allmänläkarmottagning",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 46",
                        lng: 12.862458229064941,
                        lat: 56.674713134765625
                    },
                    {
                        unitID: 1203,
                        name: "Tullinge VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "146 31",
                        lng: 17.906949996948242,
                        lat: 59.205326080322266
                    },
                    {
                        unitID: 906,
                        name: "Tumba VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "147 41",
                        lng: 17.838523864746094,
                        lat: 59.20524597167969
                    },
                    {
                        unitID: 689,
                        name: "Tunafors VC",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "631 88",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 876,
                        name: "TungelstaHälsan",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "137 55",
                        lng: 18.044836044311523,
                        lat: 59.10609436035156
                    },
                    {
                        unitID: 31,
                        name: "Ture Ålander Läkarpraktik",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "753 23",
                        lng: 17.656892776489258,
                        lat: 59.856414794921875
                    },
                    {
                        unitID: 1359,
                        name: "Turebergs VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "191 24",
                        lng: 17.954811096191406,
                        lat: 59.43117904663086
                    },
                    {
                        unitID: 5,
                        name: "Tveta Hälsocentralen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 65",
                        lng: 17.608627319335938,
                        lat: 59.17759704589844
                    },
                    {
                        unitID: 1328,
                        name: "Tvings läkarmottagning",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "370 33",
                        lng: 15.463923454284668,
                        lat: 56.31123352050781
                    },
                    {
                        unitID: 1013,
                        name: "Tybble Vårdcentral",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "702 18",
                        lng: 15.236592292785645,
                        lat: 59.25434875488281
                    },
                    {
                        unitID: 575,
                        name: "Tyresöhälsan Aleris",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "135 21",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 166,
                        name: "Tåbelunds VC",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "241 30",
                        lng: 13.297937393188477,
                        lat: 55.833377838134766
                    },
                    {
                        unitID: 1232,
                        name: "Täby Centrum Doktorn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "183 34",
                        lng: 18.067625045776367,
                        lat: 59.44426345825195
                    },
                    {
                        unitID: 15,
                        name: "Täby Kyrkby husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "187 74",
                        lng: 18.063697814941406,
                        lat: 59.494300842285156
                    },
                    {
                        unitID: 14,
                        name: "Täby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "183 34",
                        lng: 18.066768646240234,
                        lat: 59.444366455078125
                    },
                    {
                        unitID: 1077,
                        name: "Tärnaby Sjukstuga",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "920 64",
                        lng: 15.31352710723877,
                        lat: 65.71588134765625
                    },
                    {
                        unitID: 902,
                        name: "Töcksforspraktiken",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "670 10",
                        lng: 11.83569622039795,
                        lat: 59.51077651977539
                    },
                    {
                        unitID: 225,
                        name: "Uddevalla sjukhus",
                        countyCode: 14,
                        typeID: 2,
                        postalCode: "451 80",
                        lng: 11.929664611816406,
                        lat: 58.35603713989258
                    },
                    {
                        unitID: 1071,
                        name: "Ullvi-Tuna Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "731 30",
                        lng: 16.00267791748047,
                        lat: 59.50910568237305
                    },
                    {
                        unitID: 71,
                        name: "Universitetssjukhuset Linköping",
                        countyCode: 5,
                        typeID: 2,
                        postalCode: "581 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 514,
                        name: "Universitetssjukhuset Örebro",
                        countyCode: 18,
                        typeID: 2,
                        postalCode: "701 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 462,
                        name: "Vadstena VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "592 32",
                        lng: 14.900410652160645,
                        lat: 58.45304489135742
                    },
                    {
                        unitID: 77,
                        name: "Vaggeryds VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "567 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 697,
                        name: "Valbo HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "818 31",
                        lng: 17.007461547851562,
                        lat: 60.64400100708008
                    },
                    {
                        unitID: 463,
                        name: "Valdemarsviks VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "615 30",
                        lng: 16.592561721801758,
                        lat: 58.20244598388672
                    },
                    {
                        unitID: 1290,
                        name: "Valens läkargrupp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "231 42",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1592,
                        name: "Valjehälsan",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "294 37",
                        lng: 14.5551176071167,
                        lat: 56.048831939697266
                    },
                    {
                        unitID: 1037,
                        name: "Vallentuna Doktorn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "186 31",
                        lng: 18.078266143798828,
                        lat: 59.53553771972656
                    },
                    {
                        unitID: 1240,
                        name: "Vallentuna Husläkargrupp",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "186 36",
                        lng: 18.082965850830078,
                        lat: 59.53548049926758
                    },
                    {
                        unitID: 1072,
                        name: "Vallås VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 58",
                        lng: 12.909021377563477,
                        lat: 56.67749786376953
                    },
                    {
                        unitID: 765,
                        name: "Valsta VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "195 03",
                        lng: 17.828702926635742,
                        lat: 59.61614227294922
                    },
                    {
                        unitID: 548,
                        name: "Varberga Vårdcentral",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "703 51",
                        lng: 15.18012809753418,
                        lat: 59.28681945800781
                    },
                    {
                        unitID: 190,
                        name: "Varbergs sjukhus",
                        countyCode: 13,
                        typeID: 2,
                        postalCode: "432 81",
                        lng: 12.278311729431152,
                        lat: 57.098915100097656
                    },
                    {
                        unitID: 1696,
                        name: "Vardaga Hemvård Mitt",
                        countyCode: 23,
                        typeID: 1,
                        postalCode: "840 40",
                        lng: 14.43064022064209,
                        lat: 62.763206481933594
                    },
                    {
                        unitID: 1586,
                        name: "Varvets HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "824 52",
                        lng: 17.122282028198242,
                        lat: 61.72703552246094
                    },
                    {
                        unitID: 1578,
                        name: "Wasa City klinik",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "561 32",
                        lng: 14.256194114685059,
                        lat: 57.790496826171875
                    },
                    {
                        unitID: 1355,
                        name: "Vaxholms VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "185 31",
                        lng: 18.35045051574707,
                        lat: 59.40290832519531
                    },
                    {
                        unitID: 636,
                        name: "VC Centrum",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "352 31",
                        lng: 14.801424026489258,
                        lat: 56.88172149658203
                    },
                    {
                        unitID: 1474,
                        name: "VC Familjedoktorerna",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "645 33",
                        lng: 17.019933700561523,
                        lat: 59.37916946411133
                    },
                    {
                        unitID: 573,
                        name: "VC Granen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "212 13",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1247,
                        name: "VC Hertig Knut",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 42",
                        lng: 12.857410430908203,
                        lat: 56.676025390625
                    },
                    {
                        unitID: 1585,
                        name: "VC Läkarhuset Avonova",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "784 60",
                        lng: 15.45531177520752,
                        lat: 60.47270202636719
                    },
                    {
                        unitID: 960,
                        name: "VC Norra Fäladen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "220 10",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 638,
                        name: "VC Samariten",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "374 80",
                        lng: 14.851766586303711,
                        lat: 56.187103271484375
                    },
                    {
                        unitID: 1417,
                        name: "VC Specialistläkargruppen Hälsans hus",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 70",
                        lng: 15.345602035522461,
                        lat: 57.16822814941406
                    },
                    {
                        unitID: 1397,
                        name: "VC Specialistläkargruppen Växjö",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "352 34",
                        lng: 14.80367374420166,
                        lat: 56.8748664855957
                    },
                    {
                        unitID: 314,
                        name: "VC Vålberg",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "660 50",
                        lng: 13.190153121948242,
                        lat: 59.40299987792969
                    },
                    {
                        unitID: 1390,
                        name: "VC Växjöhälsan",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "352 32",
                        lng: 14.798270225524902,
                        lat: 56.881263732910156
                    },
                    {
                        unitID: 779,
                        name: "Vellinge VC",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "235 36",
                        lng: 13.011857986450195,
                        lat: 55.47138214111328
                    },
                    {
                        unitID: 506,
                        name: "Vendelsö VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "136 70",
                        lng: 18.196393966674805,
                        lat: 59.193233489990234
                    },
                    {
                        unitID: 1468,
                        name: "Veritaskliniken",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "194 37",
                        lng: 17.906681060791016,
                        lat: 59.53157043457031
                    },
                    {
                        unitID: 1341,
                        name: "Veritaskliniken Ekerö husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "178 31",
                        lng: 17.81092071533203,
                        lat: 59.28956985473633
                    },
                    {
                        unitID: 469,
                        name: "Vetlanda VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "574 28",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1519,
                        name: "Wetterhälsan AB",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "554 05",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 786,
                        name: "Vibblaby HLM",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "177 64",
                        lng: 17.831233978271484,
                        lat: 59.421607971191406
                    },
                    {
                        unitID: 1556,
                        name: "Victoria Vård och Hälsa",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "216 32",
                        lng: 12.933106422424316,
                        lat: 55.57280731201172
                    },
                    {
                        unitID: 1099,
                        name: "Vidarklinikens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "153 91",
                        lng: 17.564876556396484,
                        lat: 59.09036636352539
                    },
                    {
                        unitID: 1004,
                        name: "Viksäng-Irsta familjeläkarmottagning",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "723 45",
                        lng: 16.57548713684082,
                        lat: 59.60888671875
                    },
                    {
                        unitID: 1665,
                        name: "Viktoriakliniken Eldsberga",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 46",
                        lng: 12.861467361450195,
                        lat: 56.67256164550781
                    },
                    {
                        unitID: 183,
                        name: "Viktoriakliniken Kungsgatan",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 46",
                        lng: 12.861289978027344,
                        lat: 56.672332763671875
                    },
                    {
                        unitID: 68,
                        name: "Vilbergens VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "603 56",
                        lng: 16.1708984375,
                        lat: 58.571571350097656
                    },
                    {
                        unitID: 553,
                        name: "Vilhelmina Sjukstuga",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "912 32",
                        lng: 16.66233253479004,
                        lat: 64.62508392333984
                    },
                    {
                        unitID: 916,
                        name: "Villa Qrera",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "459 30",
                        lng: 11.942756652832031,
                        lat: 58.23908996582031
                    },
                    {
                        unitID: 958,
                        name: "Vimmerby HC",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "598 84",
                        lng: 15.857821464538574,
                        lat: 57.667625427246094
                    },
                    {
                        unitID: 962,
                        name: "Vindelns HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "922 31",
                        lng: 19.713726043701172,
                        lat: 64.201171875
                    },
                    {
                        unitID: 630,
                        name: "Vingåkers vårdcentral AB",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "640 30",
                        lng: 16.499713897705078,
                        lat: 59.152626037597656
                    },
                    {
                        unitID: 1516,
                        name: "Vintergatans Vårdcentralen",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "681 31",
                        lng: 14.10864543914795,
                        lat: 59.30963897705078
                    },
                    {
                        unitID: 1498,
                        name: "Virsbodoktorn",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "730 61",
                        lng: 16.04389762878418,
                        lat: 59.872764587402344
                    },
                    {
                        unitID: 1615,
                        name: "Virserums Läkarhus",
                        countyCode: 8,
                        typeID: 1,
                        postalCode: "570 80",
                        lng: 15.58089828491211,
                        lat: 57.32059097290039
                    },
                    {
                        unitID: 118,
                        name: "Visby lasarett",
                        countyCode: 9,
                        typeID: 2,
                        postalCode: "621 84",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 930,
                        name: "Vittangi vårdcentral Praktikertjänst",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "980 10",
                        lng: 21.634716033935547,
                        lat: 67.68033599853516
                    },
                    {
                        unitID: 877,
                        name: "Vivalla VC",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "703 71",
                        lng: 15.188578605651855,
                        lat: 59.29918670654297
                    },
                    {
                        unitID: 1579,
                        name: "Voxnadalens HC",
                        countyCode: 21,
                        typeID: 1,
                        postalCode: "822 30",
                        lng: 16.06682586669922,
                        lat: 61.34548568725586
                    },
                    {
                        unitID: 1581,
                        name: "Vrigstad läkarmottagning",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "570 03",
                        lng: 14.465842247009277,
                        lat: 57.35640335083008
                    },
                    {
                        unitID: 331,
                        name: "Vrinnevisjukhuset",
                        countyCode: 5,
                        typeID: 2,
                        postalCode: "601 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1552,
                        name: "Vår Vårdcentral",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "641 30",
                        lng: 16.2042293548584,
                        lat: 58.99528503417969
                    },
                    {
                        unitID: 1655,
                        name: "Vårbergs VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "127 43",
                        lng: 17.889554977416992,
                        lat: 59.27555847167969
                    },
                    {
                        unitID: 1211,
                        name: "Vårby VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "143 35",
                        lng: 17.87967300415039,
                        lat: 59.253841400146484
                    },
                    {
                        unitID: 612,
                        name: "Vårdcentalen Vråen",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "331 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 599,
                        name: "Vårdcentral Avesta",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "774 82",
                        lng: 16.200040817260742,
                        lat: 60.141448974609375
                    },
                    {
                        unitID: 1686,
                        name: "Vårdcentral Avestahälsan",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "774 30",
                        lng: 16.168970108032227,
                        lat: 60.1442756652832
                    },
                    {
                        unitID: 650,
                        name: "Vårdcentral Domnarvet",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "781 27",
                        lng: 15.465152740478516,
                        lat: 60.503421783447266
                    },
                    {
                        unitID: 1687,
                        name: "Vårdcentral Engelbrekt Ludvika",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "771 30",
                        lng: 15.18799114227295,
                        lat: 60.14813232421875
                    },
                    {
                        unitID: 25,
                        name: "Vårdcentral Familjeläkarna i Bålsta",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "746 32",
                        lng: 17.52775001525879,
                        lat: 59.56730651855469
                    },
                    {
                        unitID: 665,
                        name: "Vårdcentral Gagnef",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "785 51",
                        lng: 15.128449440002441,
                        lat: 60.55274200439453
                    },
                    {
                        unitID: 657,
                        name: "Vårdcentral Grangärde Fredriksberg",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "770 12",
                        lng: 14.955789566040039,
                        lat: 60.21601104736328
                    },
                    {
                        unitID: 654,
                        name: "Vårdcentral Grängesberg",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "772 32",
                        lng: 15.017623901367188,
                        lat: 60.086971282958984
                    },
                    {
                        unitID: 652,
                        name: "Vårdcentral Hedemora",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "776 30",
                        lng: 15.996901512145996,
                        lat: 60.27304458618164
                    },
                    {
                        unitID: 1276,
                        name: "Vårdcentral Ingrid Marie",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "753 15",
                        lng: 17.6304988861084,
                        lat: 59.86246871948242
                    },
                    {
                        unitID: 645,
                        name: "Vårdcentral Jakobsgårdarna",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "784 53",
                        lng: 15.402578353881836,
                        lat: 60.483585357666016
                    },
                    {
                        unitID: 1649,
                        name: "Vårdcentral Koppardalen",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "77441",
                        lng: 16.17226791381836,
                        lat: 60.14939880371094
                    },
                    {
                        unitID: 644,
                        name: "Vårdcentral Kvarnsveden",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "784 66",
                        lng: 15.410460472106934,
                        lat: 60.515811920166016
                    },
                    {
                        unitID: 252,
                        name: "Vårdcentral Leksand",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "793 27",
                        lng: 14.998790740966797,
                        lat: 60.73733139038086
                    },
                    {
                        unitID: 661,
                        name: "Vårdcentral Ludvika",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "771 81",
                        lng: 15.203526496887207,
                        lat: 60.156036376953125
                    },
                    {
                        unitID: 649,
                        name: "Vårdcentral Långshyttan",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "770 70",
                        lng: 16.051082611083984,
                        lat: 60.457664489746094
                    },
                    {
                        unitID: 250,
                        name: "Vårdcentral Malung",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "782 22",
                        lng: 13.720320701599121,
                        lat: 60.68540954589844
                    },
                    {
                        unitID: 243,
                        name: "Vårdcentral Mora",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "792 85",
                        lng: 14.584949493408203,
                        lat: 61.01628112792969
                    },
                    {
                        unitID: 245,
                        name: "Vårdcentral Orsa",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "794 30",
                        lng: 14.614131927490234,
                        lat: 61.1187629699707
                    },
                    {
                        unitID: 246,
                        name: "Vårdcentral Rättvik",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "795 21",
                        lng: 15.115716934204102,
                        lat: 60.88869857788086
                    },
                    {
                        unitID: 394,
                        name: "Vårdcentral Slite",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "624 48",
                        lng: 18.805734634399414,
                        lat: 57.706886291503906
                    },
                    {
                        unitID: 648,
                        name: "Vårdcentral Smedjebacken",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "777 25",
                        lng: 15.410853385925293,
                        lat: 60.145294189453125
                    },
                    {
                        unitID: 1699,
                        name: "Vårdcentral Solnas Hjärta",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "171 45",
                        lng: 18.00121307373047,
                        lat: 59.35922622680664
                    },
                    {
                        unitID: 642,
                        name: "Vårdcentral Sälen-Lima",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "780 67",
                        lng: 13.268927574157715,
                        lat: 61.155487060546875
                    },
                    {
                        unitID: 248,
                        name: "Vårdcentral Särna",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "790 90",
                        lng: 13.126230239868164,
                        lat: 61.69151306152344
                    },
                    {
                        unitID: 643,
                        name: "Vårdcentral Säter",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "783 27",
                        lng: 15.718362808227539,
                        lat: 60.342323303222656
                    },
                    {
                        unitID: 656,
                        name: "Vårdcentral Tisken",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "791 51",
                        lng: 15.632810592651367,
                        lat: 60.60276794433594
                    },
                    {
                        unitID: 249,
                        name: "Vårdcentral Vansbro",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "780 50",
                        lng: 14.232776641845703,
                        lat: 60.51618194580078
                    },
                    {
                        unitID: 247,
                        name: "Vårdcentral Älvdalen",
                        countyCode: 20,
                        typeID: 1,
                        postalCode: "796 30",
                        lng: 14.041011810302734,
                        lat: 61.231422424316406
                    },
                    {
                        unitID: 1097,
                        name: "Vårdcentralen Andersberg",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 55",
                        lng: 12.899023056030273,
                        lat: 56.66172790527344
                    },
                    {
                        unitID: 159,
                        name: "Vårdcentralen Anderslöv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "231 70",
                        lng: 13.318264961242676,
                        lat: 55.441585540771484
                    },
                    {
                        unitID: 1003,
                        name: "Vårdcentralen Ankaret",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "891 89",
                        lng: 18.7139835357666,
                        lat: 63.298622131347656
                    },
                    {
                        unitID: 164,
                        name: "Vårdcentralen Arlöv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "232 38",
                        lng: 13.085493087768555,
                        lat: 55.63459396362305
                    },
                    {
                        unitID: 1526,
                        name: "Vårdcentralen Aroma",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "574 40",
                        lng: 15.089302062988281,
                        lat: 57.423458099365234
                    },
                    {
                        unitID: 1648,
                        name: "Vårdcentralen Badhotellet",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "151 73",
                        lng: 17.625898361206055,
                        lat: 59.19317626953125
                    },
                    {
                        unitID: 915,
                        name: "Vårdcentralen Bagaregatan",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "611 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1451,
                        name: "Vårdcentralen Bohuslinden",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "452 30",
                        lng: 11.170343399047852,
                        lat: 58.93138122558594
                    },
                    {
                        unitID: 151,
                        name: "Vårdcentralen Bokskogen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "233 61",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 65,
                        name: "Vårdcentralen Borensberg",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "590 31",
                        lng: 15.277261734008789,
                        lat: 58.561988830566406
                    },
                    {
                        unitID: 1036,
                        name: "Vårdcentralen Borgmästaregården",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "214 67",
                        lng: 12.996719360351562,
                        lat: 55.58283233642578
                    },
                    {
                        unitID: 424,
                        name: "Vårdcentralen Boxholm",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "590 10",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1709,
                        name: "Vårdcentralen Brahehälsan Eslöv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "241 39",
                        lng: 13.307889938354492,
                        lat: 55.84110641479492
                    },
                    {
                        unitID: 760,
                        name: "Vårdcentralen Braås",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 42",
                        lng: 15.056512832641602,
                        lat: 57.06682205200195
                    },
                    {
                        unitID: 1100,
                        name: "Vårdcentralen Bredbyn",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "895 30",
                        lng: 18.109546661376953,
                        lat: 63.44774627685547
                    },
                    {
                        unitID: 425,
                        name: "Vårdcentralen Brinken",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "591 36",
                        lng: 15.051219940185547,
                        lat: 58.52910614013672
                    },
                    {
                        unitID: 135,
                        name: "Vårdcentralen Brösarp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "273 50",
                        lng: 14.099923133850098,
                        lat: 55.72492599487305
                    },
                    {
                        unitID: 1424,
                        name: "Vårdcentralen Bunkeflo",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "218 37",
                        lng: 12.919706344604492,
                        lat: 55.55368423461914
                    },
                    {
                        unitID: 185,
                        name: "Vårdcentralen Bäckagård",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "302 74",
                        lng: 12.781758308410645,
                        lat: 56.66258239746094
                    },
                    {
                        unitID: 578,
                        name: "Vårdcentralen Carlanderska",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "405 45",
                        lng: 11.988975524902344,
                        lat: 57.69169616699219
                    },
                    {
                        unitID: 160,
                        name: "Vårdcentralen Centrum",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "261 52",
                        lng: 12.841104507446289,
                        lat: 55.879371643066406
                    },
                    {
                        unitID: 1314,
                        name: "Vårdcentralen Centrum",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "312 31",
                        lng: 13.04054069519043,
                        lat: 56.51087951660156
                    },
                    {
                        unitID: 1437,
                        name: "Vårdcentralen Centrum",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "541 30",
                        lng: 13.850510597229004,
                        lat: 58.38899612426758
                    },
                    {
                        unitID: 1701,
                        name: "Vårdcentralen centrum Familjedoktorerna",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "753 20",
                        lng: 17.64293098449707,
                        lat: 59.858604431152344
                    },
                    {
                        unitID: 1509,
                        name: "Vårdcentralen Centrum Flen",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "642 37",
                        lng: 16.590280532836914,
                        lat: 59.05934143066406
                    },
                    {
                        unitID: 914,
                        name: "Vårdcentralen City",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "631 88",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 152,
                        name: "Vårdcentralen Dalby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "240 10",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 119,
                        name: "Vårdcentralen Degeberga",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "297 31",
                        lng: 14.092430114746094,
                        lat: 55.83746337890625
                    },
                    {
                        unitID: 982,
                        name: "Vårdcentralen Delfinen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "263 38",
                        lng: 12.560065269470215,
                        lat: 56.2017822265625
                    },
                    {
                        unitID: 1101,
                        name: "Vårdcentralen Domsjö",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "892 32",
                        lng: 18.689922332763672,
                        lat: 63.26591873168945
                    },
                    {
                        unitID: 703,
                        name: "Vårdcentralen Drillsnäppan",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "681 43",
                        lng: 14.1268892288208,
                        lat: 59.310142517089844
                    },
                    {
                        unitID: 1259,
                        name: "Vårdcentralen Drottninghög",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "254 57",
                        lng: 12.729035377502441,
                        lat: 56.062644958496094
                    },
                    {
                        unitID: 1146,
                        name: "Vårdcentralen Eden",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "214 20",
                        lng: 13.010628700256348,
                        lat: 55.59327697753906
                    },
                    {
                        unitID: 426,
                        name: "Vårdcentralen Ekholmen",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "589 29",
                        lng: 15.680588722229004,
                        lat: 58.37744140625
                    },
                    {
                        unitID: 790,
                        name: "Vårdcentralen Eksjö",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "575 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 547,
                        name: "Vårdcentralen Falkenberg",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "311 30",
                        lng: 12.49960708618164,
                        lat: 56.90713882446289
                    },
                    {
                        unitID: 1637,
                        name: "Vårdcentralen Feelgood",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "211 20",
                        lng: 12.99962043762207,
                        lat: 55.61236572265625
                    },
                    {
                        unitID: 468,
                        name: "Vårdcentralen Finspång",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "612 25",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1727,
                        name: "Vårdcentralen Flottiljen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "177 44",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1126,
                        name: "Vårdcentralen Fosietorp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "215 62",
                        lng: 13.01036262512207,
                        lat: 55.56669998168945
                    },
                    {
                        unitID: 1622,
                        name: "Vårdcentralen Fristaden Södermanland",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "632 20",
                        lng: 16.517723083496094,
                        lat: 59.370216369628906
                    },
                    {
                        unitID: 1098,
                        name: "Vårdcentralen Fågelbacken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "217 44",
                        lng: 12.984850883483887,
                        lat: 55.5966796875
                    },
                    {
                        unitID: 859,
                        name: "Vårdcentralen Förslöv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "269 73",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 181,
                        name: "Vårdcentralen Getinge",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "311 44",
                        lng: 12.735235214233398,
                        lat: 56.8160514831543
                    },
                    {
                        unitID: 1721,
                        name: "Vårdcentralen Getingen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "221 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 794,
                        name: "Vårdcentralen Gripen",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "652 24",
                        lng: 13.50210189819336,
                        lat: 59.382835388183594
                    },
                    {
                        unitID: 382,
                        name: "Vårdcentralen Grums",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "664 34",
                        lng: 13.102614402770996,
                        lat: 59.3525505065918
                    },
                    {
                        unitID: 1155,
                        name: "Vårdcentralen Gullviksborg",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "215 50",
                        lng: 13.022882461547852,
                        lat: 55.56808090209961
                    },
                    {
                        unitID: 1353,
                        name: "Vårdcentralen Hansahälsan",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "621 41",
                        lng: 18.313575744628906,
                        lat: 57.64649200439453
                    },
                    {
                        unitID: 115,
                        name: "Vårdcentralen Hemse",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "621 84",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 422,
                        name: "Vårdcentralen Hermes",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "661 33",
                        lng: 12.906096458435059,
                        lat: 59.128055572509766
                    },
                    {
                        unitID: 890,
                        name: "Vårdcentralen Herrhagen",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "652 19",
                        lng: 13.520000457763672,
                        lat: 59.38182067871094
                    },
                    {
                        unitID: 739,
                        name: "Vårdcentralen Hova",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "",
                        lng: 14.212334632873535,
                        lat: 58.857765197753906
                    },
                    {
                        unitID: 1323,
                        name: "Vårdcentralen Husensjö",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 63",
                        lng: 12.726349830627441,
                        lat: 56.049842834472656
                    },
                    {
                        unitID: 1147,
                        name: "Vårdcentralen Husie",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "212 33",
                        lng: 13.067632675170898,
                        lat: 55.58034133911133
                    },
                    {
                        unitID: 1104,
                        name: "Vårdcentralen Husum-Trehörningsjö",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "896 31",
                        lng: 19.165393829345703,
                        lat: 63.33957290649414
                    },
                    {
                        unitID: 188,
                        name: "Vårdcentralen Hyltebruk Unnaryd",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "314 21",
                        lng: 13.239483833312988,
                        lat: 56.994140625
                    },
                    {
                        unitID: 1042,
                        name: "Vårdcentralen Håsten",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "432 13",
                        lng: 12.279626846313477,
                        lat: 57.112003326416016
                    },
                    {
                        unitID: 702,
                        name: "Vårdcentralen Hälsan 1",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "551 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1729,
                        name: "Vårdcentralen Hökarängen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "123 56",
                        lng: 18.081573486328125,
                        lat: 59.2559700012207
                    },
                    {
                        unitID: 1047,
                        name: "Vårdcentralen Hörby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "242 34",
                        lng: 13.672389030456543,
                        lat: 55.84468078613281
                    },
                    {
                        unitID: 959,
                        name: "Vårdcentralen Höör",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "243 30",
                        lng: 13.546882629394531,
                        lat: 55.93136215209961
                    },
                    {
                        unitID: 772,
                        name: "Vårdcentralen i Alvesta",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "342 36",
                        lng: 14.550138473510742,
                        lat: 56.898040771484375
                    },
                    {
                        unitID: 695,
                        name: "Vårdcentralen i Gnesta",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "646 35",
                        lng: 17.30175018310547,
                        lat: 59.04548263549805
                    },
                    {
                        unitID: 1049,
                        name: "Vårdcentralen i Kristinehamn",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "681 80",
                        lng: 14.099649429321289,
                        lat: 59.30531692504883
                    },
                    {
                        unitID: 1338,
                        name: "Vårdcentralen i Skarpnäck",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "128 33",
                        lng: 18.1282958984375,
                        lat: 59.267356872558594
                    },
                    {
                        unitID: 783,
                        name: "Vårdcentralen i Tingsryd",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "362 30",
                        lng: 14.981234550476074,
                        lat: 56.523094177246094
                    },
                    {
                        unitID: 297,
                        name: "Vårdcentralen Ingelstad",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 44",
                        lng: 14.921490669250488,
                        lat: 56.74378967285156
                    },
                    {
                        unitID: 285,
                        name: "Vårdcentralen Johannelund",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "587 27",
                        lng: 15.663063049316406,
                        lat: 58.39559555053711
                    },
                    {
                        unitID: 1542,
                        name: "Vårdcentralen Johannesberg",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "871 31",
                        lng: 17.931684494018555,
                        lat: 62.634986877441406
                    },
                    {
                        unitID: 1202,
                        name: "Vårdcentralen Katten",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "231 45",
                        lng: 13.168237686157227,
                        lat: 55.37240219116211
                    },
                    {
                        unitID: 800,
                        name: "Vårdcentralen Kil",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "665 31",
                        lng: 13.319572448730469,
                        lat: 59.49809646606445
                    },
                    {
                        unitID: 616,
                        name: "Vårdcentralen Kirseberg",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "205 02",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 66,
                        name: "Vårdcentralen Kisa",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "590 36",
                        lng: 15.636576652526855,
                        lat: 57.9930534362793
                    },
                    {
                        unitID: 120,
                        name: "Vårdcentralen Knislinge",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "289 31",
                        lng: 14.08853816986084,
                        lat: 56.192848205566406
                    },
                    {
                        unitID: 1735,
                        name: "Vårdcentralen Kolla",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "434 51",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 701,
                        name: "Vårdcentralen Kramfors",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "872 30",
                        lng: 17.780290603637695,
                        lat: 62.93324279785156
                    },
                    {
                        unitID: 1141,
                        name: "Vårdcentralen Kroksbäck",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "216 24",
                        lng: 12.975590705871582,
                        lat: 55.575828552246094
                    },
                    {
                        unitID: 796,
                        name: "Vårdcentralen Kronan",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "172 31",
                        lng: 17.975481033325195,
                        lat: 59.36113739013672
                    },
                    {
                        unitID: 477,
                        name: "Vårdcentralen Kronoparken",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "656 37",
                        lng: 13.578946113586426,
                        lat: 59.40701675415039
                    },
                    {
                        unitID: 82,
                        name: "Vårdcentralen Kungshögen",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "341 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1443,
                        name: "Vårdcentralen Kurhälsan",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "521 22",
                        lng: 13.554136276245117,
                        lat: 58.16746520996094
                    },
                    {
                        unitID: 710,
                        name: "Vårdcentralen Kusten",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "442 50",
                        lng: 11.922958374023438,
                        lat: 57.861114501953125
                    },
                    {
                        unitID: 1492,
                        name: "Vårdcentralen Kyrkbacken",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "645 30",
                        lng: 17.03408432006836,
                        lat: 59.376731872558594
                    },
                    {
                        unitID: 83,
                        name: "Vårdcentralen Lagan",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "341 50",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 539,
                        name: "Vårdcentralen Lammhult",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 30",
                        lng: 14.591367721557617,
                        lat: 57.16851043701172
                    },
                    {
                        unitID: 1105,
                        name: "Vårdcentralen Laröd",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 86",
                        lng: 12.65699291229248,
                        lat: 56.094303131103516
                    },
                    {
                        unitID: 380,
                        name: "Vårdcentralen Laxen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "263 64",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 555,
                        name: "Vårdcentralen Lenhovda",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 73",
                        lng: 15.28503131866455,
                        lat: 57.00095748901367
                    },
                    {
                        unitID: 537,
                        name: "Vårdcentralen Lessebo",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 50",
                        lng: 15.270179748535156,
                        lat: 56.752437591552734
                    },
                    {
                        unitID: 633,
                        name: "Vårdcentralen Lidhult",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "340 10",
                        lng: 13.437787055969238,
                        lat: 56.82772445678711
                    },
                    {
                        unitID: 355,
                        name: "Vårdcentralen Likenäs",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "680 63",
                        lng: 13.043821334838867,
                        lat: 60.61173629760742
                    },
                    {
                        unitID: 1450,
                        name: "Vårdcentralen Limhamn",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "216 14",
                        lng: 12.931736946105957,
                        lat: 55.58125305175781
                    },
                    {
                        unitID: 1169,
                        name: "Vårdcentralen Lindeborg",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "215 85",
                        lng: 12.991044998168945,
                        lat: 55.562469482421875
                    },
                    {
                        unitID: 676,
                        name: "Vårdcentralen Linden",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "641 22",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1093,
                        name: "Vårdcentralen Linden",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "542 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 171,
                        name: "Vårdcentralen Linero",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "224 76",
                        lng: 13.242339134216309,
                        lat: 55.694759368896484
                    },
                    {
                        unitID: 1149,
                        name: "Vårdcentralen Ljungbyhed",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "260 70",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1524,
                        name: "Vårdcentralen Lokstallarna",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "553 11",
                        lng: 14.15086841583252,
                        lat: 57.78776168823242
                    },
                    {
                        unitID: 172,
                        name: "Vårdcentralen Lomma",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "234 34",
                        lng: 13.070089340209961,
                        lat: 55.67462158203125
                    },
                    {
                        unitID: 1145,
                        name: "Vårdcentralen Lundbergsgatan",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "215 51",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1152,
                        name: "Vårdcentralen Lunden",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "214 44",
                        lng: 13.021456718444824,
                        lat: 55.588443756103516
                    },
                    {
                        unitID: 1478,
                        name: "Vårdcentralen Läkarhuset",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "400 15",
                        lng: 11.978589057922363,
                        lat: 57.69994354248047
                    },
                    {
                        unitID: 155,
                        name: "Vårdcentralen Löddeköpinge",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "246 30",
                        lng: 13.01600456237793,
                        lat: 55.75986099243164
                    },
                    {
                        unitID: 81,
                        name: "Vårdcentralen Markaryd",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "285 36",
                        lng: 13.614863395690918,
                        lat: 56.46071243286133
                    },
                    {
                        unitID: 1462,
                        name: "Vårdcentralen Medicinskt Centrum",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "602 32",
                        lng: 16.188756942749023,
                        lat: 58.58706283569336
                    },
                    {
                        unitID: 453,
                        name: "Vårdcentralen Mjölby",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "595 30",
                        lng: 15.123534202575684,
                        lat: 58.324466705322266
                    },
                    {
                        unitID: 542,
                        name: "Vårdcentralen Moheda",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "342 60",
                        lng: 14.574329376220703,
                        lat: 57.00058364868164
                    },
                    {
                        unitID: 496,
                        name: "Vårdcentralen Munka Ljungby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "266 33",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 833,
                        name: "Vårdcentralen Munkfors",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "684 23",
                        lng: 13.542947769165039,
                        lat: 59.83201599121094
                    },
                    {
                        unitID: 842,
                        name: "Vårdcentralen Måsen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "227 32",
                        lng: 13.174890518188477,
                        lat: 55.706024169921875
                    },
                    {
                        unitID: 1436,
                        name: "Vårdcentralen Nordstan",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "462 30",
                        lng: 12.323134422302246,
                        lat: 58.38302230834961
                    },
                    {
                        unitID: 1737,
                        name: "Vårdcentralen Norrahamn",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "972 31",
                        lng: 22.15459442138672,
                        lat: 65.5858383178711
                    },
                    {
                        unitID: 435,
                        name: "Vårdcentralen Nybble",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "681 92",
                        lng: 14.160964965820312,
                        lat: 59.100013732910156
                    },
                    {
                        unitID: 427,
                        name: "Vårdcentralen Nygatan",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "582 19",
                        lng: 15.620945930480957,
                        lat: 58.409576416015625
                    },
                    {
                        unitID: 1531,
                        name: "Vårdcentralen Nyhälsan",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "571 38",
                        lng: 14.705629348754883,
                        lat: 57.64908981323242
                    },
                    {
                        unitID: 1080,
                        name: "Vårdcentralen Nyland",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "870 52",
                        lng: 17.764556884765625,
                        lat: 63.00607681274414
                    },
                    {
                        unitID: 1195,
                        name: "Vårdcentralen Närlunda",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 75",
                        lng: 12.719636917114258,
                        lat: 56.03221130371094
                    },
                    {
                        unitID: 128,
                        name: "Vårdcentralen Näsby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "291 38",
                        lng: 14.163334846496582,
                        lat: 56.059505462646484
                    },
                    {
                        unitID: 546,
                        name: "Vårdcentralen Nävertorp",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "641 50",
                        lng: 16.183534622192383,
                        lat: 58.98408889770508
                    },
                    {
                        unitID: 146,
                        name: "Vårdcentralen Nöbbelöv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "226 52",
                        lng: 13.17730712890625,
                        lat: 55.72809600830078
                    },
                    {
                        unitID: 1019,
                        name: "Vårdcentralen Olofström",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "293 32",
                        lng: 14.539450645446777,
                        lat: 56.27785110473633
                    },
                    {
                        unitID: 123,
                        name: "Vårdcentralen Osby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "283 42",
                        lng: 14.008875846862793,
                        lat: 56.38276290893555
                    },
                    {
                        unitID: 1096,
                        name: "Vårdcentralen Oskarström",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "313 32",
                        lng: 12.961090087890625,
                        lat: 56.81151580810547
                    },
                    {
                        unitID: 942,
                        name: "Vårdcentralen Oxie",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "238 40",
                        lng: 13.095532417297363,
                        lat: 55.5390625
                    },
                    {
                        unitID: 136,
                        name: "Vårdcentralen Perstorp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "284 32",
                        lng: 13.400598526000977,
                        lat: 56.137977600097656
                    },
                    {
                        unitID: 1388,
                        name: "Vårdcentralen Planteringen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 28",
                        lng: 12.709425926208496,
                        lat: 56.028446197509766
                    },
                    {
                        unitID: 608,
                        name: "Vårdcentralen Påarp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "260 33",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1138,
                        name: "Vårdcentralen Rosengården",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "213 73",
                        lng: 13.048739433288574,
                        lat: 55.586143493652344
                    },
                    {
                        unitID: 550,
                        name: "Vårdcentralen Rottne",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "363 30",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 928,
                        name: "Vårdcentralen Rud",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "654 66",
                        lng: 13.522019386291504,
                        lat: 59.4067497253418
                    },
                    {
                        unitID: 632,
                        name: "Vårdcentralen Ryd",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 10",
                        lng: 14.693042755126953,
                        lat: 56.465118408203125
                    },
                    {
                        unitID: 1269,
                        name: "Vårdcentralen Rydebäck",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "257 30",
                        lng: 12.775015830993652,
                        lat: 55.96601104736328
                    },
                    {
                        unitID: 1257,
                        name: "Vårdcentralen Råå",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "252 70",
                        lng: 12.732219696044922,
                        lat: 56.003692626953125
                    },
                    {
                        unitID: 161,
                        name: "Vårdcentralen Sankt Lars",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "221 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1115,
                        name: "Vårdcentralen Silentzvägen",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "451 50",
                        lng: 11.928010940551758,
                        lat: 58.35318374633789
                    },
                    {
                        unitID: 1120,
                        name: "Vårdcentralen Själevad",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "894 30",
                        lng: 18.61773109436035,
                        lat: 63.2918815612793
                    },
                    {
                        unitID: 150,
                        name: "Vårdcentralen Sjöbo",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "275 31",
                        lng: 13.700801849365234,
                        lat: 55.626182556152344
                    },
                    {
                        unitID: 603,
                        name: "Vårdcentralen Sjöcrona",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "263 36",
                        lng: 12.578908920288086,
                        lat: 56.19479751586914
                    },
                    {
                        unitID: 360,
                        name: "Vårdcentralen Skoghall Lövnäs",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "663 30",
                        lng: 13.464421272277832,
                        lat: 59.32484436035156
                    },
                    {
                        unitID: 147,
                        name: "Vårdcentralen Skurup",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "274 24",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 834,
                        name: "Vårdcentralen Skåre",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "650 08",
                        lng: 13.439169883728027,
                        lat: 59.43644332885742
                    },
                    {
                        unitID: 457,
                        name: "Vårdcentralen Skäggetorp",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "586 44",
                        lng: 15.583895683288574,
                        lat: 58.42765426635742
                    },
                    {
                        unitID: 84,
                        name: "Vårdcentralen Sländan",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "341 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1024,
                        name: "Vårdcentralen Slöinge",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "311 68",
                        lng: 12.684009552001953,
                        lat: 56.855735778808594
                    },
                    {
                        unitID: 1486,
                        name: "Vårdcentralen Smeden",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "632 21",
                        lng: 16.49972152709961,
                        lat: 59.378517150878906
                    },
                    {
                        unitID: 1511,
                        name: "Vårdcentralen Sorgenfrimottagningen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "214 33",
                        lng: 13.021199226379395,
                        lat: 55.59445571899414
                    },
                    {
                        unitID: 1180,
                        name: "Vårdcentralen Stadsfjärden",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "611 31",
                        lng: 17.012704849243164,
                        lat: 58.745025634765625
                    },
                    {
                        unitID: 153,
                        name: "Vårdcentralen Staffanstorp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "245 31",
                        lng: 13.206683158874512,
                        lat: 55.64143371582031
                    },
                    {
                        unitID: 337,
                        name: "Vårdcentralen Storfors",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "688 30",
                        lng: 14.276598930358887,
                        lat: 59.5317497253418
                    },
                    {
                        unitID: 729,
                        name: "Vårdcentralen Strandbjörket",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "351 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 61,
                        name: "Vårdcentralen Strängnäs",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "645 25",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 85,
                        name: "Vårdcentralen Strömsnäsbruk",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "287 32",
                        lng: 13.73689079284668,
                        lat: 56.54376220703125
                    },
                    {
                        unitID: 432,
                        name: "Vårdcentralen Sunne",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "686 22",
                        lng: 13.140779495239258,
                        lat: 59.843719482421875
                    },
                    {
                        unitID: 1053,
                        name: "Vårdcentralen Svalöv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "268 31",
                        lng: 13.107637405395508,
                        lat: 55.9130859375
                    },
                    {
                        unitID: 1504,
                        name: "Vårdcentralen Svea",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "661 40",
                        lng: 12.933780670166016,
                        lat: 59.13614273071289
                    },
                    {
                        unitID: 868,
                        name: "Vårdcentralen SöderDoktorn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "118 50",
                        lng: 18.057701110839844,
                        lat: 59.31612014770508
                    },
                    {
                        unitID: 566,
                        name: "Vårdcentralen Söderköping",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "614 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 167,
                        name: "Vårdcentralen Södertull",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "221 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 351,
                        name: "Vårdcentralen Söderväg",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "621 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 501,
                        name: "Vårdcentralen Söderåsen Bjuv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "267 38",
                        lng: 12.921989440917969,
                        lat: 56.0788688659668
                    },
                    {
                        unitID: 158,
                        name: "Vårdcentralen Södra Sandby",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "247 31",
                        lng: 13.343250274658203,
                        lat: 55.71696472167969
                    },
                    {
                        unitID: 964,
                        name: "Vårdcentralen Södra Sundet",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "871 82",
                        lng: 17.92983627319336,
                        lat: 62.62440490722656
                    },
                    {
                        unitID: 298,
                        name: "Vårdcentralen Sösdala",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "280 10",
                        lng: 13.680084228515625,
                        lat: 56.03766632080078
                    },
                    {
                        unitID: 350,
                        name: "Vårdcentralen Teleborg",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "352 51",
                        lng: 14.819273948669434,
                        lat: 56.85808563232422
                    },
                    {
                        unitID: 137,
                        name: "Vårdcentralen Tollarp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "290 10",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 797,
                        name: "Vårdcentralen Tomelilla",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "273 35",
                        lng: 13.945324897766113,
                        lat: 55.54682540893555
                    },
                    {
                        unitID: 165,
                        name: "Vårdcentralen Tornet",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "261 45",
                        lng: 12.824969291687012,
                        lat: 55.88846969604492
                    },
                    {
                        unitID: 57,
                        name: "Vårdcentralen Torshälla",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "644 30",
                        lng: 16.48555564880371,
                        lat: 59.41960525512695
                    },
                    {
                        unitID: 1300,
                        name: "Vårdcentralen Torup",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "314 41",
                        lng: 13.077733993530273,
                        lat: 56.956199645996094
                    },
                    {
                        unitID: 1033,
                        name: "Vårdcentralen Tvååker-Himledalen",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "432 78",
                        lng: 12.407806396484375,
                        lat: 57.042137145996094
                    },
                    {
                        unitID: 1255,
                        name: "Vårdcentralen Tågaborg",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "254 39",
                        lng: 12.690649032592773,
                        lat: 56.05580139160156
                    },
                    {
                        unitID: 1150,
                        name: "Vårdcentralen Törnrosen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "213 67",
                        lng: 13.03433895111084,
                        lat: 55.58744812011719
                    },
                    {
                        unitID: 952,
                        name: "Vårdcentralen Ullared",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "310 60",
                        lng: 12.719856262207031,
                        lat: 57.134979248046875
                    },
                    {
                        unitID: 456,
                        name: "Vårdcentralen Valla",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "582 16",
                        lng: 15.604052543640137,
                        lat: 58.402645111083984
                    },
                    {
                        unitID: 1026,
                        name: "Vårdcentralen Veddige",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "430 20",
                        lng: 12.322507858276367,
                        lat: 57.26424789428711
                    },
                    {
                        unitID: 582,
                        name: "Vårdcentralen Verkstaden",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "671 26",
                        lng: 12.601333618164062,
                        lat: 59.65436935424805
                    },
                    {
                        unitID: 893,
                        name: "Vårdcentralen Vessigebro",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "311 64",
                        lng: 12.645622253417969,
                        lat: 56.97701644897461
                    },
                    {
                        unitID: 436,
                        name: "Vårdcentralen Vikbolandet",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "610 24",
                        lng: 16.565547943115234,
                        lat: 58.57537078857422
                    },
                    {
                        unitID: 132,
                        name: "Vårdcentralen Vilan",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "291 59",
                        lng: 14.141037940979004,
                        lat: 56.01895523071289
                    },
                    {
                        unitID: 1463,
                        name: "Vårdcentralen Vilan",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "532 21",
                        lng: 13.454434394836426,
                        lat: 58.3859977722168
                    },
                    {
                        unitID: 122,
                        name: "Vårdcentralen Vinslöv",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "288 32",
                        lng: 13.909187316894531,
                        lat: 56.09468078613281
                    },
                    {
                        unitID: 1349,
                        name: "Vårdcentralen Visborg",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "621 50",
                        lng: 18.282878875732422,
                        lat: 57.61184310913086
                    },
                    {
                        unitID: 724,
                        name: "Vårdcentralen Visby Norr",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "621 84",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 114,
                        name: "Vårdcentralen Wisby Söder",
                        countyCode: 9,
                        typeID: 1,
                        postalCode: "621 84",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 763,
                        name: "Vårdcentralen Vislanda",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "342 50",
                        lng: 14.450196266174316,
                        lat: 56.78650665283203
                    },
                    {
                        unitID: 138,
                        name: "Vårdcentralen Vittsjö",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "280 22",
                        lng: 13.661188125610352,
                        lat: 56.3433837890625
                    },
                    {
                        unitID: 121,
                        name: "Vårdcentralen Vä",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "291 65",
                        lng: 14.094953536987305,
                        lat: 56.00102233886719
                    },
                    {
                        unitID: 299,
                        name: "Vårdcentralen Vänhem",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "281 31",
                        lng: 13.765256881713867,
                        lat: 56.158050537109375
                    },
                    {
                        unitID: 875,
                        name: "Vårdcentralen Västerstrand",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "650 02",
                        lng: 13.464495658874512,
                        lat: 59.38579559326172
                    },
                    {
                        unitID: 1051,
                        name: "Vårdcentralen Västra Vall",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "432 44",
                        lng: 12.247845649719238,
                        lat: 57.10359191894531
                    },
                    {
                        unitID: 173,
                        name: "Vårdcentralen Ystad",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "271 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 125,
                        name: "Vårdcentralen Åhus",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "296 35",
                        lng: 14.28571891784668,
                        lat: 55.928741455078125
                    },
                    {
                        unitID: 130,
                        name: "Vårdcentralen Åparken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "282 23",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 951,
                        name: "Vårdcentralen Årjäng",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "672 30",
                        lng: 12.131332397460938,
                        lat: 59.38894271850586
                    },
                    {
                        unitID: 556,
                        name: "Vårdcentralen Åseda",
                        countyCode: 7,
                        typeID: 1,
                        postalCode: "360 70",
                        lng: 15.34490966796875,
                        lat: 57.170867919921875
                    },
                    {
                        unitID: 945,
                        name: "Vårdcentralen Åsidan",
                        countyCode: 4,
                        typeID: 1,
                        postalCode: "611 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 860,
                        name: "Vårdcentralen Åstorp",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "265 34",
                        lng: 12.944550514221191,
                        lat: 56.13563537597656
                    },
                    {
                        unitID: 1594,
                        name: "Vårdcentralen Åttkanten",
                        countyCode: 17,
                        typeID: 1,
                        postalCode: "652 10",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 533,
                        name: "Vårdcentralen Örkelljunga",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "286 31",
                        lng: 13.27890396118164,
                        lat: 56.28428649902344
                    },
                    {
                        unitID: 134,
                        name: "Vårdcentralen Östermalm",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "291 33",
                        lng: 14.1634521484375,
                        lat: 56.03041076660156
                    },
                    {
                        unitID: 69,
                        name: "Vårdcentralen Östertull",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "601 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1294,
                        name: "Vårdcentralen Östervåla",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "740 46",
                        lng: 17.186296463012695,
                        lat: 60.18214416503906
                    },
                    {
                        unitID: 1373,
                        name: "Vården i Centrum",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "181 32",
                        lng: 18.1368465423584,
                        lat: 59.365455627441406
                    },
                    {
                        unitID: 1685,
                        name: "Vårdhuset Malmö city",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "211 38",
                        lng: 13.002486228942871,
                        lat: 55.60245132446289
                    },
                    {
                        unitID: 1706,
                        name: "Vårdkliniken i Ängelholm",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "262 32",
                        lng: 12.862523078918457,
                        lat: 56.24258804321289
                    },
                    {
                        unitID: 1460,
                        name: "Väddö VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "760 40",
                        lng: 18.806636810302734,
                        lat: 59.971832275390625
                    },
                    {
                        unitID: 626,
                        name: "Vällingby Läkarhus",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "162 68",
                        lng: 17.871545791625977,
                        lat: 59.36404800415039
                    },
                    {
                        unitID: 567,
                        name: "Wämö Vårdcentral",
                        countyCode: 10,
                        typeID: 1,
                        postalCode: "371 85",
                        lng: 15.601673126220703,
                        lat: 56.181968688964844
                    },
                    {
                        unitID: 867,
                        name: "Vännäs HC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "911 82",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1472,
                        name: "Värmdö VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "134 44",
                        lng: 18.431690216064453,
                        lat: 59.31269454956055
                    },
                    {
                        unitID: 79,
                        name: "Värnamo sjukhus",
                        countyCode: 6,
                        typeID: 2,
                        postalCode: "331 85",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1679,
                        name: "Väsby Läkargrupp Husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "194 61",
                        lng: 17.92749786376953,
                        lat: 59.49742889404297
                    },
                    {
                        unitID: 296,
                        name: "Väster VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "331 85",
                        lng: 14.027059555053711,
                        lat: 57.173789978027344
                    },
                    {
                        unitID: 1551,
                        name: "Västerleden Vårdcentral - Grimmered",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "421 42",
                        lng: 11.898564338684082,
                        lat: 57.66054916381836
                    },
                    {
                        unitID: 1726,
                        name: "Västerleden Vårdcentral och BVC - Frölunda Torg",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "421 42",
                        lng: 11.913143157958984,
                        lat: 57.65298080444336
                    },
                    {
                        unitID: 955,
                        name: "Wästerläkarna",
                        countyCode: 14,
                        typeID: 1,
                        postalCode: "426 77",
                        lng: 11.879073143005371,
                        lat: 57.67097091674805
                    },
                    {
                        unitID: 849,
                        name: "Västerviks sjukhus",
                        countyCode: 8,
                        typeID: 2,
                        postalCode: "593 81",
                        lng: 16.636394500732422,
                        lat: 57.75533676147461
                    },
                    {
                        unitID: 1271,
                        name: "Västervårdens Husläkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "162 68",
                        lng: 17.870948791503906,
                        lat: 59.364463806152344
                    },
                    {
                        unitID: 379,
                        name: "Västmanlands sjukhus",
                        countyCode: 19,
                        typeID: 2,
                        postalCode: "721 89",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 534,
                        name: "Västmanlands sjukhus Köping",
                        countyCode: 19,
                        typeID: 2,
                        postalCode: "731 81",
                        lng: 16.00267791748047,
                        lat: 59.50910568237305
                    },
                    {
                        unitID: 774,
                        name: "Västmanlands sjukhus Sala",
                        countyCode: 19,
                        typeID: 2,
                        postalCode: "733 38",
                        lng: 16.60199737548828,
                        lat: 59.92430114746094
                    },
                    {
                        unitID: 678,
                        name: "Västra Skogens VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "171 57",
                        lng: 17.99524688720703,
                        lat: 59.34957504272461
                    },
                    {
                        unitID: 363,
                        name: "Åby VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "616 30",
                        lng: 16.181991577148438,
                        lat: 58.66547775268555
                    },
                    {
                        unitID: 910,
                        name: "Åbågens Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "732 45",
                        lng: 15.835070610046387,
                        lat: 59.39078903198242
                    },
                    {
                        unitID: 1571,
                        name: "Åkermyntans VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "16575",
                        lng: 17.816415786743164,
                        lat: 59.38075637817383
                    },
                    {
                        unitID: 504,
                        name: "Ålidhems VC",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "907 36",
                        lng: 20.316741943359375,
                        lat: 63.81499481201172
                    },
                    {
                        unitID: 997,
                        name: "Ånge VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "841 32",
                        lng: 15.661994934082031,
                        lat: 62.52449417114258
                    },
                    {
                        unitID: 42,
                        name: "Årsta husläkarmottagning",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "751 85",
                        lng: 17.68353271484375,
                        lat: 59.865779876708984
                    },
                    {
                        unitID: 186,
                        name: "Åsa VC",
                        countyCode: 13,
                        typeID: 1,
                        postalCode: "439 54",
                        lng: 12.108338356018066,
                        lat: 57.35375213623047
                    },
                    {
                        unitID: 870,
                        name: "Åsele Sjukstuga",
                        countyCode: 24,
                        typeID: 1,
                        postalCode: "910 60",
                        lng: 17.359115600585938,
                        lat: 64.16117095947266
                    },
                    {
                        unitID: 615,
                        name: "Åsö VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "116 32",
                        lng: 18.08338737487793,
                        lat: 59.31406784057617
                    },
                    {
                        unitID: 465,
                        name: "Åtvidabergs VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "597 43",
                        lng: 16.01238250732422,
                        lat: 58.189579010009766
                    },
                    {
                        unitID: 1197,
                        name: "Äldrevårdscentralen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "169 32",
                        lng: 17.982120513916016,
                        lat: 59.363128662109375
                    },
                    {
                        unitID: 561,
                        name: "Ältapraktiken",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "138 21",
                        lng: 18.176288604736328,
                        lat: 59.256221771240234
                    },
                    {
                        unitID: 948,
                        name: "Älvsbyns HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "942 21",
                        lng: 21.013700485229492,
                        lat: 65.66915893554688
                    },
                    {
                        unitID: 1346,
                        name: "Älvsjö Vårdcentral",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "125 44",
                        lng: 18.00948715209961,
                        lat: 59.27980422973633
                    },
                    {
                        unitID: 358,
                        name: "Ängelholms sjukhus",
                        countyCode: 12,
                        typeID: 2,
                        postalCode: "262 81",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1617,
                        name: "Ängens Vårdcentral",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "702 26",
                        lng: 15.204602241516113,
                        lat: 59.256893157958984
                    },
                    {
                        unitID: 1221,
                        name: "Ängsgårdens Vårdcentral",
                        countyCode: 19,
                        typeID: 1,
                        postalCode: "735 22",
                        lng: 16.23783302307129,
                        lat: 59.71302032470703
                    },
                    {
                        unitID: 1275,
                        name: "Äppelvikens läkarmottagning",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "167 53",
                        lng: 17.974384307861328,
                        lat: 59.32877731323242
                    },
                    {
                        unitID: 1520,
                        name: "Öbacka VC",
                        countyCode: 22,
                        typeID: 1,
                        postalCode: "871 60",
                        lng: 17.95758056640625,
                        lat: 62.632022857666016
                    },
                    {
                        unitID: 466,
                        name: "Ödeshögs VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "599 31",
                        lng: 14.649825096130371,
                        lat: 58.228111267089844
                    },
                    {
                        unitID: 1382,
                        name: "Ödåkra Läkargrupp AB",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "254 67",
                        lng: 12.737763404846191,
                        lat: 56.086097717285156
                    },
                    {
                        unitID: 1173,
                        name: "Öjebyns HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "943 21",
                        lng: 21.410860061645508,
                        lat: 65.34762573242188
                    },
                    {
                        unitID: 45,
                        name: "Öregrunds VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "742 42",
                        lng: 18.440608978271484,
                        lat: 60.340301513671875
                    },
                    {
                        unitID: 1501,
                        name: "Örestadskliniken",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "217 67",
                        lng: 12.971797943115234,
                        lat: 55.58517837524414
                    },
                    {
                        unitID: 259,
                        name: "Örnsköldsviks sjukhus",
                        countyCode: 22,
                        typeID: 2,
                        postalCode: "891 89",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1367,
                        name: "Örnäsets HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "974 32",
                        lng: 22.198251724243164,
                        lat: 65.58222961425781
                    },
                    {
                        unitID: 28,
                        name: "Örsundsbro VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "749 60",
                        lng: 17.307849884033203,
                        lat: 59.73165512084961
                    },
                    {
                        unitID: 767,
                        name: "Ösmo VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "148 30",
                        lng: 17.899433135986328,
                        lat: 58.98345947265625
                    },
                    {
                        unitID: 46,
                        name: "Österbybruks VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "748 31",
                        lng: 17.89207649230957,
                        lat: 60.19829559326172
                    },
                    {
                        unitID: 467,
                        name: "Österbymo VC",
                        countyCode: 5,
                        typeID: 1,
                        postalCode: "570 60",
                        lng: 15.276615142822266,
                        lat: 57.82522964477539
                    },
                    {
                        unitID: 940,
                        name: "Östermalms VC",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "115 41",
                        lng: 18.111679077148438,
                        lat: 59.34870529174805
                    },
                    {
                        unitID: 869,
                        name: "Österpraktiken AB",
                        countyCode: 18,
                        typeID: 1,
                        postalCode: "703 62",
                        lng: 15.225686073303223,
                        lat: 59.27555847167969
                    },
                    {
                        unitID: 282,
                        name: "Östersunds sjukhus",
                        countyCode: 23,
                        typeID: 2,
                        postalCode: "831 83",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1263,
                        name: "Österåkers Doktorn",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "184 31",
                        lng: 18.301389694213867,
                        lat: 59.486083984375
                    },
                    {
                        unitID: 47,
                        name: "Östhammars VC",
                        countyCode: 3,
                        typeID: 1,
                        postalCode: "742 21",
                        lng: 18.3649959564209,
                        lat: 60.25709915161133
                    },
                    {
                        unitID: 133,
                        name: "Östra Läkargruppen",
                        countyCode: 12,
                        typeID: 1,
                        postalCode: "291 54",
                        lng: 14.17933464050293,
                        lat: 56.02897262573242
                    },
                    {
                        unitID: 856,
                        name: "Östra vårdcentralen",
                        countyCode: 1,
                        typeID: 1,
                        postalCode: "194 89",
                        lng: null,
                        lat: null
                    },
                    {
                        unitID: 1139,
                        name: "Överkalix HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "956 32",
                        lng: 22.848487854003906,
                        lat: 66.33876037597656
                    },
                    {
                        unitID: 1140,
                        name: "Övertorneå HC",
                        countyCode: 25,
                        typeID: 1,
                        postalCode: "957 31",
                        lng: 16.86975860595703,
                        lat: 63.244930267333984
                    },
                    {
                        unitID: 762,
                        name: "Öxnehaga VC",
                        countyCode: 6,
                        typeID: 1,
                        postalCode: "561 50",
                        lng: 14.265422821044922,
                        lat: 57.77473449707031
                    }
                ];
                
                var indicators = {
                    all: [
                        {
                            threshold: 50,
                            id: 101,
                            name: "HbA1c",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 102,
                            name: "BMI",
                            indicatorType: 2,
                            unit: "kg/längd²",
                            asc: true,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 103,
                            name: "LDL",
                            indicatorType: 2,
                            unit: "mmol/l",
                            asc: true,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 104,
                            name: "Kolesterol",
                            indicatorType: 2,
                            unit: "mmol/l",
                            asc: true,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 105,
                            name: "Blodtryck, systoliskt",
                            indicatorType: 2,
                            unit: "mm Hg",
                            asc: true,
                            sortOrder: 20,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 106,
                            name: "Blodtryck, diastoliskt",
                            indicatorType: 2,
                            unit: "mm Hg",
                            asc: true,
                            sortOrder: 21,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 201,
                            name: "HbA1c <52",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 202,
                            name: "Rökare",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 203,
                            name: "Fotundersökning senaste året",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 204,
                            name: "HbA1c >73",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 11,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 205,
                            name: "Blodtryck <130/80",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 20,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 206,
                            name: "Blodtryck <140/80",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 22,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 207,
                            name: "Blodtryck ≤130/80",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 21,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 208,
                            name: "Blodtryck ≤140/80",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 23,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 209,
                            name: "LDL <2,5",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 210,
                            name: "Kolesterol <4,5",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 211,
                            name: "Förekomst av albuminuri",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 212,
                            name: "Ögonbottenundersökning inom 2 år",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 213,
                            name: "Ögonbottenundersökning inom 3 år",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 214,
                            name: "Lipidsänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 215,
                            name: "Blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 216,
                            name: "Förekomst av diabetesretinopati",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 217,
                            name: "BMI <35",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 218,
                            name: "Systoliskt blodtryck <150",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 25,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 219,
                            name: "Andel fysiskt inaktiva",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 220,
                            name: "HbA1c <50",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 221,
                            name: "HbA1c >70",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 15,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 222,
                            name: "Blodtryck <140/85",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 24,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 223,
                            name: "Genomförd ögonundersökning enligt riktlinjer",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: "Genomförd ögonbottenbottenundersökning Inom 2 år för diabetes typ 1. Inom 3 år för övriga."
                        },
                        {
                            threshold: 50,
                            id: 224,
                            name: "Insulinbehandlade med insulinpump",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 301,
                            name: "HbA1c",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 302,
                            name: "LDL",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 303,
                            name: "Blodtryck",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 20,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 304,
                            name: "Kolesterol",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 305,
                            name: "BMI",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 306,
                            name: "Diabetesbehandling",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 307,
                            name: "Fotundersökning senaste året",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 308,
                            name: "Rökare",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 309,
                            name: "Fysisk aktivitet",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 310,
                            name: "Blodtryckssänkande behandling",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 311,
                            name: "Lipidsänkande läkemedel",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 312,
                            name: "Datum för ögonbottenundersökning",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 313,
                            name: "Albuminuri",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 314,
                            name: "Diabetesretinopati",
                            indicatorType: 3,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 1019,
                            name: "HbA1c, kostbehandlade",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 1020,
                            name: "HbA1c, tablettbehandlade",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 1021,
                            name: "HbA1c, insulinbehandlade",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 1022,
                            name: "HbA1c, tablett- och insulinbehandlade",
                            indicatorType: 2,
                            unit: "mmol/mol",
                            asc: true,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2003,
                            name: "Blodtryck <130/80, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 22,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2004,
                            name: "Blodtryck ≤130/80, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 22,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2005,
                            name: "Blodtryck <140/80, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 23,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2006,
                            name: "Blodtryck ≤140/80, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 23,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2007,
                            name: "Blodtryck <140/85, blodtryckssänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 23,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2010,
                            name: "LDL <2,5, lipidsänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2011,
                            name: "Kolesterol <4,5, lipidsänkande läkemedel",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 255,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2013,
                            name: "HbA1c <52, kostbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2014,
                            name: "HbA1c <50, kostbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 12,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2015,
                            name: "HbA1c >73, kostbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 11,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2016,
                            name: "HbA1c >70, kostbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 13,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2017,
                            name: "HbA1c <52, tablettbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2018,
                            name: "HbA1c <50, tablettbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 12,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2019,
                            name: "HbA1c >73, tablettbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 11,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2020,
                            name: "HbA1c >70, tablettbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 13,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2021,
                            name: "HbA1c <52, insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2022,
                            name: "HbA1c <50, insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 12,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2023,
                            name: "HbA1c >73, insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 11,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2024,
                            name: "HbA1c >70, insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 13,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2025,
                            name: "HbA1c <52, tablett- och insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 10,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2026,
                            name: "HbA1c <50, tablett- och insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: false,
                            sortOrder: 12,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2027,
                            name: "HbA1c >73, tablett- och insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 11,
                            description: null
                        },
                        {
                            threshold: 50,
                            id: 2028,
                            name: "HbA1c >70, tablett- och insulinbehandlade",
                            indicatorType: 1,
                            unit: "Andel %",
                            asc: true,
                            sortOrder: 13,
                            description: null
                        }
                    ],
                    byType: {
                        mean: [
                            {
                                threshold: 50,
                                id: 101,
                                name: "HbA1c",
                                indicatorType: 2,
                                unit: "mmol/mol",
                                asc: true,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 102,
                                name: "BMI",
                                indicatorType: 2,
                                unit: "kg/längd²",
                                asc: true,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 103,
                                name: "LDL",
                                indicatorType: 2,
                                unit: "mmol/l",
                                asc: true,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 104,
                                name: "Kolesterol",
                                indicatorType: 2,
                                unit: "mmol/l",
                                asc: true,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 105,
                                name: "Blodtryck, systoliskt",
                                indicatorType: 2,
                                unit: "mm Hg",
                                asc: true,
                                sortOrder: 20,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 106,
                                name: "Blodtryck, diastoliskt",
                                indicatorType: 2,
                                unit: "mm Hg",
                                asc: true,
                                sortOrder: 21,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 1019,
                                name: "HbA1c, kostbehandlade",
                                indicatorType: 2,
                                unit: "mmol/mol",
                                asc: true,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 1020,
                                name: "HbA1c, tablettbehandlade",
                                indicatorType: 2,
                                unit: "mmol/mol",
                                asc: true,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 1021,
                                name: "HbA1c, insulinbehandlade",
                                indicatorType: 2,
                                unit: "mmol/mol",
                                asc: true,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 1022,
                                name: "HbA1c, tablett- och insulinbehandlade",
                                indicatorType: 2,
                                unit: "mmol/mol",
                                asc: true,
                                sortOrder: 10,
                                description: null
                            }
                        ],
                        reported: [
                            {
                                threshold: 50,
                                id: 301,
                                name: "HbA1c",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 302,
                                name: "LDL",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 303,
                                name: "Blodtryck",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 20,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 304,
                                name: "Kolesterol",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 305,
                                name: "BMI",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 306,
                                name: "Diabetesbehandling",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 307,
                                name: "Fotundersökning senaste året",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 308,
                                name: "Rökare",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 309,
                                name: "Fysisk aktivitet",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 310,
                                name: "Blodtryckssänkande behandling",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 311,
                                name: "Lipidsänkande läkemedel",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 312,
                                name: "Datum för ögonbottenundersökning",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 313,
                                name: "Albuminuri",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 314,
                                name: "Diabetesretinopati",
                                indicatorType: 3,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            }
                        ],
                        target: [
                            {
                                threshold: 50,
                                id: 201,
                                name: "HbA1c <52",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 202,
                                name: "Rökare",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 203,
                                name: "Fotundersökning senaste året",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 204,
                                name: "HbA1c >73",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 11,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 205,
                                name: "Blodtryck <130/80",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 20,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 206,
                                name: "Blodtryck <140/80",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 22,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 207,
                                name: "Blodtryck ≤130/80",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 21,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 208,
                                name: "Blodtryck ≤140/80",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 23,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 209,
                                name: "LDL <2,5",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 210,
                                name: "Kolesterol <4,5",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 211,
                                name: "Förekomst av albuminuri",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 212,
                                name: "Ögonbottenundersökning inom 2 år",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 213,
                                name: "Ögonbottenundersökning inom 3 år",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 214,
                                name: "Lipidsänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 215,
                                name: "Blodtryckssänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 216,
                                name: "Förekomst av diabetesretinopati",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 217,
                                name: "BMI <35",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 218,
                                name: "Systoliskt blodtryck <150",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 25,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 219,
                                name: "Andel fysiskt inaktiva",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 220,
                                name: "HbA1c <50",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 221,
                                name: "HbA1c >70",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 15,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 222,
                                name: "Blodtryck <140/85",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 24,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 223,
                                name: "Genomförd ögonundersökning enligt riktlinjer",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: "Genomförd ögonbottenbottenundersökning Inom 2 år för diabetes typ 1. Inom 3 år för övriga."
                            },
                            {
                                threshold: 50,
                                id: 224,
                                name: "Insulinbehandlade med insulinpump",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2003,
                                name: "Blodtryck <130/80, blodtryckssänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 22,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2004,
                                name: "Blodtryck ≤130/80, blodtryckssänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 22,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2005,
                                name: "Blodtryck <140/80, blodtryckssänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 23,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2006,
                                name: "Blodtryck ≤140/80, blodtryckssänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 23,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2007,
                                name: "Blodtryck <140/85, blodtryckssänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 23,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2010,
                                name: "LDL <2,5, lipidsänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2011,
                                name: "Kolesterol <4,5, lipidsänkande läkemedel",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 255,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2013,
                                name: "HbA1c <52, kostbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2014,
                                name: "HbA1c <50, kostbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 12,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2015,
                                name: "HbA1c >73, kostbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 11,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2016,
                                name: "HbA1c >70, kostbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 13,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2017,
                                name: "HbA1c <52, tablettbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2018,
                                name: "HbA1c <50, tablettbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 12,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2019,
                                name: "HbA1c >73, tablettbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 11,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2020,
                                name: "HbA1c >70, tablettbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 13,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2021,
                                name: "HbA1c <52, insulinbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2022,
                                name: "HbA1c <50, insulinbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 12,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2023,
                                name: "HbA1c >73, insulinbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 11,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2024,
                                name: "HbA1c >70, insulinbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 13,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2025,
                                name: "HbA1c <52, tablett- och insulinbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 10,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2026,
                                name: "HbA1c <50, tablett- och insulinbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: false,
                                sortOrder: 12,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2027,
                                name: "HbA1c >73, tablett- och insulinbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 11,
                                description: null
                            },
                            {
                                threshold: 50,
                                id: 2028,
                                name: "HbA1c >70, tablett- och insulinbehandlade",
                                indicatorType: 1,
                                unit: "Andel %",
                                asc: true,
                                sortOrder: 13,
                                description: null
                            }
                        ]
                    }
                };
                var counties= [
                    {
                        code: 1,
                        name: "Stockholm"
                    },
                    {
                        code: 3,
                        name: "Uppsala"
                    },
                    {
                        code: 4,
                        name: "Södermanland"
                    },
                    {
                        code: 5,
                        name: "Östergötland"
                    },
                    {
                        code: 6,
                        name: "Jönköping"
                    },
                    {
                        code: 7,
                        name: "Kronoberg"
                    },
                    {
                        code: 8,
                        name: "Kalmar"
                    },
                    {
                        code: 9,
                        name: "Gotland"
                    },
                    {
                        code: 10,
                        name: "Blekinge"
                    },
                    {
                        code: 12,
                        name: "Skåne"
                    },
                    {
                        code: 13,
                        name: "Halland"
                    },
                    {
                        code: 14,
                        name: "Västra Götaland"
                    },
                    {
                        code: 17,
                        name: "Värmland"
                    },
                    {
                        code: 18,
                        name: "Örebro"
                    },
                    {
                        code: 19,
                        name: "Västmanland"
                    },
                    {
                        code: 20,
                        name: "Dalarna"
                    },
                    {
                        code: 21,
                        name: "Gävleborg"
                    },
                    {
                        code: 22,
                        name: "Västernorrland"
                    },
                    {
                        code: 23,
                        name: "Jämtland"
                    },
                    {
                        code: 24,
                        name: "Västerbotten"
                    },
                    {
                        code: 25,
                        name: "Norrbotten"
                    }
                ]

                units = _.where(units, {isActive : true});
            }

            if (!useStaticUnits) {
                return $q.all([
                        endpoints.units.getList({exposeMode:'minified', isActive : true}),
                        endpoints.counties.getList(),
                        endpoints.indicator.get()
                    ]).then(function (data) {
                        //console.log("data2", data[0].plain());

                        self.data.units      = data[0].plain();
                        self.data.counties   = data[1].plain();
                        self.data.indicators = data[2].plain();

                        self.prepareGeoList();
                    });
            } else {
                return $q.all([
                        //endpoints.indicator.get()
                    ]).then(function (data) {
                        self.data.units = units;
                        self.data.counties = counties;
                        self.data.indicators = indicators;

                        self.prepareGeoList();
                    });
            }
        };
    }]);
