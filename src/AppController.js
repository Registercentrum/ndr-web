angular.module('ndrApp')
  .controller('AppController', ['accountService', function (accountService) {
      accountService.bootstrap();

  }]);
