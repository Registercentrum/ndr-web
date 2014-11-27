'use strict';
// =============================
// Data Service

angular.module('ndrApp')
    .service('dataService', ['$q', '$http', 'Restangular', function($q, $http, Restangular) {

        var self = this;

        this.data = {
            units : [],
            counties : []
        }

        /* RESTANGULAR CONFIG */
        Restangular.setBaseUrl("https://ndr.registercentrum.se/api/")
        Restangular.setDefaultRequestParams({
            APIKey : "LkUtebH6B428KkPqAAsV"
        })


        /* RESTANGULAR OBJECTS */
        var endpoints = {
            units                   :    Restangular.all('unit'),
            counties                :    Restangular.all('county'),
            news                    :    Restangular.all('news'),
            indicatorresult         :    Restangular.one('indicatorresult'),
            researchproject         :    Restangular.all('researchproject')
        }


        /* POPULATE UNITS AND COUNTIES */
        endpoints.units.getList().then(function(units) {
            self.data.units = units;
        });

        endpoints.counties.getList().then(function(counties) {
            self.data.counties = counties;
        });


        /* METHODS - returns promises */
        this.getList = function (type){
           return endpoints[type].getList();
        }

        this.getOne = function (type, id){
            return Restangular.one(type, id).get();
        }

        this.getStats = function (params){
            return endpoints.indicatorresult.get(params);
        }


    }])
