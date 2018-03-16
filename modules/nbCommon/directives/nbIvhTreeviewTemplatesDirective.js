(function() {
    'use strict';

    angular.module('nb.common').directive('openTwist', function() {
        return {
            restrict: 'E',
            template: '<span class="icon_nb_tree_collapse" ></span>'
        };
    });

    angular.module('nb.common').directive('collapsedTwist', function() {
        return {
            restrict: 'E',
            template: '<span class="icon_nb_tree_expand" ></span>'
        };
    });
})(NetBrain);
