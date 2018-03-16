/* global commonUiEvent */
(function() {
    angular.module('nb.common').directive('nbGridRowMenu', NbGridRowMenu);

    NbGridRowMenu.$inject = ['$compile', '$log', '$document', '$timeout', '$sce', '$rootScope'];

    function NbGridRowMenu($compile, $log, $document, $timeout, $sce, $rootScope) {
        return {
            restrict: 'A',
            scope: false,
            require: '?uiGrid',
            compile: compile
        };

        function compile() {
            return {
                pre: function(scope, ele, attrs, uiGridCtrl) {
                    var MENU_OPEN = false;
                    var GRID_ID = '';
                    var CURRENT_ACTION_BTN = null;
                    uiGridCtrl.PRE_HORI_POS = 0;
                    var atag = attrs.atag;

                    var isEnabledRowMenu = uiGridCtrl.grid.options.enableRowActionMenu;
                    if (isEnabledRowMenu) {
                        scope.rowActionMenuList = [];

                        scope.renderTemplate = function(template) {
                            return $sce.trustAs('html', template);
                        };

                        scope.callActionMenuDropdown = function(item, event) {
                            if (typeof item.action === 'function') {
                                var selectedRows = uiGridCtrl.grid.api.selection.getSelectedRows() || [];
                                if (selectedRows.length > 1) {
                                    item.action(
                                        selectedRows,
                                        uiGridCtrl.grid,
                                        event
                                    );
                                } else {
                                    item.action(
                                        // hi, Marko: 我这边为了测试方便先这么改写了，你有方案后撤销这段代码再重新修改吧
                                        (uiGridCtrl.grid.selectedRowAction && uiGridCtrl.grid.selectedRowAction.entity) ||
                                        selectedRows[0],
                                        uiGridCtrl.grid,
                                        event
                                    );
                                }
                            }
                        };

                        uiGridCtrl.grid.toggleRowActionMenu = function(row, grid, event) {
                            CURRENT_ACTION_BTN = event.target;

                            if (!row.isSelected) {
                                grid.api.selection.clearSelectedRows();
                                grid.api.selection.selectRow(row.entity);
                            }

                            uiGridCtrl.grid.selectedRowAction = row;

                            var selectedRows = grid.api.selection.getSelectedRows() || [],
                                items;

                            if (selectedRows.length > 1 && _.isFunction(grid.options.rowContextMenuItems)) {
                                items = grid.options.rowContextMenuItems(
                                    selectedRows,
                                    grid,
                                    event
                                );
                            } else {
                                items = grid.options.rowActionMenuItems(row, grid, event);
                            }

                            if (_.isArray(items) && items.length > 0) {
                                $timeout(function() {
                                    scope.rowActionMenuList = items;
                                    var menuEle = angular.element(document.querySelector('#row-action-menu-dropdown-' + grid.id));
                                    open(event, menuEle);
                                });
                            }
                        };

                        appendActionMenuDropdown(uiGridCtrl.grid.id, scope);

                        GRID_ID = uiGridCtrl.grid.id;

                        $document.bind('click', handleClickEvent);
                        $document.bind('contextmenu', handleClickEvent);
                        uiGridCtrl.grid.api.core.on.sortChanged(scope, function() {
                            close($('#row-action-menu-dropdown-' + GRID_ID));
                        });

                        var toggleWatcher = $rootScope.$on(commonUiEvent.nbGridDropdownToggle, function(event, id) {
                            $timeout(function() {
                                if (id !== 'row-action-menu-dropdown-' + GRID_ID) {
                                    close($('#row-action-menu-dropdown-' + GRID_ID));
                                }
                            });
                        });

                        uiGridCtrl.grid.appScope.$on('$destroy', function() {
                            $document.unbind('click', handleClickEvent);
                            $document.unbind('contextmenu', handleClickEvent);
                            $(document.querySelector('#row-action-menu-dropdown-' + GRID_ID)).remove();
                            toggleWatcher();
                        });
                    }

                    function open(event, actionMenuEle) {
                        actionMenuEle.css({ display: 'block' });
                        var targetLeft = $(event.target).offset().left + event.target.scrollWidth;
                        var targetTop = $(event.target).offset().top + event.target.scrollHeight;
                        var doc = $document[0].documentElement;
                        var docLeft = (window.pageXOffset || doc.scrollLeft) -
                            (doc.clientLeft || 0),
                            docTop = (window.pageYOffset || doc.scrollTop) -
                            (doc.clientTop || 0),
                            elementWidth = actionMenuEle[0].scrollWidth,
                            elementHeight = actionMenuEle[0].scrollHeight;
                        var docWidth = doc.clientWidth + docLeft,
                            docHeight = doc.clientHeight + docTop,
                            totalWidth = targetLeft,
                            totalHeight = elementHeight + targetTop,
                            left = Math.max(targetLeft - docLeft - elementWidth, 0),
                            top = Math.max(targetTop - docTop, 0);

                        if (totalWidth > docWidth) {
                            left -= (totalWidth - docWidth);
                        }

                        if (totalHeight > docHeight) {
                            top -= (totalHeight - docHeight + 15);
                        }

                        actionMenuEle.css('top', top + 'px');
                        actionMenuEle.css('left', left + 'px');

                        MENU_OPEN = true;

                        $rootScope.$emit(commonUiEvent.nbGridDropdownToggle, actionMenuEle[0].id);
                    }

                    function close(actionMenuEle) {
                        actionMenuEle.css({ display: 'none' });
                        MENU_OPEN = false;
                        CURRENT_ACTION_BTN = null;
                    }
                    scope.closeMenu = close;

                    function handleClickEvent(event) {
                        // $timeout(function () {
                        var actionMenuEle = $('#row-action-menu-dropdown-' + GRID_ID);
                        if (MENU_OPEN && $(event.target).closest(CURRENT_ACTION_BTN).length === 0) {
                            close(actionMenuEle);
                        }
                        // })
                    }

                    scope.getTextToCopy = function(event) {
                        if (typeof event === 'function') {
                            var rowInfo = uiGridCtrl.grid.api.selection.getSelectedRows();
                            return event(rowInfo);
                        }
                        return '';
                    };


                    function appendActionMenuDropdown(gridId, scope2) {
                        scope2.rowActionMenuList = [];
                        var atagString = atag ? 'atag = "' + atag + ':actionMenu"' : '';
                        var template = '<ul ' + atagString + ' ng-show="rowActionMenuList.length>0" id="row-action-menu-dropdown-' + gridId + '" class="dropdown-menu nb-grid-action-menu-dropdown" uib-dropdown-menu>' +
                            '<li ng-click="callActionMenuDropdown(item, $event)" ng-class="item.class" ng-repeat="item in rowActionMenuList" ng-hide="item.hide">' +
                            '<a ng-bind-html="::renderTemplate(item.template)"  ng-if="item.isCopy ==null || item.isCopy==false"></a>' +
                            '<a ng-bind-html="::renderTemplate(item.template)"  ng-if="item.isCopy !=null && item.isCopy==true" clip-copy="getTextToCopy(item.event)"></a>' +
                            '</li>' +
                            '</ul>';
                        var element = $compile(template)(scope2);
                        angular.element(document.body).append(element);
                    }
                },

                post: function(scope, ele, attrs, uiGridCtrl) {
                    var isEnabledRowMenu = uiGridCtrl.grid.options.enableRowActionMenu;
                    // var menuBtnOffset = 47;
                    if (isEnabledRowMenu) {
                        uiGridCtrl.grid.api.selection.on.rowSelectionChanged(uiGridCtrl.grid.appScope, function() {
                            var rows = uiGridCtrl.grid.api.selection.getSelectedGridRows();
                            if (rows.length > 1) {
                                $(ele).addClass('multiple-rows-selected');
                            } else {
                                $(ele).removeClass('multiple-rows-selected');
                            }
                        });

                        uiGridCtrl.grid.api.core.on.rowsRendered(uiGridCtrl.grid.appScope, function() {
                            $timeout(function() {
                                if ($(ele).is(':visible')) {
                                    var rows = $(ele).find('.ui-grid-render-container .ui-grid-row'),
                                        template = '<div class="nb-grid-action-menu">' +
                                        '<i ng-click="grid.toggleRowActionMenu(row, grid, $event, rowRenderIndex)" class="icon_nb_action_menu"></i>' +
                                        '</div>';
                                    // rowHeight;
                                    // rowHeight = rows.length >= 1 ? rows[0].offsetHeight : 0
                                    // , viewportHeight = uiGridCtrl.grid.element.find('.ui-grid-viewport')[0].offsetHeight || 0;
                                    // var emptyCanvasHeight = 0;
                                    var emptyCanvas = uiGridCtrl.grid.element.find('.grid-empty-canvas');
                                    if (emptyCanvas && emptyCanvas.length > 0) {
                                        //  emptyCanvasHeight = emptyCanvas[0].offsetHeight || 0;
                                    }
                                    // var totalHeight = rowHeight * rows.length + emptyCanvasHeight;

                                    // var menuBtnOffset = 46;
                                    var isGroupHeaderActionMenu = uiGridCtrl.grid.options.enableGroupHeaderActionMenu;
                                    angular.forEach(rows, function(row) {
                                        if ($(row).parents('.ui-grid-pinned-container').length > 0 || isGroupHeaderActionMenu !== undefined &&
                                            !isGroupHeaderActionMenu && $(row).hasClass('ui-grid-tree-header-row')) {
                                            return;
                                        }
                                        if ($(row).find('.nb-grid-action-menu').length <= 0) {
                                            var rowScope = angular.element(row).scope();
                                            var actionMenuEle = $compile(template)(rowScope);
                                            $(row).find('[ui-grid-row] .ui-grid-cell').last().after($compile(actionMenuEle)(rowScope));
                                        }

                                        $(row).find('.nb-grid-action-menu').css({ right: 0 });
                                    });
                                }
                            }, 500);
                        });

                        $timeout(function() {
                            $(ele).find('.ui-grid-render-container .ui-grid-viewport').on('scroll', _.debounce(function() { // event
                                scope.closeMenu($('#row-action-menu-dropdown-' + uiGridCtrl.grid.id));
                                var sl = $(this).scrollLeft();
                                if (uiGridCtrl.PRE_HORI_POS !== sl) {
                                    var rows = $(ele).find('.ui-grid-render-container .ui-grid-row');
                                    angular.forEach(rows, function(row) {
                                        $(row).find('.nb-grid-action-menu').css({ right: 0 });
                                    });
                                    uiGridCtrl.PRE_HORI_POS = sl;
                                }
                            }, 150));
                        });
                    }
                }
            };
        }
    }
})(window.NetBrain);
