(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.gridCtrl', GridCtrl);

    GridCtrl.$inject = ['$http', '$scope'];
    function GridCtrl($http, $scope){
        var self = this;
        $scope.data = [];
        self.gridOptions = {
            data: 'data',
            columnDefs: [
                { field: 'name'},
                { field: 'gender'},
                { field: 'age'},
                { field: 'email'},
                { field: 'phone'},
                { field: 'company'}
            ],
            enableHeaderBar: true,
            enableHeaderSearchBar: true,
            headerSearchCloseIcon: '<i class="icon_nb_close" style="margin-right:5px;"></i>',
            headerBarBtnsOnRight: [
                {
                    template: '<i class="icon_nb_refresh icon-font-button"></i> Refresh',
                    isDisplay: true,
                    action: function (rows, grid, event) { /* ... */}
                }
            ],
            headerBarBtnsOnLeft: [
                {
                    template: '<i class="icon_nb_add icon-font-button"></i><label>Add</label>',
                    isDisplay: true,
                    action: function (rows, grid, event) { /* ... */}
                },
                {
                    template: '<i class="user-group-icon"></i><label>Group</label>',
                    isDisplay: function(rows, grid, event){ return rows.length > 1 },
                    action: function (rows, grid, event) { /* ... */}
                },
                {
                    template: '<i class="open-in-dashboard"></i><label>Open</label>',
                    isDisplay: function(rows, grid, event){ return rows.length === 1 },
                    action: function (rows, grid, event) { /* ... */}
                },
                {
                    template: '<i class="icon_nb_edit"></i><label>Edit</label>',
                    isDisplay: function(rows, grid, event){ return rows.length === 1 },
                    action: function (rows, grid, event) { /* ... */}
                }
            ],
            enableRowActionMenu: true,
            rowActionMenuItems: function (rows, grid, event) {
                return [
                    { template: 'Open', action: function (rows, grid, event) { /* ... */ } },
                    { template: 'Move', action: function (rows, grid, event) { /* ... */ } },
                    { template: 'Edit', action: function (rows, grid, event) { /* ... */ } },
                    { template: 'Delete', action: function (rows, grid, event) { /* ... */ } },
                ]
            },
            enableRowContextMenu: true,
            rowContextMenuItems: function (rows, grid, event) {
                return [
                    { template: 'Group', action: function (rows, grid, event) { /* ... */ } },
                    { template: 'Delete', action: function (rows, grid, event) { /* ... */ } }
                ]
            }
        }

        getFakeData();
        function getFakeData(){
            $http.get('/ui-guideline/fakeData.json').then(function(result){
                $scope.data = result.data;
            })
        }
    }
})(NetBrain)