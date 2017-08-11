/**
 * Created by Jia_Wei on 2/25/2016.
 */

; (function (NetBrain) {
    'use strict';

    angular.module('nb.common').factory('nb.common.nbSelectPropertyMgr', SelectPropertyMgr);

    SelectPropertyMgr.$inject = ['$q', '$log',
        'nb.systemmodel.deviceSchemaMgrSrvc',
        'nb.systemmodel.deviceTypeMgrSrvc',
        'nb.netbrain.httpDeviceLiveDataSrvc',
        'nb.snapshot.httpSnapshotSrvc',
        'nb.netbrain.httpObjectGroupSrvc'
    ];

    function SelectPropertyMgr($q, $log, deviceSchemaMgrSrvc, deviceTypeMgrSrvc, httpDeviceLiveDataSrvc, httpSnapshotSrvc, httpObjectGroupSrvc) {

        var services = {
            getDeviceSchemas: getDeviceSchemas,
            getIntfSchemas: getIntfSchemas,
            getAllDataTables_promise: getAllDataTables_promise,
            getAll_promise: getAll_promise
        };

        function getDeviceSchemas() {
            var lsSchemaObjs = deviceSchemaMgrSrvc.getDisplayedDeviceSchemasInDataView();
            var lsSchemaJson = lsSchemaObjs.map(function (schemaObj) {
                var devSchema =  {
                    ID: schemaObj.getID(),
                    displayName: schemaObj.getDisplayName(),
                    isSchema : true,
                    shortDisplayname: schemaObj.getShortDisplayName()
                    // add the fields you need here
                }
                var schemaType = schemaObj.getType();
                if (schemaType === "list") {
                    var subType = schemaObj.getSubtype();
                    if (subType === "object") {
                        devSchema.isSchemaTable = true;
                    }
                }
                return devSchema;
            });
            return lsSchemaJson;
        }

        function getIntfSchemas() {
            var lsSchemaObjs = deviceSchemaMgrSrvc.getDisplayedIntfSchemasInDataView();
            var lsSchemaJson = lsSchemaObjs.map(function (schemaObj) {
                return {
                    ID: schemaObj.getID(),
                    displayName: schemaObj.getDisplayName(),
                    isSchema: true,
                    shortDisplayname: schemaObj.getShortDisplayName()
                    // add the fields you need here
                }
            });
            return lsSchemaJson;
        }

        function getAllDataTables_promise() {
            var deferred = $q.defer();

            var lsDataTables = [];

            var routeTable = {
                displayName: "Route Table",
                dataType: DeviceDataType.RouteTable,
                dataName: "",
                vrf: '', // default route table
                isTable: true,
                isNctTable : false
            };
            lsDataTables.push(routeTable);

            var arpTable = {
                displayName: "ARP Table",
                dataType: DeviceDataType.ArpTable,
                dataName: "",
                vrf: '', // default arp table
                isTable: true,
                isNctTable : false
            };
            lsDataTables.push(arpTable);

            var macTable = {
                displayName: "MAC Table", // default route table
                dataType: DeviceDataType.MacTable,
                dataName: "",
                vrf: "",
                isTable: true,
                isNctTable : false
            };
            lsDataTables.push(macTable);

            var cdpTable = {
                displayName: "NDP Table", // default route table
                dataType: DeviceDataType.CdpTable,
                dataName: "",
                vrf: "",
                isTable: true,
                isNctTable : false
            };
            lsDataTables.push(cdpTable);

            var stpTable = {
                displayName: "STP Table", // default route table
                dataType: DeviceDataType.StpTable,
                dataName: "",
                vrf: "",
                isTable: true,
                isNctTable : false
            };
            lsDataTables.push(stpTable);

            httpSnapshotSrvc.getNctTableNames()
                .then(function (lsNctNames) {
                    lsNctNames.ncts.forEach(function (nctName) {
                        lsDataTables.push({
                            displayName: nctName, // default route table
                            dataType: DeviceDataType.NctTable,
                            dataName: nctName,
                            vrf: "",
                            isTable: true,
                            isNctTable : true
                        })
                    });

                    deferred.resolve(lsDataTables);
                }, function (reason) {
                    $log.error("Error in selectGeneralPropertyMgr!");
                    deferred.reject(reason);
                });

            return deferred.promise;
        }

        function getAllDataTablesByDevice_promise(devId, devType) {
            var deferred = $q.defer();

            var lsDataTables = [];


            if (deviceTypeMgrSrvc.isSupportMacTable(devType)) {
                var macTable = {
                    displayName: "MAC Table", // default route table
                    dataType: DeviceDataType.MacTable,
                    dataName: "",
                    vrf: "",
                    isTable: true,
                    isNctTable : false
                };
                lsDataTables.push(macTable);
            }

            if (deviceTypeMgrSrvc.isSupportCdpTable(devType)) {
                var cdpTable = {
                    displayName: "NDP Table", // default route table
                    dataType: DeviceDataType.CdpTable,
                    dataName: "",
                    vrf: "",
                    isTable: true,
                    isNctTable: false
                };
                lsDataTables.push(cdpTable);
            }

            if (deviceTypeMgrSrvc.isSupportStpTable(devType)) {
                var stpTable = {
                    displayName: "STP Table", // default route table
                    dataType: DeviceDataType.StpTable,
                    dataName: "",
                    vrf: "",
                    isTable: true,
                    isNctTable: false
                };
                lsDataTables.push(stpTable);
            }

            var promise_getNctCates = httpObjectGroupSrvc.getNCTCategoriesByDeviceId(null, devId);
            var promise_tableCates = httpDeviceLiveDataSrvc.getRouteArpTableCategoriesByDeviceId(devId, null, null); // test device id : 'f9b91691-5c42-4185-a025-f2cccef5ac15'
            var lsPromise = [promise_getNctCates, promise_tableCates];
            $q.all(lsPromise)
                .then(function(lsRet) {
                    var lsNcts = lsRet[0];
                    if (lsNcts && lsNcts.length > 0) {
                        lsNcts.map(function(nctObj) {
                            var currNct = {
                                displayName: nctObj.name, // default route table
                                dataType: DeviceDataType.NctTable,
                                dataName: nctObj.name,
                                isTable: true,
                                isNctTable : true
                            };
                            lsDataTables.push(currNct);
                        });
                    }


                    var tableCates = lsRet[1];
                    // take care of routeTable/arpTable sub tables
                    // route table
                    if (deviceTypeMgrSrvc.isSupportRoutingTable(devType) && tableCates && tableCates['routeTable'] && tableCates['routeTable'].length > 0) {
                        lsDataTables.push({
                            isTable: true,
                            isNctTable : false,
                            displayName: 'Route Table',
                            dataType: DeviceDataType.RouteTable,
                            dataName: '',
                            children: [],
                            hasChildren : true
                        });
                        var lsSubs_route = [];
                        tableCates[DeviceDataType.RouteTable].forEach(function(routeTable) {
                            var tableProperty = {
                                isChild : true,
                                isTable: true,
                                isNctTable : false,
                                dataType: DeviceDataType.RouteTable,
                                dataName: '',
                                vrf: routeTable && routeTable.subName ? routeTable.subName.vrf : null
                            };
                            var strDisplayName = '';
                            if (!routeTable || !routeTable.subName || !routeTable.subName.vrf || routeTable.subName.vrf == '') {
                                strDisplayName = 'Default Route Table';
                            } else {
                                strDisplayName = routeTable.subName.vrf + ' Route Table';
                            }
                            tableProperty['displayName'] = strDisplayName;

                            lsSubs_route.push(tableProperty);
                        });
                        for (var i = 0; i < lsDataTables.length; i++) {
                            if (lsDataTables[i].dataType == DeviceDataType.RouteTable) {
                                lsDataTables[i].children = lsSubs_route;
                                break;
                            }
                        }
                    }
                    // arp table
                    if (deviceTypeMgrSrvc.isSupportArpTable(devType) && tableCates && tableCates['arpTable'] && tableCates['arpTable'].length > 0) {
                        lsDataTables.push({
                            isTable: true,
                            isNctTable : false,
                            displayName: 'ARP Table',
                            dataType: DeviceDataType.ArpTable,
                            dataName: '',
                            children: [],
                            hasChildren : true
                        });

                        var lsSubs_arp = [];
                        tableCates[DeviceDataType.ArpTable].forEach(function(arpTable) {
                            var tableProperty = {
                                isChild : true,
                                isTable: true,
                                isNctTable : false,
                                dataType: DeviceDataType.ArpTable,
                                dataName: '',
                                vrf: arpTable && arpTable.subName ? arpTable.subName.vrf : null
                            };
                            var strDisplayName = '';
                            if (!arpTable || !arpTable.subName || !arpTable.subName.vrf || arpTable.subName.vrf == '') {
                                strDisplayName = 'Default ARP Table';
                            } else {
                                strDisplayName = arpTable.subName.vrf + ' ARP Table';
                            }
                            tableProperty['displayName'] = strDisplayName;

                            lsSubs_arp.push(tableProperty);
                        });
                        for (var i = 0; i < lsDataTables.length; i++) {
                            if (lsDataTables[i].dataType == DeviceDataType.ArpTable) {
                                lsDataTables[i].children = lsSubs_arp;
                                break;
                            }
                        }
                    }

                    deferred.resolve(lsDataTables);
                }, function(reason) {
                    deferred.reject(reason);
                })

            return deferred.promise;
        }

        function getConfigFile() {
            return {
                displayName: "Config File", // default route table
                dataType: DeviceDataType.Config,
                dataName: "",
                vrf: "",
                isConfigFile: true
            };
        }

        function getAll_promise(isDeviceProperties, devId_optional, devType_optional) {
            var deferred = $q.defer();

            var lsSchemas = [];

            if (!devId_optional) { // general properties
                lsSchemas.push(getConfigFile());

                if (isDeviceProperties) {
                    lsSchemas = lsSchemas.concat(getDeviceSchemas());
                } else {
                    lsSchemas = lsSchemas.concat(getIntfSchemas());
                }

                getAllDataTables_promise().then(function (lsDataTables) {
                    deferred.resolve(lsSchemas.concat(lsDataTables));
                }, function (reason) {
                    deferred.reject(reason);
                });
            } else { // filter properties by device
                if (deviceTypeMgrSrvc.isSupportConfigFile(devType_optional)) {
                    lsSchemas.push(getConfigFile());
                }

                if (isDeviceProperties) {
                    lsSchemas = lsSchemas.concat(getDeviceSchemas());
                } else {
                    lsSchemas = lsSchemas.concat(getIntfSchemas());
                }

                getAllDataTablesByDevice_promise(devId_optional, devType_optional).then(function(lsDataTables) {
                    deferred.resolve(lsSchemas.concat(lsDataTables));
                }, function (reason) {
                    deferred.reject(reason);
                });
            }


            return deferred.promise;
        }

        return services;
    }

})(NetBrain);