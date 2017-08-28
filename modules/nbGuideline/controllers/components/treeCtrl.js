(function(NetBrain){
    angular.module('nb.guideline').controller('nb.guideline.treeCtrl', TreeCtrl);

    TreeCtrl.$inject = ['$http', '$q'];
    function TreeCtrl($http, $q){
        var self = this;

        self.treeData = {};
        self.treeviewOptions = {
            expandToDepth: 1,
            labelAttribute: 'label',
            idAttribute: '_id',
            childrenAttribute: 'children',
            expandedAttribute: 'expanded',
            selectedAttribute: 'selected',
            editableAttribute: 'editable',
            enableMultipleSelect: true,
            enableSearchBar: {
                placeholder: 'Search...',
                method: 'submit',
                action: function(query){
                    query = query.toLowerCase();
                    var results = [];
                    function loop(root){
                        if(root.children && root.children.length > 0){
                            _.each(root.children, loop)
                        }else{
                            if(root.type === 'employee'
                                && root.label.toLowerCase().indexOf(query) >= 0)
                                results.push(root);
                        }
                    }

                    loop(self.treeData);
                    return results;
                }
            },
            iconTemplate: function (node, trvw) {
                return node.type <= 'department' ?
                    '<div class="icon_nb_folder"></div>' : '<div class="icon_nb_user"></div>';
            },
            nodeClickCallback: function (node, trvw) { /* ... */ },
            enableNodeDropdown: {
                isDisplay: true,
                dropdownItems: function (node, trvw) {
                    switch (node.type){
                        case 'employee': return [
                            { template: "View Profile", action: function (node, trvw, event) { /* ... */ } },
                            { template: "Edit", action: function (node, trvw, event) { node.editable = true } },
                        ];
                        case 'department': return [
                            { template: "Edit", action: function (node, trvw, event) { node.editable = true } }
                        ];
                    }
                }
            },
            editableCallback: function (node, trvw, text, event) {
                node.label = text;
                node.editable = false;
                return $q.resolve(true); //should return a promise
            }
        };

        getFakeTree();
        function getFakeTree(){
            $http.get('/ui-guideline/fakeTree.json').then(function (result) {
                self.treeData = result.data;
            })
        }
    }
})(NetBrain)