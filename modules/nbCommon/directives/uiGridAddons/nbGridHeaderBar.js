; (function (NetBrain) {
    angular.module('nb.common').directive('nbGridHeaderBar', NbGridHeaderBar);

    NbGridHeaderBar.$inject = ['$compile'];

    function NbGridHeaderBar($compile) {
        var directive = {
            restrict: 'A',
            scope: false,
            require: '?uiGrid',
            compile: compile
        }

        function compile() {
            return {
                pre: function (scope, ele, attr, uiGridCtrl) {
                    var enableHeaderBar = uiGridCtrl.grid.options.enableHeaderBar;
                    var enableHeaderSearchBar = uiGridCtrl.grid.options.enableHeaderSearchBar;

                    if (enableHeaderBar) {
                        var template = '<nb-grid-header-bar-directive></nb-grid-header-bar-directive>';
                        var headerEle = $compile(template)(uiGridCtrl.grid.appScope);
                        $(ele).before(headerEle);
                        if (attr.nbGridHeaderBar === 'full') {
                            $(ele).css({
                                height: '100%'
                            });
                        } else {
                            $(ele).css({
                                height: 'calc(100% - 35px)'
                            });
                        }

                        if (enableHeaderSearchBar) {
                            uiGridCtrl.grid.gridSearchStr = '';

                            angular.forEach(uiGridCtrl.grid.options.columnDefs, function (column) {
                                if (!column.cellTemplate) {
                                    column.cellTemplate = '<div class="ui-grid-cell-contents" ng-attr-title="{{COL_FIELD}}" ng-bind-html="COL_FIELD | nbGridHighlighter: grid.gridSearchStr"></div>'
                                } else {
                                    column.isCustomizedTemplate = true;
                                }
                            })
                        }
                    }
                }
            }
        }

        return directive;
    }

    /**
    * Nb Grid Header Bar Directive
    */
    angular.module('nb.common').directive('nbGridHeaderBarDirective', NbGridHeaderBarDirective);

    NbGridHeaderBarDirective.$inject = ['$sce', '$filter', '$timeout'];

    function NbGridHeaderBarDirective($sce, $filter, $timeout) {
        var directive = {
            restrict: 'EA',
            scope: true,
            replace: true,
            templateUrl: 'modules/nbCommon/views/nbGridHeaderBarDirective.html',
            compile: compile,
            controller: Controller
        }

        function compile() {
            return {
                pre: function (scope, ele, attr) {
                    var options = scope.gridApi.grid.options;
                    scope.leftBtnGroup = [];
                    scope.rightBtnGroup = [];
                    scope.dropdownMenu = [];
                    scope.selectDropdownOptions = null;
                    scope.isSearchBarShow = false;
                    scope.isDropdownShow = false;
                    scope.searchIcon = options.headerSearchIcon || '<i class="icon_nb_filter"></i>';
                    scope.closeIcon = options.headerSearchCloseIcon;
                    scope.searchPlaceHolder = options.headerSearchPlaceHolder || 'Filter...';

                    if (_.isArray(options.headerBarBtnsOnLeft)) {
                        scope.leftBtnGroup = scope.leftBtnGroup.concat(options.headerBarBtnsOnLeft);
                    }
                    if (_.isArray(options.headerBarBtnsOnRight)) {
                        scope.rightBtnGroup = scope.rightBtnGroup.concat(options.headerBarBtnsOnRight);
                    }
                    if (options.enableHeaderSearchBar === undefined
                        || options.enableHeaderSearchBar === true
                        || typeof options.enableHeaderSearchBar === 'function') {
                        scope.isSearchBarShow = true;
                    }
                    if (options.enableHeaderDropdown === true) {
                        scope.isDropdownShow = true;
                    }
                },
                post: function (scope, ele, attr, uiGridCtrl) {
                    var options = scope.gridApi.grid.options;
                    if (scope.isSearchBarShow) {
                        $(ele).find('input[ng-model="searchStr"]').on('keyup', function (event) {
                            $timeout(function () {
                                if (event.keyCode === 13) {
                                    scope.gridApi.grid.gridSearchStr = scope.searchStr;
                                    scope.onSearch();
                                } else if (!scope.gridApi.grid.options.disableFilter) {
                                    scope.gridApi.grid.gridSearchStr = scope.searchStr;
                                    $filter('nbGridDefaultFilter')(scope.gridApi.grid.rows, scope.searchStr, scope.gridApi.grid);
                                }
                            })
                        })
                    }
                    scope.updateDropdownMenu(options, true);
                    scope.gridApi.selection.on.rowSelectionChanged(scope, function (row, event) {
                        scope.updateDropdownMenu(options, false, event);
                    })
                }
            }

        }


        function Controller($scope) {
            var self = $scope;
            self.searchStr = '';
            self.showInputIcon = true;
            self.updateDropdownMenu = function (gridOptions, isSetSelected, event) {
                if (!_.isUndefined(gridOptions.headerDropdownMenu)) {
                    if (_.isArray(gridOptions.headerDropdownMenu)) {
                        self.dropdownMenu = gridOptions.headerDropdownMenu;
                    } else if (_.isFunction(gridOptions.headerDropdownMenu)) {
                        var userDropdownMenu = gridOptions.headerDropdownMenu(
                            self.gridApi.selection.getSelectedRows(),
                            self.gridApi.grid,
                            event
                        );
                        self.dropdownMenu = _.isArray(userDropdownMenu) ?
                            userDropdownMenu : [];
                    }
                    if (!!isSetSelected)
                        self.selectDropdownOptions = self.dropdownMenu[0];
                }
            };
            self.renderHtml = function (html) {
                if (html !== undefined && html.indexOf("<") < 0) {
                    html = "</label>" + html + "</label>";
                }
                return $sce.trustAs('html', html);
            };
            self.callDropdownAction = function (item, event) {
                if (typeof item.action === 'function') {
                    self.selectDropdownOptions = item;
                    item.action(self.gridApi.selection.getSelectedRows(), self.gridApi.grid, event);
                }
            };
            self.callBtnAction = function (item, event) {
                if (typeof item.action === 'function') {
                    item.action(self.gridApi.selection.getSelectedRows(), self.gridApi.grid, event);
                }
            };
            self.checkBtnDisplay = function (item, event) {
                if (typeof item.isDisplay === 'function') {
                    return item.isDisplay(self.gridApi.selection.getSelectedRows(), self.gridApi.grid, event);
                } else if (typeof item.isDisplay === 'boolean') {
                    return item.isDisplay;
                } else {
                    return true;
                }
            };
            self.onSearch = function () {
                var options = self.gridApi.grid.options;
                if (!(self.$parent.$parent || self.$parent.$parent.isTUNE)) {
                    self.searchStr = '';
                }

                if (_.isFunction(options.enableHeaderSearchBar)) {
                    options.enableHeaderSearchBar(self.gridApi.grid);
                } else {
                    $filter('nbGridDefaultSearch')(self.gridApi.grid.rows, self.searchStr);
                }
                self.gridApi.core.queueGridRefresh();
            };
            self.stopSearch = function () {
                var options = self.gridApi.grid.options;
                self.searchStr = '';
                if (_.isFunction(options.stopSearch)) {
                    options.stopSearch(self.gridApi.grid);
                }
            };
        }

        return directive;
    }
})(window.NetBrain);