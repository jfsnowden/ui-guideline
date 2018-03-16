/**
 * Created by Jia_Wei on 2/25/2016.
 */

(function() {
    'use strict';

    angular.module('nb.common').service('nb.common.nbSelectPropertyModalSrvc', [
        '$uibModal',
        function($uibModal) {
            var modalOptions = {
                backdrop: 'static',
                keyboard: false,
                windowClass: 'selectPropertyPopup',
                templateUrl: 'modules/nbCommon/views/nbSelectPropertyModal.html',
                controller: 'nb.common.nbSelectPropertyModalCtrl'
            };

            this.showModal = function(argParamsObj) {
                modalOptions.resolve = {
                    args: function() {
                        return argParamsObj;

                        // sample args
                        /*
                        {
                            // at least one of the following two is needed
                            isDeviceProperty : false,
                                isInterfaceProperty : true,

                            intfSchemaId : 'ipIntfs', // optional -- needed for interface type property selection -- indicating the interface type

                            preSelectedPropertyId : [...], // optional -- auto-select items when opening

                            deviceId : '', // optional -- if null, will select general property; otherwise, 
                            // will use the device to filter NCT/Route/Arp tables
                            deviceType : 2, // optional -- subtype -- comes along with deviceId

                            // following params is for the special case in edit data view from map -- not needed when selecting GDR data
                            // pass in data units from qapp
                            isDataUnitFromQapp : true, // optional -- if true, then all the prev args are not needed
                            lsDataUnitFromQapp : [], // optional -- needed if isDataUnitFromQapp
                            preSelectedDataUnitUId : []
                        }
                        */
                    }
                };

                return $uibModal.open(modalOptions).result; // resolve selected property
            };
        }
    ]);
})(NetBrain);
