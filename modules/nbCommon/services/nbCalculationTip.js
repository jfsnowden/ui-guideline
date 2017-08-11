;
(function (NetBrain) {
    'use strict';

    angular.module("nb.common")
        .service('nb.common.nbCalculationTipSrvc', ['$document', '$compile', '$rootScope', '$timeout',
            function ($document, $compile, $rootScope, $timeout) {

                var me = this;
                var options = {title:""};
                me.showCalculationTip = function (op) {
                    var scope = $rootScope.$new();
                    var newOp = _.extend({}, options, op);
                    var mask = '<div id="CalculatingMask" style="position: absolute;top:0;left: 0;width:100%;height:100%;background-color: rgba(0,0,0,0.4);z-index: 999;color:#f5f5f5;text-align: center;padding-top: 47vh;">' +
                        '<img src="img/Assets/Loader_Head_76x86.png" class="netbrainLoader-Head">' +
                        '<img src="img/Assets/Loader_Circle_145x72.png" class="netbrainLoader-Circle">' +
                        '<span style="font-size: 5em;">' + newOp.title + '</span><br>' +
                        '</div>';
                    $('body').append($compile(mask)(scope));
                };

                me.closeCalculationTip = function () {
                    $('#CalculatingMask').remove();
                };

            }
        ]);

})(NetBrain);
