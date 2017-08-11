;
(function(netBrain) {

    netBrain.nbCommon
        .directive('nbGridRowDblClick', NbGridRowDblClick);

    NbGridRowDblClick.$inject = ['$rootScope'];

    function NbGridRowDblClick($rootScope) {
        return {
            restrict: 'A',
            scope: false,
            require: '?uiGrid',
            link: link
        };

        // return void(0);


        function link(scope, element, attr) {
            var callback = getCallback();
            if (angular.isFunction(callback)) {
                element.dblclick(dblClickHandler);
            }

            return void(0);


            function dblClickHandler(event) {
                event.preventDefault();
                // event.stopPropagation();
                $rootScope.$emit(commonUiEvent.nbGridDropdownToggle);

                var entity = getEntity(event.target);
                if (entity) {
                    callback(scope, entity, event);
                }                
            }

            function getCallback() {
                var callback;
                var parentScope = scope;
                var attrName = attr.nbGridRowDblClick;

                while (!callback && parentScope) {
                    callback = parentScope[attrName];
                    parentScope = parentScope.$parent;
                }

                return callback;
            }

            function getEntity(eventTarget) {
                var rowScope = getRowScope(eventTarget);
                return rowScope && rowScope.row.entity;
            }

            function getRowScope(eventTarget) {
                var rowElement = getRowElement(eventTarget);
                return angular.element(rowElement).scope();
            }

            function getRowElement(eventTarget) {
                var $ele = $(eventTarget);
                return $ele.hasClass('ui-grid-row') ?
                    eventTarget :
                    $ele.closest('.ui-grid-row').get(0);
            }
        }
    }
})(NetBrain);