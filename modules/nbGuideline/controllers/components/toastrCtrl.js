(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.toastrCtrl', ToastrCtrl);

    ToastrCtrl.$inject = [
        'nb.common.nbToastr'
    ];
    function ToastrCtrl(nbToastr){
        var self = this;
        self.openSuccessToastr = function(){
            nbToastr.success('This is a successful toastr!')
        }

        self.openErrorToastr = function(){
            nbToastr.error('This is a error toastr!')
        }

        self.openInfoToastr = function(){
            nbToastr.info('This is a information toastr!')
        }
    }
})(NetBrain)