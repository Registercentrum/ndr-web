'use strict';
// =============================
// Data Service

angular.module('ndrApp')
    .service('dataService', ['$q', '$http', 'Restangular', function($q, $http, Restangular) {

        var self = this;

        this.data = {
            units : [],
            counties : [],
            indicators : []
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
            indicator               :    Restangular.one('indicator'),
            researchproject         :    Restangular.all('researchproject')
        }


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


        this.bootstrap = function (){

            var p = $q.all([
                endpoints.units.getList(),
                endpoints.counties.getList(),
                endpoints.indicator.get()
                ]).then(function (data){
                    console.log("data",data);
                    
                self.data.units =  data[0];
                self.data.counties = data[1];
                self.data.indicators = data[2];
            })

            return p;






        }


    }])
