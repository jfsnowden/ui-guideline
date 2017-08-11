(function (netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbButtonDropdown', nbButtonDropdown);

    nbButtonDropdown.$inject = ['$compile'];

    function nbButtonDropdown($compile){

        return {
            restrict: 'E',
            scope:false,
            transclude: true,
            template:'<div class="btn-group"><ng-transclude></ng-transclude></div>',
            compile: compile
        };

        function compile(){
        
            return {
                pre: function (scope, element, attr) {
                    
                }
            }
            
        }

    }

})(NetBrain);