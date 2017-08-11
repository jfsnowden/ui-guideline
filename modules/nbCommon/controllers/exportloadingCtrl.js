;(function (NetBrain) {
    'use strict';

    angular.module('nb.common').controller('nb.common.exportLoadingCtrl', exportLoadingCtrl);
    exportLoadingCtrl.$inject = ['$scope', '$uibModalInstance', 'option'];

    function exportLoadingCtrl($scope, $uibModalInstance, option) {

        $scope.title=option.title||'Preparing for download...';
        $scope.cancelText=option.cancelText||'Cancel';

        $scope.onCancelExporting = function () {
            option.cancelHandler&&option.cancelHandler();
            $uibModalInstance.dismiss($scope);
        };
    }

})(NetBrain);