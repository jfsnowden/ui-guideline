(function(NetBrain) {
    'use strict';

    var consts = NetBrain.ns('Common.Const');
    consts.NS_NAME = 'nb.Common';
    consts.ActionType = {
        DrawMedia: 'DrawMedia',
        DrawDevice: 'DrawDevice',
        DrawDeviceGroup: 'DrawDeviceGroup',
        DrawDeviceGroupDevice: 'DrawDeviceGroupDevice',
        DrawSite: 'DrawSite',
        DrawStencilItem: 'DrawStencilItem',
        DrawPath: 'DrawPath',
        DrawNeighbour: 'DrawNeighbour',
        DrawJson: 'DrawJson',
        DrawNodeByTopoLinks: 'DrawNodeByTopoLinks',
        OpenPanel: 'OpenPanel',
        DrawNode: 'DrawNode'
    };
    consts.DeviceGroupTypeName = {
        RootTitle: 'Device Group',
        Private: 'My Device Groups',
        Shared: 'Public',
        System: 'System'
    };
    consts.KeyCode = {
        Ctrl: 17,
        Shift: 16,
        Alt: 18,
        Del: 46,
        L: 76,
        R: 82,
        C: 67,
        T: 84,
        B: 66,
        M: 77,
        S: 83
    };
    consts.LegacySchema = {
        Legacy: "Legacy",
        Media: "Media"
    }
}(NetBrain))