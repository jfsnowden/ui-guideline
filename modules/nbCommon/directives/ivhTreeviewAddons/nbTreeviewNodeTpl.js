/**
 * Created by Marko Cen on 12/16/2015.
 */


;(function (NetBrain) {
    angular.module('nb.common').directive('nbTreeviewNodeTpl', NbTreeviewNodeTpl);

    NbTreeviewNodeTpl.$inject = ['$sce', 'ivhTreeviewMgr'];
    function NbTreeviewNodeTpl($sce, ivhTreeviewMgr) {
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

            (function () {
                if(!!nbTreeview.treeviewOptions.enableMultipleSelect){
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
            self.initEditableContent = function(node,trvw){
                var editableDiv = $(ele).find('.node-label-editable');
                nbTreeview.initEditableContent(node, trvw, editableDiv);
            };
            self.getNodeTitle = function (node, trvw) {
                if(!_.isUndefined(nbTreeview.treeviewOptions.nodeTitle)){
                    var n = nbTreeview.treeviewOptions.nodeTitle;
                    if(_.isFunction(n)){
                        return n.call(null, node, trvw);
                    }else{
                        return n.toString();
                    }
                }else{
                    return trvw.label(node);
                }
            }

        }

        return directive;
    }
})(window.NetBrain);