(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.wordingExamplesCtrl', WordingExamplesCtrl);

    WordingExamplesCtrl.$inject = ['$scope', '$http', '$location', '$anchorScroll', '$compile'];
    function WordingExamplesCtrl($scope, $http, $location, $anchorScroll, $compile){

        $scope.scrollTo = function(id) {
            $location.hash(id);
            $anchorScroll();
        };

        $http.get('/ui-guideline/docs/wordingExamples.md').then(function(res){
            showdown.setFlavor('github');
            var converter = new showdown.Converter();
            var html = converter.makeHtml(res.data);
            $('.doc-wrapper').html($compile(html)($scope));
        })
    }
})(NetBrain);