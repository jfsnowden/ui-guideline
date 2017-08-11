/**
 * Created by Jia_Wei on 3/8/2016.
 */

(function (netBrain) {
    'use strict';

    angular.module('nb.common').controller('nb.common.addToDeviceGroupPopupCtrl', AddToDeviceGroupPopupCtrl);

    AddToDeviceGroupPopupCtrl.$inject = [
        '$scope',
        '$rootScope',
        '$uibModal',
        '$uibModalInstance',
        '$log',
        'nb.datamodel.httpDeviceGroupSrvc',
        'nb.netbrain.httpDeviceSrvc',
        'nb.systemmodel.deviceTypeMgrSrvc',
        'nb.systemmodel.deviceTypeMainMgrSrvc',
        'nb.ng.userSrvc',
        'args'
    ];

    function AddToDeviceGroupPopupCtrl($scope, $rootScope, $uibModal, $uibModalInstance, $log, httpDeviceGroupSrvc, httpDeviceSrvc, deviceTypeMgrSrvc, deviceTypeMainMgrSrvc, userSrvc, args) {
        $scope.selectedDG = null;
        $scope.selectedDeviceIds = args.lsDevIds;
        $scope.lsDGs = [];
        $scope.lsDevices = [];

        $scope.init = function () {
            //[
            //    {
            //        "ID" : "xx",
            //        "Name" : "xxx",
            //        "CntDevices" : 42 // sum of static devices and dynamic devices,
            //        "Type" : 0 // or 1 or 2
            //    }
            //]
            httpDeviceGroupSrvc.getAllDeviceGroupInfo(null)
                .then(function (lsDGInfo) {
                    for (var i = 0; i < lsDGInfo.length; i++) {
                        var dgInfo = lsDGInfo[i];
                        // do NOT include system dg
                        // filter by user id for private dg
                        if (dgInfo.Type == 2 || (dgInfo.Type == 0 && !userSrvc.checkPermission(NetBrain.NG.Permissions.sharedDeviceLinkGroupMgmt)) || (dgInfo.Type == 1 && dgInfo.UserGuid != userSrvc.getUserID())) {
                            lsDGInfo.splice(i--, 1);
                        }
                    }
                    lsDGInfo.sort(function (dg_1, dg_2) {
                        return dg_1.Type - dg_2.Type;
                    });
                    $scope.lsDGs = lsDGInfo;
                });

            httpDeviceSrvc.getSimpleDevicesByGuids(null, $scope.selectedDeviceIds).then(function (data) {
                if (null != data && data.length > 0) {
                    data.forEach(function (item) {
                        var typeImg = $scope.getDevTypeImg(item.subType);
                        $scope.lsDevices.push({ ID: item.ID, name: item.name, typeImg: typeImg, vendor: item.vendor, model: item.vendor, mgmtIP: item.mgmtIP });
                    });
                }
            })
        };

        $scope.devTypeImgs = {};

        $scope.getDevTypeImg = function (devType) {
            if (devType in $scope.devTypeImgs)
                return $scope.devTypeImgs[devType];

            var picture = deviceTypeMgrSrvc.getIconIDByDevType(devType);
            if (null == picture) {
                picture = deviceTypeMainMgrSrvc.getIconIDByDevMainType(deviceTypeMgrSrvc.getMainTypeByDevType(devType));
            }

            if (null != picture) {
                picture = NetBrain.NG.Const.iconImagePath + picture + ".png";
            } else {
                picture = NetBrain.NG.Const.iconImagePath + "deletedDevice.png";
            }
            $scope.devTypeImgs[devType] = picture;

            return picture;
        };

        $scope.gridOptions = {
            data: 'lsDevices',
            showHeader: false,
            multiSelect: false,
            enableSelection: true,
            modifierKeysToMultiSelect: false,
            enableFullRowSelection: true,
            enableRowHeaderSelection: false,
            enableColumnMenus: false,
            keepLastSelected: true,
            selectedItems: [],
            //rowTemplate: '<div ng-style="{ cursor: row.cursor }" ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns" class="ui-grid-cell" ng-dblclick="grid.appScope.onEdit(row.entity)" ui-grid-cell></div>',
            columnDefs: [
                {
                    field: 'name',
                    displayName: 'Device Name',
                    //width: 250,
                    cellTemplate: '<div class="ui-grid-cell-contents"><img ng-src="{{ row.entity.typeImg }}" style="vertical-align: middle;margin-left:0px; width:16px;" /><span>{{ COL_FIELD }}</span></div>'
                }
            ],
            onRegisterApi: function (gridApi) {
                $scope.gridApi = gridApi;
                $scope.gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                    $scope.selectedModel = angular.copy(row.entity);
                });
            }
        };

        $scope.onAddToNewDeviceGroup = function () {
            var createNewDGModal = $uibModal.open({
                templateUrl: 'modules/nbDataModel/deviceGroup/editor/views/deviceGroupPopup.html',
                controller: 'nb.datamodel.deviceGroupPopupCtrl',
                windowClass: 'deviceGroupPopup',
                backdrop: 'static',
                resolve: {
                    args: function () {
                        return {
                            isCreateNew: true,
                            lsStaticDevicesInfo: $scope.lsDevices.map(function (dev) {
                                return {
                                    hostName: dev.name,
                                    guid: dev.ID,
                                    vendor: dev.vendor,
                                    model: dev.model,
                                    mgmtIP:dev.mgmtIP
                                }
                            })
                        }
                    }
                }
            });
            createNewDGModal.result.then(function () {
                $scope.onCancel();
            })
        };

        $scope.onCancel = function (argCloseReason) {
            $uibModalInstance.dismiss(argCloseReason !== null ? argCloseReason : 'Cancel Button Clicked!');
        };

        $scope.onOK = function () {
            httpDeviceGroupSrvc.addToDeviceGroup(null, $scope.selectedDG, $scope.selectedDeviceIds).then(function (data) {
                if (data != null) {
                    $uibModalInstance.close();
                }
            });
        };

        $scope.init();
    }

})(NetBrain);