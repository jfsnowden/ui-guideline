/**
 * Created by SYu on 3/9/2016.
 */
(function() {
    'use strict';

    angular.module('nb.common').service('nb.common.nbToastr', [function() {
        var _option = { timeOut: 5000, positionClass: 'toast-bottom-right' };

        this.success = function(message) {
            toastr.success(message, '', _option);
        };
        this.error = function(message) {
            toastr.error(message, '', _option);
        };
        this.info = function(message) {
            toastr.info(message, '', _option);
        };

        this.infoWithTime = function(message, time) {
            var op = angular.copy(_option);
            op.timeOut = time;
            toastr.info(message, '', op);
        };
    }]);
})(NetBrain);
