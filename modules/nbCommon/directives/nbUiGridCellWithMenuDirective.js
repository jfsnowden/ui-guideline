(function() {
    'use strict';

    angular.module('nb.common').directive('nbUiGridCellWithMenuDirective', [ // '$compile', '$log', '$timeout',
        function() {
            var cellWithFilter =
                '<div class="ui-grid-cell-contents nbUiGridCellWithMenuDirective" ng-mouseenter="grid.appScope.showMenuButton = true">' +
                // ' <div class="ui-grid-cell-contents nbUiGridCellWithMenuDirective" ng-mouseenter="showMenuButton = true;">' +
                '   <div title="{{COL_FIELD}}" class="nbUiGridCell">' +
                '       <img ng-if="row.entity[imgPathLabel]" ng-src="{{row.entity[imgPathLabel]}}" width="16px"/>' +
                '       <span ng-model="row.entity[displayField]" spellcheck="false" class="nbUiGridCellWithMenuCell" ng-bind-html="COL_FIELD | nbHighlight: filterText"></span>' +
                '       <div  ng-show="row.showMenuButton && !row.hasNoMenu" class="nbUiGridCellDropdownMenuContainer" >' +
                // '       <div class="nbUiGridCellDropdownMenuContainer" >' +
                '           <img src="img/Assets/More_Actions_Button_20x20.png" ng-click="row.showMenuDropdown = !row.showMenuDropdown">' +
                '           <ul  ng-if="row.showMenuDropdown" class="nbUiGridCellCellDropdownMenu" nb-ui-grid-cell-menu-top-adjust grid-scroll-top="gridScrollTop" grid-scroll-left="gridScrollLeft" nb-ui-grid-cell-menu-position-adjust="gridPositionElementClass" >' +
                // '           <ul  ng-show="true" class="nbUiGridCellCellDropdownMenu" nb-ui-grid-cell-menu-top-adjust 
                // grid-scroll-top="gridScrollTop" grid-scroll-left="gridScrollLeft">' +
                '               <li class="menuItem" ng-repeat="option in menuOptions" ng-click="menuClickCallback(row.entity, option)">' +
                '                   {{option[menuOptionDisplayField]}}' +
                '               </li>' +
                '           </ul>' +
                '       </div>' +
                '   </div>' +
                '</div>';

            return {
                restrict: 'E',
                replace: true,
                scope: {
                    menuOptions: '=',
                    menuOptionDisplayField: '@',
                    menuClickCallback: '=',

                    imgPathLabel: '@',
                    nbUiGridCellMenuPositionAdjustClass: '=',
                    hasNoMenu: '=',

                    filterText: '=',
                    gridScrollTop: '=',
                    gridScrollLeft: '=',
                    row: '=',
                    displayField: '@', // field name
                    COL_FIELD: '=colField'
                },
                template: cellWithFilter,
                link: function() {} // scope, element, attr
            };
        }
    ]).directive('nbUiGridCellMenuTopAdjust', [
        function() {
            return {
                restrict: 'A',
                scope: {
                    gridScrollTop: '=?',
                    gridScrollLeft: '=?'
                },

                link: function(scope, element) { // , attrs
                    adjustTop();
                    adjustLeft();

                    function adjustTop() {
                        var scrollTop = scope.gridScrollTop;
                        scrollTop = -scrollTop;
                        var curElement = element[0];
                        curElement.style.marginTop = (scrollTop - 6) + 'px';
                    }
                    scope.$watch('gridScrollTop', function() {
                        adjustTop();
                    });

                    function adjustLeft() {
                        var scrollLeft = scope.gridScrollLeft;
                        scrollLeft = -scrollLeft;
                        var curElement = element[0];
                        curElement.style.marginLeft = scrollLeft + 'px';
                    }
                    scope.$watch('gridScrollLeft', function() {
                        adjustLeft();
                    });
                }
            };
        }
    ]).directive('nbUiGridCellMenuPositionAdjust', ['$timeout',
        function($timeout) {
            return {
                restrict: 'A',

                link: function(scope, element) { // , attrs
                    $timeout(function() {
                        adjustTop();
                    }, 300);

                    function adjustTop() {
                        if (scope.nbUiGridCellMenuPositionAdjustClass) {
                            var parentT = $(element).parents(scope.nbUiGridCellMenuPositionAdjustClass).eq(0);
                            var pHeight = parentT.height();
                            var targetPosition = $(element).offset().top;
                            var targetHeight = $(element).height();
                            var pPosition = parentT.offset().top;
                            var actrueTop = targetPosition - pPosition;
                            if (actrueTop > pHeight - targetHeight) {
                                $(element).css('top', -targetHeight + 'px');
                            }
                        }
                    }
                }
            };
        }
    ]);
})(NetBrain);
