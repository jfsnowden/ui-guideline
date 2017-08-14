(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.modalCtrl', ModalCtrl);

    ModalCtrl.$inject = ['$uibModal', 'nb.common.nbAlertSrvc'];
    function ModalCtrl($modal, nbAlert){
        var self = this;

        self.notification = function () {
            nbAlert.notification("This is a notification")
        }

        self.error = function () {
            nbAlert.error("This is an error")
        }

        self.confirm = function () {
            nbAlert.confirm("This is a confirm")
        }

        self.customAlert = function () {
            nbAlert.error({
                title: 'Customized Title',
                message: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit?',
                buttons: [{
                    id: NB_CONFIRM_YES,
                    label:"Agree"
                }, {
                    id: NB_CONFIRM_NO,
                    label: "Disagree"
                }, {
                    id: NB_CONFIRM_CANCEL,
                    label: "Cancel"
                }]
            })
        }

        self.warning = function () {
            nbAlert.warning("This is an warning")
        }

        self.openModal = function(){
            $modal.open({
                backdrop: 'static',
                keyboard: false,
                windowClass: '',
                template: `
                    <div class="modal-header">
                        <div class="icon-container" ng-click="ctrl.closeModal()">
                            <span class="icon close"></span>
                        </div>
                        <h3 class="modal-title">Sample Modal</h3>
                    </div>
                    <div class="modal-body" style="width: 600px;height: 650px;">
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-link" ng-click="ctrl.closeModal()">Cancel</button>
                        <button class="btn btn-primary" ng-click="ctrl.closeModal()">OK</button>
                    </div>
                `,
                controller: function($uibModalInstance){
                    var self = this;
                    self.closeModal = function(){
                        $uibModalInstance.dismiss();
                    }
                },
                controllerAs: 'ctrl',
                resolve: {}
            })
        }
    }
})(NetBrain)