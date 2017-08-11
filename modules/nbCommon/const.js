;
(function (NetBrain) {
    'use strict';
    var consts = NetBrain.ns("Common.Const");
    consts.NS_NAME = 'nb.Common';
    consts.ActionType = {
        DrawMedia: "DrawMedia",
        DrawDevice: "DrawDevice",
        DrawDeviceGroup: "DrawDeviceGroup",
        DrawDeviceGroupDevice: "DrawDeviceGroupDevice",
        DrawSite: "DrawSite",
        DrawStencilItem: "DrawStencilItem",
        DrawPath: "DrawPath",
        DrawNeighbour: "DrawNeighbour",
        DrawJson: "DrawJson",
        DrawNodeByTopoLinks: "DrawNodeByTopoLinks",
        OpenPanel: "OpenPanel"
    };
    consts.DeviceGroupTypeName = {
        RootTitle: "Device Group",
        Private: "My Device Groups",
        Shared: "Public",
        System: "System"
    };
}(NetBrain))