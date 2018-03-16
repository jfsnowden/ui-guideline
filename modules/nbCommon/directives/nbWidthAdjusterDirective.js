(function() {
    'use strict';

    angular.module('nb.common').directive('nbWidthAdjusterDirective', [
        '$window',
        function($window) { // , $timeout
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    scope.onResizeWidth = function() {
                        //                      console.log(element.css('width'));
                        //                      console.log(attr.nbWidthAdjusterDirective);
                        var sourceDiv = attr.widthSource;
                        if (!sourceDiv) {
                            sourceDiv = angular.element($window);
                        } else {
                            sourceDiv = angular.element(sourceDiv);
                        }
                        var adjustedWidth = sourceDiv.width() - attr.nbWidthAdjusterDirective;
                        element.css({ width: adjustedWidth });
                    };
                    angular.element($window).bind('resize', function() {
                        scope.onResizeWidth();
                    });
                }
            };
        }
    ]);
})(NetBrain);
