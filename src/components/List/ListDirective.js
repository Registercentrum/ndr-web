angular.module('ndrApp')
    .directive('list', [function() {

        function link(scope, element, attrs) {
		
        }

        return {
            restrict : 'A',
            templateUrl: function(elem, attr){
                return 'src/components/List/ListTemplate.html';
            },
            link: link,
            scope: {
                model: "="
            }
        }

    }]);
