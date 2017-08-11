angular.module('nb.common').directive('nbClearButton', function () {
    return {
        require: ['ngModel'],
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {},
        link: function (scope, element, attrs, ctrls) {
            scope.ngModel = ctrls[0];
        },
        controller: function ($scope, $element) {
            $scope.clear = function () {
                $scope.ngModel.$setViewValue('');
            };
        },
        templateUrl: 'controls/nb-clear-button/nb-clear-button.tpl.html'
    };
})
;
