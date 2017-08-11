define("ace/qapp_autocomplete/popup", ["require", "exports", "module", "ace/edit_session", "ace/virtual_renderer", "ace/editor", "ace/range", "ace/lib/event", "ace/lib/lang", "ace/lib/dom"], function (require, exports, module) {
    "use strict";

    var EditSession = require("../edit_session").EditSession;
    var Renderer = require("../virtual_renderer").VirtualRenderer;
    var Editor = require("../editor").Editor;
    var Range = require("../range").Range;
    var event = require("../lib/event");
    var lang = require("../lib/lang");
    var dom = require("../lib/dom");

    var $singleLineEditor = function (el) {
        var renderer = new Renderer(el);

        renderer.$maxLines = 4;

        var editor = new Editor(renderer);

        editor.setHighlightActiveLine(false);
        editor.setShowPrintMargin(false);
        editor.renderer.setShowGutter(false);
        editor.renderer.setHighlightGutterLine(false);

        editor.$mouseHandler.$focusWaitTimout = 0;
        editor.$highlightTagPending = true;

        return editor;
    };

    var AcePopup = function (parentNode) {
        var el = dom.createElement("div");
        var popup = new $singleLineEditor(el);

        if (parentNode)
            parentNode.appendChild(el);
        el.style.display = "none";
        popup.renderer.content.style.cursor = "default";
        popup.renderer.setStyle("ace_qapp_autocomplete");

        popup.setOption("displayIndentGuides", false);
        popup.setOption("dragDelay", 150);

        var noop = function () { };

        popup.focus = noop;
        popup.$isFocused = true;

        popup.renderer.$cursorLayer.restartTimer = noop;
        popup.renderer.$cursorLayer.element.style.opacity = 0;

        popup.renderer.$maxLines = 8;
        popup.renderer.$keepTextAreaAtCursor = false;

        popup.setHighlightActiveLine(false);
        popup.session.highlight("");
        popup.session.$searchHighlight.clazz = "ace_highlight-marker";

        popup.on("mousedown", function (e) {
            var pos = e.getDocumentPosition();
            popup.selection.moveToPosition(pos);
            selectionMarker.start.row = selectionMarker.end.row = pos.row;
            e.stop();
        });

        var lastMouseEvent;
        var hoverMarker = new Range(-1, 0, -1, Infinity);
        var selectionMarker = new Range(-1, 0, -1, Infinity);
        selectionMarker.id = popup.session.addMarker(selectionMarker, "ace_active-line", "fullLine");
        popup.setSelectOnHover = function (val) {
            if (!val) {
                hoverMarker.id = popup.session.addMarker(hoverMarker, "ace_line-hover", "fullLine");
            } else if (hoverMarker.id) {
                popup.session.removeMarker(hoverMarker.id);
                hoverMarker.id = null;
            }
        };
        popup.setSelectOnHover(false);
        popup.on("mousemove", function (e) {
            if (!lastMouseEvent) {
                lastMouseEvent = e;
                return;
            }
            if (lastMouseEvent.x == e.x && lastMouseEvent.y == e.y) {
                return;
            }
            lastMouseEvent = e;
            lastMouseEvent.scrollTop = popup.renderer.scrollTop;
            var row = lastMouseEvent.getDocumentPosition().row;
            if (hoverMarker.start.row != row) {
                if (!hoverMarker.id)
                    popup.setRow(row);
                setHoverMarker(row);
            }
        });
        popup.renderer.on("beforeRender", function () {
            if (lastMouseEvent && hoverMarker.start.row != -1) {
                lastMouseEvent.$pos = null;
                var row = lastMouseEvent.getDocumentPosition().row;
                if (!hoverMarker.id)
                    popup.setRow(row);
                setHoverMarker(row, true);
            }
        });
        popup.renderer.on("afterRender", function () {
            var row = popup.getRow();
            var t = popup.renderer.$textLayer;
            var selected = t.element.childNodes[row - t.config.firstRow];
            if (selected == t.selectedNode)
                return;
            if (t.selectedNode)
                dom.removeCssClass(t.selectedNode, "ace_selected");
            t.selectedNode = selected;
            if (selected)
                dom.addCssClass(selected, "ace_selected");
        });
        var hideHoverMarker = function () { setHoverMarker(-1) };
        var setHoverMarker = function (row, suppressRedraw) {
            if (row !== hoverMarker.start.row) {
                hoverMarker.start.row = hoverMarker.end.row = row;
                if (!suppressRedraw)
                    popup.session._emit("changeBackMarker");
                popup._emit("changeHoverMarker");
            }
        };
        popup.getHoveredRow = function () {
            return hoverMarker.start.row;
        };

        event.addListener(popup.container, "mouseout", hideHoverMarker);
        popup.on("hide", hideHoverMarker);
        popup.on("changeSelection", hideHoverMarker);

        popup.session.doc.getLength = function () {
            return popup.data.length;
        };
        popup.session.doc.getLine = function (i) {
            var data = popup.data[i];
            if (typeof data == "string")
                return data;
            return (data && data.value) || "";
        };

        var bgTokenizer = popup.session.bgTokenizer;
        bgTokenizer.$tokenizeRow = function (row) {
            var data = popup.data[row];
            var tokens = [];
            if (!data)
                return tokens;
            if (typeof data == "string")
                data = { value: data };
            if (!data.caption)
                data.caption = data.value || data.name;
            if (data.meta == "keyword")
                tokens.push({ type: "qappTipIcon qappTipIcon-key", value: " " });
            else if (data.meta && data.meta.indexOf("qapp") >= 0) {
                if (data.qappType == "var")//
                    tokens.push({ type: "qappTipIcon qappTipIcon-var", value: " " });
                else if (data.qappType == "fn")//
                    tokens.push({ type: "qappTipIcon qappTipIcon-fn", value: " " });
                else if (data.qappType == "c")//
                    tokens.push({ type: "qappTipIcon qappTipIcon-class", value: " " });
                else if (data.qappType == "e")//
                    tokens.push({ type: "qappTipIcon qappTipIcon-enum", value: " " });
                else
                    tokens.push({ type: "qappTipIcon qappTipIcon-qapp", value: " " });
            } else
                tokens.push({ type: "qappTipIcon qappTipIcon-undefined", value: " " });
            var last = -1;
            var flag, c;
            for (var i = 0; i < data.caption.length; i++) {
                c = data.caption[i];
                flag = data.matchMask & (1 << i) ? 1 : 0;
                if (last !== flag) {
                    tokens.push({ type: data.className || "" + (flag ? "completion-highlight" : ""), value: c });
                    last = flag;
                } else {
                    tokens[tokens.length - 1].value += c;
                }

            }
            return tokens;
        };
        bgTokenizer.$updateOnChange = noop;
        bgTokenizer.start = noop;

        popup.session.$computeWidth = function () {
            return this.screenWidth = 0;
        };

        popup.$blockScrolling = Infinity;
        popup.isOpen = false;
        popup.isTopdown = false;

        popup.data = [];
        popup.setData = function (list) {
            popup.data = list || [];
            popup.setValue(lang.stringRepeat("\n", list.length), -1);
            popup.setRow(0);
        };
        popup.getData = function (row) {
            return popup.data[row];
        };

        popup.getRow = function () {
            return selectionMarker.start.row;
        };
        popup.setRow = function (line) {
            line = Math.max(-1, Math.min(this.data.length, line));
            if (selectionMarker.start.row != line) {
                popup.selection.clearSelection();
                selectionMarker.start.row = selectionMarker.end.row = line || 0;
                popup.session._emit("changeBackMarker");
                popup.moveCursorTo(line || 0, 0);
                if (popup.isOpen)
                    popup._signal("select");
            }
        };

        popup.on("changeSelection", function () {
            if (popup.isOpen)
                popup.setRow(popup.selection.lead.row);
            popup.renderer.scrollCursorIntoView();
        });

        popup.hide = function () {
            this.container.style.display = "none";
            this._signal("hide");
            popup.isOpen = false;
        };
        popup.show = function (pos, lineHeight, topdownOnly) {
            var el = this.container;
            var screenHeight = window.innerHeight;
            var screenWidth = window.innerWidth;
            var renderer = this.renderer;
            var maxH = renderer.$maxLines * lineHeight * 1.4;
            var top = pos.top + this.$borderSize;
            if (top + maxH > screenHeight - lineHeight && !topdownOnly) {
                el.style.top = "";
                el.style.bottom = screenHeight - top + "px";
                popup.isTopdown = false;
            } else {
                top += lineHeight;
                el.style.top = top + "px";
                el.style.bottom = "";
                popup.isTopdown = true;
            }

            el.style.display = "";
            this.renderer.$textLayer.checkForSizeChanges();

            var left = pos.left;
            if (left + el.offsetWidth > screenWidth)
                left = screenWidth - el.offsetWidth;

            el.style.left = left + "px";

            this._signal("show");
            lastMouseEvent = null;
            popup.isOpen = true;
        };

        popup.getTextLeftOffset = function () {
            return this.$borderSize + this.renderer.$padding + this.$imageSize;
        };

        popup.$imageSize = 0;
        popup.$borderSize = 1;

        return popup;
    };

    dom.importCssString("\
.ace_editor.ace_qapp_autocomplete .ace_marker-layer .ace_active-line {\
    background-color: #aad7f1;\
    z-index: 1;\
}\
.ace_editor.ace_qapp_autocomplete .ace_line-hover {\
    margin-top: -1px;\
    background: #ddedf8;\
}\
.ace_editor.ace_qapp_autocomplete .ace_line-hover {\
    position: absolute;\
    z-index: 2;\
}\
.ace_editor.ace_qapp_autocomplete .ace_line {\
    padding-left: 20px;\
}\
.ace_editor.ace_qapp_autocomplete .ace_scroller {\
   background: none;\
   border: none;\
   box-shadow: none;\
}\
.ace_rightAlignedText {\
    color: gray;\
    display: inline-block;\
    position: absolute;\
    right: 4px;\
    text-align: right;\
    z-index: -1;\
}\
.ace_editor.ace_qapp_autocomplete .ace_qappTipIcon{\
	position: absolute;\
	z-index: -1;\
	left: 4px;\
}\
.ace_editor.ace_qapp_autocomplete .ace_qappTipIcon:before {\
    position: absolute;\
    left: 0;\
    bottom: 2px;\
    border-radius: 50%;\
    font-weight: bold;\
    height: 13px;\
    width: 13px;\
    font-size: 11px;\
    line-height: 14px;\
    text-align: center;\
    color: white;\
    -moz-box-sizing: border-box;\
    -webkit-box-sizing: border-box;\
    box-sizing: border-box;\
}\
.qappTipIcon-qapp:before{\
	content: 'Q';\
    background: #2b91af;\
}\
.qappTipIcon-var:before{\
	content: 'V';\
    background: #0056a1;\
}\
.qappTipIcon-enum:before{\
	content: 'E';\
    background: #0056a1;\
}\
.qappTipIcon-fn:before{\
	content: 'F';\
    background: #682e95;\
}\
.qappTipIcon-class:before{\
	content: 'C';\
    background: #2b91af;\
}\
.qappTipIcon-key:before{\
	content: 'K';\
    background: #00f;\
}\
.qappTipIcon-undefined:before{\
	content: 'U';\
    background: #cccedb;\
}\
.ace_editor.ace_qapp_autocomplete .ace_completion-highlight{\
    color: #000;\
    text-shadow: 0 0 0.01em;\
}\
.ace_editor.ace_qapp_autocomplete {\
    width: 280px;\
    z-index: 200000;\
    background: #fbfbfb;\
    color: #444;\
    border: 1px solid #c8c8c8;\
    position: fixed;\
    box-shadow: 2px 3px 5px rgba(0,0,0,.2);\
    line-height: 1.5;\
}\
.ace_functiontip{\
    max-width: 1400px;\
	min-width: 160px;\
    height: 34px;\
    overflow: hidden;\
	background: #f7f7f7;\
	border: 1px solid #c8c8c8;\
    z-index: 200000;\
	padding: 4px;\
    position: absolute;\
    overflow: hidden;\
}\
.ace_tooltip.ace_doc-tooltip{\
	max-width: 320px;\
	min-width: 160px;\
    overflow: hidden;\
	background: #f7f7f7;\
	border: 1px solid #c8c8c8;\
	padding: 4px;\
}\
.ace_tooltip.ace_doc-tooltip .ace-python-tooltip-header{\
	font-size: 13px;\
	height: 22px;\
    font-weight: 600;\
	overflow: hidden;\
}\
.ace_tooltip.ace_doc-tooltip .ace-python-tooltip-body{\
	font-size: 12px;\
    color: gray;\
	white-space: normal;\
}\
.ace_tooltip.ace_doc-tooltip .ace-python-tooltip-body-desc{\
	font-size: 12px;\
	white-space: normal;\
}\
");

    exports.AcePopup = AcePopup;

});

