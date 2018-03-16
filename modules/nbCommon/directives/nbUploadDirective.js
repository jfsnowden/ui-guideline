/*
 ** Description: This directive is resolved the browser compatibility for file type input
 ** usage: <nb-upload file-change="fileChanged"></nb-upload>
 **        fileChanged is a function name on your own scope, receive two parameter $files and $event as the ng-file-select directive
 */
(function() {
    'use strict';

    angular.module('nb.common').directive('nbUpload', nbUpload);

    function nbUpload() {
        return {
            restrict: 'E',
            replace: true,
            template: '<div style="position:relative;width:100%;height:30px;display:flex; flex-flow: row nowrap;">' +
                '      <input name="" type="text" ng-value="filepath" style="flex-grow:1;" readonly="readonly" atag="nb:upload:text"/>' +
                '      <button class="btn btn-primary" style="width:100px;" atag="nb:upload:browseBtn">Browse</button>' +
                '      <input type="file" ng-file-select="fileChange($files, $event); updateDisplay($files, $event);" accept=".csv" style="width:100%;height:30px;position:absolute;top:0;left:0;opacity:0;cursor:pointer;"/>' +
                '  </div>',
            scope: {
                fileChange: '='
            },
            link: function(scope) {
                scope.updateDisplay = function(files, event) {
                    scope.filepath = event.target.value;
                };
            }
        };
    }
})(NetBrain);
