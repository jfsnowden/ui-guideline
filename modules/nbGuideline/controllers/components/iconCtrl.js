(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.iconCtrl', IconCtrl);

    IconCtrl.$inject = ['$http'];
    function IconCtrl($http){
        var self = this;
        self.searchValue = '';

        self.onSearchIcon = _.debounce(function(event){
            $('.icons-wrap .icon-block strong').each(function(index, elm){
                var $elm = $(elm);
                var $text = $elm.text();
                if($text.indexOf(self.searchValue) < 0){
                    $elm.parents('.icon-block').hide();
                }else{
                    $elm.html($text.replace(self.searchValue, `<span class="highlight">${self.searchValue}</span>`));
                    $elm.parents('.icon-block').show();
                }
            })
        }, 500);

        getSprites();
        function getSprites(){
            $http.get('/ui-guideline/css/less/sprite.less').then(function(res){
                var regex = /\.([a-zA-Z0-9-_.\s]+?)[{,]/g;
                var data = res.data;
                var parseSprites = [];
                while ((m = regex.exec(data)) !== null) {
                    if (m.index === regex.lastIndex) {
                        regex.lastIndex++;
                    }
                    parseSprites.push(m[1]);
                }
                var sprites = parseSprites.map(function(spr){
                    var p = document.createElement('P');
                    spr.trim().split(' ').forEach(function(s){
                        var rs = s.replace(/\./g, ' ');
                        var $next = $(p);
                        while($next.children('span').length > 0){
                            $next = $($next.children('span'))
                        }
                        $next.append('<span class="' + rs + '"></span>')
                    })
                    return '<div class="col-xs-4 icon-block">'+ p.outerHTML + '<p><strong>.'+spr+'</strong></p></div>'
                })
                $('div.icons-wrap').html(sprites);
            })
        }
    }
})(NetBrain)