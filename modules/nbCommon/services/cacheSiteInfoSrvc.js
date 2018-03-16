(function() {
    'use strict';

    angular.module('nb.common').factory('nb.common.cacheSiteInfoSrvc', cacheSiteInfoSrvc);

    cacheSiteInfoSrvc.$inject = ['$q', '$rootScope', '$timeout', 'nb.ng.offlineCacheSrvc', 'nb.datamodel.httpSiteManagerSrvc'];

    function cacheSiteInfoSrvc($q, $rootScope, $timeout, offlineCacheSrvc, httpSiteManagerSrvc) {
        var vm = {};

        function getSingleData(siteId) {
            return httpSiteManagerSrvc.getSitePropertiesBySiteID(siteId, false);
        }
        vm.cacheDatas = function(siteIds) {
            _.each(siteIds,
                function(siteId) {
                    vm.getData(siteId);
                });
        };
        vm.getData = function(siteId) {
            var store = offlineCacheSrvc.getStore(NetBrain.NG.Const.StoreCategory.SiteInfo);
            return store.get(siteId, getSingleData);
        };

        return vm;
    }
})(NetBrain);
