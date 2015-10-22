'use strict';

angular.module('ndrApp')
    .directive('parseCommas', function () {
        return {
            // $parsers/$formatters live on the
            // ngModel controller, so we need this!
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {
                ngModel.$parsers.push(function toModel(input) {
                    console.log('parsing', input, input.replace(/,/g , '.'));
                    // do something to format user input
                    // to be more "computer-friendly"
                    return input.replace(/,/g , '.');
                });

                ngModel.$formatters.push(function toModel(input) {
                    if(input){
                        return input.toString().replace(/\./g , ',');
                    }
                    else{
                        return input;
                    }
                });
            }
        };
    })