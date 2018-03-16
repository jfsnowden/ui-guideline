/**
 * Created by Marko Cen on 9/23/2015.
 */
(function() {
    'use strict';

    angular.module('nb.common').directive('nbGroupContainerDirective', GroupContainerDirective);

    GroupContainerDirective.$inject = [];

    function GroupContainerDirective() { // $document
        var directive = {
            restrict: 'A',
            scope: false,
            priority: 0,
            compile: compile
        };

        function compile() {
            return {
                pre: function() { // scope, ele, attr

                },
                post: function(scope, ele, attr) {
                    ele[0].style.position = 'relative';
                    ele[0].style.padding = '15px';
                    ele[0].style.border = '1px solid lightgray';
                    ele[0].style.borderRadius = '3px';

                    var label = document.createElement('label');
                    label.innerHTML = attr.nbGroupContainerDirective;
                    label.style.position = 'absolute';
                    label.style.marginTop = '-23px';
                    label.style.paddingLeft = '5px';
                    label.style.paddingRight = '5px';
                    label.style.backgroundColor = 'white';

                    ele.prepend(label);
                }
            };
        }

        return directive;
    }
})(NetBrain);
