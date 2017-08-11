/**
 * Created by Marko Cen on 12/16/2015.
 */


; (function (NetBrain) {

    angular.module('nb.common').directive('nbTreeviewDirective', NbTreeviewDirective);

    NbTreeviewDirective.$inject = [
        '$compile', '$timeout', '$document', '$sce', '$q', '$log',
        'ivhTreeviewMgr', 'ivhTreeviewBfs'
    ];
    function NbTreeviewDirective(
        $compile, $timeout, $document,
        $sce, $q, $log, ivhTreeviewMgr, ivhTreeviewBfs
    ) {
        var directive = {
            restrict: 'A',
            scope: {
                data: '=nbTreeviewDirective',
                options: '=',
                atag: '@'
            },
            replace: true,
            templateUrl: 'modules/nbCommon/views/nbTreeviewDirective.html',
            controller: Controller,
            controllerAs: 'nbTreeview',
            bindToController: true,
            compile: Compile
        }
        , MENU_OPEN = false
        , SCOPE_ID = ''
        , CURRENT_ACTION_BTN = null
        , CURRENT_NODE_OBJ = null;

        Controller.$inject = ['$scope', '$element'];
        function Controller($scope) {
            var self = this;
            self.query = '';
            self.trvw = null;
            self.searchResults = [];

            self.refreshDropdownItems = function refreshDropdownItems(node, trvw) {
                var dropdownFn = $scope.nbTreeview.treeviewOptions.enableNodeDropdown.dropdownItems;
                if (_.isFunction(dropdownFn)) {
                    $scope.nbTreeview.dropdownItems = dropdownFn(node, trvw);
                }
            };
            var finded = undefined;
            var mached = false;
            var parents = [];
            self.isTreeItemVisible = function isTreeItemVisible(node, trvw) {
                if ($scope.nbTreeview.options.expandFirstChildNode&&(!finded || !mached)) {
                    expandFirstChildNode(node);
                }

                if (typeof self.treeviewOptions.checkTreeNodeVisible === 'function') {
                    return self.treeviewOptions.checkTreeNodeVisible(node, trvw)
                } else if (typeof self.treeviewOptions.checkTreeNodeVisible === 'boolean') {
                    return self.treeviewOptions.checkTreeNodeVisible;
                } else {
                    return true;
                }
            };

            function expandFirstChildNode(node) {
                if (!finded) {
                    finded = findFirstdata(node);
                }
                if (finded && !mached && node && node.child) {
                    if (node.ID && node.name && _.find(parents, { id: node.ID, name: node.name })) {
                        node.expanded = true;
                    }
                    for (var i = 0; i < node.child.length; i++) {
                        var child = node.child[i];
                        if (finded.nodeType == child.nodeType && finded.name == child.name && finded.description == child.description && finded.childNumber == child.childNumber) {
                            mached = true;
                            break;
                        }
                    }
                }
            }

            function findFirstdata(node) {
                if (node.ID) {
                    parents.push({ id: node.ID, name: node.name });
                }
                if (node.nodeType == 0) {
                    var result = _.find(node.child, { 'nodeType': 1 });
                    if (result) {
                        return result;
                    }
                    var folders = _.where(node.child, { 'nodeType': 0 });
                    for (var i = 0; i < folders.length; i++) {
                        var r = findFirstdata(folders[i]);
                        if (r) {
                            if (folders[i].ID) {
                                parents.push({ id: folders[i].ID, name: folders[i].name });
                            }
                            return r;
                        }
                        else {

                            continue;
                        }
                    }
                    return null;
                }
                else {
                    return node;
                }
            }

            self.callDropdownAction = function callDropdownAction(item, event) {
                if (typeof item.action === 'function') {
                    item.action(CURRENT_NODE_OBJ, self.trvw, event);
                }
            };

            self.searchQueryChange = function searchQueryChange() {
                if (self.treeviewOptions.enableSearchBar.method === 'watch'
                    && typeof self.treeviewOptions.enableSearchBar.action === 'function') {
                    self.searchTree(self.query);
                }
                if (self.query === '') {
                    $timeout(function () {
                        resetSearchArea();
                    })
                }
            };

            self.showEditable = function showEditable(node, trvw) {
                var isNodeEditable = node[self.treeviewOptions.editableAttribute];
                return !!isNodeEditable;
            };

            self.getTemplateLabel = function getTemplateLabel(node, trvw, isPlain) {
                var customLabel = self.treeviewOptions.labelTemplate;
                if (isPlain) {
                    return trvw.label(node);
                } else {
                    return customLabel ? $sce.trustAs('html', customLabel(node, trvw, $scope))
                        : $sce.trustAs('html', trvw.label(node));
                }
            };

            self.searchTree = function searchTree(queryText) {
                var promise = self.treeviewOptions.enableSearchBar.action;
                if (_.isFunction(promise)) {
                    $q.when(promise(queryText)).then(function (results) {
                        self.searchResults = results;
                    }, function () {
                        $log.error('failed to search nb treeview')
                    })
                }
            };

            self.getTemplateIcon = function getTemplateIcon(node, trvw) {
                var customIcon = self.treeviewOptions.iconTemplate;
                return customIcon ? $sce.trustAs('html', customIcon(node, trvw)) : null;
            };
            self.getLabelTitle = function (node, trvw) {
                return node[self.treeviewOptions.labelTitleAttribute];
            }
            self.showCheckBox = function showCheckBox() {
                return self.treeviewOptions.enableMultipleSelect;
            };

            self.showToggleArrow = function showToggleArrow(node, trvw) {
                if (!trvw.isLeaf(node)) {

                    var children = node[self.treeviewOptions.childrenAttribute] || [];
                    var isVisible = true;

                    for (var i = 0; i < children.length; i++) {
                        if (_.isFunction(self.treeviewOptions.checkTreeNodeVisible)) {
                            isVisible = self.treeviewOptions.checkTreeNodeVisible(children[i], trvw)
                        } else if (_.isBoolean(self.treeviewOptions.checkTreeNodeVisible)) {
                            isVisible = self.treeviewOptions.checkTreeNodeVisible;
                        } else {
                            isVisible = true;
                        }
                        if (isVisible) break;
                    }

                    return isVisible;
                } else if (self.treeviewOptions.lazyLoadingAttribute) {
                    var flag = self.treeviewOptions.lazyLoadingAttribute;
                    if (_.isString(flag)) {
                        return node[flag];
                    }
                    if (_.isFunction(flag)) {
                        return flag(node, trvw) === true;
                    }
                    return false;
                }
                return false;
            };

            self.selectNode = function selectNode(node, trvw, event, overwrite) {
                node[self.treeviewOptions.selectedAttribute] = overwrite !== undefined ?
                    overwrite
                    : self.treeviewOptions.enableUnselect ?
                        !node[self.treeviewOptions.selectedAttribute]
                        : true;
                if (node) {
                    $scope.$emit('nbFolderTreeview.folderSelected', node);
                }
                var $target = $(event.target);
                if ($target.hasClass('node-label-editable')) {
                    event.stopPropagation();
                    return;
                }

                var isMultiple = self.treeviewOptions.enableMultipleSelect;
                var callback = self.treeviewOptions.nodeClickCallback;
                var pre = node[self.treeviewOptions.selectedAttribute];

                if (!isMultiple) {
                    ivhTreeviewMgr.deselectAll(self.data, self.treeviewOptions);
                    nbTreeSelect(self.data, node, self.treeviewOptions, pre);
                } else {
                    if(self.treeviewOptions.enableAutoSelect) {
                        trvw.select(node, pre);
                    } else {
                        if (self.showCheckBox()) {
                            var checked = false;
                            var checkbox = $(event.target).closest('.ivh-node-row').find('.node-checkbox input');
                            if (checkbox.length > 0) {
                                checked = !checkbox[0].checked;
                            }
                            node[self.treeviewOptions.selectedAttribute] = checked;
                        } else {
                            trvw.select(node, pre);
                        }
                    }
                }

                (callback || angular.noop)(node, trvw, event);
                if ($scope.isWatchData) $scope.$emit('nbTreeview.nodeSelected');

                if (self.treeviewOptions.enableLabelExpand)
                    self.toggleNode(node, trvw, event, true);
            };

            self.selectFilteredNode = function selectFilteredNode(node, trvw) {
                var isMultiple = self.treeviewOptions.enableMultipleSelect;
                var callback = self.treeviewOptions.nodeClickCallback;
                var pre = node[self.treeviewOptions.selectedAttribute];

                if (!isMultiple) {
                    ivhTreeviewMgr.deselectAll(self.data, self.treeviewOptions);
                    nbTreeSelect(self.data, node, self.treeviewOptions, !pre);
                } else {
                    trvw.select(node, !pre);
                }

                (callback || angular.noop)(node, trvw);

            };

            self.toggleNode = function toggleNode(node, trvw, event, isPropagation) {
                if (!isPropagation) event.stopPropagation();
                if (self.treeviewOptions.lazyLoadingAttribute && !node.loaded) {
                    var flagProp = self.treeviewOptions.lazyLoadingAttribute;
                    var flag = _.isString(flagProp) ?
                        node[flagProp] : _.isFunction(flagProp) ?
                            flagProp(node, trvw) : false;

                    if (flag && self.treeviewOptions.lazyLoadingCallback) {
                        $q.when(self.treeviewOptions.lazyLoadingCallback(node, trvw))
                            .then(function () {
                                trvw.toggleExpanded(node);
                            });
                    } else {
                        trvw.toggleExpanded(node);
                    }
                } else {
                    var expanded = trvw.isExpanded(node);
                    self.loadNum = 100;
                    if (!expanded && node.children && node.children.length > self.loadNum) {
                        self.allNodes = node.children;
                        node.children = [];
                        self.nodeArray = node.children;
                        self.loadLargeTreeNode();
                    }
                    trvw.toggleExpanded(node);
                }

            };

            self.loadLargeTreeNode = function () {
                var nodeArray = self.nodeArray;
                var allNodes = self.allNodes;
                var loadNum = self.loadNum;
                self.shiftFixArrayElement(nodeArray, allNodes, loadNum);
                if (allNodes.length > 0) {
                    if (allNodes.length > loadNum) {
                        setTimeout(self.loadLargeTreeNode, 100);
                    } else {
                        self.shiftFixArrayElement(nodeArray, allNodes, allNodes.length);
                    }
                }
            }

            self.shiftFixArrayElement = function (pushArray, shiftArray, shiftNum) {
                for (var i = 0; i < shiftNum; i++) {
                    pushArray.push(shiftArray.shift());
                }
            }

            self.checkboxChanged = function checkboxChanged(node, trvw, event) {
                event.stopPropagation();
                if(self.treeviewOptions.enableAutoSelect) {
                    trvw.select(node, event.target.checked);
                } else {
                    node[self.treeviewOptions.selectedAttribute] = event.target.checked;
                }
                (self.treeviewOptions.nodeClickCallback
                || angular.noop)(node, trvw, event);
                if ($scope.isWatchData) $scope.$emit('nbTreeview.nodeSelected');
            };

            self.isDisplayDropdown = function isDisplayDropdown(node, trvw) {
                var isDisplay = self.treeviewOptions.enableNodeDropdown ?
                    self.treeviewOptions.enableNodeDropdown.isDisplay : undefined;
                if (typeof isDisplay === 'function') {
                    return isDisplay(node, trvw);
                } else if (typeof isDisplay === 'boolean') {
                    return isDisplay;
                } else {
                    return false;
                }
            };

            self.openDropdown = function openDropdown(node, event, trvw) {
                event.preventDefault();
                $(document.body).click();
                if (event.button === 2 && !self.isDisplayDropdown(node, trvw)) { // check for right click
                    return;
                }
                event.stopPropagation();
                if ($(event.target).is(CURRENT_ACTION_BTN)) {
                    $timeout(function () {
                        var actionMenuEle = $("#nb-treeview-dropdown-" + SCOPE_ID);
                        close(actionMenuEle)
                    })
                } else {
                    // self.selectNode(node, trvw, event, trvw.isLeaf(node)); // open菜单时，不应做选中操作（会导致依赖项刷新），如需要当前节点，可以在回调中取到，有问题找xutao讨论
                    $(CURRENT_ACTION_BTN).closest('.ivh-node-row').removeClass('dropdown-active');
                    var targetNodeRow = $(event.target).closest('.ivh-node-row');
                    targetNodeRow.addClass('dropdown-active');

                    self.refreshDropdownItems(node, trvw);

                    CURRENT_ACTION_BTN = targetNodeRow[0];
                    CURRENT_NODE_OBJ = node;
                    SCOPE_ID = $scope.$id;

                    $timeout(function () {
                        var menuEle = angular.element(document.querySelector('#nb-treeview-dropdown-' + SCOPE_ID));
                        open(event, menuEle);
                    })
                }
            };

            self.renderTemplate = function renderTemplate(template) {
                return $sce.trustAs('html', template);
            };

            self.initEditableContent = function (node, trvw, divEle) {
                divEle[0].value = self.getTemplateLabel(node, trvw, true);
                $timeout(function () {
                    divEle.select();
                    $(document.body).one('click.nbTreeDocClickHandler', docClickHandler);
                    function docClickHandler(event) {
                        if (!$(event.target).is(divEle[0])&&_.isFunction(self.treeviewOptions.editableCallback)) {
                            $timeout(function () {
                                var scope = angular.element(divEle).scope();
                                if (scope) {
                                    var promise = self.treeviewOptions.editableCallback(
                                        node,
                                        trvw,
                                        divEle[0].value.trim(),
                                        event
                                    );
                                    if (promise && promise.then) {
                                        promise.then(function (result) {
                                            if (!result) {
                                                divEle.val(scope.node.name);
                                                $timeout(function () {
                                                    divEle.select().focus();
                                                    $(document.body).one('click.nbTreeDocClickHandler', docClickHandler);
                                                });
                                            }
                                        }, function () {
                                            divEle.val(scope.node.name);
                                            $timeout(function () {
                                                divEle.select().focus();
                                                $(document.body).one('click.nbTreeDocClickHandler', docClickHandler);
                                            });
                                        });
                                    }
                                }
                            })
                        }
                    }
                });
            };



            function resetSearchArea() {
                self.query = '';
                self.searchResults = [];
            }

            //this method override ivh-treeview default select node method
            //would be used in single selection mode
            function nbTreeSelect(tree, node, opts, isSelected) {

                var ng = angular;


                if (arguments.length > 2&&typeof opts === 'boolean') {
                    isSelected = opts;
                    opts = {};
                }


                opts = ng.extend({}, opts);
                isSelected = ng.isDefined(isSelected) ? isSelected : true;

                var cb = isSelected ?
                    function (node) {
                        node[this.selectedAttribute] = true;
                        node[this.indeterminateAttribute] = false;
                    }.bind(opts) :
                    function (node) {
                        node[this.selectedAttribute] = false;
                        node[this.indeterminateAttribute] = false;
                    }.bind(opts);

                cb(node);

            }
        }



        function Compile() {
            return {
                pre: function (scope, ele, attr) {
                    var self = scope.nbTreeview;
                    scope.isWatchData = attr.watchData != null;
                    self.treeviewOptions = initOptions(self.options);
                    if (self.options.checkboxChanged) self.checkboxChanged = self.options.checkboxChanged;
                    if (self.treeviewOptions.enableNodeDropdown) {
                        self.dropdownItems = [];
                        var atagString = self.atag ? 'atag = "' + self.atag + '"' : "";
                        var template = '<ul ' + atagString + ' id="nb-treeview-dropdown-' + scope.$id + '" class="dropdown-menu nb-treeview-dropdown">' +
                                           '<li ng-click="nbTreeview.callDropdownAction(item, $event)" ng-repeat="item in nbTreeview.dropdownItems" ng-class="item.class">' +
                                                '<a ng-bind-html="::nbTreeview.renderTemplate(item.template)"></a>' +
                                           '</li>' +
                                       '</ul>';
                        var dropdownEle = $compile(template)(scope);
                        angular.element(document.body).append(dropdownEle);
                        ele.on('scroll', function () {
                            close($("#nb-treeview-dropdown-" + SCOPE_ID));
                        });
                        $document.bind('click', handleClickEvent);
                        $document.bind('contextmenu', handleClickEvent);
                        scope.$on('$destroy', function () {
                            close($("#nb-treeview-dropdown-" + SCOPE_ID));
                            //for Site Tree, Click move to context menu, Select Site control will be initial a new tree, after close this dialog, Site tree's handleClickEvent will destroy and can not work. 
                            //$document.unbind('click', handleClickEvent);
                            //$document.unbind('contextmenu', handleClickEvent);
                        })
                    }

                    if (self.treeviewOptions.enableSearchBar
                       && self.treeviewOptions.enableSearchBar.method === 'submit') {
                        $(ele).on('keypress', '.search-bar input', function (event) {
                            if (event.keyCode === 13&&self.treeviewOptions.enableSearchBar.method === 'submit'
                            && typeof self.treeviewOptions.enableSearchBar.action === 'function') {
                                $timeout(function () {
                                    self.searchTree(event.target.value);
                                })
                            }
                        })
                    }

                    if (_.isFunction(self.treeviewOptions.editableCallback)) {
                        $(ele).on('keypress', function (event) {
                            var target = $(event.target);
                            var c = event.keyCode;

                            if (target.hasClass('node-label-editable')
                                && (c === 13 || c === 27)) {
                                $timeout(function () {
                                    var scope = angular.element(target).scope();
                                    var promise = self.treeviewOptions.editableCallback(
                                        scope.node,
                                        scope.trvw,
                                        target[0].value.trim(),
                                        event);
                                    if (promise && _.isFunction(promise.then)) {
                                        $(document.body).off('click.nbTreeDocClickHandler');// remove the previous binded clickHandler
                                        promise.then(function (result) {
                                            if (!result) {
                                                target.val(scope.node.name);
                                                $timeout(function () {
                                                    target.select().focus();
                                                    $(document.body).one('click.nbTreeDocClickHandler', docAfterEnterClickHandler);// default,  we will bind one clickHandler
                                                    function docAfterEnterClickHandler(event) {
                                                        if (
                                                            !$(event.target).is(target[0])
                                                            && _.isFunction(self.treeviewOptions.editableCallback)
                                                        ) {
                                                            $timeout(function () {
                                                                    var promise = self.treeviewOptions.editableCallback(
                                                                        scope.node,
                                                                        scope.trvw,
                                                                        target[0].value.trim(),
                                                                        event
                                                                    );
                                                                    if (promise && promise.then) {
                                                                        promise.then(function (result) {
                                                                            if (!result) {
                                                                                var scope = angular.element(target).scope();
                                                                                target.val(scope.node.name);
                                                                                $timeout(function () {
                                                                                    target.select().focus();
                                                                                    $(document.body).one('click.nbTreeDocClickHandler', docAfterEnterClickHandler); // if eroor,  we will bind one more clickHandler
                                                                                });
                                                                            }
                                                                        }, function () {
                                                                            var scope = angular.element(target).scope();
                                                                            target.val(scope.node.name);
                                                                            $timeout(function () {
                                                                                target.select().focus();
                                                                                $(document.body).one('click.nbTreeDocClickHandler', docAfterEnterClickHandler);
                                                                            });
                                                                        });
                                                                    }
                                                                })
                                                        }
                                                    }

                                                });
                                            } else {
                                                $(document.body).off('click.nbTreeDocClickHandler');//unbind click only when successful changed
                                            }
                                        });
                                    } else {
                                        $(document.body).off('click.nbTreeDocClickHandler');
                                    }
                                })
                            }
                        })
                    }
                },
                post: function (scope, ele, attr) {
                    var self = scope.nbTreeview;
                    if (self.treeviewOptions.enableSearchBar && self.treeviewOptions.enableSearchBar.icon) {
                        setTimeout(function () {
                            ele.find('.search-bar .nb-filter-bar .icons span')
                                .removeClass()
                                .addClass(self.treeviewOptions.enableSearchBar.icon);
                        });
                    }
                }
            }
        }

        function open(event, actionMenuEle) {
            actionMenuEle.css({ "display": "block" });
            var targetLeft = $(event.target).offset().left;
            var targetTop = $(event.target).offset().top;
            var doc = $document[0].documentElement;
            var docLeft = (window.pageXOffset || doc.scrollLeft) -
                    (doc.clientLeft || 0),
                docTop = (window.pageYOffset || doc.scrollTop) -
                    (doc.clientTop || 0),
                elementWidth = actionMenuEle[0].scrollWidth,
                elementHeight = actionMenuEle[0].scrollHeight;
            if (event.button === 2) { // right click
                targetLeft = event.clientX + elementWidth;
                targetTop = event.clientY;
            }
            var heightCha = 0;
            if ($(event.target).hasClass('node-dropdown-arrow') || $(event.target).hasClass('icon_nb_action_menu')) {
                heightCha = 20;
                targetLeft = $(event.target).closest('.node-dropdown-arrow').offset().left + 3;
                targetTop = $(event.target).closest('.node-dropdown-arrow').offset().top;
            }

            var docWidth = doc.clientWidth + docLeft,
                docHeight = doc.clientHeight + docTop,
                totalWidth = elementWidth + targetLeft,
                totalHeight = elementHeight + targetTop + heightCha,
                left = Math.max(targetLeft - docLeft - elementWidth, 0),
                top = Math.max(targetTop - docTop + heightCha, 0);

            if (totalWidth > docWidth) {
                left = left - (totalWidth - docWidth);
            }

            if (totalHeight > docHeight) {
                top = top - elementHeight - heightCha;//top = top - (totalHeight - docHeight) - 25; //原来的方案，导航树底部点击菜单时，菜单底部在浏览器的底部。
            }

            actionMenuEle.css('top', top + 'px');
            actionMenuEle.css('left', left + 'px');

            MENU_OPEN = true;

        }

        function close(actionMenuEle) {
            actionMenuEle.css({ "display": "none" });
            $(CURRENT_ACTION_BTN).closest('.ivh-node-row').removeClass('dropdown-active');
            MENU_OPEN = false;
            CURRENT_ACTION_BTN = null;
            CURRENT_NODE_OBJ = null;
        }

        function handleClickEvent(event) {
            $timeout(function () {
                var actionMenuEle = $("#nb-treeview-dropdown-" + SCOPE_ID);
                if (MENU_OPEN &&
                    (!$(event.target).is(CURRENT_ACTION_BTN))) {
                    close(actionMenuEle);
                }
            })
        }

        function initOptions(userOptions) {
            userOptions.nodeTitle = userOptions.nodeTitle || undefined;
            userOptions.nodeTpl = userOptions.nodeTpl || '<nb-treeview-node-tpl></nb-treeview-node-tpl>';
            userOptions.labelTemplate = typeof userOptions.labelTemplate === 'function' ? userOptions.labelTemplate : undefined;
            userOptions.iconTemplate = typeof userOptions.iconTemplate === 'function' ? userOptions.iconTemplate : undefined;

            userOptions.checkTreeNodeVisible = userOptions.checkTreeNodeVisible || undefined;
            userOptions.defaultSelectedState = userOptions.defaultSelectedState || false;

            userOptions.enableMultipleSelect = userOptions.enableMultipleSelect === true;
            userOptions.enableAutoSelect = userOptions.enableAutoSelect !== false;
            userOptions.enableLabelExpand = userOptions.enableLabelExpand !== false;
            userOptions.enableTwoWayBinding = userOptions.enableTwoWayBinding === true;
            userOptions.enableNodeDropdown = _.isObject(userOptions.enableNodeDropdown) ? userOptions.enableNodeDropdown : undefined;
            userOptions.enableSearchBar = _.isObject(userOptions.enableSearchBar) ? userOptions.enableSearchBar : undefined;
            userOptions.enableUnselect = userOptions.enableUnselect !== false;

            userOptions.expandToDepth = _.isNumber(userOptions.expandToDepth) ? userOptions.expandToDepth : 1;
            userOptions.idAttribute = userOptions.idAttribute || 'ID';
            userOptions.labelAttribute = userOptions.labelAttribute || 'label';
            userOptions.selectedAttribute = userOptions.selectedAttribute || 'selected';
            userOptions.childrenAttribute = userOptions.childrenAttribute || 'children';
            userOptions.lazyLoadingAttribute = userOptions.lazyLoadingAttribute || undefined;
            userOptions.editableAttribute = userOptions.editableAttribute || 'editable';
            userOptions.indeterminateAttribute = userOptions.indeterminateAttribute || '__ivhTreeviewIndeterminate';
            userOptions.expandedAttribute = userOptions.expandedAttribute || '__ivhTreeviewExpanded';
            userOptions.labelTitleAttribute = userOptions.labelTitleAttribute || 'label';

            userOptions.nodeClickCallback = _.isFunction(userOptions.nodeClickCallback) ? userOptions.nodeClickCallback : undefined;
            userOptions.lazyLoadingCallback = _.isFunction(userOptions.lazyLoadingCallback) ? userOptions.lazyLoadingCallback : undefined;
            userOptions.editableCallback = _.isFunction(userOptions.editableCallback) ? userOptions.editableCallback : undefined;

            return userOptions;
        }

        return directive;
    }
})(NetBrain);