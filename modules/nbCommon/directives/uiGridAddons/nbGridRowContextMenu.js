; (function (NetBrain) {

    angular.module('nb.common').directive('nbGridRowContextMenu', NbGridRowContextMenu);

    NbGridRowContextMenu.$inject = ['$compile', '$sce', '$log', '$document', '$timeout', '$rootScope'];

    function NbGridRowContextMenu($compile, $sce, $log, $document, $timeout, $rootScope) {
        return {
            restrict: 'A',
            scope: false,
            require: '?uiGrid',
            compile: compile
        };

        function compile() {
            return {
                pre: function (scope, ele, attr, uiGridCtrl) {

                },
                post: function (scope, ele, attr, uiGridCtrl) {

                    var MENU_OPEN = false;
                    var GRID_ID = '';
                    var CURRENT_ACTION_BTN = null;
                    var atag = attr.atag;

                    var enableRowContextMenu = uiGridCtrl.grid.options.enableRowContextMenu;
                    if (enableRowContextMenu) {

                        scope.rowContextMenuList = [];

                        scope.renderTemplate = function renderTemplate(template) {
                            return $sce.trustAs('html', template);
                        };

                        scope.callContextMenuDropdown = function (item, event) {
                            if (typeof item.action === 'function') {
                                var selectedRows = uiGridCtrl.grid.api.selection.getSelectedRows() || [];
                                if (selectedRows.length > 1) {
                                    item.action(
                                        selectedRows,
                                        uiGridCtrl.grid,
                                        event
                                    )
                                } else if (selectedRows.length === 1) {
                                    item.action(
                                        selectedRows[0],
                                        uiGridCtrl.grid,
                                        event
                                    )
                                }
                            }
                        };

                        var grid = uiGridCtrl.grid;

                        GRID_ID = grid.id;

                        appendContextMenuDropdown(grid.id, scope);

                        var contextMenuEventBinder = scope.$watch(function () {
                            return $(ele).is(':visible')
                        }, function (isVisible) {
                            if (isVisible) {
                                contextMenuEventBinder();
                                $(ele).on('contextmenu', function (event) {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    var rowEle = $(event.target).hasClass('ui-grid-row') ?
                                        event.target : $(event.target).closest('.ui-grid-row')[0];

                                    if (rowEle) {
                                        $timeout(function () {
                                            var rowScope = angular.element(rowEle).scope();

                                            if (!rowScope.row.isSelected) {
                                                grid.api.selection.clearSelectedRows();
                                                grid.api.selection.selectRow(rowScope.row.entity);
                                            }

                                            CURRENT_ACTION_BTN = rowEle;

                                            var selectedRows = grid.api.selection.getSelectedRows() || []
                                                , items;

                                            if (selectedRows.length === 1 && _.isFunction(grid.options.rowActionMenuItems)) {
                                                items = grid.options.rowActionMenuItems(rowScope.row, grid, event);
                                            } else {
                                                items = grid.options.rowContextMenuItems(
                                                    selectedRows,
                                                    rowScope.grid, event
                                                );
                                            }

                                            if (_.isArray(items) && items.length > 0) {
                                                scope.rowContextMenuList = items;
                                                var menuEle =
                                                    angular.element(document.querySelector('#row-context-menu-dropdown-' + grid.id));
                                                open(event, menuEle);
                                            } else {
                                                //                                                $log.error('rowActionMenuItems() should return an item array')
                                            }
                                        })
                                    }
                                })
                            }
                        });

                        $timeout(function () {
                            $(ele).find('.ui-grid-render-container .ui-grid-viewport').on('scroll', _.debounce(function () {
                                if (MENU_OPEN)
                                    close($("#row-context-menu-dropdown-" + GRID_ID));

                            }, 150));
                        });

                        $document.bind('click', handleClickEvent);
                        $document.bind('contextmenu', handleClickEvent);
                        uiGridCtrl.grid.api.core.on.sortChanged(scope, function () {
                            close($("#row-context-menu-dropdown-" + GRID_ID));
                        });

                        var toggleWatcher = $rootScope.$on(commonUiEvent.nbGridDropdownToggle, function (event, id) {
                            $timeout(function () {
                                if (id !== 'row-context-menu-dropdown-' + GRID_ID) {
                                    close($('#row-context-menu-dropdown-' + GRID_ID));
                                }
                            })
                        });
                        scope.$on('$destroy', toggleWatcher);

                        grid.appScope.$on('$destroy', function () {
                            $document.unbind('click', handleClickEvent);
                            $document.unbind('contextmenu', handleClickEvent);
                            $(document.querySelector('#row-context-menu-dropdown-' + GRID_ID)).remove();
                            toggleWatcher();
                        });

                    }

                    function open(event, actionMenuEle) {
                        actionMenuEle.css({ "display": "block" });
                        $timeout(function () {
                            var doc = $document[0].documentElement;
                            var docLeft = (window.pageXOffset || doc.scrollLeft) -
                                    (doc.clientLeft || 0),
                                docTop = (window.pageYOffset || doc.scrollTop) -
                                    (doc.clientTop || 0),
                                elementWidth = actionMenuEle[0].scrollWidth,
                                elementHeight = actionMenuEle[0].scrollHeight;
                            var docWidth = doc.clientWidth + docLeft,
                                docHeight = doc.clientHeight + docTop,
                                totalWidth = elementWidth + event.pageX,
                                totalHeight = elementHeight + event.pageY,
                                left = Math.max(event.pageX - docLeft, 0),
                                top = Math.max(event.pageY - docTop, 0);

                            if (totalWidth > docWidth) {
                                left = left - (totalWidth - docWidth);
                            }

                            if (totalHeight > docHeight) {
                                top = top - (totalHeight - docHeight);
                            }

                            actionMenuEle.css('top', top + 'px');
                            actionMenuEle.css('left', left + 'px');
                            actionMenuEle.css({ "display": "block" });

                            MENU_OPEN = true;

                            $rootScope.$emit(commonUiEvent.nbGridDropdownToggle, actionMenuEle[0].id);

                            $("#grid-empty-context-menu-dropdown-" + GRID_ID).hide();
                        })
                    }

                    function close(actionMenuEle) {
                        actionMenuEle.css({ "display": "none" });
                        MENU_OPEN = false;
                        CURRENT_ACTION_BTN = null;
                    }

                    function handleClickEvent(event) {
                        $timeout(function () {
                            var actionMenuEle = $("#row-context-menu-dropdown-" + GRID_ID);
                            if (MENU_OPEN && $(event.target).closest(CURRENT_ACTION_BTN).length === 0) {
                                close(actionMenuEle);
                            }
                        })
                    }

                    function appendContextMenuDropdown(gridId, scope) {
                        scope.rowContextMenuList = [];
                        var atagString = atag ? 'atag = "' + atag + ':contextMenu"' : "";
                        var template = '<ul ' + atagString + ' ng-show="rowContextMenuList.length>0" id="row-context-menu-dropdown-' + gridId + '" ' +
                            'class="dropdown-menu nb-grid-context-menu-dropdown" uib-dropdown-menu>' +
                            '<li ng-click="callContextMenuDropdown(item, $event)"  ng-class="item.class" ' +
                            'ng-repeat="item in rowContextMenuList" ng-hide="item.hide">' +
                            '<a ng-bind-html="::renderTemplate(item.template)"></a>' +
                            '</li>' +
                            '</ul>';
                        var element = $compile(template)(scope);
                        angular.element(document.body).append(element);
                    }


                }
            }
        }
    }

})(window.NetBrain);