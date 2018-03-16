/**
 * Created by Marko Cen on 12/16/2015.
 */

(function() {
    angular.module('nb.common').directive('nbTreeviewNodeTpl', NbTreeviewNodeTpl);

    NbTreeviewNodeTpl.$inject = [];

    function NbTreeviewNodeTpl() { // $sce, ivhTreeviewMgr
        var directive = {
            restrict: 'E',
            scope: false,
            replace: true,
            require: ['^^nbTreeviewDirective', '^^ivhTreeview'],
            templateUrl: 'modules/nbCommon/views/nbTreeviewNodeTpl.html',
            link: Link
        };

        function Link(scope, ele, attr, ctrls) {
            var self = scope;
            var nbTreeview = ctrls[0];
            var trvw = ctrls[1];
            var opts = trvw.opts();
            var indeterminateAttr = opts.indeterminateAttribute;
            var selectedAttr = opts.selectedAttribute;

            (function() {
                if (!!nbTreeview.treeviewOptions.enableMultipleSelect) {
                    self.$watch(function() {
                        return self.node[selectedAttr];
                    }, function(newVal) {
                        $(ele).find('> .ivh-node-row > .node-checkbox > input')
                            .prop('checked', newVal);
                    });

                    self.$watch(function() {
                        return self.node[indeterminateAttr];
                    }, function(newVal) {
                        $(ele).find('> .ivh-node-row > .node-checkbox > input')
                            .prop('indeterminate', newVal);
                    });
                }
            })();

            self.showNodeNum = opts.showNodeNum;
            self.enableTwoWayBinding = opts.enableTwoWayBinding;
            self.checkboxChanged = nbTreeview.checkboxChanged;
            self.getTemplateLabel = nbTreeview.getTemplateLabel;
            self.getTemplateIcon = nbTreeview.getTemplateIcon;
            self.showCheckBox = nbTreeview.showCheckBox;
            self.showToggleArrow = nbTreeview.showToggleArrow;
            self.toggleNode = nbTreeview.toggleNode;
            self.isDisplayDropdown = nbTreeview.isDisplayDropdown;
            self.openDropdown = nbTreeview.openDropdown;
            self.isTreeItemVisible = nbTreeview.isTreeItemVisible;
            self.showEditable = nbTreeview.showEditable;
            self.selectNode = nbTreeview.selectNode;
            self.dragNodeStart = nbTreeview.dragNodeStart;

            self.initEditableContent = function(node, trvw2) {
                var editableDiv = $(ele).find('.node-label-editable');
                nbTreeview.initEditableContent(node, trvw2, editableDiv);
            };

            self.getNodeTitle = function(node, trvw2) {
                if (!_.isUndefined(nbTreeview.treeviewOptions.nodeTitle)) {
                    var n = nbTreeview.treeviewOptions.nodeTitle;
                    if (_.isFunction(n)) {
                        return n.call(null, node, trvw2);
                    }
                    return n.toString();
                }
                return trvw2.label(node);
            };

            self.shouldDisableMultiCheckbox = function(node) {
                return node[nbTreeview.treeviewOptions.disableCheckboxAttribute];
            };
        }

        return directive;
    }
})(window.NetBrain);

/**
 * Created by Yang YL on 01/29/2018.
 * 用于节点内容长度显示设置限制后扩展
 */
(function() {
    angular.module('nb.common').directive('nbTreeviewNodeTplExtend', nbTreeviewNodeTplExtend);

    nbTreeviewNodeTplExtend.$inject = [];

    function nbTreeviewNodeTplExtend() { // $sce, ivhTreeviewMgr
        var directive = {
            restrict: 'E',
            scope: false,
            replace: true,
            require: ['^^nbTreeviewDirective', '^^ivhTreeviewExtend'],
            templateUrl: 'modules/nbCommon/views/nbTreeviewNodeTpl.html',
            link: Link
        };

        function Link(scope, ele, attr, ctrls) {
            var self = scope;
            var nbTreeview = ctrls[0];
            var trvw = ctrls[1];
            var opts = trvw.opts();
            var indeterminateAttr = opts.indeterminateAttribute;
            var selectedAttr = opts.selectedAttribute;

            (function() {
                if (!!nbTreeview.treeviewOptions.enableMultipleSelect) {
                    self.$watch(function() {
                        return self.node[selectedAttr];
                    }, function(newVal) {
                        $(ele).find('> .ivh-node-row > .node-checkbox > input')
                            .prop('checked', newVal);
                    });

                    self.$watch(function() {
                        return self.node[indeterminateAttr];
                    }, function(newVal) {
                        $(ele).find('> .ivh-node-row > .node-checkbox > input')
                            .prop('indeterminate', newVal);
                    });
                }
            })();

            self.showNodeNum = opts.showNodeNum;
            self.enableTwoWayBinding = opts.enableTwoWayBinding;
            self.checkboxChanged = nbTreeview.checkboxChanged;
            self.getTemplateLabel = nbTreeview.getTemplateLabel;
            self.getTemplateIcon = nbTreeview.getTemplateIcon;
            self.showCheckBox = nbTreeview.showCheckBox;
            self.showToggleArrow = nbTreeview.showToggleArrow;
            self.toggleNode = nbTreeview.toggleNode;
            self.isDisplayDropdown = nbTreeview.isDisplayDropdown;
            self.openDropdown = nbTreeview.openDropdown;
            self.isTreeItemVisible = nbTreeview.isTreeItemVisible;
            self.showEditable = nbTreeview.showEditable;
            self.selectNode = nbTreeview.selectNode;
            self.dragNodeStart = nbTreeview.dragNodeStart;

            self.initEditableContent = function(node, trvw2) {
                var editableDiv = $(ele).find('.node-label-editable');
                nbTreeview.initEditableContent(node, trvw2, editableDiv);
            };

            self.getNodeTitle = function(node, trvw2) {
                if (!_.isUndefined(nbTreeview.treeviewOptions.nodeTitle)) {
                    var n = nbTreeview.treeviewOptions.nodeTitle;
                    if (_.isFunction(n)) {
                        return n.call(null, node, trvw2);
                    }
                    return n.toString();
                }
                return trvw2.label(node);
            };

            self.shouldDisableMultiCheckbox = function(node) {
                return node[nbTreeview.treeviewOptions.disableCheckboxAttribute];
            };
        }

        return directive;
    }
})(window.NetBrain);
