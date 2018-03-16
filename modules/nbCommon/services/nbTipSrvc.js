(function() {
    'use strict';

    angular.module('nb.common')
        .service('nb.common.nbTipSrvc', ['$document', '$compile', '$rootScope', '$timeout',
            function($document, $compile, $rootScope, $timeout) {
                var me = this;
                var template = '<div class="nb-tip" id="{{tipID}}" ng-class="customClass" ng-style="position">' +
                    '<p class="nb-tip-text" ng-if="textMode">{{tipInfo}}</p>' +
                    '</div>';
                var defaultOptions = {
                    position: {
                        right: '6px',
                        top: '105px'
                    },
                    autoClose: true,
                    autoCloseDelay: 3000,
                    hasCloseBtn: false,
                    customClass: 'mapCusTip',
                    appendTo: 'Map'
                };
                me.open = function(options) {
                    options = _.extend({}, defaultOptions, options);
                    var id = 'nb-tip-' + (new Date()).getTime();
                    var scope = $rootScope.$new();
                    if (options.scope) {
                        scope = options.scope;
                    }
                    scope.callBack = options.callBack;
                    scope.tipID = id;
                    scope.tipInfo = options.tipInfo;
                    scope.customClass = options.customClass;
                    scope.position = options.position;
                    scope.textMode = true;
                    scope.closeTip = me.close;
                    var element = angular.element(template);
                    if (options.hasCloseBtn) {
                        element.addClass('has-close-btn');
                        element.prepend("<span class='icon_nb_close' ng-click=\"closeTip('" + id + "')\"></span>");
                    }

                    if (options.template) {
                        scope.textMode = false;
                        var content = angular.element(options.template);
                        element.append(content);
                    }
                    element = $compile(element)(scope);

                    if (options.defaultHide) {
                        element.hide();
                    }
                    var parent = null;
                    if (options.appendTo === 'Map') {
                        parent = angular.element('.mapMainFrameContent');
                    } else if(options.appendTo && options.appendTo !== 'body'){
                        parent = angular.element('body').find(options.appendTo);
                    }else{
                        parent = angular.element('body');
                    }
                    parent.append(element);

                    if (options.autoClose !== false) {
                        var delay = options.autoCloseDelay;
                        var canceler = timeoutClose(delay, id);
                        var hasLeaveHandler = false;
                        element.mouseenter(function() {
                            $timeout.cancel(canceler);
                            if (!hasLeaveHandler) {
                                hasLeaveHandler = true;
                                element.mouseleave(function() {
                                    if (canceler.$$state.status === 2) {
                                        canceler = timeoutClose(delay, id);
                                    }
                                });
                            }
                        });
                        // element.mouse
                    }

                    return id;
                };

                function timeoutClose(delay, id) {
                    return $timeout(function() {
                        me.close(id);
                    }, delay);
                }

                me.close = function(tipID) {
                    var element = $document.find('#' + tipID);
                    if (element) {
                        element.remove();
                    }
                };
                me.closeAllTip = function() {
                    var element = $document.find('.nb-tip');
                    if (element) {
                        element.remove();
                    }
                };
                me.hide = function(tipId) {
                    getEl(tipId).hide();
                };

                me.show = function(tipId) {
                    getEl(tipId).show();
                };

                function getEl(id) {
                    return $document.find('#' + id);
                }
            }
        ]);
})(NetBrain);
