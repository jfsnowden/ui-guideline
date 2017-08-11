(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbModalHeader', function() {
        return {
            restrict: 'E',
            scope: {
                'modalTitle': '@',
                'modalClose': '=?'
            },
            template: '<div class="modal-header">' +
                        '<div class="icon-container" ng-show="modalClose" ng-click="modalClose()">' +
						'<span class="icon close"></span>' +
                        '</div>' +
                        '<h3 class="modal-title">{{modalTitle}} </h3>' +
                '</div>',
            replace: true
        };
    });

})(NetBrain);
(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbModalDraggable', function() {
        return {
            restrict: 'A',
            link: function(scope, element,attrs){
                var options = {};
                if(attrs.dragCancel){
                    options.cancel = attrs.dragCancel;
                }
                element.parents('.modal-dialog').draggable(options);
            }
        };
    });

})(NetBrain);

