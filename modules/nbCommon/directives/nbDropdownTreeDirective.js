/**
 * Created by Marko Cen on 12/24/2015.
 */

; (function (NetBrain) {
    angular.module('nb.common')
        .directive('nbDropdownTreeDirective', DropdownTree);

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
                //'<div class="dropdown-menu dropdown-menu-custom treeview-container"><div nb-treeview-directive="treeData" options="treeOptions"></div></div>' +
                '</div>',
            controller: Controller
        };

        function Compile() {
            return {
                pre: function (scope, ele, attr) {

                    scope.treeOptions.enableUnselect = false;

                    var dropdownTemp = '<div id="dropdown-treeview-' + scope.$id + '" ' +
                        'class="dropdown-menu dropdown-menu-custom nb-dropdown-tree-directive treeview-container">' +
                        '<div nb-treeview-directive="treeData" options="treeOptions" watch-data atag="nbDropdownTreeDirective:tree"></div>' +
                        '</div>';
                    var dropdownEle = $compile(dropdownTemp)(scope);

                    $(dropdownEle).on('click', dropdownClickHandler);
                    $(dropdownEle).css({ width: $(ele).width() > 250 ? $(ele).width() : 250 });
                    $(ele).find('button').on('click', btnClickHandler);
                    $(document).on('mousedown', docClickHandler);
                    $(document).on('click', docClickHandler);
                    $(document.body).append(dropdownEle);

                    scope.$on('$destroy', function () {
                        $(document).off('mousedown', docClickHandler);
                        $(document).off('click', docClickHandler);
                        $(ele).off('click', btnClickHandler);
                        $(dropdownEle).off('click', dropdownClickHandler);
                        $(document.body).children('#dropdown-treeview-' + scope.$id).remove();
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

                    var watchWidth = scope.$watch(function () {
                        return $(ele).width();
                    }, function (newVal, oldVal) {
                        if (newVal && oldVal && newVal !== oldVal)
                            scope.setDropdownWidth();
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

                    scope.setDropdownWidth = function () {
                        var dropdownEle = $('div#dropdown-treeview-' + scope.$id);
                        if (dropdownEle)
                            $(dropdownEle).css({ width: $(ele).width() > 250 ? $(ele).width() : 250 });
                    };

                    scope.setInitTitle(scope.treeData, scope.treeOptions, ele);

                    function dropdownClickHandler(event) {
                        var target = $(event.target);
                        var s = angular.element(target).scope();
                        if (s.node) {
                            if (s.node.avoidDropdownToggle) return;
                            var children = s.node[scope.treeOptions.childrenAttribute || 'children'];
                            var dropdown = $(document.body).children('#dropdown-treeview-' + scope.$id);
                            if ((!children || children.length <= 0)
                                && !scope.treeOptions.enableMultipleSelect
                                && !scope.treeOptions.enableLabelExpand
                            ) {
                                dropdown.css({
                                    display: 'none'
                                })
                            }
                        }
                    }

                    function btnClickHandler(event) {
                        event.stopPropagation();
                        var btn = $(event.target).closest('.nb-dropdown-tree-directive');
                        var hasData = Array.isArray(scope.treeData) ? scope.treeData.length > 0 : scope.treeData[scope.treeOptions.childrenAttribute || 'children'].length > 0;
                        if (scope.treeData && hasData) {
                            var dropdown = $(document.body).children('#dropdown-treeview-' + scope.$id);
                            dropdown.css({
                                display: dropdown.css('display') === 'block' ? 'none' : 'block',
                                top: btn.offset().top + 28,
                                left: btn.offset().left
                            });
                        }
                    }

                    function docClickHandler(event) {
                        var targetTree = $(event.target).closest('.nb-dropdown-tree-directive.treeview-container');
                        var targetId = targetTree.length > 0 ?
                            targetTree[0]['id'] : 'dropdown-treeview-XXXXX';
                        // if(target.closest('.nb-dropdown-tree-directive').length <= 0){
                        //     var dropdown = $(document.body).children('#dropdown-treeview-'+scope.$id);
                        //     dropdown.css({
                        //         display: 'none'
                        //     })
                        // }
                        var ids = _.map($('.nb-dropdown-tree-directive.treeview-container'), function (ele) {
                            return ele.id;
                        });

                        _.each(ids, function (id) {
                            if (id != targetId)
                                $('#' + id).css({ display: 'none' });
                        })
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
                        watchWidth();
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
