(function(netBrain) {
    'use strict';

    angular.module('nb.common').directive('nbOnUpdateDirective', [
        '$timeout', function($timeout) {

            return {
                restrict: 'A',
                require: '?ngModel',
                replace: false,
                transclude: false,
                link: function (scope, elm, attrs, ngModel) {
                    if (!ngModel) return;
                    ngModel.$render = function () {
                        elm.html(ngModel.$viewValue || '');
                    };

                    elm.bind('keydown', function (e) {
                        if (e.keyCode === 13) {
                            e.keyCode = 0;
                            return false;
                        }
                    })

                    elm.bind('blur', function (e) {
                        if (e.keyCode === 13 || e.type !== 'keyup') {
                            //$timeout(function () {
                                var curValue = $(elm[0]).text();
                                curValue = curValue.trim();
                                if (curValue.length === 0) {
                                    elm[0].innerHTML = elm[0].nbOldValue;
                                    elm[0].focus();
                                } else {
                                    if (e.keyCode === 13 && e.type === 'keyup') {
                                        elm[0].blur();
                                    } else {
                                        scope.$apply(function () {
                                            scope.$parent.nbTextChanged = elm[0].nbOldValue != curValue;
                                            ngModel.$setViewValue(curValue);
                                            $timeout(function () {
                                                ngModel.$setViewValue(curValue);
                                                scope.$eval(attrs.nbOnUpdateDirective, scope.$parent);
                                            }, 101);
                                        });
                                    }
                                }
                            //}, 1);
                        }
                    });
                    elm.bind('keyup', function (e) {
                        if (elm.nbEleTm) {
                            clearTimeout(elm.nbEleTm);
                            elm.nbEleTm = null;
                        }
                        elm.nbEleTm = setTimeout(function () {
                            if (e.keyCode === 13) {
                                //$timeout(function () {
                                var curValue = $(elm[0]).text();
                                curValue = curValue.trim();
                                if (curValue.length === 0) {
                                    elm[0].innerHTML = elm[0].nbOldValue;
                                    elm[0].focus();
                                } else {
                                    elm[0].blur();
                                }
                                //}, 1);
                            }
                        }, 500);
                    });
                    attrs.$observe('contenteditable', function(newValue) {
                        if (newValue === 'true') {
                            $timeout(function() {
                                elm[0].nbOldValue = $(elm[0]).text();
                                elm[0].nbOldValue = elm[0].nbOldValue.trim();
                                var range = document.createRange();
                                range.selectNodeContents(elm[0]);
                                var sel = window.getSelection();
                                if (range.toString() !== sel.toString()) {
                                    sel.removeAllRanges();
                                    sel.addRange(range);
                                }
                            }, 1)
                        } else if (newValue === 'false') {
                            $timeout(function() {
                                elm[0].nbOldValue = '';
                            }, 1)
                        }
                    });
                }
            };
        }
    ]).directive('nbOnUpdateTextDirective', [
        '$timeout', function($timeout) {

            return {
                restrict: 'A',
                replace: false,
                transclude: false,
                link: function (scope, elm, attrs) {
                    elm.bind('blur', function (e) {
                        var curValue = $(elm[0]).val();
                        curValue = curValue.trim();
                        scope.$apply(function () {
                            scope.$parent.nbTextChanged = elm[0].nbOldValue != curValue;
                            scope.$parent.nbOldValue = elm[0].nbOldValue;
                            scope.$eval(attrs.nbOnUpdateTextDirective, scope.$parent);
                        });
                    });
                    elm.bind('focus', function (e) {
                        elm[0].nbOldValue = $(elm[0]).val();
                    });
                }
            };
        }
    ]);

})(NetBrain);