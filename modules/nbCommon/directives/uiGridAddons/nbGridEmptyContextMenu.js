(function(netBrain) {
    netBrain.nbCommon.directive('nbGridEmptyContextMenu', NbGridEmptyContextMenu);

    NbGridEmptyContextMenu.$inject = [
        '$rootScope', '$compile', '$sce', '$document', '$timeout',
        'nb.ng.utilitySrvc'
    ];

    function NbGridEmptyContextMenu(
        $rootScope, $compile, $sce, $document, $timeout,
        utilitySrvc
    ) {
        return {
            restrict: 'A',
            scope: false,
            require: '?uiGrid',
            link: postHandler
        };

        function postHandler(scope, ele, attr, uiGridCtrl) {
            var grid = uiGridCtrl.grid;
            var atag = attr.atag;

            if (!grid.options.enableEmptyContextMenu) {
                return undefined;
            }

            var localScope =
                scope.localScope = {};

            var menuId = 'grid-empty-context-menu-dropdown-' + grid.id;
            var menu = null;

            localScope.renderTemplate = renderTemplateHandler;
            localScope.doAction = doActionHandler;

            appendContextMenuDropdown();
            appendEmptyElement();
            bindCloseChecker();

            return undefined;

            function appendEmptyElement() {
                $timeout(function() {
                    var gridCanvas = $(ele).find('.ui-grid-canvas');

                    var parent = gridCanvas.parent()
                        .addClass('grid-with-empty-context');

                    parent.on('contextmenu', openEmptyContextMenus);
                    addEmptyCanvas(parent);
                });
            }

            function openEmptyContextMenus(event) {
                var nodeClassList = event.target.classList;
                if (_.contains(nodeClassList, 'ui-grid-viewport')) {
                    event.preventDefault();
                    event.stopPropagation();
                    open(event);
                }
            }

            function addEmptyCanvas(parent) {
                parent.css('padding-bottom', '40px');
            }

            function doActionHandler(item, event) {
                if (angular.isFunction(item.action)) {
                    item.action(grid, event);
                }
            }

            function renderTemplateHandler(template) {
                return $sce.trustAs('html', template);
            }

            function open(event) {
                localScope.emptyContextMenuItems = grid.options.emptyContextMenuItems();

                var defaultPosition = {
                    left: event.pageX,
                    top: event.pageY
                };

                $rootScope.$broadcast('system::menushow', {
                    menuId: menuId
                });

                $timeout(function() {
                    menu.show();
                    grid.api.selection.clearSelectedRows();
                });
                $timeout(function() {
                    utilitySrvc.setMenuPosition(menu, defaultPosition);
                });

                $('#row-context-menu-dropdown-' + grid.id).hide();
            }

            function close() {
                menu.hide();
            }

            function bindCloseChecker() {
                $document.bind('click', menuCloseChecker);
                $document.bind('contextmenu', menuCloseChecker);

                var cancelOtherMenuShowWatcher = $rootScope.$on(
                    'system::menushow',
                    function(event, data) {
                        if (data.menuId !== menu.id) {
                            close();
                        }
                    }
                );

                scope.$on('$destroy', function() {
                    $document.unbind('click', menuCloseChecker);
                    $document.unbind('contextmenu', menuCloseChecker);

                    cancelOtherMenuShowWatcher();

                    menu.remove();
                });
            }

            function menuCloseChecker() {
                close();
            }

            function appendContextMenuDropdown() {
                var atagString = atag ? 'atag = "' + atag + ':emptyContextMenu"' : '';
                var template = '<ul ' + atagString + ' id="' + menuId + '"' +
                    'class="dropdown-menu nb-grid-empty-context-menu-dropdown" uib-dropdown-menu' +
                    'ng-show="localScope.emptyContextMenuItems.length>1">' +
                    '<li ng-click="localScope.doAction(item, $event)" ng-class="item.class" ng-repeat="item in localScope.emptyContextMenuItems">' +
                    '<a ng-bind-html="localScope.renderTemplate(item.template)"></a>' +
                    '</li>' +
                    '</ul>';
                menu = $compile(template)(scope);
                menu.id = menuId;
                angular.element(document.body).append(menu);
            }
        }
    }
})(NetBrain);
