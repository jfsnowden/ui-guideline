(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.changesCtrl', ChangesCtrl);

    ChangesCtrl.$inject = ['$http'];
    function ChangesCtrl($http){
        var self = this;
        $http.get('/ui-guideline/CHANGELOG.md').then(function(res){
            showdown.setFlavor('github');
            var converter = new showdown.Converter();
            var html = converter.makeHtml(res.data);
            $('.changes-wrapper').html(html);
        })
    }
})(NetBrain);