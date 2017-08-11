;
(function (NetBrain) {
    'use strict';
    angular.module("nb.common").factory('nb.common.nbDragDropSrvc', nbDragDropSrvc);
    nbDragDropSrvc.$inject = [
        '$q',
        '$timeout',
        '$rootScope',
        'nb.common.nbAlertSrvc',
        'nb.topo.httpExternNbrSrvc',
        'nb.qmap.autoLinkOptionSrvc',
        'nb.netbrain.dataViewCacheSrvc',
        'nb.qmap.mapManagerSrvc',
        'nb.uiframework.urlStateMgr',
        'nb.ng.utilitySrvc',
        'nb.datamodel.httpSiteManagerSrvc',
        'nb.netbrain.httpMediaSrvc',
        'nb.uiframework.mainUISrvc',
        'nb.dataview.applyDataViewSrvc',
        'nb.qmap.updateMapSrvc'
    ];

    function nbDragDropSrvc($q, $timeout, $rootScope, nbAlertSrvc, httpExternNbrSrvc, autoLinkOptionSrvc, dataViewCacheSrvc, mapManagerSrvc, urlStateMgr, utilitySrvc, httpSiteManagerSrvc, httpMediaSrvc, mainUISrvc, applyDataViewSrvc, updateMapSrvc) {
        var services = {
            drawDevice: drawDevice,
            drawStencilItem: drawStencilItem,
            drawSite: drawSite,
            drawDeviceGroup: drawDeviceGroup,
            drawMedia: drawMedia,
            drawPath: drawPath,
            drawNeighbor: drawNeighbor,
            drawJson: drawJson,
            drawNodeJson: drawNodeJson,
            drawNodeByTopoLinks: drawNodeByTopoLinks,
            openPanel: openPanel,

        };


        function distinctDevices(dragDataObj) {
            //从 dragDataObj.actionData 去掉重复设备
            var i = 0;
            if (dragDataObj != null && dragDataObj.actionData != null && dragDataObj.actionData && dragDataObj.actionData.length > 1) {
                while (i < dragDataObj.actionData.length) {
                    for (var j = 0; j < i; j++) {
                        if (dragDataObj.actionData[i].id == dragDataObj.actionData[j].id) {
                            dragDataObj.actionData.splice(i, 1);
                            break;
                        }
                    }
                    i++;
                }
            }
        }

        function drawDeviceToMap(netmap, dragDataObj, event) {
            getNetmapOperator(netmap).then(function (netMapOperator) {
                var dragDeviceCount = { x: 0, y: 0 };
                distinctDevices(dragDataObj);
                var chunkSize = 500000; //临时屏蔽分50个一组多次画device的功能
                var dragDevices = dragDataObj.actionData;
                if (!dragDevices || dragDevices.length <= 0) return;
                angular.forEach(dragDevices, function (dragDevice) {
                    var ptLocation = netMapOperator.dropPosition(dragDeviceCount, event);
                    dragDevice.ptLocation = ptLocation;
                    dragDeviceCount.x++;
                });

                var chunkNum = Math.ceil(dragDevices.length / chunkSize);
                for (var chunk = 0; chunk < chunkNum; chunk++) {
                    var startIdx = chunk * chunkSize;
                    var tempEndIdx = (chunk + 1) * chunkSize;
                    var endIdx = tempEndIdx > dragDevices.length ? dragDevices.length : tempEndIdx;
                    var deviceChunks = dragDevices.slice(startIdx, endIdx);
                    netMapOperator.dropDeviceByDragDeviceData(deviceChunks, event, null, httpExternNbrSrvc, autoLinkOptionSrvc, dataViewCacheSrvc, nbAlertSrvc, applyDataViewSrvc);
                }
            });
        }
        function drawDevice(dragDataObj, event) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    drawDeviceToMap(netmap, dragDataObj, event);
                });
            });

        }
        function drawStencilItem(dragDataObj, event) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    getNetmapOperator(netmap).then(function (netMapOperator) {
                        netMapOperator.drawStencilItem(dragDataObj, event);
                    });
                });
            });
        }
        function drawSite(dragDataObj, event) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    getNetmapOperator(netmap).then(function (netMapOperator) {
                        netMapOperator.drawSite(httpSiteManagerSrvc, dragDataObj.actionData, event, httpExternNbrSrvc, autoLinkOptionSrvc, dataViewCacheSrvc, nbAlertSrvc, applyDataViewSrvc);
                    });
                });
            });
        }
        function drawMedia(dragDataObj, event) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    getNetmapOperator(netmap).then(function (netMapOperator) {
                        netMapOperator.drawMedia(httpMediaSrvc, dragDataObj.actionData, event);
                    });
                });
            });
        }
        function drawDeviceGroup(dragDataObj, event) {
            if (!dragDataObj.actionData || dragDataObj.actionData.length === 0)
                return;
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    getNetmapOperator(netmap).then(function (netMapOperator) {
                        for (var i = 0; i < dragDataObj.actionData.length; i++) {
                            netMapOperator.drawDeviceGroup(dragDataObj.actionData[i]);
                        }

                    });
                });
            });
        }
        function drawNeighbor(dragDataObj) {
            if (!dragDataObj.actionData)
                return;
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    getNetmapOperator(netmap).then(function (netMapOperator) {
                        var transactionName = NgUtil.getUniqueStr('drawNeighbor');
                        var diagram = netmap.getGoJsDiagram();
                        diagram.startTransaction(transactionName);
                        netMapOperator.extendNeighborsWithDataViewsSegment(dragDataObj.actionData.nbrList, dragDataObj.actionData.dataViewsSegment, applyDataViewSrvc);
                        diagram.commitTransaction(transactionName);
                    });
                });

            });
        }
        function drawPathToMap(netmap, dragDataObj, mapInfo) {//from nbPathLogDirective.js
            var drawMapDataListArray = dragDataObj.actionData.drawMapDataList;
            var hopsListArray = dragDataObj.actionData.hopsList;
            var mapId = (mapInfo && mapInfo.mapId) || mapManagerSrvc.getActiveMap().getDocId();
            var mapPageId = (mapInfo && mapInfo.mapPageId) || mapManagerSrvc.getActivePage().getDocId();
            var index = 0;
            function drawNotes() {
                $rootScope.$broadcast('updateMapViewFunc', {
                    mapInfo: {
                        mapId: mapId,
                        mapPageId: mapPageId
                    },
                    drawMapFunctions: getDrawMapFunctions(drawMapDataListArray)
                });
            };
            function getDrawMapFunctions(drawMapDataList) {
                var result = [];
                _.each(
                    drawMapDataList,
                    function (item) {
                        var arr = item;
                        _.each(arr, function (innerItem) {
                            result = result.concat(innerItem.functions);
                        });
                    }
                );
                return result;
            };
            function next() {
                var val = hopsListArray[index];
                index++;
                if (val) {
                    val.mapId = mapId;
                    val.mapPageId = mapPageId;
                    val.isFromMapPath = true;


                    $rootScope.$broadcast('hopListChange', val);
                    return next();
                } else {
                    $rootScope.$broadcast('endMapPathTransaction', mapInfo? mapInfo:{}, drawNotes);
                }
            }



            $rootScope.$broadcast('beginMapPathTransaction', mapInfo ? mapInfo : {});
            next();


        };
        function drawPath(dragDataObj, mapInfo) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    drawPathToMap(netmap, dragDataObj, mapInfo);
                });
            });


        }

        function openPanel(dragDataObj, event) {

            return getNetMap(dragDataObj).then(function (netmap) {
                openPanelByType(dragDataObj);
            });


        }

        function openPanelByType(dragDataObj) {
            $rootScope.$emit(viewFrameEvent.toggleTopPanel, dragDataObj.panelType, dragDataObj.option);
        }

        function drawJson(dragDataObj, event) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    netmap._netmapJsWrapper.pageData.linkDataArray = dragDataObj.actionData.linkDataArray;
                    netmap._netmapJsWrapper.pageData.nodeDataArray = dragDataObj.actionData.nodeDataArray;
                    
                    netmap.doOpen(netmap._netmapJsWrapper.pageData);
                    netmap.setActive(true);
                    netmap.setReadOnly(false);
                    netmap.refreshMapViewOptionVisible();
                   
                    //fix ENG-20622 加入timeout是为了解决netMapCtrl $scope.initCtrl中timeout(function(){netmap.setModify(false)})
                    $timeout(function () {
                        netmap.setModify(true);
                    });

                });
            });
        };
        function drawNodeJson(dragDataObj, event) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    _drawEachNodeJson(netmap, dragDataObj);
                });
            });
        }
        function drawNodeByTopoLinks(dragDataObj, event) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    _renderMap(netmap, dragDataObj);
                });
            });
        }
        /*
         * renderMap
         */
        function _renderMap(netmap, actionData) {
            getNetmapOperator(netmap).then(function (netMapOperator) {
                var args = actionData.actionData;
                if (args.renderType === "ByLinks") {
                    if (args.neighborLinks && args.neighborLinks.length > 0) {
                        netMapOperator.extendNeighborsWithDataViewsSegment(args.neighborLinks, args.dataViewsSegment);
                    }
                    //draw alone device
                    _.each(args.dataViewsSegment.devDataViewSegmentList, function (item) {
                        var existItem = _.find(args.neighborLinks, function (obj) {
                            return obj.devId == item.devId || obj.nbrDevId == item.devId
                        });
                        if (!existItem) {
                            netMapOperator.dropDeviceByDataView(item.devDataView);
                        }
                    });
                    //Refresh
                    netMapOperator.forceDirectedLayoutNew();
                }
                else if (args.renderType === "ByNodes") {
                    netMapOperator.addDevices(httpExternNbrSrvc, args.neighborNodes, "L3_Topo_Type").then(function () {
                        netMapOperator.forceDirectedLayoutNew();
                    });
                }
            });
        };

        function _drawEachNodeJson(netmap, dragDataObj) {
            var newNodeIds = [];
            var linkCalcCount = 0;

            var netMapOperator = netmap.getNetmapOperator();
            var needLayout = dragDataObj.needLayout === true;

            var viewportBounds = netMapOperator.getViewportBounds();
            var startX = viewportBounds.left || 0;
            var startY = viewportBounds.top || 0;
            var width = viewportBounds.width || 500;
            var height = viewportBounds.height || 500;

            netmap.setActive(true);
            netmap.setReadOnly(false);
            _.each(dragDataObj.actionData.nodeDataArray, function (node) {
                NetBrain.Map.CompPrototypeFactory.buildCompPrototype(node);
                if (!netmap._model.findNodeDataForKey(node.key)) {
                    // 需要layout 将设备随机放在map 可视范围上
                    if (needLayout) {
                        var x = startX + Math.random() * width;
                        var y = startY + Math.random() * height;

                        node.location = x + ' ' + y;
                    }

                    netMapOperator.addDevice(node);
                    newNodeIds.push(node.key);
                }
                else {
                    if (NetBrain.Map.CategoryMgr.isNetworkDevice(node.category)) {
                        netmap._centerNode(node);
                        netMapOperator.highlightNode(node);
                    }

                }
            });
            _.each(dragDataObj.actionData.linkDataArray, function (link) {
                NetBrain.Map.CompPrototypeFactory.buildCompPrototype(link);
                netMapOperator.addLinkLine(link);
                var diagram = netmap.getGoJsDiagram();
                var diagramLink = diagram.findLinkForData(link);
                if (diagramLink && diagramLink.invalidateRoute) {
                    diagramLink.invalidateRoute();

                    linkCalcCount++;
                }
            });

            if (needLayout && newNodeIds.length > 0 && linkCalcCount > 0) {
                netMapOperator.forceDirectedLayoutNew(newNodeIds);
            }
            netmap.refreshMapViewOptionVisible();
        }

        function getNetMap(dragDataObj) {
            var deferred = $q.defer();
            getActiveNetMap();
            function getActiveNetMap() {

                var isDeskTopPage = mainUISrvc.isDesktop();
                var netmap = mapManagerSrvc.getActivePage();
                var options;
                var key;
                if (isDeskTopPage && !netmap) {
                    var reInitMapCtrlCallBack = function () {
                        $timeout(function () {
                            netmap = mapManagerSrvc.getActivePage();
                            if (dragDataObj.topoType) {
                                var defaultMapAutoLinkOptionList = [dragDataObj.topoType];
                                netmap.setMapAutoLinkOptionList(defaultMapAutoLinkOptionList);
                            }
                            deferred.resolve(netmap);
                        },
                            300);

                    }
                    var mapArgs = {
                        id: Guid(),
                        callBack: reInitMapCtrlCallBack
                    };
                    utilitySrvc.setLocalStorage("CreateMap" + mapArgs.id, true);
                    $rootScope.$emit("NewMap", null, mapArgs);
                }

                else if (null == netmap
                    || dragDataObj.forceCreateNewMap
                    || (mapManagerSrvc.getActiveMap() && mapManagerSrvc.getActiveMap().getMapType() && mapManagerSrvc.getActiveMap().getMapType() == 2)) {
                    key = Guid();
                    options = {
                        isCreateNew: true,
                        urlKey: key
                    };
                    dragDataObj.forceCreateNewMap = false;
                    utilitySrvc.setLocalStorage(key, dragDataObj);
                    urlStateMgr.openMap(options);
                } else {
                    if (isDeskTopPage) {
                        $rootScope.$emit(NetBrain.NetworkOS.Const.UIFramework.Events.ShowMainContentArea, "floating-map");
                    }
                    deferred.resolve(netmap);
                }
            }
            return deferred.promise;
        }
        function getNetmapOperator(netmap) {
            var deferred = $q.defer();
            eachGet();
            function eachGet() {
                var netmapOperator = netmap.getNetmapOperator();
                if (null == netmapOperator) {
                    $timeout(eachGet, 400);
                }
                else {
                    deferred.resolve(netmapOperator);
                }

            }
            return deferred.promise;
        }
        return services;
    }
}(NetBrain))