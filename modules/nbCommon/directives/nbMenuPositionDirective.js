(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive("nbMenuPositionDirective", function() {
        return {
            restrict: 'A',

            link: function(scope, element, attrs) {
                if (!attrs.nbMenuPositionDirective) return;
                var treeContent = $(attrs.nbMenuPositionDirective);
                if (treeContent && treeContent.length) {
                    var treeTop = treeContent[0].scrollTop;
                    var offsetTop = element[0].offsetTop;
                    element[0].style.top = offsetTop - treeTop + "px";
                }
            }
        }
    });

})(NetBrain);