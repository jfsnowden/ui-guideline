(function() {
    'use strict';

    angular.module('nb.common').directive('nbGridEditDirective', [
        '$timeout',
        function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, elm, attrs) {
                    scope.node = scope.$parent.row.entity;

                    attrs.$observe('contenteditable', function(newValue) {
                        if (newValue === 'true') {
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
