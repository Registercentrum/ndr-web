angular.module('ndrApp')
    .directive('list', [function() {

        console.log('list directive', arguments);



        function link(scope, element, attrs) {

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
