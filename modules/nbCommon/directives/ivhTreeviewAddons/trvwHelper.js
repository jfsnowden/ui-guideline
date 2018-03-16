/**
 * Created by Marko Cen on 12/16/2015.
 */
(function() {
    angular.module('nb.common').directive('trvwHelper', TrvwHelper);

    TrvwHelper.$inject = [];

    function TrvwHelper() {
        return {
            restrict: 'A',
            scope: false,
            require: ['^^nbTreeviewDirective', 'ivhTreeview'],
            link: function(scope, ele, attr, ctrls) {
                var nbTreeview = ctrls[0];
                var trvw = ctrls[1];
                nbTreeview.trvw = trvw;
            }
        };
    }
})(window.NetBrain);

/**
 * Created by Yang YL on 01/29/2018.
 * 用于节点内容长度显示设置限制后扩展
 */
(function() {
    angular.module('nb.common').directive('trvwHelperExtend', TrvwHelperExtend);

    TrvwHelperExtend.$inject = [];

    function TrvwHelperExtend() {
        return {
            restrict: 'A',
            scope: false,
            require: ['^^nbTreeviewDirective', 'ivhTreeviewExtend'],
            link: function(scope, ele, attr, ctrls) {
                var nbTreeview = ctrls[0];
                var trvw = ctrls[1];
                nbTreeview.trvw = trvw;
            }
        };
    }
})(window.NetBrain);