define("ace/qapp_autocomplete/util", ["require", "exports", "module"], function (require, exports, module) {
    "use strict";

    exports.parForEach = function (array, fn, callback) {
        var completed = 0;
        var arLength = array.length;
        if (arLength === 0)
            callback();
        for (var i = 0; i < arLength; i++) {
            fn(array[i], function (result, err) {
                completed++;
                if (completed === arLength)
                    callback(result, err);
            });
        }
    };

    var ID_REGEX = /[a-zA-Z_0-9\$\-\u00A2-\uFFFF]/;

    exports.retrievePrecedingIdentifier = function (text, pos, regex) {
        regex = regex || ID_REGEX;
        var bPoint = text[pos - 1] === '.';
        if (bPoint)
            return '.';
        var buf = [];
        for (var i = pos - 1; i >= 0; i--) {
            if (regex.test(text[i]))
                buf.push(text[i]);
            else
                break;
        }
        if (text.length > buf.length && text[text.length - buf.length - 1] === '.')
            buf.push('.');
        return buf.reverse().join("");
    };

    exports.retrieveFollowingIdentifier = function (text, pos, regex) {
        regex = regex || ID_REGEX;
        var buf = [];
        for (var i = pos; i < text.length; i++) {
            if (regex.test(text[i]))
                buf.push(text[i]);
            else
                break;
        }
        return buf;
    };

    var PythonVarNameRegex = /^[\$A-Za-z_][\$A-Za-z0-9_]*$/;
    var PythonOperatorMap = (function () {
        var ret = {};
        '~ + - * / % & ^ | < > = : ( ) [ ] { } . , ** >> << <= >= <> == != %= /= -= += *= //= **='.split(' ').forEach(function (ele) {
            if (ele)
                ret[ele] = 1;
        });
        return ret;
    })();
    var PythonKeywordMap = (function () {
        var ret = {};
        'False class finally is return None continue for lambda try True def from nonlocal while and del global not with as elif if or yield assert else import pass break except in raise'.split(' ').forEach(function (ele) {
            if (ele)
                ret[ele] = 1;
        })
        return ret;
    })();
    function posInBlocks(pos, blocks) {
        var ret = -1;
        for (var i = 0; i < blocks.length; i++) {
            if (pos >= blocks[i].p1 && pos <= blocks[i].p2) {
                ret = i;
                break;
            }
        }
        return ret;
    }
    function getRanges(length, blocks) {
        var ranges = [];
        if (blocks.length) {
            for (var i = 0; i < blocks.length; i++) {
                if (i == 0) {
                    if (blocks[i].p1 > 0)
                        ranges.push({ p1: 0, p2: blocks[i].p1 - 1 });
                } else {
                    if (blocks[i].p1 > blocks[i - 1].p2 + 1)
                        ranges.push({ p1: blocks[i - 1].p2 + 1, p2: blocks[i].p1 - 1 });
                }
            }
            if (length > blocks[blocks.length - 1].p2 + 1)
                ranges.push({ p1: blocks[blocks.length - 1].p2 + 1, p2: length - 1 });
        } else {
            ranges.push({ p1: 0, p2: length - 1 });
        }
        return ranges;
    }
    function isBlockInLeftSquare(index, blocks) {
        if (index >= blocks.length)
            return null;
        var iRight = 0;
        for (var i = index - 1; i >= 0; i--) {
            if (blocks[i].c1 == ']')
                iRight++;
            else if (blocks[i].c1 == '[') {
                if (iRight == 0) {
                    return i;
                } else {
                    iRight--;
                }
            }
        }
        return null
    }
    function extractStrings(line) {//return: block
        var ret = [];
        var curBlock = null, bEscape = false;
        for (var i = 0; i < line.length; i++) {
            if (line[i] == '#') {
                if (!curBlock) {
                    curBlock = { p1: i, p2: line.length - 1, type: 'string', type2: 'note', c1: line[i] };
                    ret.push(curBlock);
                    curBlock = null;
                    break;
                }
            } else if (line[i] == '\'' || line[i] == '"') {
                if (bEscape) {
                    bEscape = false;
                } else {
                    if (curBlock && curBlock.c1 == line[i]) {
                        curBlock.p2 = i;
                        ret.push(curBlock);
                        curBlock = null;
                    } else if (curBlock && curBlock.c1 != line[i]) {
                    } else {
                        curBlock = { p1: i, p2: -1, type: 'string', c1: line[i] };
                    }
                }
            } else if (line[i] == '\\') {
                bEscape = !bEscape;
            } else {
                if (bEscape)
                    bEscape = false
            }
        }
        if (curBlock) {
            curBlock.p2 = line.length - 1;
            ret.push(curBlock);
        }
        return ret;
    }
    function extractSpaces(line, excludeBlocks) {//return: block
        var ret = [];
        var curBlock = null;
        for (var i = 0; i < line.length; i++) {
            if (posInBlocks(i, excludeBlocks) >= 0 || (line[i] != ' ' && line[i] != '\t')) {
                if (curBlock) {
                    curBlock.p2 = i - 1;
                    ret.push(curBlock);
                    curBlock = null;
                }
            } else {
                if (!curBlock) {
                    curBlock = { p1: i, p2: -1, type: 'space', c1: line[i] };
                }
            }
        }
        if (curBlock) {
            curBlock.p2 = line.length - 1;
            ret.push(curBlock);
        }
        return ret;
    }
    function extractOperators(line, excludeBlocks) {//return block
        var ret = [];
        var curBlock = null;
        //1: ~ + - * / % & ^ | < > = ( ) [ ] { } . ,
        //2: ** >> << <= >= <> == != %= /= -= += *= 
        //3: //= **=
        for (var i = 0; i < line.length; i++) {
            if (posInBlocks(i, excludeBlocks) >= 0 || !PythonOperatorMap[line[i]]) {
                if (curBlock) {
                    curBlock.p2 = i - 1;
                    ret.push(curBlock);
                    curBlock = null;
                }
            } else {
                if (curBlock) {
                    var str = curBlock.type2 + line[i];
                    if (PythonOperatorMap[str]) {
                        curBlock.type2 += line[i];
                    } else {
                        curBlock.p2 = i - 1;
                        ret.push(curBlock);
                        curBlock = { p1: i, p2: -1, type: 'operator', c1: line[i], type2: line[i] };
                    }
                } else {
                    curBlock = { p1: i, p2: -1, type: 'operator', c1: line[i], type2: line[i] };
                }
            }
        }
        if (curBlock) {
            curBlock.p2 = line.length - 1;
            ret.push(curBlock);
        }
        return ret;
    }
    function extractKeywords(line, excludeBlocks) {//return block
        var ret = [];
        var ranges = getRanges(line.length, excludeBlocks);
        for (var i = 0; i < ranges.length; i++) {
            var key = line.substr(ranges[i].p1, ranges[i].p2 - ranges[i].p1 + 1);
            if (PythonKeywordMap[key]) {
                ret.push({ p1: ranges[i].p1, p2: ranges[i].p2, type: 'keyword', c1: line[ranges[i].p1], type2: key });
            }
        }
        return ret;
    }
    function extractOperands(line, excludeBlocks) {//return block
        var ret = [];
        var ranges = getRanges(line.length, excludeBlocks);
        for (var i = 0; i < ranges.length; i++) {
            var key = line.substr(ranges[i].p1, ranges[i].p2 - ranges[i].p1 + 1);
            var curBlock = { p1: ranges[i].p1, p2: ranges[i].p2, type: 'operand', c1: line[ranges[i].p1] }
            if (PythonVarNameRegex.test(key)) {
                curBlock.type2 = 'variable';
            } else {
                curBlock.type2 = 'other';
            }
            ret.push(curBlock);
        }
        return ret;
    }
    function compareBlock(block1, block2) {
        return block1.p1 - block2.p1;
    }
    exports.parsePythonLine = function (line) {//{line: '', blocks: [{p1: 0, p2: 0, type: '', type2: '', c1: ''}]}, type: string, space, operator(. , ( ) ), keyword, operand(variable, data, bool, other)

        var excludeBlocks = extractStrings(line);
        excludeBlocks = excludeBlocks.concat(extractSpaces(line, excludeBlocks)).sort(compareBlock);
        excludeBlocks = excludeBlocks.concat(extractOperators(line, excludeBlocks)).sort(compareBlock);
        excludeBlocks = excludeBlocks.concat(extractKeywords(line, excludeBlocks)).sort(compareBlock);
        excludeBlocks = excludeBlocks.concat(extractOperands(line, excludeBlocks)).sort(compareBlock);

        return { line: line, blocks: excludeBlocks };
    };

    exports.getContext = function (blocks, pos, line, fnGetFunction) {//return {pos: pos, block: null, index: 0}
        var ret = { pos: pos, block: null, index: 0, baseDisp: '' };
        var iP1 = posInBlocks(pos, blocks), iP2 = -1, iP3 = -1;
        var leftMap = {}, iBlock;
        if (blocks.length && pos > blocks[blocks.length - 1].p2)
            iP1 = blocks.length;
        if (iP1 > 0) {
            var arr = [];
            for (var i = iP1 - 1; i >= 0; i--) {
                if (blocks[i].type == 'operator') {
                    if (blocks[i].c1 == ',') {
                        if (arr.length == 0) {
                            ret.index++;
                            iBlock = isBlockInLeftSquare(i, blocks);
                            if (iBlock > 0) {
                                if (leftMap[iBlock])
                                    leftMap[iBlock] = leftMap[iBlock] + 1;
                                else
                                    leftMap[iBlock] = 1;
                            }
                        }
                    } else if (blocks[i].c1 == '}' || blocks[i].c1 == ']' || blocks[i].c1 == ')') {
                        arr.unshift(blocks[i].c1);
                    } else if (blocks[i].c1 == '{') {
                        if (arr.length && arr[0] == '}') {
                            arr.shift();
                        }
                    } else if (blocks[i].c1 == '[') {
                        if (arr.length && arr[0] == ']') {
                            arr.shift();
                        }
                    } else if (blocks[i].c1 == '(') {
                        if (arr.length) {
                            if (arr[0] == ')')
                                arr.shift();
                        } else {
                            iP2 = i;
                            break;
                        }
                    }
                }
            }
        }
        if (iP2 >= 1) {
            var arr = [], onlySpace = true;
            for (var i = iP2 - 1; i >= 0; i--) {
                if (blocks[i].type == 'operator') {
                    if (onlySpace) {
                        if (blocks[i].c1 != ')' && blocks[i].c1 != ']' && blocks[i].c1 != '}') {
                            break;
                        }
                    }
                    if (blocks[i].c1 == ',') {
                        if (arr.length == 0) {
                            ret.index++;
                        }
                    } else if (blocks[i].c1 == '}' || blocks[i].c1 == ']' || blocks[i].c1 == ')') {
                        arr.unshift(blocks[i].c1);
                    } else if (blocks[i].c1 == '{') {
                        if (arr.length && arr[0] == '}') {
                            arr.shift();
                        }
                    } else if (blocks[i].c1 == '[') {
                        if (arr.length && arr[0] == ']') {
                            arr.shift();
                        }
                    } else if (blocks[i].c1 == '(') {
                        if (arr.length && arr[0] == ')') {
                            if (arr[0] == ')')
                                arr.shift();
                        }
                    }
                } else if (blocks[i].type == 'operand') {
                    if (onlySpace) {
                        if (blocks[i].type2 != 'variable')
                            break;
                    }
                    if (arr.length == 0 && blocks[i].type2 == 'variable') {
                        iP3 = i;
                        break;
                    }
                } else if (blocks[i].type == 'keyword') {
                    if (onlySpace) {
                        break;
                    }
                }
                if (blocks[i].type != 'space') {
                    onlySpace = false;
                }
            }
        }
        if (iP2 >= 0 && iP3 >= 0) {
            var iMinus = 0;
            var funcArr = [];
            var curABFunc = null;
            Object.getOwnPropertyNames(leftMap).forEach(function (idx) {
                if (idx > iP2)
                    iMinus += leftMap[idx];
            })
            if (ret.index >= iMinus)
                ret.index -= iMinus;
            if (fnGetFunction) {
                var fnNamePre = line.substr(0, blocks[iP2].p1);
                var fnName = /([a-zA-Z0-9\$_]+)$/.exec(fnNamePre);
                fnName = fnName && fnName[0] || '';
                funcArr = fnGetFunction(fnNamePre);
                funcArr.some(function (eleFunc) {
                    if (eleFunc.qappType === 'fn' && eleFunc.parameters.length >= ret.index && eleFunc.name == fnName) {
                        curABFunc = eleFunc;
                        return true;
                    }
                })
                if (!curABFunc) {
                    funcArr.some(function (eleFunc) {
                        if (eleFunc.qappType === 'fn' && eleFunc.name == fnName) {
                            curABFunc = eleFunc;
                            return true;
                        }
                    });
                }
            }
            ret.block = blocks[i];
            var maxWidth = 1000;
            var hearderLength = 0;
            if (curABFunc) {
                hearderLength = nbPLM.OpBaseRule.getRenderedTxtWidth(curABFunc.returnType + ' ' + curABFunc.name + '(', '12px "open sans","Helvetica Neue",Helvetica,Arial');
                curABFunc.parameters.forEach(function (elePar) {
                    elePar.iLength = nbPLM.OpBaseRule.getRenderedTxtWidth(elePar.type + ' ' + elePar.name + ', ', '12px "open sans","Helvetica Neue",Helvetica,Arial');
                })
            }
            //#e45a49
            function getDispInfo(curABFunc, ret, bText) {
                if (curABFunc) {
                    var argFnBuf = [];
                    var iLength = hearderLength, tempLength, iStart = 0, iEnd = curABFunc.parameters.length - 1, curIndex;
                    for (var i = 0; i < curABFunc.parameters.length; i++) {
                        iLength += curABFunc.parameters[i].iLength;
                    }
                    
                    if (iLength > maxWidth) {
                        tempLength = hearderLength;
                        for (var i = 0; i <= ret.index; i++) {
                            if (i >= curABFunc.parameters.length)
                                break;
                            tempLength += curABFunc.parameters[i].iLength;
                        }
                        if (tempLength > maxWidth) {
                            curIndex = 0;
                            while (tempLength > maxWidth) {
                                tempLength -= curABFunc.parameters[curIndex].iLength;
                                curIndex++;
                            }
                            iStart = curIndex;
                            iEnd = ret.index >= curABFunc.parameters.length ? curABFunc.parameters.length - 1 : ret.index;
                        } else {
                            curIndex = ret.index + 1;
                            while (tempLength < maxWidth) {
                                tempLength += curABFunc.parameters[curIndex].iLength;
                                curIndex++;
                            }
                            iEnd = curIndex - 2;
                        }
                    }
                    //curIndex = iEnd;
                    //if (iLength > maxWidth) {
                    //    tempLength = iLength
                    //    while (tempLength > maxWidth) {
                    //        tempLength -= curABFunc.parameters[curIndex].iLength;
                    //        curIndex--;
                    //    }
                    //    if (curIndex > ret.index) {
                    //        iEnd = curIndex;
                    //    } else {
                    //        curIndex = iStart;
                    //        tempLength = iLength
                    //        while (tempLength > maxWidth) {
                    //            tempLength -= curABFunc.parameters[curIndex].iLength;
                    //            curIndex++;
                    //        }
                    //        iStart = curIndex;
                    //    }
                    //}
                    for (var i = iStart; i <= iEnd; i++) {
                        if (i == ret.index) {
                            argFnBuf.push([bText ? '' : '<span style=\'color: blue;\'>', curABFunc.parameters[i].type, bText ? '' : '</span>', ' ', bText ? '' : '<span style=\'color: red;\'>', curABFunc.parameters[i].name, bText ? '' : '</span>'].join(''));
                        } else {
                            argFnBuf.push([curABFunc.parameters[i].type, ' ', curABFunc.parameters[i].name].join(''));
                        }
                    }
                    var strFnBuf
                    if (iStart == 0 && iEnd == curABFunc.parameters.length - 1)
                        strFnBuf = [curABFunc.returnType, ' ', curABFunc.name, '(', argFnBuf.join(', '), ')'];
                    else if (iStart == 0 && iEnd < curABFunc.parameters.length - 1)
                        strFnBuf = [curABFunc.returnType, ' ', curABFunc.name, '(', argFnBuf.join(', '), ', ...)'];
                    else if (iStart > 0 && iEnd == curABFunc.parameters.length - 1)
                        strFnBuf = [curABFunc.returnType, ' ', curABFunc.name, '(..., ', argFnBuf.join(', '), ')'];
                    else
                        strFnBuf = [curABFunc.returnType, ' ', curABFunc.name, '(..., ', argFnBuf.join(', '), ', ...)'];
                    return strFnBuf.join('');
                } else {
                    return '';
                    var baseDisp = line.substr(blocks[iP3].p1, blocks[iP2].p1 - blocks[iP3].p1);
                    var strBuf = [bText ? '' : '<span>', bText ? baseDisp : _.escape(baseDisp), bText ? '' : '</span>', '('];
                    for (var i = 0; i <= ret.index; i++) {
                        strBuf.push(' ');
                        if (i == ret.index)
                            strBuf.push(bText ? '' : '<span style=\'color: red;\'>', 'arg' + i, bText ? '' : '</span>');
                        else
                            strBuf.push(bText ? '' : '<span>', 'arg' + i, bText ? '' : '</span>,');
                    }
                    strBuf.push('...');
                    return strBuf.join('');
                }
            }
            
            ret.html = getDispInfo(curABFunc, ret, false);
            ret.pureContent = getDispInfo(curABFunc, ret, true);
        }
        return ret;
    }

});

