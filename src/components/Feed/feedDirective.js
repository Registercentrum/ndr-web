angular.module('ndrApp')
    .directive('feed', [function() {

        String.prototype.capitalize = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }


        function link(scope, element, attrs) {

        }


        return {
            restrict : 'A',
            //templateUrl : function(elem, attr){
            //    return 'src/components/Feed'+ attr.type.capitalize() +'/Feed'+ attr.type.capitalize() +'.html';
            //},

            link: link,
            scope: {
                model: "=",
                type: "="
            }
        }

    }]);
