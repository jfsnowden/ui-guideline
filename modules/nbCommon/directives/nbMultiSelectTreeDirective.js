(function() {
    'use strict';

    angular.module('nb.common').directive('nbMultiSelectedTree', [
        '$compile',
        function($compile) { // , $log
            return {
                restrict: 'E',
                terminal: true,
                scope: {
                    root: '@',
                    fieldid: '@',
                    isRoot: '@',
                    fieldlabel: '@',
                    fieldchildren: '@',
                    val: '=?',
                    fetch: '=?',
                    selected: '=',
                    selectCallback: '='
                },

                link: function(scope, element) { // , element, attrs, model
                    var _setParentCheckNum = function(node) {
                        var children = node[scope.fieldchildren];

                        if (children && (node.iSelectedChildren >= children.length)) {
                            node.checked = true;
                        }
                        if (node.parentNode) {
                            var parentNode = node.parentNode;
                            if (node.checked === true) {
                                parentNode.iSelectedChildren++;
                            }
                            parentNode.checked = 'indeterminate';
                            _setParentCheckNum(parentNode);
                        }
                    };

                    var _setChecks = function(node) {
                        if (node.checked === true) {
                            var children = node[scope.fieldchildren];
                            if (children) {
                                node.iSelectedChildren = children.length;
                            } else {
                                node.iSelectedChildren = 1;
                            }

                            if (node.parentNode) {
                                var parentNode = node.parentNode;
                                if (parentNode.checked !== true) {
                                    parentNode.iSelectedChildren++;
                                    parentNode.checked = 'indeterminate';
                                    _setParentCheckNum(parentNode);
                                }
                            }
                        }
                    };

                    var _setParentUncheckNum = function(node) {
                        if (node.iSelectedChildren === 0) {
                            node.checked = false;
                        }
                        if (node.parentNode) {
                            var parentNode = node.parentNode;
                            if (node.checked === false && parentNode.iSelectedChildren > 0) {
                                parentNode.iSelectedChildren--;
                            }
                            parentNode.checked = 'indeterminate';
                            _setParentUncheckNum(parentNode);
                        }
                    };

                    var _setUnchecks = function(node) {
                        if (node.checked === false) {
                            node.iSelectedChildren = 0;

                            if (node.parentNode) {
                                var parentNode = node.parentNode;
                                if (parentNode.checked === true || parentNode.checked === 'indeterminate') {
                                    parentNode.iSelectedChildren--;
                                    parentNode.checked = 'indeterminate';
                                    _setParentUncheckNum(parentNode);
                                }
                            }
                        }
                    };

                    var _setParents = function(node) {
                        if (node == null || typeof node === 'undefined') return;

                        node.iSelectedChildren = 0;
                        var children = node[scope.fieldchildren];
                        angular.forEach(children, function(child) {
                            if (!child.parentNode) {
                                child.parentNode = node;
                                child.iSelectedChildren = 0;
                                if (child[scope.fieldchildren]) {
                                    _setParents(child);
                                }
                                _setChecks(child);
                            }
                        });
                    };

                    scope.checkParent = function(node) {
                        if (node.parentNode) {
                            node.parentNode.checked = 'indeterminate';
                            scope.checkParent(node.parentNode);
                        }
                    };

                    scope.onCheckChange = function(node) {
                        if (scope.val.children) {
                            scope.checkChildren(scope.val);
                        }

                        if (scope.val.checked) {
                            _setChecks(scope.val);
                        }

                        if (!scope.val.checked) {
                            _setUnchecks(scope.val);
                        }

                        var selectedNodes = scope.findChecked(node.rootScope.val);
                        if (scope.selectCallback) {
                            scope.selectCallback(selectedNodes);
                        }
                    };

                    scope.checkChildren = function(node) {
                        angular.forEach(node.children, function(child) {
                            child.checked = scope.val.checked;
                            if (child.children) {
                                scope.checkChildren(child);
                            }
                        });
                    };

                    scope.findChecked = function(node, result) {
                        if (!angular.isDefined(result)) {
                            result = [];
                        }

                        if (node.checked === true && !node.isGrouping) {
                            result.push(node);
                        }

                        angular.forEach(node.children, function(child) {
                            scope.findChecked(child, result);
                        });

                        return result;
                    };

                    scope.expand = function(val) {
                        val.show = !val.show;

                        if (val.show && val.hasChildren && val.rootScope.fetch && val.children == null) {
                            val.isLoading = true;
                            val.rootScope.fetch(val).then(function(fetchedItems) {
                                var items = [];

                                angular.forEach(fetchedItems, function(_fetchedItem) {
                                    var hasChildren = _fetchedItem.hasChildren;
                                    var treeData = createTreeData(_fetchedItem.id, _fetchedItem.name, null, val.rootScope, hasChildren, false, false);
                                    treeData.checked = _fetchedItem.checked;
                                    items.push(treeData);
                                });

                                _setChildren(val, items);
                                _setParents(val);
                                val.isLoading = false;
                            });
                        }
                    };

                    scope.$watch('root', function(root) { // , oldRoot
                        if (root) {
                            initialiseRootScope(scope);
                            scope.val = createTreeData(root, root, null, scope, true, true, false);
                        }
                    });

                    function createTreeData(id, label, children, rootScope, hasChildren, isRoot, isGrouping) {
                        var treeData = {
                            isRoot: isRoot,
                            rootScope: rootScope,
                            hasChildren: hasChildren,
                            _children: children,
                            children: children,
                            show: false,
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
                        treeData.children = filteredItems;
                    }

                    function _getLabel(treeData) {
                        return treeData[treeData.rootScope.fieldlabel];
                    }

                    function _setChildren(treeData, children) {
                        treeData._children = children;
                        treeData.items = children;
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
                                if (!angular.isDefined(node.checked)) {
                                    node.checked = false;
                                }
                                if (!angular.isDefined(node.rootScope)) {
                                    node.rootScope = rootScope;
                                }

                                node.getId = function() {
                                    return node[node.rootScope.fieldid];
                                };

                                var items = node[node.rootScope.fieldchildren];
                                if (angular.isDefined(items)) {
                                    node.hasChildren = true;
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
                        rootScope.fieldid = angular.isDefined(rootScope.fieldid) ? rootScope.fieldid : 'id';
                        rootScope.fieldlabel = angular.isDefined(rootScope.fieldlabel) ? rootScope.fieldlabel : 'label';
                        rootScope.fieldchildren = angular.isDefined(rootScope.fieldchildren) ? rootScope.fieldchildren : 'items';
                    }

                    scope.$watch('val.filterText', function(val) { // , old
                        if (val != null) {
                            _refresh(scope.val);
                        }
                    });

                    scope.$watch('val', function(val) { // , oldVal
                        if (val && angular.isDefined(val)) {
                            initialiseStaticTree(val, scope);
                            _setParents(scope.val);

                            var nt = val.isGrouping ? 'span' : 'ul';
                            var template = '';
                            template += val.isRoot ? '<div class="multiSelectTree_treeView">' : '';
                            template += '<div class="multiSelectTree_treeItem">';
                            template += '  <span ng-if="val.hasChildren && val.show" class="icon_nb_tree_collapse" ng-click="expand(val)" ></span>';
                            template += '  <span ng-if="val.hasChildren && !val.show" class="icon_nb_tree_expand" ng-click="expand(val)" ></span>';
                            template += '    <label class=\"nb-checkbox\">';
                            template += '    <input type="checkbox" ng-model="val.checked" ng-change="onCheckChange(val)" ng-checked="val.checked">';
                            template += '    <span class="image">';
                            template += '    <i ng-if="val.checked" class="fa fa-check"></i>';
                            template += '    <i ng-if="val.checked ===\'indeterminate\'" class="fa fa-square"></i>';
                            template += '    </span>     ';
                            template += '    </label>     ';
                            template += '  <a ng-if="val.hasChildren && !val.show" href="" ng-click="expand(val)" class="multiSelectTree_treeItemCollapse" title="{{ val.getId() }}">{{ val[val.rootScope.fieldlabel] }}</a>';
                            template += '  <a ng-if="val.hasChildren && val.show" href="" ng-click="expand(val)" class="multiSelectTree_treeItemExpand" title="{{ val.getId() }}">{{ val[val.rootScope.fieldlabel] }}</a>';
                            template += '  <span ng-if="!val.hasChildren" class="multiSelectTree_treeItemSingle" title="{{ val.getId() }}">{{ val[val.rootScope.fieldlabel]}}</span>';
                            template += '  <' + nt + ' ng-if="val.show" class="multiSelectTree_treeItemChildren">';
                            template += '    <li ng-repeat="item in val.children track by item.getId()" class="multiSelectTree_treeItemChild_{{ item.hasChildren }}">';
                            template += '      <nb-multi-selected-tree is-root="false" val="item" fetch="expandTree" fieldchildren="{{fieldchildren}}" fieldlabel="name" expand-tree="expandTree" select-callback="selectCallback"></tree>';
                            template += '    </li>';
                            template += '  </' + nt + '>';
                            template += '  <div class="multiSelectTree_treeItemLoading" ng-show="val.isLoading">Loading...</div>';
                            template += '</div>';

                            template += val.isRoot ? '</div>' : '';

                            var newElement = angular.element(template);
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
