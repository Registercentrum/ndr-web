'use strict';

angular.module('ndrApp')
    .directive('setClassWhenAtTop', function ($window) {
        console.log(angular,'angular');
        var $win = angular.element($window); // wrap window object as jQuery object
    
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var topClass = attrs.setClassWhenAtTop, // get CSS class from directive's attribute value
                    offsetTop = (element.offset().top + 492); // get element's top relative to the document
                
                console.log('element',element);
                console.log('offsetTop',element.offset().top);

                $win.on('scroll', function (e) {
                    if ($win.scrollTop() >= offsetTop) {
                        element.addClass(topClass);
                    } else {
                        element.removeClass(topClass);
                    }
                });
            }
        };
    })