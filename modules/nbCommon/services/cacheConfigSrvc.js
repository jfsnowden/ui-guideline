(function(NetBrain) {
    'use strict';

    angular.module('nb.common').factory('nb.common.cacheConfigSrvc', cacheConfigSrvc);

    cacheConfigSrvc.$inject = ['$q', '$rootScope', '$timeout', 'nb.ng.offlineCacheSrvc', 'nb.deviceDetail.httpDeviceDetailSrvc'];

    function cacheConfigSrvc($q, $rootScope, $timeout, offlineCacheSrvc, httpDeviceDetailSrvc) {
        var vm = {};

        function _getDetailDataParams(devId) {
            return {
                sourceType: NetBrain.DeviceDetail.DataFolder.CurrentBaseline,
                devId: devId,
                withData: true
            };
        }

        var configKeyword = navigator.userAgent;

        function getSingleData(devId) {
            var params = _getDetailDataParams(devId);
            var ret = httpDeviceDetailSrvc.getConfigFileDataList(params);
            ret.then(function(objResult) {
                objResult.content = encrypt(objResult.content, configKeyword);
            });
            return ret;
        }

        vm.cacheDatas = function(devIds) {
            _.each(devIds,
                function(devId) {
                    vm.getData(devId);
                });
        };
        vm.getData = function(devId) {
            var store = offlineCacheSrvc.getStore(NetBrain.NG.Const.StoreCategory.ConfigFile);
            var ret = store.get(devId, getSingleData);
            ret.then(function(objResult) {
                objResult.content = decrypt(objResult.content, configKeyword);
            });
            return ret;
        };

        function encrypt(str, pwd) {
            if (pwd == null || pwd.length <= 0) {
                return '';
            }
            var prand = '';
            for (var i2 = 0; i2 < pwd.length; i2++) {
                prand += pwd.charCodeAt(i2).toString();
            }
            var sPos = Math.floor(prand.length / 5);
            var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) +
                prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
            var incr = Math.ceil(pwd.length / 2);
            var modu = Math.pow(2, 31) - 1;
            if (mult < 2) {
                return null;
            }
            var salt = Math.round(Math.random() * 1000000000) % 100000000;
            prand += salt;
            while (prand.length > 10) {
                prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
            }
            prand = (mult * prand + incr) % modu;
            var encChr = '';
            var encStr = '';
            for (var i = 0; i < str.length; i++) {
                encChr = parseInt(str.charCodeAt(i) ^ Math.floor((prand / modu) * 255));
                if (encChr < 16) {
                    encStr += '0' + encChr.toString(16);
                } else encStr += encChr.toString(16);
                prand = (mult * prand + incr) % modu;
            }
            salt = salt.toString(16);
            while (salt.length < 8) salt = '0' + salt;
            encStr += salt;
            return encStr;
        }

        function decrypt(str, pwd) {
            if (str == null || str.length < 8) {
                return '';
            }
            if (pwd == null || pwd.length <= 0) {
                return '';
            }
            var prand = '';
            for (var i3 = 0; i3 < pwd.length; i3++) {
                prand += pwd.charCodeAt(i3).toString();
            }
            var sPos = Math.floor(prand.length / 5);
            var mult = parseInt(prand.charAt(sPos) + prand.charAt(sPos * 2) +
                prand.charAt(sPos * 3) + prand.charAt(sPos * 4) + prand.charAt(sPos * 5));
            var incr = Math.round(pwd.length / 2);
            var modu = Math.pow(2, 31) - 1;
            var salt = parseInt(str.substring(str.length - 8, str.length), 16);
            str = str.substring(0, str.length - 8);
            prand += salt;
            while (prand.length > 10) {
                prand = (parseInt(prand.substring(0, 10)) + parseInt(prand.substring(10, prand.length))).toString();
            }
            prand = (mult * prand + incr) % modu;
            var encChr2 = '';
            var encStr2 = '';
            for (var i = 0; i < str.length; i += 2) {
                encChr2 = parseInt(parseInt(str.substring(i, i + 2), 16) ^ Math.floor((prand / modu) * 255));
                encStr2 += String.fromCharCode(encChr2);
                prand = (mult * prand + incr) % modu;
            }
            return encStr2;
        }
        return vm;
    }
})(NetBrain);
