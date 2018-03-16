angular.module('nb.common').directive('nbFilterBar', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            placeholder: '@'
        },
        require: ['ngModel'],
        templateUrl: 'controls/nb-filter-bar/nb-filter-bar.tpl.html',
        replace: true,
        link: function(scope, element, attrs, ctrls) {
            scope.ngModel = ctrls[0];

            scope.inputValue = scope.ngModel.$modelValue;

            scope.$watch(
                function() {
                    return scope.ngModel.$modelValue;
                },
                function() {
                    scope.inputValue = scope.ngModel.$modelValue;
                }
            );

            scope.$watch(
                function() {
                    return scope.inputValue;
                },
                function() {
                    scope.ngModel.$setViewValue(scope.inputValue);
                }
            );

            scope.clear = function() {
                scope.inputValue = '';
            };
        },
        controller: function() { // $scope, $element

        }
    };
});
