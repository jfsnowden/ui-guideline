/**
 * Created by yaoningning on 2016/9/12.
 */
(function (NetBrain) {
    'use strict';
    angular.module('nb.common').controller('nb.common.nbSelectQappModalCtrl', nbSelectQappModalCtrl);

    nbSelectQappModalCtrl.$inject = ['$scope', '$timeout', '$uibModalInstance', 'nb.ng.nbHttp', 'options'];

    function nbSelectQappModalCtrl($scope, $timeout, $uibModalInstance, nbHttp, options) {
        $scope.filterOption = {
            filterWord: ''
        };

        $scope.options = angular.extend({}, {
            title: 'Select Qapp',
            delay: false
        }, options || {});
        /*
         * set icon of tree node
         */
        function setIconOfTreeNode(node, trvw) {
            return trvw.isLeaf(node) && node.isQapp ?
                '<i class="qapp-icon-12"></i>' :
                '<i class="icon_nb_folder"></i>';
        }

        /*
         * format tree data
         * */
        function formatTreeData(formatSource, state) {
            var copySource;
            if (!angular.isArray(formatSource)) {
                return formatSource;
            }
            var setChildren = function (parent, source) {
                if (angular.isArray(parent)) {
                    angular.forEach(parent,
                        function (parentVal, parentKey) {
                            parentVal.children = _.filter(copySource, {
                                parentId: parentVal.id
                            });
                            if (parentVal.children.length > 0) {
                                if (state) {
                                    $timeout(function(){
                                        parentVal.expended = true;
                                    },300)

                                }
                                parentVal.children = _.sortBy(parentVal.children, function(item){
                                    return item.name.toLowerCase();
                                });
                                setChildren(parentVal.children, source);
                            } else {
                                parentVal.children = [];
                                return;
                            }
                        });
                } else {
                    parent.children = _.filter(copySource, {
                        parentId: parent.id
                    });

                    if (parent.children.length > 0) {
                        if (state) {
                            $timeout(function(){
                                parent.expended = true;
                            },300)
                        }
                        parent.children = _.sortBy(parent.children, 'id');
                        setChildren(parent.children, source);
                    } else {
                        parent.children = [];
                        return;
                    }
                }
            };

            var result = [];
            copySource=angular.copy(formatSource);

            var root = _.find(copySource,
                function (item) {
                    return item.parentId === null;
                });
            if(!!root){
                setChildren(root, formatSource);
                result = result.concat(root);
            }
            return result;
        }


        /*
         * get tree data
         * */
        function getTreeData() {
            $scope.treeDataLoaded = false;
            var promise = nbHttp.get("qapp/qappcategory/qappCategoryTree/false",null,{avoidBlockUI:$scope.options.delay});
            promise.then(function (data) {
                $scope.treeDataLoaded = true;
                if (!!data) {
                    $scope.treeDataSource = data;
                    $scope.treeData = formatTreeData(data);
                } else {
                    $scope.treeDataSource = [];
                    $scope.treeData = [];
                    $scope.selectedTreeNode = {};
                }
            });
        }

        getTreeData();

        /*
         * node click callback
         * */
        function nodeClickCallback(node, trvw) {
            $scope.selectedTreeNode = node;
        }

        function escape(str) {
            if(str) {
                return str.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
            }

            return str;
        }

        /*
         * init tree option
         * */
        $scope.treeOption = angular.extend({},{
            validate: true,
            expandToDepth: 2,
            idAttribute: 'id',
            parentIdAttribute: 'parentId',
            enableTwoWayBinding: false,
            labelAttribute: 'name',
            childrenAttribute: 'children',
            expandedAttribute: 'expended',
            enableLabelExpand: false,
            iconTemplate: setIconOfTreeNode,
            labelTemplate: function (node) {
                var reg = new RegExp(escape($scope.filterOption.filterWord), 'gi');
                return node.name.replace(reg, function (match) {
                    return '<i class="filter-highlight">' + match + '</i>';
                });
            },
            nodeClickCallback: nodeClickCallback
        }, options || {});

        $scope.setSelectedTree = function () {
            if ($scope.selectedTreeNode != null && $scope.selectedTreeNode.isQapp) {
                $uibModalInstance.close($scope.selectedTreeNode);
            }
        };

        $scope.closeModal = function () {
            $uibModalInstance.dismiss();
        };

        $scope.filterData = function (params) {
            if(params.clear){
                $scope.filterOption.filterWord = '';
            }
            if(!!$scope.treeDataSource && angular.isArray($scope.treeDataSource)) {
                $scope.treeData = formatTreeData(filterNode($scope.treeDataSource, $scope.filterOption.filterWord), true);
                if ($scope.treeData.length > 0) {
                    $timeout(function () {
                        nodeClickCallback($scope.treeData[0]);
                    }, 100);
                }
            }
        };

        function filterNode(dataSource, keyword) {
            var result = [];
            var nodeMatch = false;
            dataSource.forEach(function (node) {
                if (!node.children || (angular.isArray(node.children) && node.children.length === 0)) {
                    if (keyword) {
                        nodeMatch = node.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1;
                    } else {
                        nodeMatch = true;
                    }
                    if(nodeMatch && result.indexOf(node) < 0){
                        result.push(node);
                        addNodeParent(node, result);
                    }
                }
            }, this);
            return result;
        };

        function addNodeParent(node, source) {
            if(!!node.parentId){
                var parentNode = _.filter($scope.treeDataSource, {id: node.parentId});
                if(!!parentNode && parentNode[0]){
                    if(source.indexOf(parentNode[0]) === -1){
                        parentNode[0].expended = true;
                        source.push(parentNode[0]);
                        addNodeParent(parentNode[0], source);
                    }
                }
            }
        }
    }

})(NetBrain);