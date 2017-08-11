

(function (netBrain) {
    "use strict";

    angular.module("nb.common").factory('nb.common.cacheInterfaceInfoSrvc', cacheInterfaceInfoSrvc);

    cacheInterfaceInfoSrvc.$inject = ['$q', '$rootScope', '$timeout', 'nb.ng.offlineCacheSrvc', 'nb.topo.httpTopoSrvc'];

    function cacheInterfaceInfoSrvc($q, $rootScope, $timeout, offlineCacheSrvc, httpTopoSrvc) {
        var vm = {};
        function getSingleData(intf) {
            return httpTopoSrvc.getIfObj(intf);
        };
        vm.cacheDatas = function (intfs) {
            _.each(intfs,
                function (intf) {
                    vm.getData(intf);
                });
        }
        vm.getData = function (intf) {
            var store = offlineCacheSrvc.getStore(NetBrain.NG.Const.StoreCategory.InterfaceInfo);
            return store.get(intf, getSingleData);
         }
        return vm;

    }
})(NetBrain);


