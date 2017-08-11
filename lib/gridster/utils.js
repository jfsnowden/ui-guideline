;
(function (window, undefined) {

    /* Delay, debounce and throttle functions taken from underscore.js
     *
     * Copyright (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and
     * Investigative Reporters & Editors
     *
     * Permission is hereby granted, free of charge, to any person
     * obtaining a copy of this software and associated documentation
     * files (the "Software"), to deal in the Software without
     * restriction, including without limitation the rights to use,
     * copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the
     * Software is furnished to do so, subject to the following
     * conditions:
     *
     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
     * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
     * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
     * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
     * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
     * OTHER DEALINGS IN THE SOFTWARE.
     */

    window.delay = function (func, wait) {
        var args = Array.prototype.slice.call(arguments, 2);
        return setTimeout(function () {
            return func.apply(null, args);
        }, wait);
    };

    window.debounce = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            if (immediate && !timeout) func.apply(context, args);
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    window.throttle = function (func, wait) {
        var context, args, timeout, throttling, more, result;
        var whenDone = debounce(
            function () {
                more = throttling = false;
            }, wait);
        return function () {
            context = this;
            args = arguments;
            var later = function () {
                timeout = null;
                if (more) func.apply(context, args);
                whenDone();
            };
            if (!timeout) timeout = setTimeout(later, wait);
            if (throttling) {
                more = true;
            } else {
                result = func.apply(context, args);
            }
            whenDone();
            throttling = true;
            return result;
        };
    };
    /*    /!*16进制颜色转为RGB格式*!/
     String.prototype.colorRgba = function(opacity){
     var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
     var sColor = this.toLowerCase(),
     op = opacity!=undefined?opacity:1;
     if(sColor && reg.test(sColor)){
     if(sColor.length === 4){
     var sColorNew = "#";
     for(var i=1; i<4; i+=1){
     sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));
     }
     sColor = sColorNew;
     }
     //处理六位的颜色值
     var sColorChange = [];
     for(var i=1; i<7; i+=2){
     sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));
     }
     return "RGBA(" + sColorChange.join(",") + ","+op+")";
     }else{
     return sColor;
     }
     };
     Date.prototype.timeFormat = function (fmt) {
     var o = {
     "M+": this.getMonth() + 1,
     "d+": this.getDate(),
     "H+": this.getHours(),
     "m+": this.getMinutes(),
     "s+": this.getSeconds(),
     "q+": Math.floor((this.getMonth() + 3) / 3),
     "S": this.getMilliseconds()
     };
     if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
     for (var k in o)
     if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
     return fmt;
     }*/
})(window);
;
(function ($, h, c) {
    var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j + "-special-event", b = "delay", f = "throttleWindow";
    e[b] = 250;
    e[f] = true;
    $.event.special[j] = {
        setup: function () {
            if (!e[f] && this[k]) {
                return false
            }
            var l = $(this);
            a = a.add(l);
            $.data(this, d, {w: l.width(), h: l.height()});
            if (a.length === 1) {
                g()
            }
        }, teardown: function () {
            if (!e[f] && this[k]) {
                return false
            }
            var l = $(this);
            a = a.not(l);
            l.removeData(d);
            if (!a.length) {
                clearTimeout(i)
            }
        }, add: function (l) {
            if (!e[f] && this[k]) {
                return false
            }
            var n;

            function m(s, o, p) {
                var q = $(this), r = $.data(this, d);
                r.w = o !== c ? o : q.width();
                r.h = p !== c ? p : q.height();
                n.apply(this, arguments)
            }

            if ($.isFunction(l)) {
                n = l;
                return m
            } else {
                n = l.handler;
                l.handler = m
            }
        }
    };
    function g() {
        i = h[k](function () {
            a.each(function () {
                var n = $(this), m = n.width(), l = n.height(), o = $.data(this, d);
                if (m !== o.w || l !== o.h) {
                    n.trigger(j, [o.w = m, o.h = l])
                }
            });
            g()
        }, e[b])
    }
})(jQuery, window);
