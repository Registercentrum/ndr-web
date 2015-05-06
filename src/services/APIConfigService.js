// =============================
// Account Service

angular.module('ndrApp')
    .service('APIconfigService', ['$q', '$http', 'Restangular', '$state', '$filter', '$rootScope', function($q, $http, Restangular, $state, $filter, $rootScope) {

        //this.baseURL = "https://ndr.registercentrum.se/api/";
		this.baseURL = "https://w8-038.rcvg.local/api/";
        this.APIKey = "LkUtebH6B428KkPqAAsV";

    }])


