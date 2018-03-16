angular.module('nb.common').directive('nbSearchBar', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            placeholder: '@',
            onClear: '&',
            onSearch: '&'
        },
        require: ['ngModel'],
        templateUrl: 'controls/nb-search-bar/nb-search-bar.tpl.html',
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
        },
        controller: function() {} // $scope, $element
    };
});
