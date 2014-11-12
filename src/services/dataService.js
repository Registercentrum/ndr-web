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


        var units = Restangular.all('unit');

        units.getList().then(function(units) {
            self.data.units = units;

            console.log("units", units);

        });



    }])
