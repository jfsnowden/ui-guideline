; (function (NetBrain) {
    'use strict';

    angular.module("nb.common").controller('nb.common.loginPopupCtrl', LoginPopupCtrl);

    LoginPopupCtrl.$inject = ['$scope', '$timeout', '$log', '$location', '$state', '$rootScope', '$parse', '$window', '$uibModalInstance',
        'nb.ng.userSrvc',
        'nb.ng.httpAuthSrvc',
        'nb.ng.utilitySrvc',
        'nb.ng.callbackSrvc',
        'nb.ng.sessionSrvc',
        'nb.ng.multiTabEventSrvc',
        'reloginObj',
        '$uibModal'
    ];

    function LoginPopupCtrl($scope, $timeout, $log, $location, $state, $rootScope,
        $parse, $window, $uibModalInstance, userSrvc, httpAuthSrvc, utilitySrvc,
        callbackSrvc, sessionSrvc, multiTabEventSrvc, reloginObj, $uibModal) {
        $scope.form = {
            'password': ''
        };
        $scope.title = reloginObj.message;
        $scope.appType = reloginObj.type;
        $scope.userName = $scope.appType === 'system'
            ? utilitySrvc.getLocalStorage(NetBrain.NG.LocalStorageDefine.loginUserName.system)
            : utilitySrvc.getLocalStorage(NetBrain.NG.LocalStorageDefine.loginUserName.mainUi);

        $scope.loginErrors = {
            "PWD_EXPIRED": "100070",
            "NEED_MORE_INFO": "100054",
            "NEED_LOGOUT": "100071",
            "BROWSER_LOGGED": "100074",
            "INCORRECT_PASSWORD": "100012"
        };
        $scope.isForce = "no";

        $scope.submitForm = function () {
            var serverMessage = $parse('form.$error.serverMessage'); // place-holder for display an error in case there is an error

            if (angular.isUndefined($scope.userName) || !$scope.userName || '' === $scope.userName) {
                $rootScope.$emit(systemEvent.mainSessionTimeout);
            }
            if (angular.isUndefined($scope.form.password) || $scope.form.password === '') {
                serverMessage.assign($scope, "Please input your password.");
            }
            else {
                httpAuthSrvc.reLogin($scope.userName, $scope.form.password, $scope.appType, $scope.isForce).then(function (response) {
                    multiTabEventSrvc.trigger(MultiTabEvent.closeRelogin);
                    $uibModalInstance.close(response);
                }, function (error) {
                    var reason = error ? error["error"] : "unknown";
                    var desc = error["error_description"] ? error["error_description"] : "Failed to log in due to database issue.";

                    switch (reason) {
                        case $scope.loginErrors.NEED_LOGOUT:
                            desc += ' Click "Log In" to force log in.';
                            $scope.isForce = "kick_login";
                            serverMessage.assign($scope, desc);
                            break;
                        case $scope.loginErrors.INCORRECT_PASSWORD:
                            desc = 'Incorrect password.';
                            serverMessage.assign($scope, desc);
                            break;
                        case $scope.loginErrors.PWD_EXPIRED:
                            var forceResetPassword = "Your password has expired, please reset it.";
                            var params = desc.split(",");
                            var userId = params[0],
                                pwdPolicy = {
                                    minimumLength: params[1],
                                    expiredInDays: params[2],
                                    complexityRequirement: params[3]
                                };
                            $scope.resetUserPassword(userId, pwdPolicy, forceResetPassword);
                            break;
                        default:
                            serverMessage.assign($scope, desc);
                            $scope.form.password = '';
                            break;
                    }
                });
            }

        };


        $scope.enterToSubmit = function (event) {
            if (event.keyCode === 13) {
                $scope.submitForm();
            }
        };

        multiTabEventSrvc.on(MultiTabEvent.closeRelogin, function (data) {
            $uibModalInstance.close(true);
        });

        $scope.modalClose = function () {
            $uibModalInstance.close(null);
        };

        $scope.resetUserPassword = function (uId, pwdPolicy, reason) {
            $scope.passwordModal = $uibModal.open({
                templateUrl: 'loginResetPasswordDialog.html',
                controller: 'nb.ng.loginResetPasswordDialogCtrl',
                windowClass: 'userPasswordDialog',
                backdrop: 'static',
                resolve: {
                    resolveData: function () {
                        return {
                            userId: uId,
                            reason: reason,
                            passwordPolicy: pwdPolicy
                        }
                    }
                }
            });
            $scope.passwordModal.result.then(
                function (newPwd) {
                    $scope.form.password = newPwd;
                    $scope.submitForm();
                }
            );
        };

    }

})(NetBrain);
