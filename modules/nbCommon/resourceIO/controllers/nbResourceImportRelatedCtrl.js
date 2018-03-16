(function () {
    'use strict';

    angular.module('nb.common').controller('nb.common.nbResourceImportRelatedCtrl', nbController);
    nbController.$inject = ['$scope', '$filter', '$uibModalInstance', 'nb.common.nbResourceImportRelatedSrvc', 'nb.common.nbResourceIOSrvc', 'resolveData'];

    function nbController($scope, $filter, $uibModalInstance, nbResourceImportRelatedSrvc, nbResourceIOSrvc, resolveData) {
        $scope.dataModel = {
            fileInfo: undefined,
            curResource: undefined,
            options: resolveData.options,
            dependentGroups: [],// {type: '', data: [], tblDef: undefine }
            tblTmpl: {
                allCheck: true,
                data: [],
                columnDefs: [
                    { field: 'check', displayName: '', width: '5%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-contents-ck"><div class="rii-item"><input class="rii-item-ck" type="checkbox" ng-model="row.entity.check" ng-change="grid.appScope.onItemCheck(row.entity, grid.appScope)" /></div></div>' },
                    { field: 'name', displayName: 'Name', width: '29%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents" title="{{row.entity.name}}">{{row.entity.name}}</div>' },
                    { field: 'path', displayName: 'Import Path', width: '30%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents" title="{{row.entity.path}}">{{row.entity.path}}</div>' },
                    { field: 'status', displayName: 'Status', width: '23%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents" title="{{row.entity.isExists | nbResourceIOExists}}" style="{{row.entity.isExists | nbResourceIOExists | nbResourceIOTextColor}}">{{row.entity.isExists | nbResourceIOExists}}</div>' },
                    { field: 'overwritable', displayName: 'Overwrite', width: '13%', enableSorting: false, cellTemplate: '<div class="ui-grid-cell-contents ui-grid-cell-contents-ck"><div class="rii-item"><input class="rii-item-ck" type="checkbox" ng-model="row.entity.overwritable" ng-disabled="!row.entity.isExists" /></div></div>' }
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
        };

        function init() {
            var dm = $scope.dataModel;
            var resourceTypeMap = {};
            dm.fileInfo = resolveData.fileInfo;
            dm.curResource = angular.copy(resolveData.fileInfo.inventory.resources[0]);
            resolveData.fileInfo.inventory.resourceTypes.forEach(function (eleType, index) {
                resourceTypeMap[eleType.name] = index;
            });
            dm.curResource.dependencies.forEach(function (ele) {
                if (!dm.dependentGroups.some(function (eleDG) {
                    if (eleDG.type == ele.type) {
                        eleDG.data.push(ele);
                        return true;
                }
                })) {
                    var xxType = nbResourceIOSrvc.getTypeModel(ele.type);
                    var newDG = {
                        type: ele.type,
                        dispType: 'Import ' + (xxType && xxType.displayName || ele.type) + 's:',
                        data: [ele],
                        bHide: false,
                        tblDef: angular.copy(dm.tblTmpl)
                    };
                    newDG.tblDef.data = newDG.data;
                    newDG.tblDef.gidCK = window.nbPLM.nbParserLibCM.getGUID();
                    if (newDG.type == 'VariableMapping') {
                        newDG.tblDef.columnDefs = newDG.tblDef.columnDefs.filter(function (eleCol) {
                            return ['check', 'name'].indexOf(eleCol.field) >= 0;
                        });
                        newDG.tblDef.columnDefs.some(function (eleCol) {
                            if (eleCol.field == 'name') {
                                eleCol.width = '95%';
                                return true;
                            }
                        })
                    }
                    dm.dependentGroups.push(newDG)
                }
            });
            dm.dependentGroups.forEach(function (eleDG) {
                if (eleDG.data.length > 1000) {
                    eleDG.height = 1001 * 30;
                } else {
                    eleDG.height = (eleDG.data.length + 1) * 30 + 2;
                }
                nbResourceImportRelatedSrvc.initAllCheck($scope.dataModel, eleDG);
            });
            dm.dependentGroups.sort(function (ele1, ele2) {
                return resourceTypeMap[ele1.type] > resourceTypeMap[ele2.type] ? 1 : -1;
            })
        }

        $scope.onAllCheck = function (eleDG) {
            nbResourceImportRelatedSrvc.onAllCheck($scope.dataModel, eleDG);
        }

        $scope.onItemCheck = function (entity, appScope) {
            nbResourceImportRelatedSrvc.onItemCheck(appScope.dataModel, appScope.eleDG, entity);
        }

        $scope.onCancel = function (button) {
            $uibModalInstance.dismiss({
                button: 'cancel',
                result: null
            });
        };

        $scope.onOK = function (button) {
            var dm = $scope.dataModel;
            angular.merge(dm.fileInfo.inventory.resources[0], dm.curResource);
            $uibModalInstance.close({
                button: 'ok',
                result: $scope.dataModel
            });
        };

        init();
    }
})(NetBrain);
