/**
 * Created by Marko Cen on 10/29/2015.
 */
(function() {
    'use strict';

    angular.module('nb.common').factory('nb.common.nbGridUtilSrvc', nbGridUtilSrvc);

    nbGridUtilSrvc.$inject = []; // 'gridUtil'

    function nbGridUtilSrvc() {
        var services = {
            resizeGrid: resizeGrid
        };

        function resizeGrid() {

        }

        return services;
    }
})(NetBrain);
