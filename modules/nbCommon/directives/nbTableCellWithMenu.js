(function() {
    'use strict';

    angular.module('nb.common').directive('nbTableCellWithMenu', [
        function() { // $compile, $log
            var cellWithFilter = '';
            cellWithFilter += '<div title="{{cellContent}}" ng-mouseenter="setShowMenu(true);"  ng-mouseleave="showMenuButton = false;menuSelected=false;"><div class="nbTableCellWithMenuCell" ng-bind-html="cellContent | nbHighlight: filterText"></div>';
            cellWithFilter += '  <div  ng-if="showMenuButton" class="nbTableCellDropdownMenuContainer" >';
            cellWithFilter += '    <img src="img/Assets/More_Actions_Button_20x20.png" ng-click="showDropdownMenu()")>';
            cellWithFilter += '    <ul  ng-if="menuSelected" class="nbTableCellDropdownMenu" id="propMenu"+{{cellContent}} nb-table-cell-menu-top-adjust>';
            cellWithFilter += '      <li style="padding-left:10px; list-style-type: none;" ng-click="selectAction(action)" class="menuItem" ng-repeat="action in actionMenu track by $index">';
            cellWithFilter += '        {{action.title}}';
            cellWithFilter += '      </li>';
            cellWithFilter += '    </ul>';
            cellWithFilter += '  </div>';
            cellWithFilter += '  </div>';
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    rowEntity: '=',
                    cellContent: '@',
                    filterText: '@',
                    actionMenu: '=',
                    gridOptions: '='

                },
                template: cellWithFilter,
                link: function(scope) { // , element, attr
                    scope.parentScope = scope.$parent;
                    scope.ngGrid = scope.gridOptions.ngGrid;
                    scope.menuSelected = false;

                    scope.setShowMenu = function(show) {
                        scope.showMenuButton = show;
                    };

                    scope.showDropdownMenu = function() {
                        scope.menuSelected = true;
                    };

                    scope.selectAction = function(action) {
                        scope.showMenuButton = false;
                        scope.menuSelected = false;
                        var callbackFun = action.action;
                        // scope.parentScope.$eval(callbackFun)(JSON.parse(scope.rowEntity));
                        scope.parentScope.$eval(callbackFun)(scope.rowEntity);
                    };
                }
            };
        }
    ]).directive('nbTableCellMenuTopAdjust', [
        function() {
            return {
                restrict: 'A',

                link: function(scope, element) { // , attrs
                    var grid = scope.ngGrid;
                    var scrollTop = grid.$viewport.scrollTop();

                    var offsetTop = element[0].offsetTop;
                    element[0].style.top = (offsetTop - scrollTop) + 'px';
                }
            };
        }
    ]);
})(NetBrain);
