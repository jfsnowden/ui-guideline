define("ace/theme/text", ["require", "exports", "module", "ace/lib/dom"], function (require, exports, module) {

    exports.padding = 13;
    exports.isDark = false;
    exports.cssClass = "";
    exports.cssText = "";

    var dom = require("../lib/dom");
    dom.importCssString(exports.cssText, exports.cssClass);
});
