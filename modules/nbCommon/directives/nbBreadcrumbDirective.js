(function() {
    'use strict';

    angular.module('nb.common').directive('nbBreadcrumbDirective', [
        function() {
            return {
                restrict: 'EA',
                scope: {
                    id: '@',
                    folderClicked: '&',
                    val: '='
                },
                template: '<ul class="breadcrumb">' +
                    '<li style="float: left; cursor: pointer;margin:-1px 10px 0px -10px;" ng-if="showTopNav">' +
                    '<span class="dropdown divider">' +
                    '<div class="dropdown-toggle" data-toggle="dropdown">' +
                    '<img src="img/Assets/Left_Double_Arrows_20x20.png"/>' +
                    '</div>' +
                    '<ul class="dropdown-menu" uib-dropdown-menu>' +
                    '<li ng-repeat="f in displayNavMenu">' +
                    '<a ng-if="0 == f.nodeType" ng-click="selectBreadcrumbNode(f)">{{f.name}}</a>' +
                    '</li>' +
                    '</ul>' +
                    '</span>' +
                    '</li>' +
                    '<li style="float: left; cursor: pointer;" ng-repeat="folder in displayFolders">' +
                    '<a ng-click="selectBreadcrumbNode(folder)" ng-attr-title="{{folder.name}}" style="float: left; cursor: pointer;max-width:90px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;">' +
                    '{{folder.name}}' +
                    '</a>' +
                    '<span class="dropdown divider" ng-if="toggleArrow(folder)">' +
                    '<div class="dropdown-toggle" data-toggle="dropdown" >' +
                    '<img src="img/Assets/Right_Arrow_Blue_10x20.png"/>' +
                    '</div>' +
                    '<ul class="dropdown-menu" uib-dropdown-menu>' +
                    '<li ng-repeat=\'f in folder.child\'>' +
                    '<a ng-if="0 == f.nodeType" ng-click="selectBreadcrumbNode(f)" ng-style="{fontWeight: (f.ID === displayFolders[$parent.$parent.$index+1].ID) ? \'bold\' : \'normal\'}">' +
                    '{{f.name}}' +
                    '</a>' +
                    '</li>' +
                    '</ul>' +
                    '</span>' +
                    '</li>' +
                    '</ul>',
                replace: true,
                compile: function() { // tElement, tAttrs
                    return function($scope, $elem, $attr) {
                        $scope.folderLevel = 0;

                        $scope.displayFolderLevel = $attr.displayFolderLevel || 2;

                        $scope.showTopNav = false;

                        $scope.displayFolders = [];

                        $scope.displayNavMenu = [];

                        $scope.selectBreadcrumbNode = function(obj) {
                            $scope.folderClicked({ obj: obj });
                        };

                        $scope.toggleArrow = function(folder) {
                            if (folder.child) {
                                for (var i = 0; i < folder.child.length; i++) {
                                    if (folder.child[i].nodeType === 0) {
                                        return true;
                                    }
                                }
                            }

                            return false;
                        };

                        $scope.$watch('val', function(value) {
                            if (value === undefined) {
                                return;
                            }

                            $scope.folderLevel = value.length;

                            $scope.displayFolders = [];
                            $scope.displayNavMenu = [];

                            if ($scope.folderLevel <= $scope.displayFolderLevel) {
                                $scope.showTopNav = false;
                                $scope.displayFolders = value;
                            } else {
                                $scope.showTopNav = true;
                                for (var i = $scope.displayFolderLevel; i--;) {
                                    $scope.displayFolders.push(value[value.length - i - 1]);
                                }
                                for (var j = value.length - $scope.displayFolderLevel; j--;) {
                                    $scope.displayNavMenu.push(value[j]);
                                }
                            }
                        });
                    };
                }
            };
        }
    ]);
})(NetBrain);
