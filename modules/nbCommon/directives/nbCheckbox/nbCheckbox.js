(function() {
    'use strict';

    angular.module('nb.common').directive('nbCheckbox', Checkbox);

    Checkbox.$inject = [];

    function Checkbox() {
        return {
            require: 'ngModel',
            replace: true,
            transclude: true,
            scope: {},
            link: function(scope, element, attrs, model) {
                scope.value = undefined;
                scope.checkbox = $(element).find('input');

                model.$render = function() {
                    scope.value = model.$viewValue;
                    scope.checkbox.prop('indeterminate', (scope.value === undefined));
                };

                scope.update = function() {
                    model.$setViewValue(scope.value);
                };
            },
            templateUrl: 'controls/nb-checkbox/nb-checkbox.tpl.html'
        };
    }
})(NetBrain);
