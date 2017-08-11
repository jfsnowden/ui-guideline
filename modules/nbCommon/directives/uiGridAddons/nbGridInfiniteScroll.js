;(function(NetBrain){
    angular.module('nb.common').directive('nbGridInfiniteScroll', NbGridInfiniteScroll);

    NbGridInfiniteScroll.$inject = ['$timeout'];
    function NbGridInfiniteScroll($timeout) {
        var directive = {
            restrict: 'A',
            scope: false,
            require: '?uiGrid',
            compile: compile
        };

        function compile(){
            return {
                pre: function(scope, ele, attr, uiGridCtrl){
                    var options = uiGridCtrl.grid.options;
                    var type = typeof options.enableGridInfiniteScroll;
                    if(type === 'object' || type === 'function'){
                        options.infiniteScrollDown = true;
                        options.infiniteScrollRowsFromEnd = type === 'object' ?
                            options.enableGridInfiniteScroll.offset || 20 : 20;
                    }
                },
                post: function(scope, ele, attr, uiGridCtrl){
                    var gridApi = uiGridCtrl.grid.api;
                    var options = uiGridCtrl.grid.options;
                    var appScope = uiGridCtrl.grid.appScope;
                    var type = typeof options.enableGridInfiniteScroll;

                    if (type === 'object' || type === 'function') {
                        var callback = type === 'object' ?
                            options.enableGridInfiniteScroll.loadCallback || null
                            : options.enableGridInfiniteScroll;
                        var isNeedMore =  type === 'object' ? 
                            options.enableGridInfiniteScroll.isNeedMore || function(){return true} 
                            : function(){return true};

                        gridApi.infiniteScroll.on.needLoadMoreData(appScope, loadedCallback);

                        function loadedCallback(event) {
                            gridApi.infiniteScroll.saveScrollPercentage();
                            if (!_.isFunction(callback)) return;

                            callback(uiGridCtrl.grid, event).then(function () {
                                $timeout(function () {
                                    gridApi.infiniteScroll.dataLoaded(false, isNeedMore(uiGridCtrl.grid, event)).then(function(){
                                        doAutoSorting(options, gridApi);
                                        doAutoFiltering(options, gridApi);
                                    });
                                });
                            })
                        }

                        function doAutoSorting(options, gridApi){
                            if(options.useExternalSorting === true
                                && options.enableGridInfiniteScroll.autoSortAfterLoaded !== false){
                                var cols = gridApi.grid.getColumnSorting();
                                if(cols && cols.length > 0){
                                    _.each(cols, function(col){
                                        if(col.sort)
                                            gridApi.grid.sortColumn(col, col.sort.direction)
                                    })

                                }
                            }
                        }

                        function doAutoFiltering(options, gridApi) {
                            if(options.useExternalFiltering === true
                                && options.enableGridInfiniteScroll.autoFilteAfterLoaded !== false){
                                gridApi.core.raise.filterChanged();
                            }
                        }
                    }
                }
            }
        }
        return directive;
    }
})(window.NetBrain);