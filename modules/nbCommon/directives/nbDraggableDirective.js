(function (netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbDraggable', [
        '$log',
        function (
            $log
        ) {
            return {
                restrict: "A",
                scope: false,
                replace: false,
                link: function (scope, element, attr) {
                    var el = element[0];
                    var callback = null;
                    var parentScope = scope;
                    el.draggable = true;

                    if (attr.nbDraggable !== "") {
                        callback = parentScope[attr.nbDraggable];
                        while ((callback === undefined || callback === null) && parentScope.$parent) {
                            parentScope = parentScope.$parent;
                            callback = parentScope[attr.nbDraggable]
                            ;
                        }
                    }

                    el.addEventListener('dragstart', function (event) {
                        //event.preventDefault();
                        if (callback) {
                            //callback(parentScope, event);
                            callback(scope, event);
                        } else {
                            $log.log("no callback method");
                        }
                        return false;
                    },
                        false);

                    el.addEventListener('dragend', function (event) {

                    });
                }
            }
        }
    ]);

})(NetBrain);