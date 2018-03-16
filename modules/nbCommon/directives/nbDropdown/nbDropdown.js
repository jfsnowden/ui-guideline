(function() {
    'use strict';

    angular.module('nb.common').directive('nbDropdown', [
        '$timeout',
        function($timeout) {
            return {
                restrict: 'E',
                transclude: true,
                scope: {
                    nbDropdownPlaceholder: '@',
                    nbHide: '@',
                    dropdownDisabled: '=',
                    width: '@',
                    height: '@'
                },
                require: ['ngModel', 'nbDropdown'],
                priority: 1,
                replace: true,
                link: {
                    post: function(scope, element, attrs, ctrls) {
                        scope.editable = (attrs.editable !== undefined);
                        scope.ngModel = ctrls[0];
                        scope.nbDropdown = ctrls[1];
                        scope.inputValue = scope.ngModel.$modelValue;
                        scope.inputType = scope.nbHide === 'true' ? 'password' : 'text';
                        scope.validator = {};
                        if (scope.width) {
                            element[0].style.width = scope.width;
                        }

                        if (scope.height) {
                            element[0].style.height = scope.height;
                        }

                        scope.$watch('dropdownDisabled', function() { // val, oval
                            $timeout(function() {
                                scope.isDisabled = scope.dropdownDisabled;
                                scope.$apply();
                            });
                        });


                        $timeout(function() { // is there a better way to wait for child templates to be processed?
                            scope.$watch(
                                function() {
                                    return scope.ngModel.$modelValue;
                                },
                                function() {
                                    scope.inputValue = scope.ngModel.$modelValue;
                                    $timeout(function() {
                                        var match = null;

                                        scope.options.forEach(function(option) {
                                            var dropDownItem = angular.copy(option.nbDropdownData);
                                            var modelVal = angular.copy(scope.ngModel.$modelValue);

                                            if (_.isEqual(modelVal, dropDownItem)) {
                                                match = option;
                                            } else {
                                                option._selected = false;
                                            }
                                        }); // .bind(this)


                                        scope.nbDropdown.select(match);
                                    }, 200);
                                }
                            );

                            if (scope.editable) {
                                scope.$watch(
                                    function() {
                                        scope.inputType = scope.nbHide === 'true' ? 'password' : 'text';
                                        return scope.inputValue;
                                    },
                                    function() {
                                        scope.ngModel.$setViewValue(scope.inputValue);
                                    }
                                );
                                if (element.attr('validator')) {
                                    scope.validator = scope.$parent[element.attr('validator')];
                                }
                            }
                        });
                    }
                },
                controller: function($scope, $element) {
                    $scope.options = [];

                    var selectionBlock = $element.find('span.dropdown-selection');

                    this.select = function(option) {
                        if ($scope.option !== option) {
                            if ($scope.option) {
                                $scope.option.selected(null, false);
                            }
                            $scope.option = option;

                            if (option) {
                                option.selected(null, true);

                                if (!$scope.editable) {
                                    selectionBlock.html(option.getSelectedRepresentation());
                                    selectionBlock.attr('title', option.getSelectedText());
                                }

                                $scope.ngModel.$setViewValue(option.nbDropdownData);
                            }
                        }
                    };

                    this.add = function(option) {
                        $scope.options.push(option);
                    };
                },
                templateUrl: function(tElement) {
                    var editable = (tElement.attr('editable') !== undefined);
                    return 'controls/nb-dropdown/nb-' + (editable ? 'editable-' : '') + 'dropdown.tpl.html';
                }
            };
        }
    ]);
})(NetBrain);
