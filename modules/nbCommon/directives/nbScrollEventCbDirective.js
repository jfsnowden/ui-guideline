(function() {
    angular.module('nb.common').directive('scrollEventCb', [
        function() {
            return {
                restrict: 'EA',
                scope: { cb: '=' },
                priority: 1000,
                link: function(scope, element) {
                    element.bind('scroll', function() {
                        if (scope.cb && _.isFunction(scope.cb)) {
                            scope.cb();
                        }
                    });
                }
            };
        }
    ]);
})(NetBrain);
