

(function (netBrain) {
    "use strict";

    angular.module("nb.common").factory('nb.common.cacheConfigSrvc', cacheConfigSrvc);

    cacheConfigSrvc.$inject = ['$q', '$rootScope', '$timeout', 'nb.ng.offlineCacheSrvc', 'nb.mapfoldermanager.detailService'];

    function cacheConfigSrvc($q, $rootScope, $timeout, offlineCacheSrvc, detailService) {
        var vm = {};
        
        function _getDetailDataParams(devId) {
            return {
                folderType: 1,
                sourceId: '',
                type: 1,
                devId: devId
            }
        };

         function getSingleData(devId) {
            var params = _getDetailDataParams(devId);
             return detailService.getDetailByPaged(params);
         };

        vm.cacheDatas = function(devIds) {
            _.each(devIds,
                function(devId) {
                    vm.getData(devId);
                });
        };
        vm.getData = function(devId) {
            var store = offlineCacheSrvc.getStore(NetBrain.NG.Const.StoreCategory.ConfigFile);
            return store.get(devId, getSingleData);
        };



        return vm;

    }
})(NetBrain);


