angular.module('ndrApp')
  .controller('AppController', ['accountService','$transitions', function (accountService,$transitions) {
      accountService.bootstrap();
      $transitions.onFinish({}, function($transition) {
        ga('send', 'pageview', $transition.$to().self.url);
      });
  }]);
