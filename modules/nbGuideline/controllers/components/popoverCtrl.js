(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.popoverCtrl', PopoverCtrl);

    PopoverCtrl.$inject = ['$sce'];
    function PopoverCtrl($sce){
        var self = this;
        self.popoverHtml = $sce.trustAsHtml('<b style="color: red">You can</b> have customized <div class="label label-success">HTML</div> content in <code>popover</code>');
    }
})(NetBrain)