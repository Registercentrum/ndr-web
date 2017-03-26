'use strict';

angular.module('ndrApp')
  .service('APIconfigService', [function () {
    this.baseURL = 'https://demo.ndr.nu/api/';

    // this.baseURL = 'https://www.ndr.nu/api/';
    // this.baseURL = 'https://w10-038.rcvg.local/api/';
    this.APIKey  = 'jEGPvHoP7G4eMkjLQwE5';

    // get a query url with or without the sessionid
    // with for local development and without for deploy
    this.constructUrl = function (url) {
      var sessionId = "999a";

      // uncomment to get urls without session id
      return url;

      // uncomment to get urls with sessionid attached
      // return url + (url.indexOf("?") !== -1 ? "&" : "?") + "SESSIONID=" + sessionId;
    }
  }]);
