(function (netBrain) {
    'use strict';

    /**
     *	controller for confirmation modal dialog
     */
    angular.module('nb.common').controller('nb.common.nbAlertCtrl', AlertCtrl);

    AlertCtrl.$inject = ['$scope', '$uibModal', '$uibModalInstance', '$sce', 'dialogOptions'];

    function AlertCtrl($scope, $uibModal, $uibModalInstance, $sce, dialogOptions) {
        $scope.title = dialogOptions.title;
        $scope.showText = dialogOptions.showText;
        $scope.message = $sce.trustAsHtml(dialogOptions.message);

        $scope.buttons = dialogOptions.buttons;

        $scope.iconType = dialogOptions.iconType;

        $scope.ok_button = null;
        $scope.yes_button = null;
        $scope.no_button = null;
        $scope.cancel_button = null;
        $scope.check_button = null;
        

        angular.forEach($scope.buttons, function (button) {
            if (button.id === NB_CONFIRM_OK) {
                $scope.ok_button = button;
            }
            else if (button.id === NB_CONFIRM_YES) {
                $scope.yes_button = button;
            }
            else if (button.id === NB_CONFIRM_NO) {
                $scope.no_button = button;
            }
            else if (button.id === NB_CONFIRM_CANCEL) {
                $scope.cancel_button = button;
            } 
            else if (button.id === NB_CONFIRM_CHECK) {
                $scope.check_button = button;
            }
        })
        $scope.closeDialog = function (reason) {
            $uibModalInstance.close(reason);
        };

    }

})(NetBrain);
