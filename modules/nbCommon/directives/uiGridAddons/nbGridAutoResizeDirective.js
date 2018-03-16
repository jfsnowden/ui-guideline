/**
 * Created by Marko Cen on 10/29/2015.
 */

(function() {
    'use strict';

    angular.module('nb.common').directive('nbGridAutoResizeDirective', nbGridAutoResizeDirective);

    nbGridAutoResizeDirective.$inject = ['gridUtil', '$timeout'];

    function nbGridAutoResizeDirective(gridUtil, $timeout) { // , $window
        var directive = {
            require: 'uiGrid',
            scope: false,
            restrict: 'A',
            link: function(scope, element, attrs, uiGridCtrl) {
                scope.$watch(function() {
                    return $(element).is(':visible');
                }, function(isVisible) {
                    if (isVisible) {
                        $timeout(function() {
                            var newGridHeight = gridUtil.elementHeight(element);
                            var newGridWidth = gridUtil.elementWidth(element);
                            uiGridCtrl.grid.gridHeight = newGridHeight;
                            uiGridCtrl.grid.gridWidth = newGridWidth;
                            uiGridCtrl.grid.refresh();
                        }, 100);
                    }
                });
            }
        };

        return directive;
    }
})(NetBrain);
