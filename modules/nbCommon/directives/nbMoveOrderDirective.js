(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbMoveOrderDirective', [
        '$log', '$window', function($log, $window) {
            return {
                restrict: 'E',
                templateUrl: "modules/nbCommon/views/nbMoveOrderDirective.html",
                transclude: true,
                scope: {
                    list: '=',
                    selectIndex: '='
                },
                link: function(scope, element, attrs) {
                    scope.$watch('selectIndex', function(val, oldVal) {
                        scope.disableMoveToTop = true;
                        scope.disableMoveUp = true;
                        scope.disableMoveDown = true;
                        scope.disableMoveToBottom = true;
                        if (scope.selectIndex > 0) {
                            scope.disableMoveToTop = false;
                            scope.disableMoveUp = false;
                        }
                        if (scope.selectIndex >= 0 && scope.selectIndex < scope.list.length - 1) {
                            scope.disableMoveDown = false;
                            scope.disableMoveToBottom = false;
                        }
                    });

                    scope.moveToTop = function() {
                        if (scope.selectIndex <= 0) return;
                        var resultList = [];
                        resultList.push(scope.list[scope.selectIndex]);
                        for (var i = 0; i < scope.selectIndex; i++) {
                            resultList.push(scope.list[i]);
                        }
                        for (var j = scope.selectIndex + 1; j < scope.list.length; j++) {
                            resultList.push(scope.list[j]);
                        }
                        scope.list = resultList;
                        scope.selectIndex = 0;
                    };

                    scope.moveToBottom = function() {
                        if (scope.selectIndex < 0 || scope.selectIndex >= scope.list.length - 1) return;
                        var resultList = [];
                        resultList.push(scope.list[scope.selectIndex]);
                        for (var i = scope.list.length - 1; i > scope.selectIndex; i--) {
                            resultList.push(scope.list[i]);
                        }
                        for (var j = scope.selectIndex - 1; j >= 0; j--) {
                            resultList.push(scope.list[j]);
                        }
                        scope.list = resultList.reverse();
                        scope.selectIndex = resultList.length - 1;
                    };

                    scope.moveUp = function() {
                        if (scope.selectIndex <= 0) return;
                        var resultList = [];
                        for (var i = 0; i < scope.selectIndex - 1; i++) {
                            resultList.push(scope.list[i]);
                        }
                        resultList.push(scope.list[scope.selectIndex]);
                        resultList.push(scope.list[scope.selectIndex - 1]);
                        for (var j = scope.selectIndex + 1; j < scope.list.length; j++) {
                            resultList.push(scope.list[j]);
                        }
                        scope.list = resultList;
                        scope.selectIndex = scope.selectIndex - 1;
                    };

                    scope.moveDown = function() {
                        if (scope.selectIndex < 0 || scope.selectIndex >= scope.list.length - 1) return;
                        var resultList = [];
                        for (var i = 0; i < scope.selectIndex; i++) {
                            resultList.push(scope.list[i]);
                        }
                        resultList.push(scope.list[scope.selectIndex + 1]);
                        resultList.push(scope.list[scope.selectIndex]);
                        for (var j = scope.selectIndex + 2; j < scope.list.length; j++) {
                            resultList.push(scope.list[j]);
                        }
                        scope.list = resultList;
                        scope.selectIndex = scope.selectIndex + 1;
                    }
                }
            };
        }
    ]);

})(NetBrain);