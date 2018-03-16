(function() {
    angular.module('nb.common').directive('nbAnchorDropdownDirective', AnchorDrowndownSelection);

    AnchorDrowndownSelection.$inject = [
        '$location', '$anchorScroll'
    ];

    function AnchorDrowndownSelection($location, $anchorScroll) {
        var directive = {
            restrict: 'AE',
            scope: {
                listValue: '=?',
                selectedItems: '=?',
                filterTitle: '=?',
                isMultiSelect: '=?',
                closeOnSelect: '=?',
                nameField: '=?',
                onSelect: '&'
            },
            templateUrl: 'modules/nbCommon/views/nbAnchorDropdownDirective.html',
            link: linkFunc,
            controller: anchorScrollDropdownController,
            controllerAs: 'anchorDropdownCtrl'
        };

        return directive;

        function anchorScrollDropdownController () {

        }

        function linkFunc(scope) {
            // init options
            scope.selectedItems = [];

            if (!scope.nameField) {
                scope.nameField = 'name';
            }
            scope.$watchCollection('listValue', function() {
                scope.sortedList = __sortListValue(scope.listValue);
            });

            scope.clickCheckbox = function(event, item) {
                __updateSelectedItems(event.currentTarget.checked, item);
                scope.onSelect()(scope.selectedItems);
            };

            scope.selectItem = function(event, item) {
                if (!scope.isMultiSelect) {
                    scope.selectedItems = [];
                }
                __updateSelectedItems(true, item);

                if (scope.closeOnSelect) {
                    scope.dropdownIsOpen = false;
                }
            };

            scope.selectAnchor = function(alpIndex) {
                $location.hash(alpIndex);
                $anchorScroll();
            };

            function __sortListValue(rawLists) {
                var sortedList = _.sortBy(rawLists, scope.nameField);
                return _.groupBy(sortedList, function(item) {
                    var firstAlphabet = item[scope.nameField].charAt(0).toUpperCase();
                    return firstAlphabet.match(/[A-Z]/) ? firstAlphabet : '#';
                });
            }

            function __updateSelectedItems(bl, item) {
                var index;
                if (!scope.selectedItems) {
                    scope.selectedItems = [];
                }

                if (bl) {
                    scope.selectedItems.push(item);
                } else {
                    index = scope.selectedItems.indexOf(item);
                    scope.selectedItems.splice(index, 1);
                }
                if (scope.selectedItems) {
                    scope.selectedItems = _.sortBy(scope.selectedItems, scope.nameField);
                    scope.selectedItemNames = _.pluck(scope.selectedItems, scope.nameField).join(', ');
                }
            }
        }
    }
})(NetBrain);
