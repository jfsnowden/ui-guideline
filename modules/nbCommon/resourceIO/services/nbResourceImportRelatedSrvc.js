(function () {
    'use strict';

    angular.module('nb.common').service('nb.common.nbResourceImportRelatedSrvc', nbService);

    nbService.$inject = ['$q', '$rootScope', '$timeout', 'nb.common.nbResourceIOSrvc'];

    function nbService($q, $rootScope, $timeout, nbResourceIOSrvc) {
        this.Const = {

        };

        this.initAllCheck = function (dm, eleDG) {
            var me = this;
            window.nbPLM.Common.delayRun(function (arg) {
                var ele = document.getElementById(arg.name);

                if (ele) {
                    me.setCheck(eleDG);
                    return true;
                }
                return false;
            }, { name: eleDG.tblDef.gidCK }, 20, 20);
        }

        this.onAllCheck = function (dm, eleDG) {
            eleDG.tblDef.indeterminate = false;
            if (eleDG.tblDef.allCheck) {
                eleDG.tblDef.data && eleDG.tblDef.data.forEach(function (ele) {
                    ele.check = true;
                })
            } else {
                eleDG.tblDef.data && eleDG.tblDef.data.forEach(function (ele) {
                    ele.check = false;
                })
            }
            $('#' + eleDG.tblDef.gidCK).prop('indeterminate', eleDG.tblDef.indeterminate);
        }

        this.onItemCheck = function (dm, eleDG, entity) {
            this.setCheck(eleDG);
        };

        this.setCheck = function (eleDG) {
            eleDG.tblDef.indeterminate = false;
            if (eleDG.tblDef.data) {
                var allCheck = eleDG.tblDef.data.every(function (ele) {
                    return ele.check;
                });
                var indeterminate = eleDG.tblDef.data.some(function (ele) {
                    return ele.check;
                });
                eleDG.tblDef.allCheck = allCheck;
                eleDG.tblDef.indeterminate = !allCheck && indeterminate;
            }
            $('#' + eleDG.tblDef.gidCK).prop('indeterminate', eleDG.tblDef.indeterminate);
        }
    }
})(NetBrain);
