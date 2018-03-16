(function() {
    'use strict';

    angular.module('nb.common').directive('floating', [
        '$document',
        function($document) {
            return {
                restrict: 'EA',
                replace: false,
                link: function(scope, element) { // , attrs
                    element.bind('mousedown', function(event) {
                        var filterClass = ['modal-header', 'modal-title', 'ngMapOperHideFrame', 'panelHead', 'titleBar', 'title', 'floating'];
                        var target = event.target;
                        var bindLocation = function(e) {
                            var origPageY = e.pageY;
                            var origPageX = e.pageX;
                            var origY = element.position().top;
                            var origX = element.position().left;
                            element.bind('mousemove', function(e2) {
                                element.css({
                                    top: origY + e2.pageY - origPageY,
                                    left: origX + e2.pageX - origPageX
                                });
                            });
                            $document.find('body').bind('mousemove.' + scope.$id, function(e3) {
                                element.css({
                                    top: origY + e3.pageY - origPageY,
                                    left: origX + e3.pageX - origPageX
                                });
                            });
                            $document.find('body').addClass('unselectable');
                        };

                        for (var i in filterClass) {
                            if (angular.element(target).hasClass(filterClass[i])) {
                                bindLocation(event);
                            }
                        }
                    });

                    $document.find('body').bind('mouseup', function() {
                        $document.find('body').removeClass('unselectable');
                        $document.find('body').unbind('mousemove.' + scope.$id);
                    });
                    element.bind('mouseup', function() {
                        element.unbind('mousemove');
                        $document.find('body').unbind('mousemove.' + scope.$id);
                        $document.find('body').removeClass('unselectable');
                    });
                }
            };
        }
    ]);
})(NetBrain);