define("ace/qapp_autocomplete", ["require", "exports", "module", "ace/keyboard/hash_handler", "ace/qapp_autocomplete/popup", "ace/qapp_autocomplete/util", "ace/lib/event", "ace/lib/lang", "ace/lib/dom", "ace/snippets"], function (require, exports, module) {
    "use strict";

    var HashHandler = require("./keyboard/hash_handler").HashHandler;
    var AcePopup = require("./qapp_autocomplete/popup").AcePopup;
    var util = require("./qapp_autocomplete/util");
    var event = require("./lib/event");
    var lang = require("./lib/lang");
    var dom = require("./lib/dom");
    var snippetManager = require("./snippets").snippetManager;

    var Autocomplete = function () {
        this.autoInsert = true;
        this.autoSelect = true;
        this.exactMatch = true;
        this.keyboardHandler = new HashHandler();
        this.keyboardHandler.bindKeys(this.commands);

        this.blurListener = this.blurListener.bind(this);
        this.changeListener = this.changeListener.bind(this);
        this.mousedownListener = this.mousedownListener.bind(this);
        this.mousewheelListener = this.mousewheelListener.bind(this);
        this.scrollListener = this.scrollListener.bind(this);

        this.listenerBlur = this.listenerBlur.bind(this);
        this.listenerFocus = this.listenerFocus.bind(this);
        this.listenerChangeSelection = this.listenerChangeSelection.bind(this);
        this.listenerMousewheel = this.listenerMousewheel.bind(this);
        this.listenerScroll = this.listenerScroll.bind(this);

        this.changeTimer = lang.delayedCall(function () {
            this.updateCompletions(true);
        }.bind(this));

        this.tooltipTimer = lang.delayedCall(this.updateDocTooltip.bind(this), 50);
        this.functiontipTimer = lang.delayedCall(this.updateFunctionTip.bind(this), 50);
    };

    (function () {
        this.gatherCompletionsId = 0;

        this.$init = function () {
            this.popup = new AcePopup(document.body || document.documentElement);
            this.popup.on("click", function (e) {
                this.insertMatch();
                e.stop();
            }.bind(this));
            this.popup.focus = this.editor.focus.bind(this.editor);
            this.popup.on("show", this.tooltipTimer.bind(null, null));
            this.popup.on("show", this.functiontipTimer.bind(null, null));
            this.popup.on("select", this.tooltipTimer.bind(null, null));
            this.popup.on("changeHoverMarker", this.tooltipTimer.bind(null, null));
            return this.popup;
        };

        this.getPopup = function () {
            return this.popup || this.$init();
        };

        this.openPopup = function (editor, prefix, keepPopupPosition) {
            if (!this.popup)
                this.$init();

            this.popup.setData(this.completions.filtered);

            var renderer = editor.renderer;
            this.popup.setRow(this.autoSelect ? 0 : -1);
            if (!keepPopupPosition) {
                this.popup.setTheme(editor.getTheme());
                this.popup.setFontSize(editor.getFontSize());

                var lineHeight = renderer.layerConfig.lineHeight;

                var pos = renderer.$cursorLayer.getPixelPosition(this.base, true);

                pos.left -= this.popup.getTextLeftOffset();

                var rect = editor.container.getBoundingClientRect();
                pos.top += rect.top - renderer.layerConfig.offset;
                pos.left += rect.left - editor.renderer.scrollLeft;
                pos.left += renderer.$gutterLayer.gutterWidth;
                this.popup.show(pos, lineHeight);
            } else if (keepPopupPosition && !prefix) {
                this.detach();
            }
        };

        this.detach = function () {
            this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
            this.editor.off("changeSelection", this.changeListener);
            this.editor.off("blur", this.blurListener);
            this.editor.off("mousedown", this.mousedownListener);
            this.editor.off("mousewheel", this.mousewheelListener);
            this.editor.renderer.scrollBar.off("scroll", this.scrollListener);
            this.functiontipTimer.cancel();
            this.changeTimer.cancel();
            this.hideDocTooltip();
            if (this.popup && this.popup.isOpen) {
                this.gatherCompletionsId += 1;
                this.popup.hide();
            }

            if (this.base)
                this.base.detach();
            this.activated = false;
            this.completions = this.base = null;
        };

        this.changeListener = function (e) {
            var cursor = this.editor.selection.lead;
            if (cursor.row != this.base.row || cursor.column < this.base.column) {
                this.detach();
            }
            if (this.activated)
                this.changeTimer.schedule();
            else
                this.detach();
        };

        this.blurListener = function (e) {
            var el = document.activeElement;
            var text = this.editor.textInput.getElement()
            if (el != text && el.parentNode != this.popup.container
                && el != this.tooltipNode && e.relatedTarget != this.tooltipNode
                && e.relatedTarget != text
            ) {
                this.detach();
            }
        };

        this.mousedownListener = function (e) {
            this.detach();
        };

        this.scrollListener = function (e) {
            this.detach();
        }

        this.mousewheelListener = function (e) {
            this.detach();
        };

        this.goTo = function (where) {
            var row = this.popup.getRow();
            var max = this.popup.session.getLength() - 1;

            switch (where) {
                case "up": row = row <= 0 ? max : row - 1; break;
                case "down": row = row >= max ? -1 : row + 1; break;
                case "start": row = 0; break;
                case "end": row = max; break;
            }

            this.popup.setRow(row);
        };

        this.insertMatch = function (data) {
            if (!data)
                data = this.popup.getData(this.popup.getRow());
            if (!data)
                return false;

            if (data.completer && data.completer.insertMatch) {
                data.completer.insertMatch(this.editor, data);
            } else {
                if (this.completions.filterText && this.completions.filterText != '.') {
                    var ranges = this.editor.selection.getAllRanges();
                    for (var i = 0, range; range = ranges[i]; i++) {
                        if (this.completions.filterText.length)
                            range.start.column -= this.completions.filterText.charAt(0) != '.' ? this.completions.filterText.length : this.completions.filterText.length - 1;
                        this.editor.session.remove(range);
                    }
                }
                if (data.qappType == 'fn') {
                    this.editor.execCommand("insertstring", data.value.replace(/(\(|\))/g, '') + '(');
                } else if (data.snippet)
                    snippetManager.insertSnippet(this.editor, data.snippet);
                else
                    this.editor.execCommand("insertstring", data.value || data);
            }
            this.detach();
        };


        this.commands = {
            "Up": function (editor) { editor.completer.goTo("up"); },
            "Down": function (editor) { editor.completer.goTo("down"); },
            "Ctrl-Up|Ctrl-Home": function (editor) { editor.completer.goTo("start"); },
            "Ctrl-Down|Ctrl-End": function (editor) { editor.completer.goTo("end"); },

            "Esc": function (editor) { editor.completer.detach(); },
            "Space": function (editor) { editor.completer.detach(); editor.insert(" "); },
            "Return": function (editor) { return editor.completer.insertMatch(); },
            "Shift-Return": function (editor) { editor.completer.insertMatch(true); },
            "Tab": function (editor) {
                var result = editor.completer.insertMatch();
                if (!result && !editor.tabstopManager)
                    editor.completer.goTo("down");
                else
                    return result;
            },

            "PageUp": function (editor) { editor.completer.popup.gotoPageUp(); },
            "PageDown": function (editor) { editor.completer.popup.gotoPageDown(); }
        };

        this.gatherCompletions = function (editor, callback) {
            var session = editor.getSession();
            var pos = editor.getCursorPosition();

            var line = session.getLine(pos.row);
            var prefix = util.retrievePrecedingIdentifier(line, pos.column);

            this.base = session.doc.createAnchor(pos.row, pos.column - prefix.length);
            this.base.$insertRight = true;

            var matches = [];
            var total = editor.completers.length;
            editor.completers.forEach(function (completer, i) {
                completer.getCompletions(editor, session, pos, prefix, function (err, results, tipState) {
                    if (results)
                        if (prefix.charAt(0) === '$' && prefix.indexOf('.') < 0) {
                            results.forEach(function (ele) {
                                if (!ele.value)
                                    ele.value = ele.name.charAt(0) === '$' ? ele.name : '$' + ele.name;
                            })
                        } else {
                            results.forEach(function (ele) {
                                if (!ele.value)
                                    ele.value = ele.name;
                            })
                        }
                    if (!err)
                        matches = matches.concat(results);
                    var pos = editor.getCursorPosition();
                    var line = session.getLine(pos.row);
                    callback(null, {
                        prefix: util.retrievePrecedingIdentifier(line, pos.column, results[0] && results[0].identifierRegex),
                        matches: matches,
                        finished: (--total === 0)
                    }, { session: session, pos: pos });
                });
            });
            return true;
        };

        this.showPopup = function (editor) {
            if (this.editor)
                this.detach();

            this.activated = true;

            this.editor = editor;
            if (editor.completer != this) {
                if (editor.completer)
                    editor.completer.detach();
                editor.completer = this;
            }

            editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
            editor.on("changeSelection", this.changeListener);
            editor.on("blur", this.blurListener);
            editor.on("mousedown", this.mousedownListener);
            editor.on("mousewheel", this.mousewheelListener);
            editor.renderer.scrollBar.on("scroll", this.scrollListener);

            this.updateCompletions();
        };

        this.updateCompletions = function (keepPopupPosition) {
            if (keepPopupPosition && this.base && this.completions) {
                var pos = this.editor.getCursorPosition();
                var prefix = this.editor.session.getTextRange({ start: this.base, end: pos });
                if (prefix == this.completions.filterText)
                    return;
                this.completions.setFilter(prefix, { session: this.editor.session, pos: pos });
                if (!this.completions.filtered.length)
                    return this.detach();
                if (this.completions.filtered.length == 1
                && this.completions.filtered[0].value == prefix
                && !this.completions.filtered[0].snippet)
                    return this.detach();
                this.openPopup(this.editor, prefix, keepPopupPosition);
                return;
            }
            var _id = this.gatherCompletionsId;
            this.gatherCompletions(this.editor, function (err, results, tipState) {
                var detachIfFinished = function () {
                    if (!results.finished) return;
                    return this.detach();
                }.bind(this);

                var prefix = results.prefix;
                var matches = results && results.matches;

                if (!matches || !matches.length)
                    return detachIfFinished();
                if (prefix.indexOf(results.prefix) !== 0 || _id != this.gatherCompletionsId)
                    return;

                this.completions = new FilteredList(matches);

                if (this.exactMatch)
                    this.completions.exactMatch = true;

                this.completions.setFilter(prefix, tipState);
                var filtered = this.completions.filtered;
                if (!filtered.length)
                    return detachIfFinished();
                if (filtered.length == 1 && filtered[0].value == prefix && !filtered[0].snippet)
                    return detachIfFinished();
                if (this.autoInsert && filtered.length == 1 && results.finished)
                    return this.insertMatch(filtered[0]);

                this.openPopup(this.editor, prefix, keepPopupPosition);
            }.bind(this));
        };

        this.cancelContextMenu = function () {
            this.editor.$mouseHandler.cancelContextMenu();
        };

        this.listenerBlur = function () {
            this.hideFunctionTip();
        }

        this.listenerFocus = function () {
            this.updateFunctionTip();
        }

        this.listenerChangeSelection = function () {
            this.updateFunctionTip();
        }

        this.listenerMousewheel = function () {
            this.hideFunctionTip();
        }

        this.listenerScroll = function () {
            this.hideFunctionTip();
        }

        this.configFunctionTip = function (editor) {
            if (!this.editor)
                this.editor = editor;
            if (!this.functionTipNode) {
                editor.on("blur", this.listenerBlur);
                editor.on("focus", this.listenerFocus);
                editor.on("changeSelection", this.listenerChangeSelection);
                editor.on("mousewheel", this.listenerMousewheel);
                editor.renderer.scrollBar.on("scroll", this.listenerMousewheel);
            }
        }

        this.updateFunctionTip = function () {
            this.showFunctionTip('void createEditSession(Document | String text, TextMode mode)');
        }

        this.getFunctionCallback = function () {
            if (!this.editor)
                return null;
            var completer = null;
            this.editor.completers.some(function (ele) {
                if (ele.getFuncCompletions) {
                    completer = ele;
                    return true;
                }
            });
            return completer && completer.getFuncCompletions || null;
        }

        this.showFunctionTip = function (content) {
            if (!this.functionTipNode) {
                this.functionTipNode = dom.createElement("div");
                this.functionTipNode.className = "ace_functiontip";
                this.functionTipNode.style.margin = 0;
                this.functionTipNode.style.pointerEvents = "auto";
                this.functionTipNode.tabIndex = -1;
            }
            var functionTipNode = this.functionTipNode;
            functionTipNode.textContent = content;
            if (!functionTipNode.parentNode)
                document.body.appendChild(functionTipNode);
            if (!this.editor) {
                this.removeFunctionTip();
                return;
            }


            var session = this.editor.getSession();
            var posCursor = this.editor.getCursorPosition();

            var line = session.getLine(posCursor.row);

            if (this.blocks && this.blocks.line == line) {
            } else {
                this.blocks = util.parsePythonLine(line);
            }
            var context = util.getContext(this.blocks.blocks, posCursor.column, line, this.getFunctionCallback());
            if (!context || !context.block || !context.html) {
                functionTipNode.style.display = "none";
                return;
            }
            if (context.html) {
                functionTipNode.innerHTML = context.html;
            } else {
                functionTipNode.textContent = content;///
            }

            var iStart = context && context.block && context.block.p1 < posCursor.column ? context.block.p1 : posCursor.column;
            var pos = this.editor.renderer.$cursorLayer.getPixelPosition({ row: posCursor.row, column: iStart }, true);
            var screenWidth = window.innerWidth;

            var txtWidth = nbPLM.OpBaseRule.getRenderedTxtWidth(context.pureContent || content, '12px "open sans","Helvetica Neue",Helvetica,Arial') + 20;
            txtWidth = txtWidth > 1400 ? 1400 : txtWidth;
            var lineHeight = this.editor.renderer.layerConfig.lineHeight;
            var rect = this.editor.container.getBoundingClientRect();
            pos.top += rect.top - this.editor.renderer.layerConfig.offset + lineHeight;
            pos.left += rect.left - this.editor.renderer.scrollLeft + this.editor.renderer.$gutterLayer.gutterWidth - this.editor.renderer.$padding - 1;

            if (pos.left + txtWidth > screenWidth)
                pos.left -= pos.left + txtWidth - screenWidth;
            functionTipNode.style.left = pos.left + 'px';
            if (this.popup && this.popup.isTopdown == false) {
                functionTipNode.style.top = pos.top + 'px';
                functionTipNode.style.bottom = "";
            } else {
                functionTipNode.style.top = (pos.top - 34 - lineHeight) + 'px';
                functionTipNode.style.bottom = "";
            }
            functionTipNode.style.display = "block";
        }

        this.hideFunctionTip = function () {
            if (!this.functionTipNode) return;
            var el = this.functionTipNode;
            this.functionTipNode.style.display = 'none';
        }

        this.removeFunctionTip = function () {
            var editor = this.editor;
            if (editor) {
                editor.off("blur", this.listenerBlur);
                editor.off("focus", this.listenerFocus);
                editor.off("changeSelection", this.listenerChangeSelection);
                editor.off("mousewheel", this.listenerMousewheel);
                editor.renderer.scrollBar.off("scroll", this.listenerMousewheel);
            }
            if (!this.functionTipNode) return;
            var el = this.functionTipNode;
            if (el.parentNode)
                el.parentNode.removeChild(el);
            this.functionTipNode = null;
        }

        this.getDocTooltip = function (item) {
            if (!item.docHTML) {
                var strTitle = '';
                var desc = '';
                if (item.qappType === 'fn') {
                    strTitle = [item.returnType + ' ' + item.name, '(',
                    item.parameters.map(function (ele) {
                        return ele.type + ' ' + ele.name;
                    }).join(', '), ')'].join('');
                    desc = item.description || '';
                } else {
                    desc = item.description || item.value;
                }
                var arrHtml = [
                "<div class='ace-python-tooltip-header' title='", _.escape(item.value), "'>", _.escape(item.value), "</div>"];
                if (strTitle) {
                    arrHtml.push("<div class='ace-python-tooltip-body'>");
                    arrHtml.push(_.escape(strTitle))
                    arrHtml.push("</div>")
                }
                if (desc) {
                    arrHtml.push("<div class='ace-python-tooltip-body-desc'>");
                    arrHtml.push(_.escape(desc))
                    arrHtml.push("</div>")
                }
                item.docHTML = arrHtml.join("");
            }
        }

        this.updateDocTooltip = function () {
            var me = this;
            var popup = this.popup;
            var all = popup.data;
            var selected = all && (all[popup.getHoveredRow()] || all[popup.getRow()]);
            var doc = null;
            if (!selected || !this.editor || !this.popup.isOpen)
                return this.hideDocTooltip();
            this.editor.completers.some(function (completer) {
                if (me.getDocTooltip)
                    doc = me.getDocTooltip(selected);
                return doc;
            });
            if (!doc)
                doc = selected;

            if (typeof doc == "string")
                doc = { docText: doc }
            if (!doc || !(doc.docHTML || doc.docText))
                return this.hideDocTooltip();
            this.showDocTooltip(doc);
        };

        this.showDocTooltip = function (item) {
            if (!this.tooltipNode) {
                this.tooltipNode = dom.createElement("div");
                this.tooltipNode.className = "ace_tooltip ace_doc-tooltip";
                this.tooltipNode.style.margin = 0;
                this.tooltipNode.style.pointerEvents = "auto";
                this.tooltipNode.tabIndex = -1;
                this.tooltipNode.onblur = this.blurListener.bind(this);
            }

            var tooltipNode = this.tooltipNode;
            if (item.docHTML) {
                tooltipNode.innerHTML = item.docHTML;
            } else if (item.docText) {
                tooltipNode.textContent = item.docText;
            }

            if (!tooltipNode.parentNode)
                document.body.appendChild(tooltipNode);
            var popup = this.popup;
            var rect = popup.container.getBoundingClientRect();
            tooltipNode.style.top = popup.container.style.top;
            tooltipNode.style.bottom = popup.container.style.bottom;

            if (window.innerWidth - rect.right < 320) {
                tooltipNode.style.right = window.innerWidth - rect.left + "px";
                tooltipNode.style.left = "";
            } else {
                tooltipNode.style.left = (rect.right + 1) + "px";
                tooltipNode.style.right = "";
            }
            tooltipNode.style.display = "block";
        };

        this.hideDocTooltip = function () {
            this.tooltipTimer.cancel();
            if (!this.tooltipNode) return;
            var el = this.tooltipNode;
            if (!this.editor.isFocused() && document.activeElement == el)
                this.editor.focus();
            this.tooltipNode = null;
            if (el.parentNode)
                el.parentNode.removeChild(el);
        };

    }).call(Autocomplete.prototype);

    Autocomplete.startCommand = {
        name: "startAutocomplete",
        exec: function (editor) {
            if (!editor.completer)
                editor.completer = new Autocomplete();
            editor.completer.autoInsert =
            editor.completer.autoSelect = true;
            editor.completer.showPopup(editor);
            editor.completer.cancelContextMenu();
        },
        bindKey: "Ctrl-Space|Ctrl-Shift-Space|Alt-Space"
    };

    var FilteredList = function (array, filterText, mutateData) {
        this.all = array;
        this.filtered = array;
        this.filterText = filterText || "";
        this.exactMatch = false;
    };
    (function () {
        this.setFilter = function (str, tipState) {
            if (str.length > this.filterText && str.lastIndexOf(this.filterText, 0) === 0)
                var matches = this.filtered;
            else
                var matches = this.all;
            matches = str.charAt(0) != '.' ? matches.filter(function (ele) {
                return ele.meta != 'local'
            }) : matches.filter(function (ele) {
                return ele.meta != 'local' && ele.meta != 'keyword';
            });
            this.filterText = str;

            matches = this.filterCompletions(matches, this.filterText, tipState);

            matches = matches.sort(function (a, b) {
                if (b.meta == 'keyword' && a.meta != 'keyword')
                    return -1;
                else if (b.meta != 'keyword' && a.meta == 'keyword')
                    return 1;
                var ib = 0, ia = 0;
                if (b.qappType === 'fn')
                    ib = 4;
                else if (b.qappType === 'e')
                    ib = 3;
                else if (b.qappType === 'var')
                    ib = 2;
                else if (b.qappType === 'c')
                    ib = 1;
                if (a.qappType === 'fn')
                    ia = 4;
                else if (a.qappType === 'e')
                    ia = 3;
                else if (a.qappType === 'var')
                    ia = 2;
                else if (a.qappType === 'c')
                    ia = 1;
                if (ia && ib && ia != ib)
                    return ia - ib;
                if (a.value && b.value)
                    return a.value.toLowerCase() > b.value.toLowerCase() ? 1 : -1;
            });
            var prev = null;
            matches = matches.filter(function (item) {
                var caption = item.snippet || item.caption || item.value;
                if (caption === prev) return false;
                prev = caption;
                return true;
            });

            this.filtered = matches;
        };
        this.filterCompletions = function (items, needle, tipState) {
            var results = [], lowerNeedle, lowerCaption;
            if (needle.length > 1 && needle.charAt(0) == '.') {
                needle = needle.substr(1);
            }
            lowerNeedle = needle.toLowerCase();
            var upper = needle.toUpperCase();
            var lower = needle.toLowerCase();
            loop: for (var i = 0, item; item = items[i]; i++) {
                var caption = item.value || item.caption || item.snippet;
                if (!caption) continue;
                var lowerCaption = caption.toLowerCase();
                var lastIndex = -1;
                var matchMask = 0;
                var penalty = 0;
                var index, distance;
                if (needle.charAt(needle.length - 1) != '.') {
                    if (this.exactMatch) {
                        if (lowerNeedle !== lowerCaption.substr(0, lowerNeedle.length) || (lowerNeedle === lowerCaption.substr(0, lowerNeedle.length) && lowerCaption.substr(lowerNeedle.length).indexOf(".") >= 0))
                            continue loop;
                    } else {
                        for (var j = 0; j < needle.length; j++) {
                            var i1 = caption.indexOf(lower[j], lastIndex + 1);
                            var i2 = caption.indexOf(upper[j], lastIndex + 1);
                            index = (i1 >= 0) ? ((i2 < 0 || i1 < i2) ? i1 : i2) : i2;
                            if (index < 0)
                                continue loop;
                            distance = index - lastIndex - 1;
                            if (distance > 0) {
                                if (lastIndex === -1)
                                    penalty += 10;
                                penalty += distance;
                            }
                            matchMask = matchMask | (1 << index);
                            lastIndex = index;
                        }
                    }
                }
                item.matchMask = matchMask;
                item.exactMatch = penalty ? 0 : 1;
                item.score = (item.score || 0) - penalty;
                results.push(item);
            }
            return results;
        };
    }).call(FilteredList.prototype);

    exports.Autocomplete = Autocomplete;
    exports.FilteredList = FilteredList;

});

