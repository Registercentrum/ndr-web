'use strict';

angular.module('ndrApp')
  .service('APIconfigService', [function () {
    this.baseURL = 'https://www.ndr.nu/api/';
    this.APIKey  = 'LkUtebH6B428KkPqAAsV';
  }]);
