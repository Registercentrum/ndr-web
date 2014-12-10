angular.module('ndrApp')
    .directive('list', [function() {

        function link(scope, element, attrs) {
            if ( attrs.readmore !== undefined ) {
                scope.readmore = '/#/' + attrs.readmore;
            } else {
                scope.readmore = false;
            }
        }

        return {
            restrict : 'A',
            templateUrl: function(elem, attr){
                return 'src/components/List/List.html';
            },
            link: link,
            scope: {
                model: "="
            }
        }

    }]);
