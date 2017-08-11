/**
 * Created by Jia_Wei on 2/24/2016.
 */

(function (netBrain) {
    'use strict';

    angular.module("nb.common").directive("nbInterfacePropertyTreeDirective", [
        '$log', '$filter', 'nb.systemmodel.deviceSchemaMgrSrvc', 'ivhTreeviewMgr',
        function($log, $filter, deviceSchemaMgrSrvc, ivhTreeviewMgr) {
            return {
                replace: true,
                restrict: 'E',
                scope: {
                    intfType : '=',
                    targetValueTypes : '=?', // to filter out properties with certain types -- if null, get all types
                    isMultiSelect : '=?',
                    isOnlyLeafSelectable : '=?',
                    isDisplayInDataview : '=?',
                    selectedNodes : '=', // output
                    filterText : '=?', //
                    preSelectedIntfSchemaIds : '=' // optional -- only used to set pre-selected ids, when directive is initiated -- immutable afterwards
                },
                templateUrl: 'modules/nbCommon/views/nbInterfacePropertyTreeDirective.html',
                link: function (scope, elem, attrs) {


                    init();

                    function init() {

                        scope.treeOptions = {
                            enableTwoWayBinding : true,
                            labelAttribute: 'displayName',
                            idAttribute: 'ID',
                            childrenAttribute: 'child',
                            expandToDepth: -1,
                            selectedAttribute: 'selected',
                            enableMultipleSelect: scope.isMultiSelect ? scope.isMultiSelect : false,
                            labelTemplate : function(node, trvw , labelScope) {//| nbHighlight:filterText
                                var filteredText = $filter('nbHighlight')(node.displayName, scope.filterText);
                                return '<span>'+ filteredText +'</span>';
                            },
                            nodeClickCallback: onSelectNode
                        };


                        scope.treeData = [];

                        var intfSchemaObj = deviceSchemaMgrSrvc.getSchemaObjByKey(scope.intfType);
                        var lsSchemaObjs = getIntfSchemasByType(scope.intfType);

                        var firstTree = {
                            ID : intfSchemaObj.getID(),
                            displayName : intfSchemaObj.getDisplayName(),
                            selected : false,
                            isSchema: true,
                            isParent: true,
                            child : []
                        };
                        firstTree.child = getNodeValueForTree(lsSchemaObjs);
                        scope.treeData.push(firstTree);

                        if (intfSchemaObj.isPhantomInterface()) {
                            var associateSchemaId = intfSchemaObj.getAssociatedSchema();
                            if (!associateSchemaId) {
                                $log.error('Internal Error -- nbInterfacePropertyTreeDirective');
                            } else {
                                var associateIntfType = DeviceTableProcessor.getFirstPartBeforeDot(associateSchemaId);
                                var associateIntfSchemaObjs = getIntfSchemasByType(associateIntfType);
                            }

                            var associateSchemaObj = deviceSchemaMgrSrvc.getSchemaObjByKey(associateIntfType);
                            var secondTree = {
                                ID : associateSchemaObj.getID(),
                                displayName : associateSchemaObj.getDisplayName(),
                                selected : false,
                                isSchema: true,
                                isParent: true,
                                child : []
                            };
                            secondTree.child = getNodeValueForTree(associateIntfSchemaObjs);
                            scope.treeData.push(secondTree);
                        }

                        scope.treeData_backup = angular.copy(scope.treeData);
                        scope.isDataReady = true;
                    }

                    function getIntfSchemasByType(strIntfType) {
                        return deviceSchemaMgrSrvc.getDisplayedIntfSchemasByIntfTypeAndValueType(strIntfType, scope.targetValueTypes, scope.isDisplayInDataview);
                    }

                    function getNodeValueForTree(lsSchemaObjs) {
                        lsSchemaObjs.sort(function(s1, s2) {
                            return s1.getDisplayName().localeCompare(s2.getDisplayName());
                        });
                        return lsSchemaObjs.map(function(schemaObj) {
                            return {
                                ID : schemaObj.getID(),
                                displayName : schemaObj.getDisplayName(),
                                type : schemaObj.getType(),
                                isSchema: true,
                                selected : scope.preSelectedIntfSchemaIds && scope.preSelectedIntfSchemaIds.indexOf(schemaObj.getID()) > -1
                            }
                        })
                    }

                    function onSelectNode(node) {
                        if (!scope.isMultiSelect) {
                            while (scope.selectedNodes.length > 0) {
                                scope.selectedNodes.pop();
                            }

                            if (scope.isOnlyLeafSelectable&&node.isParent) {
                                return;
                            }
                            scope.selectedNodes.push(node);
                        } else {
                             getSelectedNodesInTree(scope.isOnlyLeafSelectable, scope.selectedNodes);
                        }
                    }

                    function getSelectedNodesInTree(bExcludeFolder, refLsSelectedNodes) {

                        while (refLsSelectedNodes.length > 0) {
                            refLsSelectedNodes.pop();
                        }

                        for (var i in scope.treeData) {
                            var subTree = scope.treeData[i];
                            if (!bExcludeFolder&&subTree.selected) {
                                refLsSelectedNodes.push(
                                    {
                                        ID : subTree.ID,
                                        displayName : subTree.displayName
                                    }
                                )
                            }
                            var lsChildNodes = subTree.child;
                            for (var j in lsChildNodes) {
                                var childNode = lsChildNodes[j];
                                if (childNode.selected) {
                                    refLsSelectedNodes.push(childNode);
                                }
                            }
                        }
                    }

                    scope.$watch('filterText', function(val) {
                        scope.refreshData();
                    }, true);
                    scope.refreshData = function() {
                        if (!scope.filterText || scope.filterText.length == 0) {
                            scope.treeData = angular.copy(scope.treeData_backup);
                        } else {
                            scope.treeData = getFilterData(scope.filterText);
                        }

                        ivhTreeviewMgr.validate(scope.treeData, scope.treeOptions);
                    };

                    function getFilterData(query) {
                        var newTreeData = angular.copy(scope.treeData_backup);
                        for (var i = 0; i < newTreeData.length; i++) {
                            var tree = newTreeData[i];
                            var children = tree.child;
                            if (!children || children.length === 0) {
                                continue;
                            }
                            for (var j = 0; j < children.length; j++) {
                                if ((children[j].displayName.toLowerCase()).indexOf(query.toLowerCase()) < 0) {
                                    children.splice(j--, 1);
                                }
                            }
                            if (children.length === 0) {
                                newTreeData.splice(i--, 1);
                            }
                        }

                        return newTreeData;
                    }
                }
            }
        }
    ]);

})(NetBrain);