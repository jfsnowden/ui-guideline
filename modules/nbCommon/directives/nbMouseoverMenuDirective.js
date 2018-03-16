(function() {
    'use strict';

    angular.module('nb.common').directive('nbMouseoverMenuDirective', [
        '$compile',
        function($compile) {
            return {
                restrict: 'A',
                scope: true,
                replace: false,
                // terminal: true,
                priority: 1000,
                compile: function(element) { // , scope
                    $(element).attr('dropdown', '');
                    $(element).attr('dropdown-append-to-body', '');
                    $(element).attr('is-open', 'isMouseoverMenuShow');

                    var toggleBtn = $(element).children('.dropdown-toggle');
                    var toggleMenu = $(element).children('.dropdown-menu');

                    toggleBtn.attr('ng-mouseenter', 'toggleMouseoverMenu(true, $event)');
                    toggleBtn.attr('ng-mouseleave', 'toggleMouseoverMenu(false, $event)');

                    toggleMenu.css({ 'z-index': 9999 });

                    // For further requirements
                    // toggleMenu.attr('ng-style', '{top: mouseoverMenuPosition.top, left: mouseoverMenuPosition.left}');

                    $(element).removeAttr('nb-mouseover-menu-directive');

                    return function(scope, element2) { // , attr
                        $compile(element2)(scope);

                        scope.toggleMouseoverMenu = function(isShow) { // , event
                            scope.isMouseoverMenuShow = isShow;
                        };
                    };
                }
            };
        }
    ]);
})(NetBrain);
