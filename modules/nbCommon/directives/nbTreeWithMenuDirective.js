(function() {
    'use strict';

    angular.module('nb.common').directive('nbTreeWithMenuDirective', [
        '$compile',
        function($compile) {
            var parentScope = null;
            return {
                restrict: 'EA',
                terminal: true,
                scope: {
                    maxnumberchildren: '@',
                    displayFolderOnly: '@',
                    root: '@',
                    fieldid: '@',
                    fieldlabel: '@',
                    fieldchildren: '@',
                    val: '=?',
                    fetch: '=?',
                    selected: '=',
                    multi: '@',
                    treeNodeSelect: '&',
                    treeActionMenu: '=',
                    nbMenuPositionDirective: '@',
                    treeNodeDrag: '&',
                    treeNodeDrop: '&'
                },

                link: function(scope, element) { // , attrs
                    if (scope.fieldlabel) {
                        parentScope = scope.$parent;
                    }

                    scope.dragStart = function() { // myscope, myevent
                        scope.val.rootScope.treeNodeDrag({ node: scope.val.ID });
                    };
                    scope.dropItem = function() { // myscope, myevent
                        scope.val.rootScope.treeNodeDrop({ node: scope.val.ID });
                    };

                    scope.expand = function(val) {
                        val.show = !val.show;

                        if (val.isFolder && val.rootScope.fetch && val.children == null) {
                            val.isLoading = true;
                            val.rootScope.fetch(val.getId(), function(fetchedItems) {
                                var items = [];
                                var index = 0;
                                var fetchedItem = null;
                                var label = null;
                                var isFolder = false;

                                angular.forEach(fetchedItems, function(_fetchedItem) {
                                    fetchedItem = _fetchedItem[0];
                                    isFolder = _fetchedItem[1];

                                    index = fetchedItem.lastIndexOf('/') > -1 ? fetchedItem.lastIndexOf('/') : fetchedItem.lastIndexOf('\\');
                                    label = fetchedItem.substr(index + 1);
                                    items.push(createTreeData(fetchedItem, label, null, val.rootScope, isFolder, false, false));
                                });

                                _setChildren(val, items);
                                val.isLoading = false;
                            });
                        }
                    };

                    scope.setSelectNode = function(node) {
                        scope.val.rootScope.selected = node.getId();
                        if (parentScope.nodeSelected) {
                            parentScope.nodeSelected.selected = false;
                        }
                        if (parentScope.nodeSelected && parentScope.nodeSelected.editMode && (node.getId() !== parentScope.nodeSelected.getId())) {
                            // user clicked on a different node, reset the edit mode if it's in edit mode
                            parentScope.nodeSelected.editMode = false;
                        }
                        node.selected = true;
                        parentScope.nodeSelected = node;
                        scope.val.rootScope.treeNodeSelect({ node: node });
                    };

                    function _subDivideChildren(val, items) {
                        if (items.length > val.rootScope.maxnumberchildren) {
                            var groups = _subDivideChildrenIntoGroups(val.rootScope, items, 1);
                            var result = [];
                            var label = '';

                            angular.forEach(groups, function(items2, group) {
                                if (items2.length === 1) {
                                    result.push(items2[0]);
                                } else {
                                    label = group + '... [' + items2.length + ' items]';
                                    result.push(createTreeData(val.id + '.' + group, label, items2, val.rootScope, true, false, true));
                                }
                            });

                            return result.sort(function(a, b) {
                                return _getLabel(a) - _getLabel(b);
                            });
                        }
                        return items;
                    }

                    function _subDivideChildrenIntoGroups(rootScope, items, numberChars) {
                        var groups = {};

                        angular.forEach(items, function(item) {
                            var prefix = angular.lowercase(_getLabel(item).substr(0, numberChars));

                            if (!(prefix in groups)) {
                                groups[prefix] = [];
                            }

                            groups[prefix].push(item);
                        });

                        angular.forEach(groups, function(items3, group) {
                            if (items3.length > rootScope.maxnumberchildren && numberChars < 10) {
                                delete groups[group];
                                var newGroups = _subDivideChildrenIntoGroups(rootScope, items3, numberChars + 1);
                                angular.forEach(newGroups, function(items4, group3) {
                                    groups[group3] = items4;
                                });
                            }
                        });

                        return groups;
                    }

                    scope.$watch('root', function(root) { // , oldRoot
                        if (root) {
                            initialiseRootScope(scope);
                            scope.val = createTreeData(root, root, null, scope, true, true, false);
                        }
                    });

                    function createTreeData(id, label, children, rootScope, isFolder, isRoot, isGrouping) {
                        var treeData = {
                            isRoot: isRoot,
                            rootScope: rootScope,
                            isFolder: isFolder,
                            _children: children,
                            children: children,
                            show: true,
                            checked: false,
                            isLoading: false,
                            isGrouping: isGrouping,
                            filterText: null,
                            getId: function() {
                                return treeData[treeData.rootScope.fieldid];
                            }
                        };

                        treeData[rootScope.fieldid] = id;
                        treeData[rootScope.fieldlabel] = label;

                        return treeData;
                    }

                    function _refresh(treeData) {
                        var filteredItems = [];
                        if (treeData.filterText != null) {
                            angular.forEach(treeData._children, function(item) {
                                if (_getLabel(item).indexOf(treeData.filterText) === 0) {
                                    filteredItems.push(item);
                                }
                            });
                        } else {
                            filteredItems = treeData._children;
                        }
                        treeData.children = treeData.rootScope.maxnumberchildren > 0 ? _subDivideChildren(treeData, filteredItems) : filteredItems;
                    }

                    function _getLabel(treeData) {
                        return treeData[treeData.rootScope.fieldlabel];
                    }

                    function _setChildren(treeData, children) {
                        treeData._children = children;
                        _refresh(treeData);
                    }

                    function initialiseStaticTree(val, scope2) {
                        if (!angular.isDefined(val.rootScope)) {
                            initialiseRootScope(scope2);
                            val.rootScope = scope2;

                            var _recurse = function(node, rootScope) {
                                if (!angular.isDefined(node.show)) {
                                    node.show = false;
                                }
                                if (node.selected) {
                                    parentScope.nodeSelected = node;
                                }

                                node.isFolder = (node.nodeType === undefined || node.nodeType === 0);

                                node.rootScope = rootScope;

                                node.getId = function() {
                                    return node[node.rootScope.fieldid];
                                };

                                node.getName = function() {
                                    return node[node.rootScope.fieldlabel];
                                };

                                var items = node[node.rootScope.fieldchildren];
                                if (angular.isDefined(items)) {
                                    _setChildren(node, items);
                                    for (var i in items) {
                                        if ({}.hasOwnProperty.call(items, i)) {
                                            _recurse(items[i], rootScope);
                                        }
                                    }
                                }
                            };
                            _recurse(val, val.rootScope);
                        }
                    }

                    function initialiseRootScope(rootScope) {
                        rootScope.maxnumberchildren = angular.isDefined(rootScope.maxnumberchildren) ? parseInt(rootScope.maxnumberchildren) : 250000;
                        rootScope.fieldid = angular.isDefined(rootScope.fieldid) ? rootScope.fieldid : 'id';
                        rootScope.fieldlabel = angular.isDefined(rootScope.fieldlabel) ? rootScope.fieldlabel : 'label';
                        rootScope.fieldchildren = angular.isDefined(rootScope.fieldchildren) ? rootScope.fieldchildren : 'items';
                        rootScope.multi = angular.isDefined(rootScope.multi) ? (rootScope.multi === 'true' || rootScope.multi === true) : false;
                    }

                    scope.selectMenu = function() { // viewId
                        scope.showMenuSelect = scope.showMenuSelect;
                        scope.menuSelected = !scope.menuSelected;
                    };

                    scope.selectAction = function(folderId, action) {
                        scope.showMenuSelect = false;
                        scope.menuSelected = false;
                        var callbackFun = action.action;
                        if (action.supportContentEditable) {
                            scope.editMode = true;
                            scope.callbackFunName = callbackFun;
                            if (parentScope.nodeSelected) {
                                parentScope.nodeSelected.editMode = true;
                            }
                        } else {
                            parentScope.$eval(callbackFun)(folderId);
                        }
                    };

                    scope.updateFolderName = function(selectFolder) {
                        if (scope.callbackFunName) {
                            var newFolderName = selectFolder.name;
                            var folderId = selectFolder.getId();
                            parentScope.$eval(scope.callbackFunName)(folderId, newFolderName);
                        }
                        scope.editMode = false;
                        if (parentScope.nodeSelected) {
                            parentScope.nodeSelected.editMode = false;
                        }
                    };

                    scope.$watch('val.filterText', function(val) { // , old
                        if (val != null) {
                            _refresh(scope.val);
                        }
                    });

                    scope.$watch('val', function(val) { // , oldVal
                        var template;
                        var newElement;
                        if (val && angular.isDefined(val)) {
                            initialiseStaticTree(val, scope);
                            var nt = val.isGrouping ? 'span' : 'ul';
                            template = '';
                            template += val.isRoot ? '<div class="treeView">' : '';
                            template += '<div class="treeWithMenu_treeItem">';
                            template += '  <div class="treeWithMenu_treeItemRow" ng-class="{treeWithMenu_treeItemRow_selected:val.selected}" ng-mouseenter="showMenuSelect = true"  ng-mouseleave="showMenuSelect = false;menuSelected=false;" ng-click="setSelectNode(val)" nb-draggable="dragStart" nb-droppable="dropItem">';
                            template += '  <span ng-if="val.isFolder && val.show" class="icon_nb_tree_collapse" ng-click="expand(val)" ></span>';
                            template += '  <span ng-if="val.isFolder && !val.show" class="icon_nb_tree_expand" ng-click="expand(val)" ></span>';
                            template += '  <span contenteditable="{{editMode === undefined? false: editMode}}" ng-if="val.isFolder && !val.show" class="treeWithMenu_treeItemCollapse" ng-class="{folderEditing: editMode}" title="{{ val[val.rootScope.fieldlabel] }}" ng-model="val[val.rootScope.fieldlabel]" on-update="updateFolderName(val)" spellcheck="false">{{ val[val.rootScope.fieldlabel] }}</span>';
                            template += '  <span contenteditable="{{editMode === undefined? false: editMode}}" ng-if="val.isFolder && val.show" class="treeWithMenu_treeItemExpand" ng-class="{folderEditing: editMode}"  title="{{ val[val.rootScope.fieldlabel] }}" ng-model="val[val.rootScope.fieldlabel]" on-update="updateFolderName(val)" spellcheck="false">{{ val[val.rootScope.fieldlabel] }}</span>';
                            template += '  <div ng-if="val.isFolder && (showMenuSelect) && treeActionMenu" class="treeWithMenu_treeItemRight" ng-click="selectMenu(val.getId())" >';
                            template += '    <img src="img/Assets/More_Actions_Button_20x20.png" dropdown-toggle="" aria-haspopup="true" aria-expanded="true">';
                            template += '    <ul ng-if="val.isFolder && (showMenuSelect && menuSelected)" class="treeWithMenu_treeItemFolderMenu" nb-menu-position-directive="{{nbMenuPositionDirective}}">';
                            template += '      <li style="padding-left:20px; list-style-type: none;"  ng-click="selectAction(val.getId(), action)" class="treeWithMenu_treeItemFolderMenuItem" ng-repeat="action in treeActionMenu">';
                            template += '        {{action.title}}';
                            template += '      </li>';
                            template += '    </ul>';
                            template += '  </div>';
                            template += '</div>';
                            template += '  <span ng-if="!val.isFolder && !displayFolderOnly" style="cursor:pointer;"  class="treeWithMenu_treeItemSingle" ng-class="{treeWithMenu_treeItemSingle_selected: val.selected}" title="{{ val[val.rootScope.fieldlabel] }}" ng-click="setSelectNode(val)">{{ val[val.rootScope.fieldlabel]}}</span>';
                            template += '  <' + nt + ' ng-if="val.show" class="treeWithMenu_treeItemChildren">';

                            template += '    <li style="padding-left:20px; list-style-type: none;" ng-repeat="item in val.children track by item.getId()" class="treeWithMenu_treeItemChild_{{ item.isFolder }}">';
                            template += '      <nb-tree-with-menu-directive val="item" fetch="fetch" display-folder-only={{displayFolderOnly}} data-tree-action-menu="treeActionMenu" nb-menu-position-directive="{{nbMenuPositionDirective}}"></nb-t>';
                            template += '    </li>';
                            template += '  </' + nt + '>';
                            template += '  <div class="treeItemLoading" ng-show="val.isLoading">Loading...</div>';
                            template += '</div>';

                            template += val.isRoot ? '</div>' : '';

                            newElement = angular.element(template);
                            $compile(newElement)(scope);
                            element.replaceWith(newElement);
                            element = newElement;
                        } else {
                            template = '';
                            template += '<span style="padding-left:4px;"> No Data Views found. </span>';
                            newElement = angular.element(template);
                            $compile(newElement)(scope);
                            element.replaceWith(newElement);
                            element = newElement;
                        }
                    });
                }
            };
        }
    ]);
})(NetBrain);
