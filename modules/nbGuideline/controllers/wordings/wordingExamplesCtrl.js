(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.wordingExamplesCtrl', WordingExamplesCtrl);

    WordingExamplesCtrl.$inject = ['$http'];
    function WordingExamplesCtrl($http){
        $http.get('/ui-guideline/docs/wordingExamples.md').then(function(res){
            showdown.setFlavor('github');
            var converter = new showdown.Converter();
            var html = converter.makeHtml(res.data);
            $('.doc-wrapper').html(html);
        })
    }
})(NetBrain);