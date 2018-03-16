(function() {
    'use strict';

    angular.module('nb.common').directive('nbWindowEvent', function() {
        return {
            restrict: 'EA',
            scope: {
                isClose: '&?',
                unload: '&?'
            },
            link: function(scope) { // , element, attrs
                window.addEventListener('beforeunload', function(e) {
                    var canClose = true;
                    if (scope.isClose !== undefined) {
                        canClose = scope.isClose();
                    }

                    if (canClose === false) {
                        var dialogText = 'Are You Sure to Close This Window?';
                        e.returnValue = dialogText;
                        return dialogText;
                    }
                    return undefined;
                });
                window.addEventListener('unload', function() {
                    if (scope.unload && typeof scope.unload === 'function') {
                        scope.unload();
                    }
                });
            }
        };
    });
})(NetBrain);
