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
        var units = Restangular.all('unit');
        var counties = Restangular.all('county');
        //.all('cars')


        units.getList().then(function(units) {
            self.data.units = units;
        });

        counties.getList().then(function(counties) {
            self.data.counties = counties;
        });


        /* Returns a promise */
        this.getOne = function (type, id){
            return Restangular.one(type, id).get();
        }



    }])
