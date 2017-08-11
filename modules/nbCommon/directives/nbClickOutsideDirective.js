;
(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbClickOutsideDirective', [
        '$document', '$rootScope', '$timeout', function($document, $rootScope, $timeout) {
            return {
                restrict: 'A',
                scope: false,
                link: function($scope, elem, attr) {

                    var classList = (attr.outsideIfNot !== undefined) ? attr.outsideIfNot.replace(', ', ',').split(',') : [];
                    var timer = null;

                    classList.forEach(function (elem) {
                        elem = elem.trim();
                    });

                    if (attr.id !== undefined) classList.push(attr.id);

                    var $body = $('body');

                    $scope.$on('$destroy', function(){
                        if(timer) $timeout.cancel(timer);
                        $body.off('click', docClickHander);
                        if(attr.clickOutsideHide){
                            $body.off('mousedown', mousedownHander);
                        }
                    });

                    $body.on('click', docClickHander);
                    if(attr.clickOutsideHide){
                        $body.on('mousedown', mousedownHander);
                    }

                    function docClickHander(e) {

                        function timerHandler() {

                            if (!e.target) return;

                            var i = 0,
                                element;

                            for (element = e.target; element; element = element.parentNode) {
                                var id = element.id;
                                var classNames = element.className;
                                if (typeof classNames !== "string") {
                                    continue;
                                }
                                if (id !== undefined) {
                                    for (i = 0; i < classList.length; i++) {
                                        if (id.indexOf(classList[i]) > -1 || classNames.indexOf(classList[i]) > -1) {
                                            return;
                                        }
                                    }
                                }
                            }

                            if (attr.clickOutside) {
                                if (
                                    attr.notClickInSelf === 'true'
                                    && elem.find(e.target).length > 0
                                ) {
                                    return;
                                }
                                $scope.$eval(attr.clickOutside);
                            }
                            if(attr.clickOutsideHide){
                                elem.hide();
                            }
                        }

                        if(timer) $timeout.cancel(timer);
                        timer = $timeout(timerHandler);

                    }
                    function mousedownHander(e){
                        if(elem.find(e.target).length === 0) {
                            elem.hide();
                        }
                    }


                }
            };
        }
    ]);

})(NetBrain);