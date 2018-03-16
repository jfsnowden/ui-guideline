(function() {
    'use strict';

    angular.module('nb.common').directive('nbIvhTreeviewWithLeafDirective', [
        function() {
            'use strict';

            return {
                restrict: 'A',
                require: '^ivhTreeview',
                template: '<div>' +
                    '<div ng-if="node.nodeType == 0" class="ivh-tree-node" ng-class="{nodeSelected: node.selected}" ng-mouseleave="node.menuSelected = false;" ng-click="selectNode($event, node)">' +
                    '<span ivh-treeview-toggle>' +
                    '<span ng-if="node.expended"><span class="icon_nb_tree_collapse" ng-style="{\'opacity\': (node.childNumber > 0) ? 1 : 0}"></span>' +
                    '<img ng-if="!node.icon" src="img/folder.png" style="margin: -5px 2px 0 5px;"/><img ng-if="node.icon" ng-src="{{node.icon}}" style="margin: -5px 2px 0 5px;width:16px;height:16px;"/></span>' +
                    '<span ng-if="!node.expended"><span class="icon_nb_tree_expand" ng-style="{\'opacity\': (node.childNumber > 0) ? 1 : 0}"></span>' +
                    '<img ng-if="!node.icon" src="img/folder-closed.png" style="margin: -5px 2px 0 5px;"/><img ng-if="node.icon" ng-src="{{node.icon}}" style="margin: -5px 2px 0 5px;width:16px;height:16px;"/></span>' +
                    '</span>' +
                    '<span contenteditable="{{true == node.editMode}}" class="ivh-treeview-node-label" ng-class="{\'editHighlight\': node.editMode}" ng-model="node.name" nb-ivh-treeview-edit-directive spellcheck="false">' +
                    '{{trvw.label(node)}}' +
                    '</span>' +
                    '<div class="ivhTreeMenuRight" ng-if="node.treeActionMenu != undefined && node.treeActionMenu.length > 0 && !node.nodeActions">' +
                    '<img src="img/Assets/More_Actions_Button_20x20.png" dropdown-toggle="" aria-haspopup="true" aria-expanded="true" style="margin-right:0.3em;" nb-ivh-treeview-select-menu-directive>' +
                    '<ul ng-show="node.menuSelected" class="treeWithMenu_treeItemFolderMenu" nb-menu-position-directive="{{nbMenuPositionDirective}}">' +
                    '<li style="padding-left:20px; list-style-type: none;" nb-ivh-treeview-select-action-directive action-index="$index" class="treeWithMenu_treeItemFolderMenuItem" ng-repeat="action in node.treeActionMenu" ng-style="{\'border-top\':(\'Delete Folder\' == action[\'title\']) ? \'1px solid #cccccc\' : \'none\'}">' +
                    '{{action.title}}' +
                    '</li>' +
                    '</ul>' +
                    '</div>' +
                    '<img ng-if="node.nodeActions" src="img/Assets/Close_Button_16x16.png" class="deleteNodeImage" nb-ivh-treeview-node-action-directive />' +
                    '</div>' +
                    '<div ng-if="node.nodeType == 1" class="ivh-tree-node"  ng-class="{nodeSelected: node.selected}" ng-click="selectNode($event, node)" ng-mouseenter="node.showDeleteNode = (!disableDeleteBtn && node.treeLeafActions && node.treeLeafActions.length > 0);"  ng-mouseleave="node.showDeleteNode = false;node.menuSelected = false;" >' +
                    '  <img ng-if="!node.icon" src="img/file.png" style="margin: -5px 0 0 14px;"/> <img ng-if="node.icon" ng-src="{{node.icon}}" style="margin: -5px 0 0 14px;"/> <span class="ivh-treeview-node-label" title="{{node.name}}" >{{trvw.label(node)}}</span>' +
                    '<img ng-if="node.showDeleteNode" src="img/Assets/Close_Button_16x16.png" class="deleteNodeImage" nb-ivh-treeview-node-action-directive />' +
                    '<div class="ivhTreeMenuRight" ng-if="node.treeActionMenu != undefined && node.treeActionMenu.length > 0 && !node.nodeActions">' +
                    '<img src="img/Assets/More_Actions_Button_20x20.png" dropdown-toggle="" aria-haspopup="true" aria-expanded="true" style="margin-right:0.3em;" nb-ivh-treeview-select-menu-directive>' +
                    '<ul ng-show="node.menuSelected" class="treeWithMenu_treeItemFolderMenu" nb-menu-position-directive="{{nbMenuPositionDirective}}">' +
                    '<li style="padding-left:20px; list-style-type: none;" nb-ivh-treeview-select-action-directive action-index="$index" class="treeWithMenu_treeItemFolderMenuItem" ng-repeat="action in node.treeActionMenu" ng-style="{\'border-top\':(\'Delete Folder\' == action[\'title\']) ? \'1px solid #cccccc\' : \'none\'}">' +
                    '{{action.title}}' +
                    '</li>' +
                    '</ul>' +
                    '</div>' +
                    '</div>' +
                    '</div>',
                replace: true,
                link: function(scope, elm, attrs, ivhTreeview) {
                    scope.selectNode = function(event, node) {
                        var ele = angular.element(event.target);
                        if (ele.hasClass('ivh-tree-node') || ele.hasClass('ivh-treeview-node-label')) {
                            ivhTreeview.onNodeClick(node);
                        }
                    };
                    scope.nbIvhRootNode = attrs.nbIvhTreeviewWithLeafDirective;
                    scope.disableDeleteBtn = attrs.disableDeleteBtn === 'true';
                }
            };
        }
    ]);
})(NetBrain);
