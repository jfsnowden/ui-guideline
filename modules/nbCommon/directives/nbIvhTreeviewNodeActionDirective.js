(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbIvhTreeviewNodeActionDirective', [
        function() {
            'use strict';
            return {
                restrict: 'A',
                require: '^ivhTreeview',
                link: function(scope, element, attrs, trvw) {
                    var node = scope.$parent.node;

                    element.bind('click', function() {
                        if (node.nodeType == 1 && node.treeLeafActions) {
                            node.selectLeafAction(node, node.treeLeafActions[0]);
                        }
                        if (node.nodeActions) { //this is used when folder node has only delete action and it shows as a x button
                            node.selectNodeAction(node, node.nodeActions[0]);
                        }
                    });
                }
            };
        }
    ]);

})(NetBrain);
