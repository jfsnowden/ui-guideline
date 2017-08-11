(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbIvhTreeviewSelectMenuDirective', [
        function() {
            'use strict';
            return {
                restrict: 'A',
                require: '^ivhTreeview',
                link: function(scope, element, attrs, trvw) {
                    var node = scope.node;

                    element.bind('click', function(event) {
                        if (node.selectMenu) {
                            node.selectMenu(node);
                        }
                    });
                }
            };
        }
    ]);

})(NetBrain);

