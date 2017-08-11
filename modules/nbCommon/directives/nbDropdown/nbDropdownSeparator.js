(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbDropdownSeparator', [
        function() {
            return {
                require: ['^nbDropdown' , 'ngChange'],
                restrict: 'E',
                transclude: true,
                replace: true,
                template: '<li class="nb-dropdown-separator"></li>',
                scope: false
            };
        }
    ]);

})(NetBrain);
