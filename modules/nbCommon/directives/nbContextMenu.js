(function() {
    angular.module('nb.common').directive('nbContextMenu', NbContextMenu);

    NbContextMenu.$inject = [
        '$rootScope', '$compile', '$sce', '$log', '$document', '$timeout',
        'nb.ng.utilitySrvc'
    ];

    function NbContextMenu(
        $rootScope, $compile, $sce, $log, $document, $timeout,
        utilitySrvc
    ) {
        var directive = {
            restrict: 'A',
            scope: {
                data: '=nbContextMenuData',
                key: '=nbContextMenuKey',
                getMenuItems: '&nbContextMenu'
            },
            link: postHandler
        };

        return directive;

        function postHandler(scope, ele) { // , attr, ctrl
            var localScope =
                scope.localScope = {};

            var menuId = NgUtil.getGUID(); // '$$_nb-context-menu';
            var menu = null;

            localScope.renderTemplate = renderTemplateHandler;
            localScope.doAction = doActionHandler;
            localScope.rendMenuItem = rendMenuItemHandler;

            bindMenus();

            return undefined;

            function bindMenus() {
                var eventName = scope.key === 'left' ? 'click' : 'contextmenu';
                $(ele).on(eventName, function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $timeout(function() {
                        open(event);
                    });
                });
            }

            function doActionHandler(item, event) {
                if (angular.isFunction(item.action)) {
                    item.action(scope.data, event);
                }
            }

            function rendMenuItemHandler(isLast) {
                if (isLast) {
                    $timeout(function() {
                        var defaultPosition = {
                            left: localScope.event.pageX,
                            top: localScope.event.pageY
                        };
                        utilitySrvc.setMenuPosition(menu, defaultPosition);
                    });
                }
            }

            function renderTemplateHandler(template) {
                return $sce.trustAs('html', template);
            }

            function open(event) {
                if (!menu) {
                    appendContextMenuDropdown();
                    bindCloseChecker();
                }

                doOpen(event);
            }

            function bindCloseChecker() {
                $document.bind('click', menuCloseChecker);
                $document.bind('contextmenu', menuCloseChecker);

                scope.cancelOtherMenuShowWatcher = $rootScope.$on(
                    'system::menushow',
                    function(event, data) {
                        if (data.menuId !== menu.id) {
                            close();
                        }
                    }
                );
            }

            function doOpen(event) {
                localScope.contextMenuItems = scope.getMenuItems(); // 一次获取还是每次获取？？？
                if (localScope.contextMenuItems.length < 1) {
                    return;
                }

                $rootScope.$broadcast('system::menushow', {
                    menuId: menuId
                });

                localScope.event = event;
                menu.show();
            }

            function close() {
                removeCloseChecker();
                menu.remove();
                menu = null;
            }

            function removeCloseChecker() {
                $document.unbind('click', menuCloseChecker);
                $document.unbind('contextmenu', menuCloseChecker);
                scope.cancelOtherMenuShowWatcher();
            }

            function menuCloseChecker() {
                close();
            }

            function appendContextMenuDropdown() {
                var template = '<ul id="' + menuId + '" class="dropdown-menu" uib-dropdown-menu' +
                    '     ng-show="localScope.contextMenuItems.length>1">' +
                    '     <li ng-class="item.class" ng-click="localScope.doAction(item, $event)" ng-repeat="item in localScope.contextMenuItems" ng-init="localScope.rendMenuItem($last)">' +
                    '       <a ng-bind-html="localScope.renderTemplate(item.template)"></a>' +
                    '    </li>' +
                    '</ul>';
                menu = $compile(template)(scope);
                menu.id = menuId;
                angular.element(document.body).append(menu);
            }
        }
    }
})(NetBrain);
