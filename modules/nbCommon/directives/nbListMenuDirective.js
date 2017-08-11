(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbListMenuDirective', [
        '$timeout',
        function($timeout) {

            return {
                scope: {
                    selectMode: '=',
                    selectedItems: '=',
                    filterText: '='
                },
                restrict: 'E',
                replace: true,
                transclude: true,
                template: '<div class="nb-list-menu-directive"><ul ng-transclude atag="domainAdmin:domainCreatePopup:selectDevicePopup:deviceTypes"></ul></div>',
                controller: function($scope, $element, $attrs) {
                    this.selectedItems = [];

                    this.itemToggleCheck = function(itemScopeId, item, isActive, isEvent) {

                        var self = this;

                        //$timeout(function(){
                        var isSingleMode = ($scope.selectMode === 'single');
                        if (isSingleMode) {
                            self.selectedItems = [];
                            if (isActive) {
                                self.selectedItems.push({
                                    id: itemScopeId,
                                    item: angular.copy(item)
                                });
                            }

                        } else {
                            var index = self.selectedItems.map(function(item) {
                                return item.id;
                            }).indexOf(itemScopeId);

                            if (index > -1 && !isActive) {
                                self.selectedItems.splice(index, 1);
                            } else if (index < 0 && isActive) {
                                self.selectedItems.push({
                                    id: itemScopeId,
                                    item: angular.copy(item)
                                })
                            }
                        }

                        // BUG here:
                        //      Will change reference of passed-in var
                        //$scope.selectedItems = self.selectedItems.map(function(item) {
                        //    return item.item;
                        //});
                        if (!$scope.selectedItems) {
                            $scope.selectedItems =[];
                        }
                        while ($scope.selectedItems.length > 0) {
                            $scope.selectedItems.pop();
                        }
                        var tmpItems = self.selectedItems.map(function(item) {
                            return item.item;
                        });
                        tmpItems.forEach(function(item) {
                            $scope.selectedItems.push(item);
                        });

                        $scope.$broadcast('itemToggled', itemScopeId, isEvent, isSingleMode);

                        //})
                    };

                    $scope.$watch('filterText', function(newText) {
                        $timeout(function() {
                            $scope.$broadcast('filterTextChanged', newText, $attrs.filterText)
                        })
                    })
                }
            }

        }
    ]);

    angular.module('nb.common').directive('nbListMenuOption', [
        '$timeout', '$compile',
        function($timeout, $compile) {

            return {
                replace: true,
                restrict: 'E',
                scope: {
                    optionItem: '=',
                    isActive: '=',
                    isDisabled: '=',
                    isAvoidFilter: '='
                },
                transclude: true,
                template: '<li ng-class="{active: isSelected, hide: isHide, disabled: isDisabled}" class="nb-list-menu-option" ng-transclude atag="domainAdmin:domainCreatePopup:selectDevicePopup:deviceTypeItem"></li>',
                require: '^^nbListMenuDirective',
                link: function(scope, element, attrs, ctrl, transFn) {

                    var isActiveWatcher;

                    transFn(scope.$parent, function(clone, transScope) {
                        var tag = element;
                        tag.empty();
                        tag.append(clone);
                    });

                    scope.isSelected = scope.isActive ? scope.isActive : false;
                    scope.isHide = false;

                    $(element).bind('click', function(event) {

                        if (scope.isDisabled) {
                            return;
                        }

                        $timeout(function() {
                            scope.isSelected = !scope.isSelected;
                            ctrl.itemToggleCheck(scope.$id, scope.optionItem, scope.isSelected, true);
                        });

                    });

                    var toggleActiveWatcher = function(isSelected) {
                        isActiveWatcher();
                        scope.isActive = isSelected;
                        $timeout(function() {
                            isActiveWatcher = scope.$watch('isActive', function(newValue, oldValue) {
                                if (newValue !== null && newValue !== undefined && newValue !== oldValue) {
                                    scope.isSelected = newValue;
                                    ctrl.itemToggleCheck(scope.$id, scope.optionItem, scope.isSelected, false);
                                }
                            });
                        })
                    };

                    var itemToggleWatcher = scope.$on('itemToggled', function(event, id, isEvent, isSingleMode) {
                        if (scope.$id !== id) {
                            if (isSingleMode && scope.isSelected) {
                                scope.isSelected = false;
                                toggleActiveWatcher(scope.isSelected);
                            }
                        } else {
                            if (isEvent) {
                                toggleActiveWatcher(scope.isSelected);
                            }
                        }
                    });

                    var filterStringWatcher = scope.$on('filterTextChanged', function(event, text, filterTextName) {
                        scope[filterTextName] = text;

                        if (scope.isAvoidFilter === true)
                            return;

                        if (text !== null && text !== undefined) {
                            var elementText = $(element).text().trim();
                            var index = elementText.toLowerCase().indexOf(text.toLowerCase());
                            scope.isHide = (index <= -1);
                        }
                    });

                    isActiveWatcher = scope.$watch('isActive', function(newValue, oldValue) {
                        if (newValue !== null && newValue !== undefined && (newValue !== oldValue || newValue)) {
                            scope.isSelected = newValue;
                            ctrl.itemToggleCheck(scope.$id, scope.optionItem, scope.isSelected, false);
                        }
                    });

                    scope.$on('$destroy', function() {
                        itemToggleWatcher();
                        filterStringWatcher();
                        isActiveWatcher();
                    })


                }

            }

        }
    ]);

    angular.module('nb.common').directive('nbListMenuOutSelected', function() {
        return {
            restrict: 'A',
            replace: false,
            require: '?^nbListMenuDirective',
            link: function(scope, element) {
                scope.$watch("group.isOutSelected", function (nv) {
                    if(nv){
                        element.addClass("outSelectedHighlight");
                    }else{
                        element.removeClass("outSelectedHighlight");
                    }
                });

            }
        }

    });

})(NetBrain);