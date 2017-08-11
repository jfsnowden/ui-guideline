/**
 * Created by Jia_Wei on 2/25/2016.
 */

(function (netBrain) {
    "use strict";

    angular.module("nb.common").controller('nb.common.nbSelectPropertyModalCtrl', SelectPropertyModalCtrl);

    SelectPropertyModalCtrl.$inject = ['$scope', '$rootScope', '$uibModal', '$uibModalInstance', 'nb.common.nbSelectPropertyMgr', 'args',
        'nb.systemmodel.httpDeviceSchemaSrvc','nb.systemmodel.deviceSchemaMgrSrvc','nb.common.nbAlertSrvc'
    ];

    function SelectPropertyModalCtrl($scope, $rootScope, $uibModal, $uibModalInstance, nbSelectPropertyMgr, args, httpDeviceSchemaSrvc, deviceSchemaMgrSrvc,nbAlertSrvc) {

        /**
         * Special case to use in edit data view from map -- select data unit from qapp manually
         */
        $scope.isDataUnitFromQapp = args.isDataUnitFromQapp;
        $scope.lsDataUnitFromQapp = args.lsDataUnitFromQapp;
        if (args.isDataUnitFromQapp) {
            $scope.DataUnitType = DataUnitType;

            if (args.preSelectedDataUnitUId && args.preSelectedDataUnitUId.length > 0) {
                for (var i = 0; i < $scope.lsDataUnitFromQapp.length; i++) {
                    if (args.preSelectedDataUnitUId.indexOf($scope.lsDataUnitFromQapp[i].uId) > -1) {
                        $scope.lsDataUnitFromQapp[i].isSelected = true;
                    }
                }
            }

            $scope.lsDataUnitFromQapp.sort(function(p1, p2) {
                return p1.name.localeCompare(p2.name);
            });

        }
        // if (args.isDataUnitFromQapp && (!args.lsDataUnitFromQapp || args.lsDataUnitFromQapp.length === 0)) {
        //     nbAlertSrvc.alert('Error in nbSelectPropertyModalCtrl');
        // }



        $scope.isDeviceProperty = args.isDeviceProperty;
        $scope.isInterfaceProperty = args.isInterfaceProperty;

        // if (!args.isDataUnitFromQapp&&(!$scope.isDeviceProperty && !$scope.isInterfaceProperty || $scope.isDeviceProperty && $scope.isInterfaceProperty)) {
        //     nbAlertSrvc.alert('Error in nbSelectPropertyModalCtrl');
        // }

        $scope.intfSchemaId = args.intfSchemaId;

        /**
         * Need if wanna filter by device id
         * effective for route/arp tables, and nct tables
         */
        $scope.deviceId = args.deviceId;
        $scope.deviceType = args.deviceType;

        $scope.isGeneralProperty = !$scope.deviceId; // if general property or devic specific property

        var preSelectedPropertyId = args.preSelectedPropertyId ? args.preSelectedPropertyId : [];

        $scope.lsSelectedProperty = [];

        $scope.filterTarget = {
            filterText: '',
            searchText: ''
        };

        $scope.propertyCategories = [
            {
                name : ($scope.isDeviceProperty ? "Device" : "Interface") + " Property",
                id : 0
            },
            {
                name : "Device Data",
                id : 1
            },
            {
                name : "NCT Table",
                id : 2
            }
        ];

        $scope.dictProperties = {
            devProp : [],
            intfProp : [],
            devData : [],
            nctTable : []
        };
        $scope.lsProperties = [];

        $scope.initData = function () {
            var initCategory = 0;

            //ENG-7248: get device schema from server so that the data is up-to-date (server should implement caching mechanism to avoid query db if so desired)
            httpDeviceSchemaSrvc.getAllDeviceSchemasFilter(null).then(function (jsList) {
                deviceSchemaMgrSrvc.initDeviceSchemaObjList(jsList);

                // note : 2nd and 3rd param may be null, if the modal is for general properties
                nbSelectPropertyMgr.getAll_promise($scope.isDeviceProperty, $scope.deviceId, $scope.deviceType)
                .then(function (lsProps) {

                    lsProps.sort(function(p1, p2) {
                        return p1.displayName.localeCompare(p2.displayName);
                    });

                    // for interface
                    if ($scope.isInterfaceProperty) {
                        $scope.lsPreSelectIntfSchemaIds = preSelectedPropertyId;
                    }

                    lsProps.forEach(function(prop)
                    {
                        if ($scope.isDeviceProperty && prop.isSchema) {
                            if (preSelectedPropertyId.indexOf(prop.ID) > -1) {
                                $scope.lsSelectedProperty.push(prop);
                                prop.isSelected = true;
                                initCategory = 0;
                            }
                            $scope.dictProperties.devProp.push(prop);
                        }
                        if (prop.isTable && !prop.isNctTable) {
                            // to check prop.displayName is for arpTable and routeTable
                            if (preSelectedPropertyId.indexOf(prop.dataType) > -1 || preSelectedPropertyId.indexOf(prop.displayName) > -1) {
                                $scope.lsSelectedProperty.push(prop);
                                prop.isSelected = true;
                                initCategory = 1;
                            }
                            if (prop.children) {
                                prop.children.forEach(function(childProp) {
                                    if (preSelectedPropertyId.indexOf(childProp.dataType) > -1 || preSelectedPropertyId.indexOf(childProp.displayName) > -1) {
                                        $scope.lsSelectedProperty.push(childProp);
                                        childProp.isSelected = true;
                                        initCategory = 1;

                                        // expand the node
                                        prop.children.forEach(function(childProp) {
                                            childProp.expanded = true;
                                        })
                                    }
                                })
                            }
                            $scope.dictProperties.devData.push(prop);
                        }
                        if (prop.isNctTable) {
                            if (preSelectedPropertyId.indexOf(prop.dataName) > -1) {
                                $scope.lsSelectedProperty.push(prop);
                                prop.isSelected = true;
                                initCategory = 2;
                            }
                            $scope.dictProperties.nctTable.push(prop);
                        }
                        if (prop.isConfigFile) {
                            if (preSelectedPropertyId.indexOf(prop.dataType) > -1) {
                                $scope.lsSelectedProperty.push(prop);
                                prop.isSelected = true;
                                initCategory = 2;
                            }
                            $scope.dictProperties.nctTable.push(prop);
                        }
                    });

                    // for route table and arp table with vrf, process
                    if (!$scope.isGeneralProperty) {
                        for (var i = 0; i < $scope.dictProperties.devData.length; i++) {
                            var currProperty = $scope.dictProperties.devData[i];
                            if (currProperty.children && (currProperty.dataType === DeviceDataType.RouteTable || currProperty.dataType === DeviceDataType.ArpTable)) {
                                var lsSubTables = angular.copy(currProperty.children);
                                delete currProperty.children;
                                currProperty.hasChildren = true;
                                for (var j = 0; j < lsSubTables.length; j++) {
                                    lsSubTables[j].isChild = true;
                                    $scope.dictProperties.devData.splice(i++ + 1, 0, lsSubTables[j]);
                                }
                            }
                        }
                    }
                })
                .then(function() {
                    $scope.onSelectPropertyCategory(initCategory);
                    $scope.displayPropertyCategory = initCategory;

                    $scope.isDataReady = true;
                })

            });
        };

        if (!args.isDataUnitFromQapp) {
            $scope.initData();
        }

        $scope.onSelectPropertyCategory = function(cateId) {
            $scope.displayPropertyCategory = cateId;
            switch (cateId) {
                case 0 :
                    $scope.lsProperties = $scope.isDeviceProperty ? $scope.dictProperties.devProp : $scope.dictProperties.intfProp;
                    break;
                case 1 :
                    $scope.lsProperties = $scope.dictProperties.devData;
                    break;
                case 2 :
                    $scope.lsProperties = $scope.dictProperties.nctTable;
                    break;
                default :
                    nbAlertSrvc.alert('Error in nbSelectPropertyModalCtrl');
            }
        };

        $scope.toggleExpansionByTableType = function(tableType) {
            $scope.lsProperties.forEach(function(property) {
                if (property.dataType == tableType) {
                    property.expanded = !property.expanded;
                }
            })
        };

        $scope.onFilterFired = function () {
            $scope.filterTarget.filterText = $scope.filterTarget.searchText;
            if ($scope.filterTarget.filterText && $scope.filterTarget.filterText.length > 0) {
                $scope.lsProperties.forEach(function(prop) {
                    if (prop.isChild) {
                        prop.expanded = true;
                    }
                })

            }
            else {
                $scope.lsProperties.forEach(function(prop) {
                    if (prop.isChild || prop.hasChildren) {
                        prop.expanded = false;
                    }

                })
            }
        };

        $scope.isSelectionNeeded = function() {
            return !$scope.lsSelectedProperty || $scope.lsSelectedProperty.length === 0;
        };

        $scope.isTreeViewNeeded = function() {
            return $scope.isInterfaceProperty && $scope.displayPropertyCategory == 0;
        };

        $scope.onOK = function () {
            $uibModalInstance.close($scope.lsSelectedProperty[0]);
        };

        $scope.onCancel = function () {
            $uibModalInstance.dismiss();
        };
    }

})(NetBrain);


