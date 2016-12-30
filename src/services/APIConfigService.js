'use strict';

angular.module('ndrApp')
  .service('APIconfigService', [function () {
    this.baseURL = 'https://www.ndr.nu/api/';
    // this.baseURL = 'https://w10-038.rcvg.local/api/';
    this.APIKey  = 'jEGPvHoP7G4eMkjLQwE5';
  }]);
