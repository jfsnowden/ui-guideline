(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.iconCtrl', IconCtrl);

    IconCtrl.$inject = ['$http'];
    function IconCtrl($http){
        var self = this;

        getSprites();
        function getSprites(){
            $http.get('/ui-guideline/css/less/sprite.less').then(function(res){
                var regex = /\.([a-zA-Z0-9-_]+?)[\s]?[{,]/g
                var data = res.data;
                var parseSprites = [];
                while ((m = regex.exec(data)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    parseSprites.push(m[1]);
                }
                var sprites = parseSprites.map(function(spr){
                    return '<div class="col-xs-4 icon-block"><p class="'+spr+'"></p><p><strong>.'+spr+'</strong></p></div>'
                })
                $('div.icons-wrap').html(sprites);
            })
        }
    }
})(NetBrain)