(function() {
    'use strict';

    angular.module('nb.common').directive('nbDropdownOption', [
        '$compile', '$timeout',
        function($compile, $timeout) {
            return {
                require: ['nbDropdownOption', '^nbDropdown', '^ngModel', '?^ngDropdownGroup'],
                restrict: 'E',
                transclude: true,
                replace: true,
                scope: {
                    nbDropdownData: '=',
                    optionDisabled: '&'
                },
                link: function(scope, element, attrs, ctrls) {
                    scope.nbDropdown = ctrls[1];
                    scope.ngModel = ctrls[2];
                    scope.ngDropdownGroup = ctrls[3];

                    scope.nbDropdown.add(scope);

                    scope._selected = false;

                    scope.$watch('optionDisabled', function() {
                        $timeout(function() {
                            scope.isDisabled = scope.optionDisabled();
                        });
                    });
                },
                controller: function($scope, $element) {
                    $scope.getSelectedRepresentation = function() {
                        return $element.find('[ng-transclude]').html();
                    };

                    $scope.getSelectedText = function() {
                        return $element.find('[ng-transclude]').text().trim();
                    };

                    $scope.selected = function(event, value) {
                        if ($scope.isDisabled) {
                            if (event) {
                                event.preventDefault();
                                event.stopPropagation();
                            }
                            return undefined;
                        }
                        if ((value !== undefined) && ($scope._selected !== value)) {
                            $scope._selected = value;
                            $scope.nbDropdown.select($scope);
                        }
                        return $scope._selected;
                    }; // .bind(this)
                },
                templateUrl: 'controls/nb-dropdown/nb-dropdown-option.tpl.html'
            };
        }
    ]);
})(NetBrain);
