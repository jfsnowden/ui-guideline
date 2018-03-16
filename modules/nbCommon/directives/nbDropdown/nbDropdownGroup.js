(function() {
    'use strict';

    angular.module('nb.common').directive('nbDropdownGroup', [
        function() {
            return {
                require: ['^nbDropdown'],
                restrict: 'E',
                transclude: true,
                replace: true,
                scope: {
                    nbDropdownGroupLabel: '@'
                },
                templateUrl: 'controls/nb-dropdown/nb-dropdown-group.tpl.html'
            };
        }
    ]);
})(NetBrain);
