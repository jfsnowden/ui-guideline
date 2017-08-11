/**
 * Created by yaoningning on 2016/9/12.
 */
(function(netBrain) {
    'use strict';

    angular.module('nb.common').service('nb.common.nbSelectQappModalSrvc', [
        '$uibModal', '$q',
        function($uibModal, $q) {

            var modalOptions = {
                backdrop: 'static',
                windowClass: 'nbSelectQappModal',
                templateUrl: 'modules/nbCommon/views/nbSelectQappModal.html',
                controller: 'nb.common.nbSelectQappModalCtrl'
            };

            this.showModal = function(options) {
                modalOptions.resolve = {
                    options : function() {
                        return options;
                    }
                };

                return $uibModal.open(modalOptions).result;
            };
        }
    ]);

})(NetBrain);