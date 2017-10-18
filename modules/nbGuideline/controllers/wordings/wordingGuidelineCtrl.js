(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.wordingGuidelineCtrl', WordingGuidelineCtrl);

    WordingGuidelineCtrl.$inject = ['$http'];
    function WordingGuidelineCtrl($http){
        $http.get('/ui-guideline/docs/wordingGuidelines.md').then(function(res){
            showdown.setFlavor('github');
            var converter = new showdown.Converter();
            var html = converter.makeHtml(res.data);
            $('.doc-wrapper').html(html);
        })
    }
})(NetBrain);