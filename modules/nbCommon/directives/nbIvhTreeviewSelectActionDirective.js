(function() {
    'use strict';

    angular.module('nb.common').directive('nbIvhTreeviewSelectActionDirective', [
        function() {
            'use strict';

            return {
                restrict: 'A',
                require: '^ivhTreeview',
                scope: {
                    actionIndex: '='
                },
                link: function(scope, element) { // , attrs, trvw
                    var node = scope.$parent.node;

                    element.bind('click', function() {
                        if (node.selectAction) {
                            var idx = scope.actionIndex + 0;
                            node.selectAction(node, node.treeActionMenu[idx]);
                        }
                    });
                }
            };
        }
    ]);
})(NetBrain);
