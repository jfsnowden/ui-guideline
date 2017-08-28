(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.dateTimePicker', DateTimePicker);

    DateTimePicker.$inject = [];
    function DateTimePicker(){
        var self = this;
        self.selectedDate = new Date();
        self.isOpen = false;
        self.timeValue = Date.now();
        self.onTimePickerChange = function(){
            // ...
        }
    }
})(NetBrain)