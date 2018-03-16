/* global alertSrvc */
/* eslint no-unused-vars:0 */
var NB_CONFIRM_OK = 0;
var NB_CONFIRM_YES = 1;
var NB_CONFIRM_NO = 2;
var NB_CONFIRM_CANCEL = 3;
var NB_CONFIRM_CHECK = 4;

var NB_ICON_INFORMATION = 'INFO';
var NB_ICON_WARNING = 'WARNING';
var NB_ICON_ERROR = 'ERROR';
var NB_ICON_QUESTION = 'QUESTION';

(function() {
    'use strict';

    angular.module('nb.common').factory('nb.common.nbAlertSrvc', NbAlertSrvc);

    NbAlertSrvc.$inject = ['$q', '$timeout', '$uibModal'];

    function NbAlertSrvc($q, $timeout, $uibModal) {
        var modalDefaults = {
            backdrop: 'static',
            keyboard: false,
            // windowClass: 'nb.common.confirmation-dialog nbMessage',
            windowClass: 'nb-common-message',
            templateUrl: 'modules/nbCommon/views/nbAlert.html',
            controller: 'nb.common.nbAlertCtrl'
        };

        var showModal = function(customModalOptions) {
            var dialogOptions = customModalOptions;
            var customizedModalOptions = {};

            _.each(modalDefaults, function(val, key) {
                customizedModalOptions[key] = val;
                if (dialogOptions[key]) {
                    customizedModalOptions[key] = dialogOptions[key];
                }
            });

            customizedModalOptions.resolve = {
                dialogOptions: function() {
                    return dialogOptions;
                }
            };

            return $uibModal.open(customizedModalOptions).result;
        };


        var triConfirm = function(title, message, btnContent, cancelCallback) {
            var deferred = $q.defer();
            showModal({
                title: title,
                message: message,
                buttons: [{
                    id: NB_CONFIRM_YES,
                    label: btnContent.OK || 'Yes'
                }, {
                    id: NB_CONFIRM_NO,
                    label: btnContent.No || 'No'
                }, {
                    id: NB_CONFIRM_CANCEL,
                    label: btnContent.Cancel || 'Cancel'
                }]
            }).then(function(button) {
                if (button === NB_CONFIRM_YES) {
                    deferred.resolve(true);
                } else if (button === NB_CONFIRM_NO) {
                    deferred.resolve(false);
                } else if (button === NB_CONFIRM_CANCEL && _.isFunction(cancelCallback)) {
                    cancelCallback();
                }
            });
            return deferred.promise;
        };


        return window.alertSrvc = {
            alert: alert,
            notification: notification,
            confirm: confirm,
            warning: warning,
            warnning: warning, // typo
            error: error,
            triConfirm: triConfirm,
            test: createTest()
        };


        function createTest() {
            var opt = {
                message: 'message'
            };

            var tests;

            return tests = {
                testAll: function() {
                    return tests.alert()
                        .then(tests.notification)
                        .then(tests.confirm)
                        .then(tests.warning)
                        .then(tests.error);
                },
                alert: function() {
                    return alertSrvc.alert(opt);
                },
                notification: function() {
                    return alertSrvc.notification(opt);
                },
                confirm: function() {
                    return alertSrvc.confirm(opt);
                },
                warning: function() {
                    return alertSrvc.warning(opt);
                },
                error: function() {
                    return alertSrvc.error(opt);
                }
            };
        }

        // type:notification、warning、error
        function alert(option) {
            if (option.type) {
                var fn = alertSrvc[option.type];
                if (typeof fn === 'function') {
                    return fn(option);
                }
                return undefined;
            }
            return notification(option);
        }

        function notification(option) {
            option = makeLegacyOption(arguments);

            var defaultOption = {
                title: 'Notification',
                iconType: NB_ICON_INFORMATION,
                buttons: [{
                    id: NB_CONFIRM_YES,
                    label: 'OK'
                }]
            };

            return showModal(
                _.extend({}, defaultOption, option)
            );
        }

        function confirm(option) {
            option = makeLegacyOption(arguments);

            var defaultOption = {
                title: 'Confirmation',
                iconType: NB_ICON_QUESTION,
                buttons: [{
                    id: NB_CONFIRM_YES,
                    label: 'Yes'
                }, {
                    id: NB_CONFIRM_NO,
                    label: 'No'
                }]
            };

            return showModal(
                _.extend({}, defaultOption, option)
            ).then(function(btn) {
                // 此处不建议有此then处理,为兼容原来代码，留此逻辑
                return (btn === NB_CONFIRM_YES) ?
                    $q.resolve() :
                    $q.reject(btn);
            });
        }

        function warning(option) {
            option = makeLegacyOption(arguments);

            var defaultOption = {
                title: 'Warning',
                iconType: NB_ICON_WARNING,
                buttons: [{
                    id: NB_CONFIRM_YES,
                    label: 'OK'
                }]
            };

            return showModal(
                _.extend({}, defaultOption, option)
            );
        }

        function error(option) {
            option = makeLegacyOption(arguments);

            var defaultOption = {
                title: 'Error',
                iconType: NB_ICON_ERROR,
                buttons: [{
                    id: NB_CONFIRM_YES,
                    label: 'OK'
                }]
            };

            return showModal(
                _.extend({}, defaultOption, option)
            );
        }

        function makeLegacyOption(data) {
            var option = {};

            if (data.length === 2) {
                option = {
                    message: data[0],
                    iconType: data[1]
                };
            } else if (data.length === 1 && angular.isString(data[0])) {
                option = {
                    message: data[0]
                };
            } else if (data.length === 1 && data[0] instanceof Error) {
                option = {
                    message: String(data[0]).replace(/^Error:/, '').trim()
                };
            } else {
                option = data[0];
            }
            return option;
        }
    }
})(NetBrain);
