angular.module('ndrApp')
    .directive('list', [function() {

        function link(scope, element, attrs) {
            console.log('HERE', scope);
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
