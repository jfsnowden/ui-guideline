/**
 * Created by Marko Cen on 12/24/2015.
 */

; (function (NetBrain) {
    angular.module('nb.common')
        .directive('nbDropdownTreeInDashboardDirective', DropdownTree);

    DropdownTree.$inject = ['$compile'];
    function DropdownTree($compile) {
        var directive = {
            scope: {
                treeOptions: '=',
                treeData: '='
            },
            restrict: 'EA',
            compile: Compile,
            replace: true,
            template: '<div class="btn-group dropdown nb-dropdown-tree-directive">' +
                '<button class="btn btn-default dropdown-body dropdown-body-custom tree-select-title"></button>' +
                '<button class="btn dropdown-toggle">' +
                '<div class="icon-container"><span class="icon_nb_arrow_down"></span></div>' +
                '</button>' +
                '</div>',
            controller: Controller
        };

        function Compile() {
            return {
                pre: function (scope, ele, attr) {
                    ele.attr('id', 'dropdown-treeview-' + scope.$id);
                    var dropdownTemp = $('<div ' +
                        'class="dropdown-menu dropdown-menu-custom nb-dropdown-tree-directive treeview-container">' +
                        '<div nb-treeview-directive="treeData" options="treeOptions" watch-data></div>' +
                        '</div>');
                    var dropdownEle = $compile(dropdownTemp)(scope);

                    $(dropdownEle).on('click', dropdownClickHandler.bind(null, dropdownEle));
                    $(dropdownEle).css({ width: $(ele).width() > 250 ? $(ele).width() : 250 });
                    $(ele).find('button').on('click', btnClickHandler.bind(null, dropdownEle));
                    $(document).on('click', docClickHandler.bind(null, dropdownEle, ele));
                    $(ele).append(dropdownEle);

                    scope.$on('$destroy', function () {
                        $(document).off('click', docClickHandler);
                        $(ele).off('click', btnClickHandler);
                        $(dropdownEle).off('click', dropdownClickHandler);
                        dropdownEle.remove();
                    });

                    if (scope.treeOptions.nodeClickCallback !== undefined) {
                        var userCallback = scope.treeOptions.nodeClickCallback;
                        scope.treeOptions.nodeClickCallback = function (node, trvw) {
                            if ((!node[scope.treeOptions.childrenAttribute]
                                || node[scope.treeOptions.childrenAttribute].length <= 0)
                                || !scope.treeOptions.enableLabelExpand) {
                                setDropdownTitle(
                                    node[scope.treeOptions.labelAttribute],
                                    node[scope.treeOptions.selectedAttribute],
                                    scope.treeOptions.enableMultipleSelect
                                );
                            }
                            userCallback(node, trvw)
                        }
                    } else {
                        scope.treeOptions.nodeClickCallback = function (node, trvw) {
                            if (trvw.isLeaf(node) || !scope.treeOptions.enableLabelExpand) {
                                setDropdownTitle(
                                    node[scope.treeOptions.labelAttribute],
                                    node[scope.treeOptions.selectedAttribute],
                                    scope.treeOptions.enableMultipleSelect
                                );
                            }
                        }
                    }

                    var watchTreeData = scope.$watch('treeData', function (newVal, oldVal, scope) {
                        if (newVal === oldVal) {
                            return;
                        } else {
                            if (scope.titles) {
                                scope.titles = [];
                                scope.setInitTitle(scope.treeData, scope.treeOptions, ele);
                            }
                        }
                    });

                    scope.setInitTitle = function (data, options, ele) {
                        var childAttr = options.childrenAttribute || 'children';
                        var selAttr = options.selectedAttribute || 'selected';
                        var labelAttr = options.labelAttribute || 'label';
                        var titleEle = $(ele).find('.tree-select-title');
                        scope.defaultTitle = angular.isDefined(attr.placeholder) ? attr.placeholder : 'Select';
                        scope.titles = [];

                        function getTitles(root) {
                            if (_.isArray(root[childAttr]) && !root[selAttr]) {
                                _.forEach(root[childAttr], function (subRoot) {
                                    getTitles(subRoot);
                                });
                            } else {
                                if (root[selAttr]) {
                                    var index = scope.titles.indexOf(root[labelAttr]);
                                    if (index < 0 && !root.avoidDropdownToggle) {
                                        scope.titles.push(root[labelAttr]);
                                    }
                                }
                            }
                        }

                        if (_.isArray(data)) {
                            _.forEach(data, function (d) {
                                getTitles(d);
                            });
                        } else {
                            getTitles(data);
                        }

                        if (scope.titles.length > 0) {
                            var fullTitle = scope.titles.join(', ');
                            titleEle.html(fullTitle);
                            titleEle.prop('title', fullTitle);
                        } else {
                            titleEle.html(scope.defaultTitle);
                            titleEle.prop('title', scope.defaultTitle);
                        }
                    };

                    scope.setInitTitle(scope.treeData, scope.treeOptions, ele);

                    function dropdownClickHandler(treeEl, event) {
                        event.stopPropagation();
                        var target = $(event.target);
                        var s = angular.element(target).scope();
                        if (s && s.node) {
                            if (s.node.avoidDropdownToggle) return;
                            var children = s.node[scope.treeOptions.childrenAttribute || 'children'];
                            if (((!children || children.length <= 0) && !scope.treeOptions.enableMultipleSelect) || !scope.treeOptions.enableLabelExpand) {
                                treeEl.css({ display: 'none' })
                            }
                        }
                    }

                    function btnClickHandler(treeEl, event) {
                        var hasData = Array.isArray(scope.treeData) ? scope.treeData.length > 0 : scope.treeData[scope.treeOptions.childrenAttribute || 'children'].length > 0;
                        if (scope.treeData && hasData) {
                            treeEl.toggle();
                        }
                    }

                    function docClickHandler(treeEl, el, event) {
                        var targetTree = $(event.target).closest('.nb-dropdown-tree-directive');
                        if (targetTree.length && targetTree[0]['id'] == el[0]['id']) {

                        } else {
                            treeEl.hide();
                        }

                    }

                    function setDropdownTitle(label, isSelect, isMultiple) {
                        if (!isMultiple) scope.titles = [];
                        var index = scope.titles.indexOf(label);
                        if (index === -1 && isSelect) {
                            scope.titles.push(label);
                        } else if (index > -1 && !isSelect) {
                            scope.titles.splice(index, 1);
                        }
                        $(ele).find('.tree-select-title').html(
                            scope.titles.length > 0 ? scope.titles.join(', ') : scope.defaultTitle
                        );
                        $(ele).find('.tree-select-title').prop(
                            'title', scope.titles.length > 0 ? scope.titles.join(', ') : scope.defaultTitle
                        );
                    }

                    scope.$on('$destroy', function () {
                        watchTreeData();
                    });
                },
                post: function (scope, ele, attr) {


                    $(ele).on('click', clickHandler);
                    $('#dropdown-treeview-' + scope.$id).css({ width: $(ele).width() > 250 ? $(ele).width() : 250 });
                    if (scope.treeData != null) {
                        scope.$on('nbTreeview.nodeSelected', function (event) {
                            event.stopPropagation();
                            scope.setInitTitle(scope.treeData, scope.treeOptions, ele);
                        })
                    }



                    function clickHandler(e) {
                        var element;
                        for (element = e.target; element; element = element.parentNode) {
                            var classNames = element.className;
                            if (typeof classNames !== "string") {
                                continue;
                            }
                            if (classNames.indexOf('treeview-container') > -1
                                && scope.treeOptions.enableMultipleSelect) {
                                e.stopPropagation();
                                return;
                            }
                        }
                    }

                    scope.$on('$destroy', function () {
                        $(ele).off('click', clickHandler)
                    })
                }
            }
        }

        Controller.$inject = [];
        function Controller() {

        }

        return directive;
    }
})(window.NetBrain);
