(function () {
    'use strict';

    angular.module('nb.common').controller('nb.common.nbResourceImportCtrl', nbController);
    nbController.$inject = ['$scope', '$filter', '$uibModalInstance', 'nb.common.nbResourceImportSrvc', 'nb.common.nbResourceIOSrvc', 'resolveData'];

    function nbController($scope, $filter, $uibModalInstance, nbResourceImportSrvc, nbResourceIOSrvc, resolveData) {
        //status: 0: select; 100: ready; 200: upload success; 300: validating; 400: uploading; 301: validate failed; 401; upload failed  
        $scope.dataModel = {
            type: resolveData.type,
            typeModel: nbResourceIOSrvc.getTypeModel(resolveData.type),
            importTo: resolveData.importTo,
            options: resolveData.options,
            fileSelect: {
                gidSelect: window.nbPLM.nbParserLibCM.getGUID(),
                opts: {
                    accept: resolveData.options && resolveData.options.accept || '*',
                    uploadSettings: ''
                }
            },
            fileArray: [
                // { file: {}, checked: true, gidSelect: '', name: '', size: '', status: '', related: '' }
            ],
            tblDef: {
                gid: window.nbPLM.nbParserLibCM.getGUID(),
                data: [],
                columnDefs: [
                    { field: 'name', displayName: 'Name', width: '28%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents" title="{{row.entity.name}}">{{row.entity.name}}</div>' },
                    { field: 'size', displayName: 'Size', width: '10%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents" title="{{row.entity.size|nbResourceIOFileSize}}">{{row.entity.size|nbResourceIOFileSize}}</div>' },
                    { field: 'status', displayName: 'Status', width: '20%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents" title="{{grid.appScope.displayStatus(row.entity)}}" style="{{grid.appScope.displayStatus(row.entity) | nbResourceIOTextColor}}">{{grid.appScope.displayStatus(row.entity)}}</div>' },
                    { field: 'overwritable', displayName: 'Overwrite', width: '12%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-contents-ck"><div class="rii-item"><input class="rii-item-ck" type="checkbox" ng-model="row.entity.overwritable" ng-disabled="!row.entity.isExists" /></div></div>' },
                    { field: 'related', displayName: 'Related Resources', width: '25%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents rii-item-related" title="{{row.entity.related}}"><a ng-click="grid.appScope.onOpenRelated(row.entity)">{{row.entity.related}}<a></div>' },
                    { field: 'delete', displayName: '', width: '5%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-contents-ck"><div class="rii-item"><em ng-if="row.entity.status < 4" class="icon icon_nb_delete rii-item-op" ng-click="grid.appScope.onItemDelete(row.entity)"></em></div></div>' }
                ],
                enableColumnResize: false,
                multiSelect: false,
                enableFullRowSelection: false,
                enableRowHeaderSelection: false,
                modifierKeysToMultiSelect: false,
                enableHorizontalScrollbar: 0, // uiGridConstants.scrollbars.NEVER,
                enableVerticalScrollbar: 1, // uiGridConstants.scrollbars.ALWAYS,
                enableColumnMenus: false,
                rowTemplate: "<div ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>",
                onReady: function (event) {
                    event.api.sizeColumnsToFit();
                },
                onRegisterApi: function (gridApi) {
                    this.gridApi = gridApi;
                },
                gridApi: null
            }
        }

        $scope.displayStatus = function (fileInfo) {
            if (fileInfo.status == 1) {
                return '';
            } else if (fileInfo.status == 2) {
                return fileInfo.isExists ? nbResourceImportSrvc.Const.FileStatus2['202'] : nbResourceImportSrvc.Const.FileStatus2['201'];
            } else if (fileInfo.status == 3) {
                return nbResourceImportSrvc.Const.FileStatus2[fileInfo.status2] || nbResourceImportSrvc.Const.FileStatus[fileInfo.status];
            } else if (fileInfo.status == 4) {
                return nbResourceImportSrvc.Const.FileStatus[fileInfo.status];
            } else if (fileInfo.status == 5) {
                return nbResourceImportSrvc.Const.FileStatus[fileInfo.status];
            } else if (fileInfo.status == 6) {
                return nbResourceImportSrvc.Const.FileStatus[fileInfo.status2] || nbResourceImportSrvc.Const.FileStatus[fileInfo.status];
            } else {
                return '';
            }
        }

        $scope.onSelectFile = function () {
            $('#' + $scope.dataModel.fileSelect.gidSelect).click();
        }

        $scope.onFileSelect = function ($files, $event) {
            nbResourceImportSrvc.onFileSelect($scope.dataModel, $files, $event.target.id);
        }

        $scope.onItemDelete = function (fileInfo) {
            nbResourceImportSrvc.onItemDelete($scope.dataModel, fileInfo);
        }

        $scope.beforeUploading = function () {
            var dm = $scope.dataModel;
            return dm.fileArray.every(function (eleFileInfo) {
                return eleFileInfo.status != 4 && eleFileInfo.status != 5 && eleFileInfo.status != 6;
            });
        }

        $scope.isReady = function () {
            var dm = $scope.dataModel;
            var checkedNumber = 0;
            var ret = dm.fileArray.every(function (eleFileInfo) {
                if (eleFileInfo.checked) {
                    if (eleFileInfo.status == 2) {
                        checkedNumber++;
                    }
                    return eleFileInfo.status == 2 || eleFileInfo.status == 3;
                } else {
                    return true;
                }
            });
            return ret && checkedNumber > 0;
        }

        $scope.isUploading = function () {
            var dm = $scope.dataModel;
            return dm.fileArray.some(function (eleFileInfo) {
                return eleFileInfo.status == 4;
            });
        }

        $scope.isAfterUploading = function () {
            var dm = $scope.dataModel;
            return dm.fileArray.some(function (eleFileInfo) {
                return eleFileInfo.status == 4 || eleFileInfo.status == 5 || eleFileInfo.status == 6;
            });
        }

        $scope.isComplete = function () {
            var dm = $scope.dataModel;
            var checkedNumber = 0;
            var ret = dm.fileArray.every(function (eleFileInfo) {
                if (eleFileInfo.status == 3) {
                    return true;
                } else if (eleFileInfo.checked) {
                    checkedNumber++;
                    return eleFileInfo.status == 5 || eleFileInfo.status == 6;
                } else {
                    return true;
                }
            });
            return ret && checkedNumber;
        }

        $scope.onOpenRelated = function (fileInfo) {
            nbResourceImportSrvc.onOpenRelated($scope.dataModel, fileInfo);
        }


        $scope.onCancel = function (button) {
            $uibModalInstance.dismiss({
                button: 'cancel',
                result: null
            });
        };

        $scope.onClose = function (button) {
            var results = $scope.dataModel.fileArray.filter(function (ele) {
                return ele.result;
            }).map(function (ele) {
                return ele.result;
            });
            $uibModalInstance.close(results);
        };

        $scope.onUpload = function (button) {
            nbResourceImportSrvc.onUpload($scope.dataModel);
        };

        nbResourceImportSrvc.onInit($scope.dataModel);
    }
})(NetBrain);
