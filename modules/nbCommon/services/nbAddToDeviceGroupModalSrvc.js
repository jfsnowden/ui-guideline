/**
 * Created by Jia_Wei on 3/8/2016.
 */

(function() {
    'use strict';

    angular.module('nb.common').service('nb.common.nbAddToDeviceGroupModalSrvc', [
        '$uibModal',
        function($uibModal) {
            var modalOptions = {
                templateUrl: 'modules/nbCommon/views/addToDeviceGroupPopup.html',
                controller: 'nb.common.addToDeviceGroupPopupCtrl',
                windowClass: 'addToDeviceGroupPopup',
                backdrop: false
            };

            this.showModal = function(lsDevIds) {
                modalOptions.resolve = {
                    args: function() {
                        return {
                            lsDevIds: lsDevIds
                        };
                    }
                };

                return $uibModal.open(modalOptions).result; // resolve selected property
            };
        }
    ]);
})(NetBrain);
