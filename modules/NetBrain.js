(function (window, undefined) {
    'use strict'

    var NetBrain = window.NetBrain || {};
    NetBrain.ns = function (namespace) {
        if (!namespace || !namespace.length) {
            return null;
        }

        var levels = namespace.split(".");
        var nsobj = NetBrain;
        for (var i = (levels[0] === "NetBrain") ? 1 : 0; i < levels.length; ++i) {
            nsobj[levels[i]] = nsobj[levels[i]] || {};
            nsobj = nsobj[levels[i]];
        }
        return nsobj;
    };
    NetBrain.Page = {};
    window.NetBrain = NetBrain;
})(window);