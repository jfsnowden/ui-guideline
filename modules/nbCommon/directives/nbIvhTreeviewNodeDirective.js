(function() {
    'use strict';

    angular.module('nb.common').directive('nbIvhTreeviewNodeDirective', [
        function() {
            'use strict';

            return {
                restrict: 'A',
                require: '^ivhTreeview',
                template: '<div class="ivh-tree-node" ng-class="{nodeSelected: node.selected}" ng-mouseleave="node.menuSelected = false;" ng-click="selectNode($event, node)">' +
                    '<span ivh-treeview-toggle>' +
                    '<span ng-if="node.expended"><span class="icon_nb_tree_collapse" ng-style="{\'opacity\': (node.childNumber > 0) ? 1 : 0}"></span><img src="img/folder.png" style="margin: -5px 0 0 7px;"/></span>' +
                    '<span ng-if="!node.expended"><span class="icon_nb_tree_expand" ng-style="{\'opacity\': (node.childNumber > 0) ? 1 : 0}"></span><img src="img/folder-closed.png" style="margin: -5px 0 0 7px;"/></span>' +
                    '</span>' +
                    // '<span ng-if="!node.show">' +
                    //    '<span class="fa fa-plus-square" /><img src="img/folder-closed.png" style="margin: -5px 0 0 7px;"/></span>' +
                    // '</span>' +
                    '<span contenteditable="{{true == node.editMode && !node.systemFolder}}" ng-click="node.clicked = true" class="ivh-treeview-node-label" ng-class="{\'editHighlight\': node.editMode && !node.systemFolder}" ng-model="node.name" nb-ivh-treeview-edit-directive spellcheck="false">' +
                    '{{trvw.label(node)}}' +
                    '</span>' +
                    '<div ng-if="nbIvhRootNode!=node.name && node.treeActionMenu != undefined" class="ivhTreeMenuRight">' +
                    '<img src="img/Assets/More_Actions_Button_20x20.png" dropdown-toggle="" aria-haspopup="true" aria-expanded="true" nb-ivh-treeview-select-menu-directive>' +
                    '<ul ng-show="true" class="treeWithMenu_treeItemFolderMenu" nb-menu-position-directive="{{nbMenuPositionDirective}}">' +
                    '<li style="padding-left:20px; list-style-type: none;" nb-ivh-treeview-select-action-directive action-index="$index" class="treeWithMenu_treeItemFolderMenuItem" ng-repeat="action in node.treeActionMenu" ng-style="{\'border-top\':(\'Delete Folder\' == action[\'title\']) ? \'1px solid #cccccc\' : \'none\'}">' +
                    '{{action.title}}' +
                    '</li>' +
                    '</ul>' +
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
                    scope.nbIvhRootNode = attrs.nbIvhTreeviewNodeDirective;
                }
            };
        }
    ]);
})(NetBrain);
