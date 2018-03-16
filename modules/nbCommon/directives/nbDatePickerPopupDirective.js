(function() {
    angular.module('nb.common')
        .run(['$templateCache', function($templateCache) {
            $templateCache.put('nb/template/datepickerPopup/popup.html',
                '<ul class="nb-date-picker-popup uib-datepicker-popup dropdown-menu uib-position-measure" dropdown-nested ng-if="isOpen" ng-keydown="keydown($event)" ng-click="$event.stopPropagation()">\n' +
                '  <li ng-transclude></li>\n' +
                '  <li ng-if="showButtonBar" class="uib-button-bar">\n' +
                '    <span class="btn-group pull-left">\n' +
                "      <button type=\"button\" class=\"btn btn-sm btn-info uib-datepicker-current\" ng-click=\"select('today', $event)\" ng-disabled=\"isDisabled('today')\">{{ getText('current') }}</button>\n" +
                "      <button type=\"button\" class=\"btn btn-sm btn-danger uib-clear\" ng-click=\"select(null, $event)\">{{ getText('clear') }}</button>\n" +
                '    </span>\n' +
                "    <button type=\"button\" class=\"btn btn-sm btn-success pull-right uib-close\" ng-click=\"close($event)\">{{ getText('close') }}</button>\n" +
                '  </li>\n' +
                '</ul>\n' +
                '');
        }])
        .directive('nbDatePickerPopup', function() {
            return {
                restrict: 'E',
                require: ['ngModel'],
                scope: {
                    opened: '=isOpen',
                    appendToBody: '='
                },
                templateUrl: 'modules/nbCommon/views/nbDatePickerPopupDirective.html',

                controller: ['$scope', function($scope) {
                    // setting the default disabled for the benchmark-recurrence-endDate
                    if (angular.element('#benchmark-recurrence-endDate').find('input[ng-model="dt"]') && angular.element('#benchmark-recurrence-endDate').find('input[ng-model="dt"]').length > 0) {
                        angular.element('#benchmark-recurrence-endDate').find('input[ng-model="dt"]')[0].disabled = true;
                        angular.element('#benchmark-recurrence-endDate').find('button[type="button"].btn.btn-default')[0].disabled = true;
                    }
                    $scope.options = {
                        startingDay: 0,
                        showWeeks: false,
                        customClass: dayClass
                    };

                    if ($scope.appendToBody === undefined) {
                        $scope.appendToBody = true;
                    }

                    $scope.today = function() {
                        $scope.dt = new Date();
                    };

                    $scope.clear = function() {
                        $scope.dt = null;
                    };


                    function dayClass() {
                        return '';
                    }
                }],
                link: function(scope, element, attrs, controllers) {
                    var modelCtrl = controllers[0];
                    scope.$on('CLOSE-DATEPICKER-MENU-ON-SCROLL', function() {
                        scope.$apply(function() {
                            scope.opened = false;
                            element.find('input[type="text"]').blur();
                        });
                    });
                    modelCtrl.$render = function() {
                        scope.dt = modelCtrl.$viewValue;
                    };

                    scope.$watch('dt', function() { // newValue
                        var dt = new Date(scope.dt);
                        modelCtrl.$setViewValue(dt);
                    });
                }
            };
        });
})(NetBrain);
