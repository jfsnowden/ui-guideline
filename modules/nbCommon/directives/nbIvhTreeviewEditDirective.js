(function() {
    'use strict';

    angular.module('nb.common').directive('nbIvhTreeviewEditDirective', [
        '$timeout', 'nb.ng.utilitySrvc',
        function($timeout, utilitySrvc) {
            return {
                restrict: 'A',
                link: function(scope, elm, attrs) {
                    scope.node = scope.$parent.node;

                    elm.bind('blur', function() {
                        $timeout(function() {
                            scope.$apply(function() {
                                if (scope.node && scope.node.renameFolder) {
                                    var result = utilitySrvc.decodeEntities(elm.html());
                                    scope.node.renameFolder(scope.node.ID, result, scope.node);
                                }
                            });
                        }, 1);
                    });


                    attrs.$observe('contenteditable', function(newValue) {
                        if (newValue === 'true' && !scope.node.systemFolder) {
                            $timeout(function() {
                                var range = document.createRange();
                                range.selectNodeContents(elm[0]);
                                var sel = window.getSelection();
                                if (range.toString() !== sel.toString()) {
                                    sel.removeAllRanges();
                                    sel.addRange(range);
                                }
                            }, 1);
                        }
                    });
                }
            };
        }
    ]);
})(NetBrain);
