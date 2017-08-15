(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.sidebarCtrl', SideBarCtrl);

    SideBarCtrl.$inject = [];
    function SideBarCtrl(){
        var self = this;
        self.selectedTab = 'overview';
        self.onTabSelect = function(tab){
            if(self.selectedTab === tab) {
                self.selectedTab = '';
            } else{
                self.selectedTab = tab;
            }
        }
    }
})(NetBrain)