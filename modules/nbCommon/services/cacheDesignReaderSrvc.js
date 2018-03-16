/**
 * cacheDesignReaderSrvc
 * Cache DesignReader Tree From httpDesignReaderSrvc.GetTreeJson Method
 * Level: Tenant
 * Author: Dezhi Chen
 * Create Date: 2017-01-19
 */
(function() {
    'use strict';

    angular.module('nb.common').factory('nb.common.cacheDesignReaderSrvc', cacheDesignReaderSrvc);

    cacheDesignReaderSrvc.$inject = ['$q', '$rootScope', '$timeout',
        'nb.ng.offlineCacheSrvc',
        'nb.netbrain.httpDesignReaderSrvc'
    ];

    function cacheDesignReaderSrvc($q, $rootScope, $timeout,
        offlineCacheSrvc,
        httpDesignReaderSrvc) {
        var vm = {};

        function getTreeJson(subType) {
            return httpDesignReaderSrvc.getTreeJson(subType);
        }

        vm.cacheDatas = function(subTypes) {
            _.each(subTypes,
                function(subType) {
                    vm.getData(subType);
                });
        };

        vm.getData = function(subType) {
            var store = offlineCacheSrvc.getStore(NetBrain.NG.Const.StoreCategory.DesignReader);
            return store.get(subType, getTreeJson);
        };

        return vm;
    }
})(NetBrain);
