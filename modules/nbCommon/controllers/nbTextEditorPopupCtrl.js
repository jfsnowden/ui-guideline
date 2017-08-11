(function (netBrain) {
    'use strict';

    angular.module('nb.common').controller('nb.common.nbTextEditorPopupCtrl', NbTextEditorPopupCtrl);

    NbTextEditorPopupCtrl.$inject = [
        '$scope', '$uibModalInstance',
        'nb.common.nbTextEditorSrvc',
        'args'
    ];

    function NbTextEditorPopupCtrl($scope, $uibModalInstance, nbTextEditorSrvc, args) {
        $scope.popupTitle = args.title;

        $scope.init = function () {

            $scope.nbDataObj = {
                ace: null,
                acePlaceHolder: 'python script',
                model: {scripting: null},
                aceOptions: {
                    onLoad: function (_ace) {
                        nbTextEditorSrvc.registerAcee($scope.nbDataObj, _ace);
                        nbTextEditorSrvc.setContent($scope.nbDataObj, $scope.nbDataObj.content);
                    },
                    useWrapMode: false,
                    showGutter: true,
                    theme: 'chrome',
                    mode: 'python',
                    advanced: {
                        fontSize: 12,
                        enableBasicAutocompletion: true,
                        enableSnippets: true,
                        enableLiveAutocompletion: true
                    }
                },
                oldRange: null
            };

            if (args != null) {
                _.extend($scope.nbDataObj, args);
            }

            nbTextEditorSrvc.init($scope.nbDataObj);
        }

        $scope.onCancel = function () {
            $uibModalInstance.dismiss('cancel');
        }

        $scope.onSave = function () {
            $uibModalInstance.close($scope.nbDataObj.content);
        }

        $scope.init();
    }

})(NetBrain);

