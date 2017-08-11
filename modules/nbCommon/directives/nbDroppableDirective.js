(function (netBrain) {
    'use strict';
    angular.module('nb.common').directive('nbDroppable', ['nb.common.nbDragDropSrvc','nb.path.httpPathSrvc',
        function (nbDragDropSrvc,httpPathSrvc) {
            var dragType = {
                "DrawMedia": nbDragDropSrvc.drawMedia,
                "DrawDevice": nbDragDropSrvc.drawDevice,
                "DrawDeviceGroup": nbDragDropSrvc.drawDeviceGroup,
                "DrawSite": nbDragDropSrvc.drawSite,
                "DrawStencilItem": nbDragDropSrvc.drawStencilItem,
                "DrawPath":nbDragDropSrvc.drawPath
            }
            return {
                restrict: "A",
                scope: false,
                replace: false,
                link: function (scope, element, attr) {
                    var el = element[0];
                    var callback = null;
                    var parentScope = scope;

                    if (attr.nbDroppable !== "") {
                        callback = parentScope[attr.nbDroppable];
                        while ((callback === undefined || callback === null) && parentScope.$parent) {
                            parentScope = parentScope.$parent;
                            callback = parentScope[attr.nbDroppable];
                        }
                    }
                    el.addEventListener('dragenter', function (event) {
                    }, false);

                    el.addEventListener('dragover', function (event) {
                        if (document.URL.toLowerCase().indexOf('map.html') > 0 && document.URL.toLowerCase().indexOf('maptype=2') > 0) {
                            if (event.preventDefault) {
                                event.preventDefault();
                            } else {
                                event.returnValue = false;
                            }
                            event.stopPropagation();
                            return false;
                        }
                        if (event.target.className === "dropzone") {
                            // Disallow a drop by returning before a call to preventDefault:
                            return;
                        }

                        // Allow a drop on everything else
                        if (event.preventDefault) {
                            event.preventDefault();
                        } else {
                            event.returnValue = false;
                        }
                        event.stopPropagation();
                        return false;

                    }, false);
                    el.addEventListener('drop', function (event) {
                        if (document.URL.toLowerCase().indexOf('map.html') > 0 && document.URL.toLowerCase().indexOf('maptype=2') > 0) {
                            if (event.preventDefault) {
                                event.preventDefault();
                            } else {
                                event.returnValue = false;
                            }
                            event.stopPropagation();
                            return;
                        }
                        try {
                            var dragData = JSON.parse(event.dataTransfer.getData('text'));
                            if (dragType[dragData.actionType]) {
                                if(dragData.actionType==="DrawPath"){
                                    httpPathSrvc.getPathTempLastHistory(dragData.pathTempId).then(function (path) {
                                        httpPathSrvc.getAllPathHops(path.ID).then(function(data) {
                                            var drawMapDataList=[];
                                            
                                            _.each(data,function(d){
                                                if(d.drawMapDataList){
                                                        drawMapDataList=drawMapDataList.concat(d.drawMapDataList);
                                                }
                                            })
                                            var pathObjs = { drawMapDataList: drawMapDataList, hopsList: data };
                                            var drawData = { actionData: pathObjs, actionType: NetBrain.Common.Const.ActionType.DrawPath };
                                            dragType[dragData.actionType](drawData, event);
                                        });
                                    });
                                }else{
                                    dragType[dragData.actionType](dragData, event);
                                }
                                
                            }
                            if (event.preventDefault) {
                                event.preventDefault();
                            } else {
                                event.returnValue = false;
                            }
                            
                            event.stopPropagation();
                        } catch(ex) {
                            return;
                        }
                        
                    }, false);
                    el.addEventListener('dragleave', function (event) {
                    },
                        false);
                }
            }

        }
    ]);

})(NetBrain);