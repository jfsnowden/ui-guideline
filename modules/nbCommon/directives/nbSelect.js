(function() {
    'use strict';

    angular.module('nb.common').directive('nbSelect', nbSelect);
    angular.module('nb.common').directive('nbOption', nbOption);

    function nbSelect() {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                placeholder: '@',
                disabled: '=',
                ngModel: '=',
                noTimeout: '=',
                options: '&',
                change: '=',
                optionClick: '&?',
                enableHover: '@',
                labelField: '@',
                valueField: '@',
                atag: '@'
            },
            replace: true,
            require: ['nbSelect', 'ngModel'],
            controllerAs: 'nbSelect',
            controller: ['$scope', '$element', '$attrs', '$transclude', '$parse', '$compile', '$sce', '$timeout', controllerFn],
            link: function(scope, element, attrs, ctrls, transclude) {
                scope.enableHover = scope.enableHover || true;
                var ngModel = ctrls[1];
                ctrls = ctrls[0];
                element.find('ul.dropdown-menu').on('click', '>*', function(e) {
                    var li = e.currentTarget;
                    scope.ngModel = li.attributes.$$value;
                    ngModel.$setViewValue(li.attributes.$$value);
                    scope.$apply();
                    if (scope.optionClick) scope.optionClick();
                });
                transclude(ctrls.transcludeFn);
                ctrls.refresh(element.find('ul.dropdown-menu'));
            },
            template: function(tElement, tAttrs) {
                var editable = (tElement.attr('editable') !== undefined);
                var atagString = tAttrs.atag ? 'atag = "' + tAttrs.atag + '"' : '';
                if (!editable) {
                    return ['<div ' + atagString + ' class="btn-group dropdown"  ng-mouseenter="showArr=true" ng-mouseleave="showArr=false">',
                        '<button type="button" class="btn btn-default dropdown-body dropdown-body-custom" data-toggle="dropdown" ng-disabled="disabled">',
                        '<span ng-if="!selectedLabel" class="dropdown-placeholder" ng-bind-html="placeholder || \'select\'"></span>',
                        '<span ng-if="selectedLabel" class="dropdown-selection" data-ng-bind-html="selectedLabel"></span>',
                        '</button>',
                        '<button type="button" class="btn dropdown-toggle" data-toggle="dropdown" aria-expanded="false" ng-disabled="disabled">',
                        '<div class="icon-container"><span ng-class="{icon_nb_arrow_down: enableHover==true||showArr==true}" ></span></div>',
                        '<span class="sr-only">Toggle Dropdown</span>',
                        '</button>',
                        '<ul class="dropdown-menu dropdown-menu-custom" uib-dropdown-menu role="menu">',
                        '</ul>',
                        '</div>'
                    ].join('');
                }
                return ['<div ' + atagString + ' class="input-group dropdown">',
                    '<input type="text" class="form-control" ng-model="ngModel" placeholder="{{nbDropdownPlaceholder || \' \'}}" ng-disabled="isDisabled">',
                    '<div class="input-group-btn">',
                    '    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" ng-disabled="isDisabled">',
                    '        <div class="icon-container"><span class="icon_nb_arrow_down"></span></div>',
                    '    </button>',
                    '    <ul class="dropdown-menu" uib-dropdown-menu role="menu" ng-transclude>',
                    '    </ul></div></div>'
                ].join('');
            }
        };
    }

    function controllerFn($scope, $element, $attrs, $transclude, $parse, $compile, $sce, $timeout) {
        $scope.liTpl = '<li><a title="<%=' + getLabelField() + '%>"><%=' + getLabelField() + '%></a></li>';
        var ctrls = this;

        if ($attrs.options !== undefined) $scope.options = $parse($attrs.options)($scope.$parent);

        function getLabelField() {
            return $scope.labelField || 'label';
        }

        this.compileLi = function(tpl, options) {
            var elements = [];
            angular.forEach(options, function(item) {
                var tpl2 = $scope.liTpl;
                var el;
                var model;
                if (!angular.isObject(item)) {
                    model = {};
                    model[getLabelField()] = item;
                    $scope.valueField = getLabelField();
                } else {
                    model = item;
                }
                if (/.*{{.*}}.*/.test(tpl2)) {
                    var scope = $scope.$new(false);
                    scope = _.extend(scope, model);
                    el = $compile($scope.liTpl)(scope)[0];
                    if (el.attributes['ng-value']) {
                        el.attributes.$$value = $parse(el.attributes['ng-value'].value)(scope);
                    } else if ($scope.valueField) {
                        el.attributes.$$value = model[$scope.valueField];
                    } else {
                        el.attributes.$$value = item;
                    }
                } else {
                    el = $(_.template(tpl2)(model))[0];
                    if (el.attributes['ng-value']) {
                        el.attributes.$$value = model[el.attributes['ng-value'].value];
                    } else if ($scope.valueField) {
                        el.attributes.$$value = model[$scope.valueField];
                    } else {
                        el.attributes.$$value = item;
                    }
                }

                el.attributes.$$item = item;

                $(el).addClass('nb-select-option');
                elements.push(el);

                if ($scope.ngModel !== undefined && _.isEqual($scope.ngModel, el.attributes.$$value)) {
                    $(el).addClass('active');
                    if ($scope.noTimeout) {
                        $scope.selectedLabel = $sce.trustAsHtml(el.innerHTML);
                    } else {
                        $timeout(function() {
                            $scope.selectedLabel = $sce.trustAsHtml(el.innerHTML);
                        });
                    }
                }
            });

            var ulEle = $element.find('.dropdown-menu');
            if (elements.length === 0) {
                ulEle.addClass(' dropdown-menu-zero');
            } else {
                ulEle.removeClass(' dropdown-menu-zero');
            }

            return elements;
        };
        this.onModelChange = function(li) { // , isEvent
            $element.find('ul.dropdown-menu>*.active').removeClass('active');
            $(li).addClass('active');
            this.onChange(li.attributes.$$value, li.attributes.$$item, li);
            $scope.selectedLabel = $sce.trustAsHtml(li.innerHTML);
            // Fix browser compatibility error: There is no tooltip in IE & Firefox
            var editable = ($element.attr('editable') !== undefined);
            if (!editable) {
                var buttonList = $element.find('button');
                if (!!buttonList && buttonList.length > 0) {
                    buttonList[0].title = li.innerText;
                }
            }
        };
        this.onChange = function(val, model, li) {
            if (angular.isFunction($scope.change)) {
                $scope.change(val, model, li);
            }
        };
        this.refresh = function() {
            $element.find('ul.dropdown-menu>.nb-select-option').remove();
            $element.find('ul.dropdown-menu').prepend(this.compileLi($scope.liTpl, $scope.options));
        };
        this.refreshActive = function() {
            var val = $scope.ngModel;
            $scope.selectedLabel = null;
            $element.find('ul.dropdown-menu>*').each(function(index, el) {
                if (el.attributes && _.isEqual(el.attributes.$$value, val)) {
                    ctrls.onModelChange(el, false);
                    return false;
                }
                return true;
            });
        };
        this.setSelectedLabel = function(val) {
            $scope.selectedLabel = $sce.trustAsHtml(val);
        };
        this.transcludeFn = transcludeFn;

        function transcludeFn(clone, scope) {
            angular.forEach(clone, function(c) {
                if (c.tagName === 'script'.toUpperCase()) {
                    $scope.liTpl = c.innerHTML.trim();
                } else if (c.attributes) {
                    if (c.attributes['ng-value']) {
                        c.attributes.$$value = $parse(c.attributes['ng-value'].value)(scope);
                    } else if (c.attributes.value) {
                        c.attributes.$$value = c.attributes.value.value;
                    }

                    if ($scope.ngModel !== undefined && _.isEqual($scope.ngModel, c.attributes.$$value)) {
                        c.attributes.$$selected = true;
                        $(c).addClass('active');
                    }
                    $element.find('ul.dropdown-menu').append(c);
                }
            });
        }

        var watchCollection = $scope.$watch(function() {
            if ($scope.options === undefined) return undefined;
            var options = $parse($attrs.options)($scope.$parent);
            if (!_.isEqual(options, $scope.options)) {
                $scope.options = options;
            }
            return $scope.options;
        }, function(newOptions, oldOptions) {
            if (newOptions === oldOptions) return;
            ctrls.refresh($element.find('ul.dropdown-menu'));
        }, true);

        var watchModel = $scope.$watch('ngModel', function(newVal) { // , oldVal
            if (!(_.isNull(newVal) || _.isUndefined(newVal))) {
                ctrls.refreshActive();
            } else {
                $scope.selectedLabel = null;
                var editable = ($element.attr('editable') !== undefined);
                if (!editable) {
                    var buttonList = $element.find('button');
                    if (!!buttonList && buttonList.length > 0) {
                        $(buttonList[0]).removeAttr('title');
                    }
                }
            }
        }, true);
        $scope.$on('$destroy', function() {
            watchCollection();
            watchModel();
        });
    }

    function nbOption() {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            template: '<li><a ng-transclude></a></li>',
            require: '^?nbSelect',
            link: function(scope, element, attrs, ctrls, transclude) {
                if (element[0].attributes.$$selected) {
                    transclude(function(clone) { // , scope
                        ctrls.setSelectedLabel(clone.html());
                    });
                    delete element[0].attributes.$$selected;
                }
            }
        };
    }
})(NetBrain);
