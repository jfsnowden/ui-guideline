/*
     * serach ace
     * */
    angular.module("nb.common").directive('nbSearchAce',[function(){
        return {
            restrict: 'E',
            templateUrl: 'modules/nbCommon/views/searchAce.html',
            replace: true,
            scope: {
                searchText: '=',
                searchAction: '&',
                prevAction: '&',
                nextAction: '&'
            },
            link: function (scope, ele, attr) {
                // scope.$watch('userInputSearchText', function (newVal, oldVal, scope) {
                //     if (newVal == oldVal) {
                //         return;
                //     }
                //     scope.onSeach();
                // });

                // ele.find('.form-control').on('focus', function () {
                //     scope.onSeach();
                // });
                scope.onSearch = function() {
                    scope.searchText = scope.userInputSearchText;
                    if (scope.searchAction && typeof scope.searchAction == 'function') {
                        scope.searchAction();
                    }
                };
                scope.onClear = function() {
                    scope.userInputSearchText = '';
                    scope.searchText = '';
                    if (scope.searchAction && typeof scope.searchAction == 'function') {
                        scope.searchAction();
                    }
                };
            }
        }
    }]);