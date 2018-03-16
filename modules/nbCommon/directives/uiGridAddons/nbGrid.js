(function () {
    angular.module('nb.common').directive('nbGrid', NbGrid);

    NbGrid.$inject = [];

    function NbGrid() {
        var directive = {
            restrict: 'A',
            scope: false,
            compile: compile,
            require: '?uiGrid',
            priority: 0
        };

        function compile() {
            return {
                pre: function (scope, ele, attrs, uiGridCtrl) {
                    uiGridCtrl.grid.options = angular.extend(
                        {
                            enableSelectionBatchEvent: false,
                            enableFullRowSelection: true,
                            enableRowHeaderSelection: false,
                            enableGridMenu: false,
                            modifierKeysToMultiSelect: true,
                            enableColumnResizing: true,

                            // for performance concerns
                            flatEntityAccess: uiGridCtrl.grid.options.flatEntityAccess !== undefined ?
                                uiGridCtrl.grid.options.flatEntityAccess : true,
                            fastWatch: uiGridCtrl.grid.options.fastWatch !== undefined ?
                                uiGridCtrl.grid.options.fastWatch : true
                        },
                        uiGridCtrl.grid.options,
                        {
                            enableColumnMenus: false
                        }
                    );

                    _.each(uiGridCtrl.grid.options.columnDefs || [], function (def) {
                        if (!def.width) {
                            def.width = '*';
                        }

                        if (!def.minWidth) {
                            def.minWidth = 80;
                        }

                        if (!def.maxWidth) {
                            def.maxWidth = 600;
                        }
                    });

                    var enableHeaderBar = uiGridCtrl.grid.options.enableHeaderBar;
                    $(ele).css({
                        width: '100%'
                    });
                    if (!enableHeaderBar) {
                        $(ele).css({
                            height: '100%'
                        });
                    }
                    $(ele).bind('mousedown', function (event) { // fixed a shift for multi-select issue in IE11 on Windows 2012 ENG-10178
                        event.shiftKey && event.preventDefault();
                    });
                },
                post: function (scope, ele, attr, uiGridCtrl) {
                    if (!uiGridCtrl.grid.appScope.gridApi) {
                        uiGridCtrl.grid.appScope.gridApi = uiGridCtrl.grid.api;
                    }
                }
            };
        }

        return directive;
    }
})(NetBrain);
