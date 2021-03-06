﻿(function(NetBrain) {
    'use strict';

    angular.module('nb.common').factory('nb.common.cacheSrvc', cacheSrvc);

    cacheSrvc.$inject = ['$q', '$rootScope', '$timeout', 'nb.ng.offlineCacheSrvc', 'nb.deviceDetail.httpDeviceDetailSrvc', 'nb.datamodel.httpSiteManagerSrvc'];

    function cacheSrvc($q, $rootScope, $timeout, offlineCacheSrvc, httpDeviceDetailSrvc, httpSiteManagerSrvc) {
        var vm = {};
        vm.initCacheConfig = function() {
            offlineCacheSrvc.initStores([{
                name: 'ConfigFile',
                getUpdateOn: function(item) {
                    return item.uploadDate;
                },
                generateId: function(item) {
                    return item;
                },
                freshChecker: function(arr) {
                    var params = {
                        sourceType: NetBrain.DeviceDetail.DataFolder.CurrentBaseline,
                        taskId: '',
                        dataType: 1, // config
                        devIds: arr
                    };
                    return httpDeviceDetailSrvc.getDetailLastUpdateTime(params);
                }
            }, {
                name: 'SiteInfo',
                getUpdateOn: function(item) {
                    return item.operateInfo.operateTime;
                },
                generateId: function(item) {
                    return item;
                },
                freshChecker: function(arr) {
                    return httpSiteManagerSrvc.getSitesLastUpdateTime(arr);
                }
            }, {
                name: 'InterfaceInfo',
                getUpdateOn: function() { // item
                    return '';
                },
                generateId: function(item) {
                    return item.intfKeyObj.value + '_' + item.intfKeyObj.schema;
                }
            }, {
                name: 'DesignReader',
                level: 'Tenant',
                getUpdateOn: function() { // item
                    return '';
                },
                generateId: function(item) {
                    return item;
                }
            }]);
        };
        vm.resetFreshFlags = function() {
            offlineCacheSrvc.resetFreshFlags();
        };
        return vm;
    }
})(NetBrain);
