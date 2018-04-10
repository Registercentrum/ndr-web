'use strict';
angular.module('ndrApp')
    .controller('Knappen2Controller', [
        '$scope', '$stateParams', '$sce','$state','APIconfigService',
        function($scope, $stateParams, $sce,$state,APIconfigService) {

          $scope.reload = function() {
            $state.reload();
          }

          $scope.getQueryString = function() {

            var queryParams = {};
            if ($stateParams.s) queryParams.searchKey = $stateParams.s;
            queryParams.apiURL = APIconfigService.baseURL;

            var querystring = Object.keys(queryParams).map(function(key, index) {
               return (key + '=' + queryParams[key]);
            }).join('&');

            return querystring;

          }

          $scope.scrollStart = function() {

            var $el = $("#start");
            $("html, body").animate({
              scrollTop: $el.offset().top// + ($el.outerHeight() / 2) - ($(window).height() / 2)
            },1000);

          }

          $scope.setBaseURL = function(config) {

            var iframeurl = config.baseURL + config.querystring;

            console.log('iframeurl',iframeurl);
            $scope.url = $sce.trustAsResourceUrl(iframeurl);
          }

          $scope.init = function(config) {

            $scope.setBaseURL(config);
            $scope.scrollStart();
          }

          var config = {
            querystring: $scope.getQueryString(),
            baseURL: 'https://www.ndr.nu/Knappen2?',
          }

          $scope.init(config);

        }
    ]);
