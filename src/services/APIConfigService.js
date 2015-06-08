'use strict';

angular.module('ndrApp')
  .service('APIconfigService', [function () {
    this.baseURL = 'https://ndr.registercentrum.se/api/';
    this.APIKey  = 'LkUtebH6B428KkPqAAsV';
  }]);
