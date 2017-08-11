(function(netBrain) {
    'use strict';

    angular.module('nb.common').factory('nb.common.ContextMenuService', function() {
        return {
            element: null,
            menuElement: null
        };
    });

    angular.module('nb.common').directive('nbContextMenuDirective', [
        '$document', 'nb.common.ContextMenuService',
        function($document, ContextMenuService) {
            return {
                restrict: 'A',
                scope: {
                    'callback': '&nbContextMenuDirective',
                    'disabled': '&contextMenuDisabled',
                    'closeCallback': '&contextMenuClose'
                },
                link: function($scope, $element, $attrs) {
                    var opened = false;

                    function open(event, menuElement) {
                        if (menuElement.length === 0) {
                            return;
                        }
                        var doc = $document[0].documentElement;
                        var docLeft = (window.pageXOffset || doc.scrollLeft) -
                            (doc.clientLeft || 0),
                            docTop = (window.pageYOffset || doc.scrollTop) -
                            (doc.clientTop || 0),
                            elementWidth = menuElement[0].scrollWidth,
                            elementHeight = menuElement[0].scrollHeight;
                        var docWidth = doc.clientWidth + docLeft,
                            docHeight = doc.clientHeight + docTop,
                            totalWidth = elementWidth + event.pageX,
                            totalHeight = elementHeight + event.pageY,
                            left = Math.max(event.pageX - docLeft, 0),
                            top = Math.max(event.pageY - docTop, 0);

                        if (totalWidth > docWidth) {
                            left = left - (totalWidth - docWidth);
                        }

                        if (totalHeight > docHeight) {
                            top = top - (totalHeight - docHeight);
                        }

                        menuElement.css('top', top + 'px');
                        menuElement.css('left', left + 'px');
                        menuElement.css({ "display": "block" });
                        opened = true;
                    }

                    function close(menuElement) {
                        menuElement.css({ "display": "none" });
                        if (opened) {
                            $scope.closeCallback(menuElement);
                        }

                        opened = false;
                    }

                    $element.bind('contextmenu', function(event) {
                        event.preventDefault();
                        if (!$scope.disabled()) {
                            if (typeof ($scope.$parent.preventContext) === 'function'&&$scope.$parent.preventContext()) {
                                return;
                            }
                            if (ContextMenuService.menuElement !== null) {
                                close(ContextMenuService.menuElement);
                            }
                            ContextMenuService.menuElement = angular.element(
                                document.getElementById($attrs.target)
                            );
                            ContextMenuService.element = event.target;

                            event.preventDefault();
                            $scope.$apply(function() {
                                $scope.callback({ $event: event });
                            });
                            $scope.$apply(function() {
                                open(event, ContextMenuService.menuElement);
                            });
                        }
                    });

                    function handleKeyUpEvent(event) {
                        if (!$scope.disabled() && opened && event.keyCode === 27) {
                            $scope.$apply(function() {
                                close(ContextMenuService.menuElement);
                            });
                        }
                    }

                    function handleClickEvent(event) {
                        if ( /*!$scope.disabled() &&*/
                            opened &&
                            (event.button !== 2 ||
                                event.target !== ContextMenuService.element)) {
                            if ($(event.target).next().children()[0]&&$($(event.target).next().children()[0]).hasClass('ng-scope')) {
                                return;
                            }
                            $scope.$apply(function() {
                                close(ContextMenuService.menuElement);
                            });
                        }
                    }

                    $document.bind('keyup', handleKeyUpEvent);
                    // Firefox treats a right-click as a click and a contextmenu event
                    // while other browsers just treat it as a contextmenu event
                    $document.bind('click', handleClickEvent);
                    $document.bind('contextmenu', handleClickEvent);

                    $scope.$on('$destroy', function() {
                        $document.unbind('keyup', handleKeyUpEvent);
                        $document.unbind('click', handleClickEvent);
                        $document.unbind('contextmenu', handleClickEvent);
                    });
                }
            };
        }
    ]);

})(NetBrain);