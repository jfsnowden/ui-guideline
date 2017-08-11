(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbHeightAdjusterDirective', [
        '$window', function($window) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    scope.onHeightResize = function() {
                        var sourceDiv = attr.heightSource;
                        if (!sourceDiv) {
                            sourceDiv = angular.element($window);
                        } else {
                            sourceDiv = angular.element(sourceDiv);
                        }
                        var adjustedHeight = sourceDiv.height() - attr.nbHeightAdjusterDirective;
                        element.css({ height: adjustedHeight });
                    };
                    angular.element($window).bind('resize', function() {
                        scope.onHeightResize();
                    });
                    scope.onHeightResize();
                }
            };
        }
    ]);

})(NetBrain);
