(function() {
    'use strict';

    angular.module('nb.common').service('nb.common.nbLoadingSrvc', ['$uibModal', function($uibModal) {
        this.exportLoading = {

            /*
             * option对象
             * title：modal标题
             * cancelText：取消按钮的wording
             * cancelHandler：点击按钮的回调
             * */
            open: function(option) {
                return $uibModal.open({
                    templateUrl: 'modules/nbCommon/views/exportLoadingModal.html',
                    controller: 'nb.common.exportLoadingCtrl',
                    windowClass: 'exportLoadingModal',
                    size: 'sm',
                    backdrop: 'static',
                    resolve: {
                        option: option || {}
                    }
                });
            }
        };
    }]);
})(NetBrain);
