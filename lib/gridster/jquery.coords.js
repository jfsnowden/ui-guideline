/*
 * jquery.coords
 * https://github.com/ducksboard/gridster.js
 *
 * Copyright (c) 2012 ducksboard
 * Licensed under the MIT licenses.
 */

;(function(root, factory) {

    if (typeof define === 'function' && define.amd) {
        define('gridster-coords', ['jquery'], factory);
    } else {
       root.GridsterCoords = factory(root.$ || root.jQuery);
    }

}(window, function($) {
    /**
    * Creates objects with coordinates (x1, y1, x2, y2, cx, cy, width, height)
    * to simulate DOM elements on the screen.
    * Coords is used by Gridster to create a faux grid with any DOM element can
    * collide.
    *
    * @class Coords
    * @param {HTMLElement|Object} obj The jQuery HTMLElement or a object with: left,
    * top, width and height properties.
    * @return {Object} Coords instance.
    * @constructor
    */
    function Coords(obj) {
        if (obj[0] && $.isPlainObject(obj[0])) {
            this.data = obj[0];
        }else {
            this.el = obj;
        }

        this.isCoords = true;
        this.coords = {};
        this.init();
        return this;
    }


    var fn = Coords.prototype;


    fn.init = function(){
        this.set();
        this.original_coords = this.get();
    };


    fn.set = function(update, not_update_offsets) {
        var el = this.el;

        if (el && !update) {
            this.data = el.offset();
            this.data.width = el.width();
            this.data.height = el.height();

          /*  //console.log(el.offset().top)
            //console.log(el[0].offsetTop)
            //console.log(el[0].getBoundingClientRect().top)
            var beginTime1 = +new Date();
            //var a = window.getComputedStyle(el[0], null);
            console.log('elapsed time1:' + ((+new Date()) - beginTime1));
            var beginTime2 = +new Date();
            var b = a.width;
            console.log('elapsed time2:' + ((+new Date()) - beginTime2));
            //console.log(el.css('top'));*/
        }
        if (el && update && !not_update_offsets) {
            var offset = el.offset();
            this.data.top = offset.top;
            this.data.left = offset.left;
        }

        var d = this.data;

        typeof d.left === 'undefined' && (d.left = d.x1);
        typeof d.top === 'undefined' && (d.top = d.y1);

        this.coords.x1 = d.left;
        this.coords.y1 = d.top;
        this.coords.x2 = d.left + d.width;
        this.coords.y2 = d.top + d.height;
        this.coords.cx = d.left + (d.width / 2);
        this.coords.cy = d.top + (d.height / 2);
        this.coords.width  = d.width;
        this.coords.height = d.height;
        this.coords.el  = el || false ;

        return this;
    };


    fn.update = function(data){
        if (!data && !this.el) {
            return this;
        }

        if (data) {
            var new_data = $.extend({}, this.data, data);
            this.data = new_data;
            return this.set(true, true);
        }

        this.set(true);
        return this;
    };


    fn.get = function(){
        return this.coords;
    };

    fn.destroy = function() {
        this.el.removeData('coords');
        delete this.el;
    };

    //jQuery adapter
    $.fn.coords = function() {
        if (this.data('coords') ) {
            return this.data('coords');
        }

        var ins = new Coords(this, arguments[0]);
        this.data('coords', ins);
        return ins;
    };

    return Coords;

}));
