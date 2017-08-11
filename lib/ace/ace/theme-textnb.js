define("ace/theme/textnb",["require","exports","module","ace/lib/dom"], function(require, exports, module) {

exports.padding = 13;
exports.isDark = false;
exports.cssClass = "ace-textnb";
exports.cssText = ".ace-textnb .ace_gutter {\
background: #ebebeb;\
color: #246199;\
border-right: 1px dotted #246199;\
overflow: visible;\
}\
.ace-textnb .ace_gutter-layer{\
overflow: visible;\
}\
.ace-textnb .ace_gutter-active-line {\
background-color : #dcdcdc;\
}\
.ace-textnb .ace_print-margin {\
width: 1px;\
background: #e8e8e8;\
}\
.ace-textnb {\
background-color: #FFFFFF;\
color: black;\
}\
.ace-textnb .ace_cursor {\
color: black;\
}\
.ace-textnb .ace_invisible {\
color: rgb(191, 191, 191);\
}\
.ace-textnb .ace_constant.ace_buildin {\
color: rgb(88, 72, 246);\
}\
.ace-textnb .ace_constant.ace_language {\
color: rgb(88, 92, 246);\
}\
.ace-textnb .ace_constant.ace_library {\
color: rgb(6, 150, 14);\
}\
.ace-textnb .ace_constant.ace_numeric {\
color: rgb(0, 0, 205);\
}\
.ace-textnb .ace_invalid {\
background-color: rgb(153, 0, 0);\
color: white;\
}\
.ace-textnb .ace_fold {\
display:initial;\
background-image:none;\
border: 1px dotted gray;\
color: black;\
border-radius: 3px;\
vertical-align: baseline;\
padding: 0px 5px;\
}\
.ace-textnb .ace_support.ace_function {\
color: rgb(60, 76, 114);\
}\
.ace-textnb .ace_support.ace_constant {\
color: rgb(6, 150, 14);\
}\
.ace-textnb .ace_support.ace_type,\
.ace-textnb .ace_support.ace_class,\
.ace-textnb .ace_support.ace_other {\
color: rgb(109, 121, 222);\
}\
.ace-textnb .ace_variable {\
color: rgb(49, 132, 149);\
}\
.ace-textnb .ace_variable.ace_parameter {\
font-style:italic;\
color:#FD971F;\
}\
.ace-textnb .ace_keyword.ace_operator {\
color: rgb(104, 118, 135);\
}\
.ace-textnb .ace_comment {\
color: #236e24;\
}\
.ace-textnb .ace_comment.ace_doc {\
color: #236e24;\
}\
.ace-textnb .ace_comment.ace_doc.ace_tag {\
color: #236e24;\
}\
.ace-textnb .ace_marker-layer .ace_selection {\
background: rgb(181, 213, 255);\
}\
.ace-textnb .ace_marker-layer .ace_step {\
background: rgb(252, 255, 0);\
}\
.ace-textnb .ace_marker-layer .ace_stack {\
background: rgb(164, 229, 101);\
}\
.ace-textnb .ace_marker-layer .ace_bracket {\
margin: -1px 0 0 -1px;\
border: 1px solid rgb(192, 192, 192);\
}\
.ace-textnb .ace_marker-layer .ace_active-line {\
background: rgba(0, 0, 0, 0.07);\
}\
.ace-textnb .ace_marker-layer .ace_selected-word {\
background: rgb(250, 250, 255);\
border: 1px solid rgb(200, 200, 250);\
}\
.ace-textnb .ace_string {\
color: #1A1AA6;\
}\
.ace-textnb .ace_string.ace_regex {\
color: rgb(255, 0, 0)\
}\
.ace-textnb .ace_storage,\
.ace-textnb .ace_keyword,\
.ace-textnb .ace_meta.ace_tag {\
color: rgb(147, 15, 128);\
}\
.ace-textnb .ace_entity.ace_other.ace_attribute-name {\
color: #994409;\
}\
.ace-textnb .ace_entity.ace_name.ace_function {\
color: #0000A2;\
}\
.ace-textnb .ace_xml-pe {\
color: rgb(104, 104, 91);\
}\
.ace-textnb .ace_heading {\
color: rgb(12, 7, 255);\
}\
.ace-textnb .ace_list {\
color:rgb(185, 6, 144);\
}\
.ace-textnb .ace_fold-widget {\
text-align: center;\
position: absolute;\
right: -1px;\
}\
.ace-textnb .ace_indent-guide {\
background: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAACCAYAAACZgbYnAAAAE0lEQVQImWP4////f4bLly//BwAmVgd1/w11/gAAAABJRU5ErkJggg==\") right repeat-y;\
}\
";

var dom = require("../lib/dom");
dom.importCssString(exports.cssText, exports.cssClass);
});
