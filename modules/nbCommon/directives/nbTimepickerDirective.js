(function() {
    angular.module('nb.common')
        .directive('nbTimepicker', [function() { // 'nbTimepickerPaddingFilter',
            return {
                restrict: 'E',
                require: 'ngModel',
                scope: {
                    hourStep: '=?',
                    minuteStep: '=?',
                    secondStep: '=?',
                    showMeridian: '=?',
                    showSecond: '=?'
                },
                templateUrl: 'modules/nbCommon/views/nbTimepickerDirective.html',
                controller: ['$scope', function($scope) {
                    $scope.AM = 'AM';
                    $scope.PM = 'PM';
                    $scope.meridian = $scope.AM;

                    $scope.$on('CLOSE-TIMEPICKER-MENU-ON-SCROLL', function() {
                        $scope.$apply(function() {
                            $scope.openHour = false;
                            $scope.openMinute = false;
                            $scope.openSecond = false;
                            $scope.openMeridian = false;
                        });
                    });

                    if ($scope.showMeridian === undefined) {
                        $scope.showMeridian = true;
                    }
                    if ($scope.showSecond === undefined) {
                        $scope.showSecond = false;
                    }
                    if ($scope.hourStep === undefined) {
                        $scope.hourStep = 1;
                    }
                    if ($scope.minuteStep === undefined) {
                        $scope.minuteStep = 1;
                    }
                    if ($scope.secondStep === undefined) {
                        $scope.secondStep = 1;
                    }

                    $scope.hourList = $scope.showMeridian ? getList(1, 12, $scope.hourStep) : getList(0, 23, $scope.hourStep);
                    $scope.minuteList = getList(0, 59, $scope.minuteStep);
                    if ($scope.showSecond) {
                        $scope.secondList = getList(0, 59, $scope.secondStep);
                    }
                    if ($scope.showMeridian) {
                        $scope.meridianList = [$scope.AM, $scope.PM];
                    }

                    $scope.setHour = function(h) {
                        $scope.hour = parseInt(h);
                        $scope.changeHour = true;
                    };
                    $scope.setMinute = function(m) {
                        $scope.minute = parseInt(m);
                        $scope.changeMinute = true;
                    };
                    $scope.setSecond = function(s) {
                        $scope.second = parseInt(s);
                        $scope.changeSecond = true;
                    };
                    $scope.setMeridian = function(item) {
                        $scope.meridian = item;
                        $scope.changeMeridian = true;
                    };
                }],
                link: function(scope, element, attrs, ngModelCtrl) {
                    ngModelCtrl.$formatters.push(function(modelValue) {
                        var time = { hour: 0, minute: 0 };
                        if (modelValue) {
                            time.hour = modelValue.getHours();
                            time.minute = modelValue.getMinutes();
                        }

                        if (scope.showSecond) {
                            time.second = modelValue.getSeconds();
                        }

                        return time;
                    });

                    ngModelCtrl.$render = function() {
                        scope.hour = ngModelCtrl.$viewValue.hour;
                        if (scope.showMeridian) {
                            switch (scope.hour) {
                                case 0:
                                    scope.hour = 12;
                                    scope.meridian = scope.AM;
                                    break;
                                case 12:
                                    scope.meridian = scope.PM;
                                    break;
                                default:
                                    scope.meridian = (scope.hour > 12) ? scope.PM : scope.AM;
                                    scope.hour -= (scope.hour > 12) ? 12 : 0;
                                    break;
                            }
                        }
                        scope.minute = ngModelCtrl.$viewValue.minute;
                        if (scope.showSecond) {
                            scope.second = ngModelCtrl.$viewValue.second;
                        }
                    };

                    scope.$watchGroup(['hour', 'minute', 'second', 'meridian'], function() {
                        ngModelCtrl.$setViewValue({
                            hour: scope.hour,
                            minute: scope.minute,
                            second: scope.second,
                            meridian: scope.meridian
                        });
                    });

                    ngModelCtrl.$parsers.push(function(viewValue) {
                        var h = viewValue.hour;
                        if (scope.showMeridian) {
                            h %= 12;
                            h += (viewValue.meridian === scope.PM) ? 12 : 0;
                        }
                        var time = new Date();
                        time.setHours(h);
                        time.setMinutes(viewValue.minute);
                        time.setSeconds(0);
                        if (scope.showSecond) {
                            time.setSeconds(viewValue.second);
                        }

                        return time;
                    });
                }
            };

            function getList(begin, end, step) {
                var list = [];
                for (var i = begin; i <= end; i += step) {
                    var item = i < 10 ? '0' + i : i;
                    list.push(item);
                }
                return list;
            }
        }])
        .filter('nbTimepickerPadding', function() {
            return function(input) {
                var item = parseInt(input);
                if (item < 10) {
                    item = '0' + item;
                }
                return item;
            };
        });
})(NetBrain);