define("ace/ext/qapp_language_tools", ["require", "exports", "module", "ace/snippets", "ace/qapp_autocomplete", "ace/config", "ace/lib/lang", "ace/qapp_autocomplete/util", "ace/editor", "ace/config"], function (require, exports, module) {
    "use strict";

    var snippetManager = require("../snippets").snippetManager;
    var Autocomplete = require("../qapp_autocomplete").Autocomplete;
    var config = require("../config");
    var lang = require("../lib/lang");
    var util = require("../qapp_autocomplete/util");

    var keyWordCompleter = {
        getCompletions: function (editor, session, pos, prefix, callback) {
            if (session.$mode.completer) {
                return session.$mode.completer.getCompletions(editor, session, pos, prefix, callback);
            }
            var state = editor.session.getState(pos.row);
            var completions = session.$mode.getCompletions(state, session, pos, prefix);
            callback(null, completions, { session: session, pos: pos });
        }
    };

    var completers = [keyWordCompleter];
    exports.setCompleters = function (val) {
        completers = val || [];
    };
    exports.addCompleter = function (completer) {
        completers.push(completer);
    };
    exports.clearSelfDefineCompleter = function () {
        completers.splice(0, completers.length);
        completers.push(keyWordCompleter);
    }
    exports.keyWordCompleter = keyWordCompleter;

    function getCompletionPrefix(editor) {
        var pos = editor.getCursorPosition();
        var line = editor.session.getLine(pos.row);
        var prefix = util.retrievePrecedingIdentifier(line, pos.column);
        editor.completers.forEach(function (completer) {
            if (completer.identifierRegexps) {
                completer.identifierRegexps.forEach(function (identifierRegex) {
                    if (!prefix && identifierRegex)
                        prefix = util.retrievePrecedingIdentifier(line, pos.column, identifierRegex);
                });
            }
        });
        return prefix;
    }

    var doLiveAutocomplete = function (e) {
        var editor = e.editor;
        var text = e.args || "";
        var hasCompleter = editor.completer && editor.completer.activated;
        if (!editor.completer) {
            editor.completer = new Autocomplete();
        }
        if (editor.completer)
            editor.completer.configFunctionTip(editor);
        if (e.command.name === "backspace") {
            if (hasCompleter && !getCompletionPrefix(editor))
                editor.completer.detach();
        }
        else if (e.command.name === "insertstring") {
            var prefix = getCompletionPrefix(editor);
            if (prefix == '.')
                if (hasCompleter) {
                    editor.completer.detach();
                    hasCompleter = false;
                }
            if (prefix && !hasCompleter) {
                if (!editor.completer) {
                    editor.completer = new Autocomplete();
                }
                editor.completer.autoSelect = false;
                editor.completer.autoInsert = false;
                editor.completer.showPopup(editor);
                editor.completer.configFunctionTip(editor);
            }
        }
    };

    var Editor = require("../editor").Editor;
    require("../config").defineOptions(Editor.prototype, "editor", {
        enableQappLiveAutocompletion: {
            set: function (val) {
                if (val) {
                    if (!this.completers)
                        this.completers = Array.isArray(val) ? val : completers;
                    this.commands.on('afterExec', doLiveAutocomplete);
                } else {
                    this.commands.removeListener('afterExec', doLiveAutocomplete);
                }
            },
            value: false
        },
    });
});
(function () {
    require(["ace/ext/qapp_language_tools"], function () { });
})();
