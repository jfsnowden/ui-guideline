/**
 * Created by Marko Cen on 12/16/2015.
 */


;(function (NetBrain) {
    angular.module('nb.common').directive('trvwHelper', TrvwHelper);

    TrvwHelper.$inject = [];
    function TrvwHelper() {
        return {
            restrict: 'A',
            scope: false,
            require: ['^^nbTreeviewDirective', 'ivhTreeview'],
            link: function (scope, ele, attr, ctrls) {
                var nbTreeview = ctrls[0];
                var trvw = ctrls[1];
                nbTreeview.trvw = trvw;
            }
        }
    }
})(window.NetBrain);