; (function (NetBrain) {
    'use strict';

    angular.module('nb.common').controller('nb.common.aboutCtrl', aboutCtrl);
    aboutCtrl.$inject = ['$scope', '$filter', '$uibModalInstance', 'versionObj'];

    function aboutCtrl($scope, $filter, $uibModalInstance, version) {
        $scope.version = JSON.parse(JSON.stringify(version));
        $scope.version.Date = $filter('date')(new Date($scope.version.Date), 'yyyy-MM-dd');
        
        $scope.close = function close() {
            $uibModalInstance.dismiss('cancel');
        };
    }

})(NetBrain);