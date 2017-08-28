(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.dropdownCtrl', DropdownCtrl);

    DropdownCtrl.$inject = ['$http'];
    function DropdownCtrl($http){
        var self = this;

        self.basicDropdownSelectedItem = 2;
        self.basicDropdownItems = [
            { value: 1, label: 'Boston' },
            { value: 2, label: 'Beijing' },
            { value: 3, label: 'New York' },
            { value: 4, label: 'Sacramento' },
            { value: 5, label: 'Munich' }
        ]

        self.onBasicDropdownChange = function(){
            // ...
        }

        self.dropdownTreeData ={};

        self.dropdownTreeOptions = {
            expandToDepth: 1,
            labelAttribute: 'label',
            idAttribute: '_id',
            childrenAttribute: 'children',
            expandedAttribute: 'expanded',
            selectedAttribute: 'selected',
            enableMultipleSelect: true,
            iconTemplate: function (node, trvw) {
                return node.type <= 'department' ?
                    '<div class="icon_nb_folder"></div>' : '<div class="icon_nb_user"></div>';
            },
            nodeClickCallback: function (node, trvw) { /* ... */ }
        };

        getFakeTree();
        function getFakeTree(){
            $http.get('/ui-guideline/fakeTree.json').then(function (result) {
                self.dropdownTreeData = result.data;
            })
        }
    }
})(NetBrain)