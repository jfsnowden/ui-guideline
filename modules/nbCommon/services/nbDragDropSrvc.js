/* global Guid */
(function(NetBrain) {
    'use strict';

    angular.module('nb.common').factory('nb.common.nbDragDropSrvc', nbDragDropSrvc);
    nbDragDropSrvc.$inject = [
        '$q',
        '$log',
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
        'nb.qmap.updateMapSrvc',
        'nb.sdn.httpSdnSrvc'
    ];

    function nbDragDropSrvc($q, $log, $timeout, $rootScope, nbAlertSrvc, httpExternNbrSrvc, autoLinkOptionSrvc, dataViewCacheSrvc, mapManagerSrvc, urlStateMgr, utilitySrvc, httpSiteManagerSrvc, httpMediaSrvc, mainUISrvc, applyDataViewSrvc, updateMapSrvc, httpSdnSrvc) {
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
            drawNode: drawNode,
            openPanel: openPanel,
            drawVisualSpaceDiagram: drawVisualSpaceDiagram
        };


        function distinctDevices(dragDataObj) {
            // 从 dragDataObj.actionData 去掉重复设备
            var i = 0;
            if (dragDataObj != null && dragDataObj.actionData != null && dragDataObj.actionData && dragDataObj.actionData.length > 1) {
                while (i < dragDataObj.actionData.length) {
                    for (var j = 0; j < i; j++) {
                        if (dragDataObj.actionData[i].id === dragDataObj.actionData[j].id) {
                            dragDataObj.actionData.splice(i, 1);
                            break;
                        }
                    }
                    i++;
                }
            }
        }

        function drawDeviceToMap(netmap, dragDataObj, event) {
            var deferred = $q.defer();
            var appPro = [];
            getNetmapOperator(netmap).then(function(netMapOperator) {
                var dragDeviceCount = { x: 0, y: 0 };
                distinctDevices(dragDataObj);
                var chunkSize = 500000; // 临时屏蔽分50个一组多次画device的功能
                var dragDevices = dragDataObj.actionData;
                if (!dragDevices || dragDevices.length <= 0) return;
                angular.forEach(dragDevices, function(dragDevice) {
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
                    appPro.push(netMapOperator.dropDeviceByDragDeviceData(deviceChunks, event, null, httpExternNbrSrvc, autoLinkOptionSrvc, dataViewCacheSrvc, nbAlertSrvc, applyDataViewSrvc));
                }

                 $q.all(appPro).then(function() {
                     deferred.resolve();
                 });

             });
            return deferred.promise;

        }

        function drawDevice(dragDataObj, event) {
            return getNetMap(dragDataObj).then(function (netmap) {
                return updateMapSrvc.canUpdateCurrentMap().then(function () {
                    return drawDeviceToMap(netmap, dragDataObj, event);
                });
            });
        }

        function drawStencilItem(dragDataObj, event) {
            getNetMap(dragDataObj).then(function(netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    getNetmapOperator(netmap).then(function(netMapOperator) {
                        netMapOperator.drawStencilItem(dragDataObj, event);
                    });
                });
            });
        }

        function drawSite(dragDataObj, event) {
            getNetMap(dragDataObj).then(function(netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    getNetmapOperator(netmap).then(function(netMapOperator) {
                        netMapOperator.drawSite(httpSiteManagerSrvc, dragDataObj.actionData, event,
                            httpExternNbrSrvc, autoLinkOptionSrvc, dataViewCacheSrvc, nbAlertSrvc, applyDataViewSrvc);
                    });
                });
            });
        }

        function drawMedia(dragDataObj, event) {
            getNetMap(dragDataObj).then(function(netmap) {
                if (!netmap.getVisualSpaceInfo()) {
                    netmap.setVisualSpaceInfo({
                        visualSpaceInstanceId: VisualSpaceConstant.defaultVisualSpaceInstanceId,
                        visualSpaceName: VisualSpaceConstant.defaultVisualSpaceName
                    }, true);
                }

                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    getNetmapOperator(netmap).then(function(netMapOperator) {
                        netMapOperator.drawMedia(httpMediaSrvc, dragDataObj.actionData, event);

                    });
                });
            });
        }

        function isDrawingGroup(lsNodes) {
            for (var i = 0; i < lsNodes.length; i++) {
                if (lsNodes[i].isGroup === true)
                    return true;
            }

            return false;
        }

        /**
         * 这个函数还需要在添加CompNode后进行优化，现在Node list中的object是怎么来的。
         * @param {} netmap
         * @param {} dragDataObj
         * @param {} event
         * @returns {}
         */
        function drawVisualSpaceDiagram(netmap, dragDataObj, event) {
            var lstNode = dragDataObj["NodeList"];
            var lstLink = dragDataObj["LinkList"];
            if (lstNode.length == 0 || null == netmap) {
                return;
            }

            // filter out duplicate links
            var lstLinkNew = [];
            for (var i = 0; i < lstLink.length; i++)
            {
                var link = lstLink[i];
                var bExist = false;

                for (var j = 0; j < lstLinkNew.length; j++) {
                    if (lstLinkNew[j]._id === link._id && lstLinkNew[j].from === link.from && lstLinkNew[j].to === link.to && lstLinkNew[j].direction === link.direction) {
                        bExist  = true;
                        break;
                    }
                }

                if (isLinkExist(netmap, link)) {
                    bExist = true;
                    break;
                }

                if (!bExist)
                {
                    lstLinkNew.push(link);
                }
            }
            lstLink = lstLinkNew;

            updateMapSrvc.canUpdateCurrentMap().then(function () {
                getNetmapOperator(netmap).then(function(netMapOperator) {
                    for (var i = 0; i < lstNode.length; i++) {
                        var node = lstNode[i];
                        NetBrain.Map.CompPrototypeFactory.buildCompPrototype(node);
                        netMapOperator.drawVisualSpaceNode(node);
                    }

                    netMapOperator.addLinkLines(lstLink, false);

                    //auto layout
                    netmap.getCmdTarget().onLayeredDigraphLayout();//onCircularLayout();
                });
            });
        }

        function drawDeviceGroup(dragDataObj, event) {
            if (!dragDataObj.actionData || dragDataObj.actionData.length === 0)
                return;

            getNetMap(dragDataObj).then(function(netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    getNetmapOperator(netmap).then(function(netMapOperator) {
                        for (var i = 0; i < dragDataObj.actionData.length; i++) {
                            netMapOperator.drawDeviceGroup(dragDataObj.actionData[i]);
                        }
                    });
                });
            });
        }

        function drawNeighbor(dragDataObj) {
            if (!dragDataObj.actionData) {
                return;
            }
            getNetMap(dragDataObj).then(function(netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    getNetmapOperator(netmap).then(function(netMapOperator) {
                        var transactionName = NgUtil.getUniqueStr('drawNeighbor');
                        var diagram = netmap.getGoJsDiagram();
                        diagram.startTransaction(transactionName);
                        netMapOperator.extendNeighborsWithDataViewsSegment(dragDataObj.actionData.nbrList,
                            dragDataObj.actionData.dataViewsSegment, applyDataViewSrvc);
                        diagram.commitTransaction(transactionName);
                    });
                });
            });
        }

        function drawPathToMap(netmap, dragDataObj, mapInfo) { // from nbPathLogDirective.js
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
            }

            function getDrawMapFunctions(drawMapDataList) {
                var result = [];
                _.each(
                    drawMapDataList,
                    function(item) {
                        var arr = item;
                        _.each(arr, function(innerItem) {
                            result = result.concat(innerItem.functions);
                        });
                    }
                );
                return result;
            }

            function next() {
                var val = hopsListArray[index];
                index++;
                if (val) {
                    val.mapId = mapId;
                    val.mapPageId = mapPageId;
                    val.isFromMapPath = true;


                    $rootScope.$broadcast('hopListChange', val);
                    return next();
                }
                $rootScope.$broadcast('endMapPathTransaction', mapInfo ? mapInfo : {}, drawNotes);
                return undefined;
            }

            $rootScope.$broadcast('beginMapPathTransaction', mapInfo ? mapInfo : {});
            next();
        }

        function drawPath(dragDataObj, mapInfo) {
            getNetMap(dragDataObj).then(function(netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    drawPathToMap(netmap, dragDataObj, mapInfo);
                });
            });
        }

        function openPanel(dragDataObj) {
            return getNetMap(dragDataObj).then(function() {
                openPanelByType(dragDataObj);
            });
        }

        function generateLinkKey(link) {
            return [
                link.from,
                link.to,
                link.fromText,
                link.toText
            ].join('|');
        }

        function isLinkExist(netmap, link) {
            var linkKey = generateLinkKey(link);

            var links = netmap._getAllLinksByFilter(function (currentLink) {
                return generateLinkKey(currentLink) === linkKey;
            });

            return links && links.length > 0;
        }

        function drawNodeToMap(netmap, dragDataObj, event) {
            var isForceLayout = false;
            if (netmap._diagram.nodes.count == 0) {
                isForceLayout = true;
            }

            var dictGoJsTemplates = null;
            var visualSpaceInstanceId = dragDataObj.visualSpaceInstanceId;

            getNetmapOperator(netmap).then(function (netMapOperator) {
                var dragData = {
                    actionData: [],
                    actionType: dragDataObj.actionType,
                    isSiteDevices: dragDataObj.isSiteDevices
                };

                dragDataObj.actionData.forEach(function (item) {
                    dragData.actionData.push({
                        id: item.key,
                        devNodeData: {
                            id: item.key,
                            visualSpaceInfo: {
                                visualSpaceInstanceId: dragDataObj.visualSpaceInstanceId
                            },
                            nodeIdentify: {
                                nbPathSchema: item.nbPathSchema,
                                nbPathValue: item.nbPathValue
                            }
                        }
                    });
                });

                drawDeviceToMap(netmap, dragData, event);
            });
        }

        function getIntfInfoForLink(node, currLink) {
            var fromNodeKey = currLink.from;
            var toNodeKey = currLink.to;

            if (!node.dataViewData ||
                !node.dataViewData.intfInfoList) {
                return;
            }

            for (var i = 0; i < node.dataViewData.intfInfoList.length; i++) {
                var currIntfInfo = node.dataViewData.intfInfoList[i];
                if (!currIntfInfo.intf || !currIntfInfo.intf.intfKeyObj || !currIntfInfo.intf.intfKeyObj.value)
                    continue;

                var intfKeyValue = currIntfInfo.intf.intfKeyObj.value;
                if ( (intfKeyValue.indexOf(fromNodeKey) === 0 && intfKeyValue.length > fromNodeKey.length && intfKeyValue.charAt(fromNodeKey.length) === '/')
                    || (intfKeyValue.indexOf(toNodeKey) === 0 && intfKeyValue.length > toNodeKey.length && intfKeyValue.charAt(toNodeKey.length) === '/')
                ) {
                    return currIntfInfo;
                }
            }

            return null;
        }

        function modifyGoJsTemplate(netmap, diagram, dictGoJsTemplates) {
            if (!dictGoJsTemplates) {
                return;
            }
            var dictNodeTmpl = dictGoJsTemplates.nodeTemplates;
            var dictLinkTmpl = dictGoJsTemplates.linkTemplates;
            var dictGroupTmpl = dictGoJsTemplates.groupTemplates;

            //scope参考于CompDevice.getTheMainPanel中的参数, 命名意义不明, 建议在Comp中去定义，并注释，实际是nbGoDiagramDirective中的scope, 在某一处赋值给了netmap的currentScopeRef变量
            //用于db中的goJs模板中的
            var fnLocationParse = function (data, node) {
                return NetBrain.Map.GoDiagramPositionUtil.zoomPositionParse(diagram, data);
            };

            var fnPointStringify = function (pt, data) {
                return NetBrain.Map.GoDiagramPositionUtil.zoomPositionStringify(diagram, pt, data);
            };

            var scope = netmap.currentScopeRef;
            var $ = go.GraphObject.make;
            var lsNodeCates = Object.keys(dictNodeTmpl);
            lsNodeCates.forEach(function(nodeCate) {
                var $ = go.GraphObject.make;
                var nodeTmpl = eval(dictNodeTmpl[nodeCate]);
                diagram.nodeTemplateMap.add(nodeCate, nodeTmpl);
            });

            var lsLinkCates = Object.keys(dictLinkTmpl);
            lsLinkCates.forEach(function(linkCate) {
                var $ = go.GraphObject.make;
                var linkTmpl = eval(dictLinkTmpl[linkCate]);
                diagram.linkTemplateMap.add(linkCate, linkTmpl);
            });

            var lsGroupCates = Object.keys(dictGroupTmpl);
            lsGroupCates.forEach(function(groupCate) {
                var $ = go.GraphObject.make;
                var groupTmpl = eval(dictGroupTmpl[groupCate]);

                diagram.groupTemplateMap.add(groupCate, groupTmpl);
            });

        }
        function drawNode(dragDataObj, event) {
            getNetMap(dragDataObj).then(function (netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function () {
                    drawNodeToMap(netmap, dragDataObj, event);
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

        function drawJson(dragDataObj) {
            getNetMap(dragDataObj).then(function(netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    netmap._netmapJsWrapper.pageData.linkDataArray = dragDataObj.actionData.linkDataArray;
                    netmap._netmapJsWrapper.pageData.nodeDataArray = dragDataObj.actionData.nodeDataArray;

                    netmap.doOpen(netmap._netmapJsWrapper.pageData);
                    netmap.setActive(true);
                    netmap.setReadOnly(false);
                    netmap.refreshMapViewOptionVisible();

                    // fix ENG-20622 加入timeout是为了解决netMapCtrl $scope.initCtrl中timeout(function(){netmap.setModify(false)})
                    $timeout(function() {
                        netmap.setModify(true);
                    });
                });
            });
        }

        function drawNodeJson(dragDataObj) {
            getNetMap(dragDataObj).then(function(netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    _drawEachNodeJson(netmap, dragDataObj);
                });
            });
        }

        function drawNodeByTopoLinks(dragDataObj) {
            getNetMap(dragDataObj).then(function(netmap) {
                updateMapSrvc.canUpdateCurrentMap().then(function() {
                    _renderMap(netmap, dragDataObj);
                });
            });
        }
        /*
         * renderMap
         */
        function _renderMap(netmap, actionData) {
            getNetmapOperator(netmap).then(function(netMapOperator) {
                var args = actionData.actionData;
                if (args.renderType === 'ByLinks') {
                    if (args.neighborLinks && args.neighborLinks.length > 0) {
                        netMapOperator.extendNeighborsWithDataViewsSegment(args.neighborLinks, args.dataViewsSegment);
                    }
                    // draw alone device
                    _.each(args.dataViewsSegment.devDataViewSegmentList, function(item) {
                        var existItem = _.find(args.neighborLinks, function(obj) {
                            return obj.devId === item.devId || obj.nbrDevId === item.devId;
                        });
                        if (!existItem) {
                            netMapOperator.dropDeviceByDataView(item.devDataView);
                        }
                    });
                    // Refresh
                    netMapOperator.forceDirectedLayoutNew();
                } else if (args.renderType === 'ByNodes') {
                    netMapOperator.addDevices(httpExternNbrSrvc, args.neighborNodes, 'L3_Topo_Type').then(function() {
                        netMapOperator.forceDirectedLayoutNew();
                    });
                }
            });
        }

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

            function doAddNodeJsonToMap() {
                var transactionName = NgUtil.getUniqueStr('doAddNodeJsonToMap');
                netMapOperator.startTransaction(transactionName);

                _.each(dragDataObj.actionData.nodeDataArray, function(node) {
                    //pre add node

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
                var addLinks = [];
                _.each(dragDataObj.actionData.linkDataArray, function (link) {
                    NetBrain.Map.CompPrototypeFactory.buildCompPrototype(link);
                    var flag = netMapOperator.addLinkLine(link);

                    if (flag) {
                        addLinks.push(link);
                    }
                });

                if (needLayout && newNodeIds.length > 0/* && linkCalcCount > 0*/) {
                    netMapOperator.forceDirectedLayoutNew(newNodeIds);
                }
                netmap.refreshMapViewOptionVisible();

                netMapOperator.commitTransaction(transactionName);

                _.each(addLinks, function (link) {
                    var diagram = netmap.getGoJsDiagram();
                    var diagramLink = diagram.findLinkForData(link);
                    if (diagramLink && diagramLink.invalidateRoute) {
                        diagramLink.invalidateRoute();
                    }
                });
            }

            var scope = netmap.getCurrentScope();

            //make sure all data are same VisualSpaceInstanceId before all the function
            var defered = $q.defer();
            if (!_.isEmpty(dragDataObj.actionData.nodeDataArray)) {
                var nodeTemp = dragDataObj.actionData.nodeDataArray[0];
                if (netmap.setVisualSpaceInfo(nodeTemp.devNodeData.visualSpaceInfo)) {
                    doAddNodeJsonToMap();
                } else {
                    scope.$emit(NetBrain.Map.Event.ConfirmAddNewMapPage, netmap.getParentQmap(), defered, "");
                }
            }

            defered.promise.then(function () {
                //新建netmap
                var cache_defered = $q.defer();
                scope.$emit(NetBrain.Map.Event.AddNewMapPage, netmap.getParentQmap(), cache_defered);

                //等待netmap初始化，然后才真正的添加Node
                setTimeout(function () {
                    cache_defered.promise.then(function (newNetMap) {
                        _drawEachNodeJson(newNetMap, dragDataObj);
                    }, function () {
                    }, 0);
                });
            });
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
                    var reInitMapCtrlCallBack = function() {
                        $timeout(function() {
                            netmap = mapManagerSrvc.getActivePage();
                            if (dragDataObj.topoType) {
                                var defaultMapAutoLinkOptionList = [dragDataObj.topoType];
                                netmap.setMapAutoLinkOptionList(defaultMapAutoLinkOptionList);
                            }
                            deferred.resolve(netmap);
                        }, 300);
                    };
                    var mapArgs = {
                        id: Guid(),
                        callBack: reInitMapCtrlCallBack
                    };
                    utilitySrvc.setLocalStorage("CreateMap" + mapArgs.id, {});
                    $rootScope.$emit('NewMap', null, mapArgs);
                } else if (netmap == null ||
                    dragDataObj.forceCreateNewMap ||
                    (mapManagerSrvc.getActiveMap() && mapManagerSrvc.getActiveMap().getMapType() &&
                        mapManagerSrvc.getActiveMap().getMapType() === 2)) {
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
                        $rootScope.$emit(NetBrain.NetworkOS.Const.UIFramework.Events.ShowMainContentArea, 'floating-map');
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
                if (netmapOperator == null) {
                    $timeout(eachGet, 400);
                } else {
                    deferred.resolve(netmapOperator);
                }
            }
            return deferred.promise;
        }
        return services;
    }
})(NetBrain);
