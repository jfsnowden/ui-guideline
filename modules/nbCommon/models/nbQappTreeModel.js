(function (window) {
    'use strict';
    function nbQappTreeMgr(settings, options) {
        var me = this;
        this._settings = {};
        this._tree = [];
        this._nodes = {};
        this._search = '';
        this._isSearchDirty = false;
        this._counter = {
            start: 1,
            end: 2000000000,
            value: 1
        }
        this.constant = nbQappTreeMgr.Constant;
        this.handle = {};
        function mergeOptions(dst, src) {
            Object.keys(nbQappTreeMgr.Constant.nodeAttrBindings).forEach(function (attr) {
                if (src.hasOwnProperty(nbQappTreeMgr.Constant.nodeAttrBindings[attr]))
                    dst[attr] = src[nbQappTreeMgr.Constant.nodeAttrBindings[attr]];
                else
                    dst[attr] = attr;
            });
        }
        function mergeSettings(dst, src) {
            Object.keys(nbQappTreeMgr.Constant.configs).forEach(function (attr) {
                if (src.hasOwnProperty(attr)) {
                    dst[attr] = src[attr];
                }
                else
                    dst[attr] = nbQappTreeMgr.Constant.configs[attr];
            });
            Object.keys(nbQappTreeMgr.Constant.handles).forEach(function (attr) {
                if (src.hasOwnProperty(attr))
                    dst[attr] = src[attr];
                else
                    dst[attr] = dst[attr] && nbQappTreeMgr.Constant.handles[attr];
            });
        }
        mergeOptions(this._settings, options);
        mergeSettings(this._settings, settings);
        Object.keys(nbQappTreeMgr.Constant.handles).forEach(function (handleName) {
            me.handle[handleName] = function () {
                var node;
                switch (handleName) {
                    case 'onSelectNode':
                        node = arguments[0];
                        if (node['$edit']) return;
                        me.select(node.id);
                        break;
                    case 'onUpdateNodeName':
                        node = arguments[0];
                        var isChanged = arguments[1];
                        if (!node['$edit'])
                            return;
                        if (!isChanged && !(node.newCat)) {
                            node.name = node.name.trim();
                            node['$edit'] = false;
                            return;
                        }
                        break;
                    case 'onSelectAction':
                        node = arguments[0];
                        //$(document).click();
                        break;
                }
                if (me._settings[handleName]) {
                    var args = [].slice.call(arguments)
                    return me._settings[handleName].apply(me, args);
                }
                return false;
            }
        });
    };
    window.nbQappTreeMgr = nbQappTreeMgr;
    nbQappTreeMgr.Constant = {
        nodeAttrBindings: { 'id': 'idAttribute', 'pid': 'parentIdAttribute', 'name': 'labelAttribute', 'child': 'childrenAttribute', 'expended': 'expandedAttribute' },
        configs: { 'enableSearch': false, 'enableCalcNodeNumber': false, 'enableSort': true, 'enableDispFileNode': true },
        handles: { 'onInitNode': null, 'onUpdateNodeName': null, 'onSelectAction': null, 'onSelectNode': null, 'onSort': null, 'isFolder': null, 'isRoot': null },
        nodeStatus: { normal: 0, edit: 1, del2: -2, add2: -3, del: 2, add: 3 },
        ex: {
            Sprintf_Exception: 'sprintf error',
            MultiRoot: 'nodes have more than 1 root node.',
            TreeNodeIsNull: 'tree node array is null',
            NoRoot: 'nodes have no root node.',
            NodeNotHaveProperty: 'node "{0}" doesn\'t have property: {1}',
            NodeIdCollaps: 'node\'s {0} {1} collaps',
            NodeIdLength: 'length of node\'s {0} must > 0',
            zzLast: null
        },
        template: {
            tmp1: '<div ng-if="node[\'$isDisplay\']" style="min-width: 100%; white-space: nowrap; display:inline-block;">\
            <div style="white-space: nowrap; display:inline-block; position: relative;" class="ivh-tree-node ivh-node-row" ng-click="node[\'$_tree\'][\'handle\'][\'onSelectNode\'](node)" ng-class="{selected: (node[\'$selected\'])}">\
                <span ivh-treeview-toggle class="node-icon">\
                    <span ng-if="::!node[\'$isFolder\']">\
                        <span style="opacity: 0;" class="icon_nb_tree_expand"></span>\
                        <span style="margin: -5px 0 0 0;" class="nb-parser-img-file"></span>\
                    </span>\
                    <span ng-if="node[\'$isFolder\'] && node[\'$expended\']">\
                        <span ng-style="{\'opacity\': (node[\'$hasDispChild\']) ? 1 : 0}" class="icon_nb_tree_collapse"></span>\
                        <span style="margin: -5px 0 0 0;" class="nb-parser-img-folder-open"></span>\
                    </span>\
                    <span ng-if="node[\'$isFolder\'] && !(node[\'$expended\'])">\
                        <span ng-style="{\'opacity\': (node[\'$hasDispChild\']) ? 1 : 0}" class="icon_nb_tree_expand"></span>\
                        <span style="margin: -5px 0 0 0;" class="nb-parser-img-folder-close"></span>\
                    </span>\
                </span>\
                <span title="{{node[\'$name\']}}" ng-if="!node[\'$edit\']" style="cursor: pointer;" spellcheck="false" class="nbUiGridCellWithMenuCell" ng-bind-html="node[\'$name\'] | nbParserTreeHighlightFilter: !node[\'$edit\'] && node[\'$_tree\'][\'_search\']"></span>\
                <input type="text" ng-if="node[\'$edit\']" id="editTree{{::node[\'$id\']}}" ng-model="node[\'$name\']" nb-on-update-text-directive="node[\'$_tree\'][\'handle\'][\'onUpdateNodeName\'](node, nbTextChanged, nbOldValue)" style="width: 100px; height: 24px; font-size: 12px;"/>\
                <span ng-if="node[\'$_tree\'][\'_settings\'][\'enableCalcNodeNumber\'] && node[\'$child\'] && node[\'$dispNo\']"  class="nbUiGridCellWithMenuCell">\
                    &nbsp;({{node[\'$fileNo\']}})\
                </span>\
                <div ng-if="node[\'$menu\'].length > 0" class="btn-group dropdown" style="position: absolute; top: 0px; right: 0px;">\
                    <span style="cursor: pointer;" class="nb-pl-msdisplay" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true"><i style="margin-top: 2px; background-color: white;" class="icon_nb_action_menu nb-parser-icon"></i></span>\
                    <ul class="dropdown-menu dropdown-menu-custom" uib-dropdown-menu role="menu" style="font-size: 12px; top: 24px; right: 0;left: inherit;">\
                        <li class="nb-select-option" ng-click="node[\'$_tree\'][\'handle\'][\'onSelectAction\'](node, action);" action-index="$index" ng-repeat="action in node[\'$menu\']" ng-style="{\'border-top\':(action[\'split\']) ? \'1px solid #cccccc\' : \'none\'}">\
                            <a>{{::action.title}}</a>\
                        </li>\
                    </ul>\
                </div>\
            </div>\
            <div ivh-treeview-children class="ivh-treeview-twistie-expanded"></div>\
        </div>'
        } // ng-if="node[\'$expended\']"
    }
    nbQappTreeMgr.Traverse = function (curNode, func, funcArgs) {
        if (func(curNode, funcArgs) === true)
            return true;
        if (curNode && curNode['$child']) {
            for (var i = 0; i < curNode['$child'].length; i++) {
                if (true === nbQappTreeMgr.Traverse(curNode['$child'][i], func, funcArgs)) {
                    return true;
                }
            }
        }
    };

    nbQappTreeMgr.prototype.checkInputNode = function (oriNode) {
    }

    nbQappTreeMgr.sprintf = function () {
        if (arguments.length === 0)
            throw new Error(nbQappTreeMgr.Constant.ex.Sprintf_Exception)
        var index = 1;
        var arg = arguments;
        return arguments[0].replace(/\{\d*\}/g, function (str) {
            if (arg.length > index)
                return String(arg[index]);
            else
                throw new Error(nbQappTreeMgr.Constant.ex.Sprintf_Exception)
        });
    }

    nbQappTreeMgr.prototype.getNO = function () {
        var no = this._counter;
        if (no.value > no.end || no.value < no.start) {
            no.value = no.start;
        }
        return no.value++;
    };



    nbQappTreeMgr.prototype.initNode = function (oriNodes, retArray) {
        var me = this;
        var node = null;
        var nodeArr = [];
        var oriNode = null;
        var props = { '$selected': false, '$fileNo': 0, '$display': true, '$status': nbQappTreeMgr.Constant.nodeStatus.normal, '$index': -1, '$showMenu': false, '$menu': [], '$edit': false, '$dispNo': true };
        var arrProps = Object.keys(props);
        var arrNodeBindings = Object.keys(nbQappTreeMgr.Constant.nodeAttrBindings);
        function treeNode(treeMgr) {
            var me = this;
            this['$_tree'] = treeMgr || null;
            this['$_parent'] = null;
            this['$sid'] = treeMgr.getNO();

            arrProps.forEach(function (ele) {
                me[ele] = props[ele];
            })
            arrNodeBindings.forEach(function (ele) {
                Object.defineProperty(me, '$' + ele, {
                    get: function () { return this[treeMgr._settings[ele]]; },
                    set: function (value) { this[treeMgr._settings[ele]] = value; }
                })
            })
            this['$isFolder'] = treeMgr._settings['isFolder'] ? treeMgr['handle']['isFolder'](oriNode) : true;
            Object.defineProperty(me, '$hasDispChild', {
                get: function () {
                    return this['$child'] && this['$child'].some(function (ele) {
                        return ele['$isFolder'] ? ele['$display'] : ele['$display'] && ele['$_tree']['_settings']['enableDispFileNode'];
                    })
                }
            })
            Object.defineProperty(me, '$isParentExpended', {
                get: function () {
                    if (!this['$_parent']) return true;
                    return this['$_parent']['$expended'];
                }
            })
            Object.defineProperty(me, '$isDisplay', {
                get: function () {
                    var ret = this['$display'];// && this['$isParentExpended'];
                    if (!this['$isFolder'] && !this['$_tree']['_settings']['enableDispFileNode'])
                        ret = false;
                    return ret;
                }
            })

            Object.defineProperty(me, 'nodePath', {
                get: function () {
                    return treeMgr.getFullName(this, false);
                }
            });
        }
        var oriNodeArr = Object.prototype.toString.call(oriNodes) === '[object Array]' ? oriNodes : [oriNodes];
        for (var i = 0; i < oriNodeArr.length; i++) {
            oriNode = oriNodeArr[i];
            me.checkInputNode(oriNode);

            node = new treeNode(me);
            node['$child'] = (node['$isFolder']) && [] || null;
            node['$status'] = nbQappTreeMgr.Constant.nodeStatus.add;

            for (var attr in oriNode) {
                if (oriNode.hasOwnProperty(attr)) {
                    node[attr] = oriNode[attr];
                }
            }
            nodeArr.push(node);
        }
        if (retArray) return nodeArr;
        else {
            if (nodeArr.length == 0)
                return null;
            else if (nodeArr.length == 1)
                return nodeArr[0]
            else
                return nodeArr;
        }
    }
    nbQappTreeMgr.prototype.clear = function () {
        var me = this;
        this._tree.splice(0, this._tree.length);
        Object.keys(this._nodes).forEach(function (attr) {
            delete me._nodes[attr];
        });
    }
    nbQappTreeMgr.prototype.$filtNodes = function (nodeMap/*key is id*/, rootNodes) {
        rootNodes.forEach(function (ele) {
            ele['$isValid'] = true;
        });
        function setValidNode(nodeMap, node) {
            if (node['$isValid']) return;
            var curNode = node;
            var nodeArr = [];
            var isValid = false;
            while (true) {
                nodeArr.push(curNode);
                if (curNode['$isValid']) {
                    isValid = true;
                    break;
                }
                curNode = nodeMap[curNode['$pid']];
                if (!curNode) break;
            }
            if (isValid) {
                nodeArr.forEach(function (ele) {
                    ele['$isValid'] = true;
                })
            }
        }
        var arrId = Object.keys(nodeMap);
        arrId.forEach(function (attr) {
            setValidNode(nodeMap, nodeMap[attr]);
        })
        arrId.forEach(function (attr) {
            if (!nodeMap[attr]['$isValid'])
                delete nodeMap[attr];
        });
        return nodeMap;
    }
    nbQappTreeMgr.prototype.init = function (nodeArr) {
        var me = this;
        if (!nodeArr) throw new Error(nbQappTreeMgr.Constant.ex.TreeNodeIsNull);
        me.clear();
        var rootNode = [];
        var nodeMap = {};

        me.initNode(nodeArr, true).forEach(function (ele) {
            var node = ele;
            if (node['$id'] === undefined || node['$id'] === null || String(node['$id']).length === 0)
                throw new Error(nbQappTreeMgr.sprintf(nbQappTreeMgr.Constant.ex.NodeIdLength, '$id'));

            nodeMap[node['$id']] = node;
        });
        Object.keys(nodeMap).forEach(function (attr) {
            if (me._settings['isRoot']) {
                if (me.handle['isRoot'](nodeMap[attr]))
                    rootNode.push(nodeMap[attr]);
            } else {
                if (!nodeMap[nodeMap[attr]['$pid']])
                    rootNode.push(nodeMap[attr]);
            }
        })
        if (nodeArr.length > 0 && rootNode.length === 0)
            throw new Error(nbQappTreeMgr.Constant.ex.NoRoot);
        rootNode.forEach(function (ele) {
            me._tree.push(ele);
        });
        nodeMap = me.$filtNodes(nodeMap, rootNode);
        var arrId = Object.keys(nodeMap);
        arrId.forEach(function (attr) {
            var cEle = nodeMap[attr]
            me._nodes[cEle['$sid']] = cEle;
            var ele = nodeMap[cEle['$pid']]
            if (ele) {
                if (!ele['$child']) {
                    ele['$child'] = [];
                }
                ele['$child'].push(cEle);
                cEle['$psid'] = ele['$sid']
            }
        });
        this._search = '';
        this._isSearchDirty = true;
        this.$refresh(true);
        return this._tree;
    }
    nbQappTreeMgr.prototype.$refresh = function (isInit) {
        var me = this;
        var notInit = !isInit
        function calcFileNumber2(me, node) {
            if (node['$child'] || !node['$display'] || Math.abs(node['$status']) == nbQappTreeMgr.Constant.nodeStatus.del) return;
            var curNode = me._nodes[node['$psid']];
            while (curNode) {
                curNode['$fileNo'] += 1;
                if (!curNode['$psid']) return;
                curNode = me._nodes[curNode['$psid']];
            }
        }
        function calcFileNumber(me, node, isPart) {
            if (isPart) {
                if (node['$child'] || !node['$display']) return;
                var changeNumber = 0;
                if (Math.abs(node['$status']) == nbQappTreeMgr.Constant.nodeStatus.del) changeNumber = -1;
                else if (Math.abs(node['$status']) == nbQappTreeMgr.Constant.nodeStatus.add) changeNumber = 1;
                if (changeNumber == 0) return;
                var curNode = me._nodes[node['$psid']];
                while (curNode) {
                    curNode['$fileNo'] += changeNumber;
                    if (!curNode['$psid']) return;
                    curNode = me._nodes[curNode['$psid']];
                }
            } else
                calcFileNumber2(me, node);
        }
        function sortNodes(me, node) {
            var curNode = node;
            var pNode = me._nodes[curNode['$psid']];
            while (curNode) {
                if (curNode['$status'] != nbQappTreeMgr.Constant.nodeStatus.add) {
                    return;
                }
                curNode['$status'] = nbQappTreeMgr.Constant.nodeStatus.add2;
                if (pNode && pNode['$child'].length >= 2) pNode['$child'].sort(function (node1, node2) {
                    var ret = me.handle['onSort'](node1, node2);
                    if (ret == false) {
                        if (node1['$isFolder'] != node2['$isFolder'])
                            return node1['$child'] ? -1 : 1;
                        else
                            return node2['$name'].toLowerCase() > node1['$name'].toLowerCase() ? -1 : 1;
                    } else return ret;
                });
                curNode = me._nodes[curNode['$psid']];
                pNode = curNode && me._nodes[curNode['$psid']] || null;
            }
        }
        function getTopDeleteNode(me, node) {
            var ret = null;
            var curNode = node;
            while (curNode) {
                if (curNode['$status'] == nbQappTreeMgr.Constant.nodeStatus.del) {
                    ret = curNode;
                    curNode['$status'] = nbQappTreeMgr.Constant.nodeStatus.del2;
                }
                else if (curNode['$status'] == nbQappTreeMgr.Constant.nodeStatus.del2) {
                    ret = null;
                    break;
                }
                else
                    break;
                curNode = me._nodes[curNode['$psid']];
            }
            return ret;
        }
        function delNodeInTree(me, node) {
            var delNode = getTopDeleteNode(me, node);
            if (delNode) {
                var pNode = me._nodes[delNode['$psid']];
                for (var i = 0; i < pNode['$child'].length; i++) {
                    if (pNode['$child'][i]['$id'] == delNode['$id']) {
                        pNode['$child'].splice(i, 1);
                        break;
                    }
                }
            }
        }
        function calcIndex(me, node) {
            if (node['$index'] >= 0 || Math.abs(node['$status']) == nbQappTreeMgr.Constant.nodeStatus.del) return;
            var nodeArr = [];
            var curNode = node;
            while (true) {
                nodeArr.push(curNode);
                if (curNode['$index'] >= 0)
                    break;
                curNode = me._nodes[curNode['$psid']];
                if (!curNode) break;
            }
            nodeArr.reverse();
            var startIndex = nodeArr[0]['$index'] < 0 ? 0 : nodeArr[0]['$index'];
            for (var i = 0; i < nodeArr.length; i++) {
                nodeArr[i]['$index'] = startIndex + i;
            }
        }
        var keys = Object.keys(this._nodes);
        keys.forEach(function (attr) {
            var node = me._nodes[attr];
            var pNode = me._nodes[node['$psid']];
            if (pNode) node['$_parent'] = pNode;
            calcIndex(me, node);
        });
        if (notInit && this._settings['enableSearch']) {
            if (this._isSearchDirty) {
                keys.forEach(function (attr) {
                    var ele = me._nodes[attr];
                    ele['$display'] = (!me._search || ele['$name'].toLowerCase().indexOf(me._search.toLowerCase()) >= 0) ? true : false;
                });
                keys.forEach(function (attr) {
                    var ele = me._nodes[attr];
                    while (true) {
                        if (!ele) break;
                        if (!ele['$display']) break;
                        ele = me._nodes[ele['$psid']];
                        if (ele) {
                            if (ele['$display'])
                                break;
                            else
                                ele['$display'] = true;
                        } else break;
                    }
                });
            } else {
                keys.forEach(function (attr) {
                    var ele = me._nodes[attr];
                    if (Math.abs(ele['$status']) == nbQappTreeMgr.Constant.nodeStatus.add) {
                        var oriDisplay = ele['$display'];
                        ele['$display'] = (!me._search || ele['$name'].toLowerCase().indexOf(me._search.toLowerCase()) >= 0) ? true : false;
                        if (!oriDisplay && ele['$display']) {
                            //
                        } else {
                            ele['$status'] = nbQappTreeMgr.Constant.nodeStatus.normal;
                        }
                    }
                })
            }
        }
        if (this._settings['enableCalcNodeNumber']) {
            if (this._isSearchDirty) {
                keys.forEach(function (attr) {
                    me._nodes[attr]['$fileNo'] = 0;
                })
                keys.forEach(function (attr) {
                    calcFileNumber(me, me._nodes[attr])
                })
            } else {
                keys.forEach(function (attr) {
                    calcFileNumber(me, me._nodes[attr], true);
                })
            }
        }
        this._isSearchDirty = false;
        if (notInit) {
            keys.forEach(function (attr) {
                var ele = me._nodes[attr];
                if (ele) {
                    delNodeInTree(me, ele);
                }
            });
            keys.forEach(function (attr) {
                var ele = me._nodes[attr];
                if (ele) {
                    switch (Math.abs(ele['$status'])) {
                        case nbQappTreeMgr.Constant.nodeStatus.del:
                            delete me._nodes[attr];
                            break;
                        default:
                            break;
                    }
                }
            });
        }
        keys = Object.keys(this._nodes);
        this._settings['enableSort'] && keys.forEach(function (attr) {
            var ele = me._nodes[attr];
            if (ele)
                sortNodes(me, ele);
        });
        keys.forEach(function (attr) {
            var ele = me._nodes[attr];
            switch (Math.abs(ele['$status'])) {
                case nbQappTreeMgr.Constant.nodeStatus.add:
                    ele['$status'] = nbQappTreeMgr.Constant.nodeStatus.normal;
                    me.handle['onInitNode'](ele);
                    break;
                default:
                    break;
            }
        });
    }

    nbQappTreeMgr.prototype.search = function (strArg) {
        if (this._search != strArg) {
            this._search = strArg;
            this._isSearchDirty = true;
            this.$refresh();
        }
    };
    nbQappTreeMgr.prototype.editName = function (id) {
        var node = this.getNodeById(id);
        if (node) {
            node['$edit'] = true;
        }
    }
    nbQappTreeMgr.prototype.rename = function (id, newName) {
        var me = this;
        var node = this.getNodeById(id);
        if (node) {
            node['$name'] = newName;
            if (me._settings['enableSearch']) {
                node['$status'] = nbQappTreeMgr.Constant.nodeStatus.add;
            }
            this.$refresh();
        }
    };
    nbQappTreeMgr.prototype.select = function (id, withoutExpended) {
        var me = this;
        var selectNode = me.getNodeById(id);
        selectNode && Object.keys(this._nodes).forEach(function (attr) {
            if (me._nodes[attr] == selectNode) {
                me._nodes[attr]['$selected'] = true;
            }
            else
                me._nodes[attr]['$selected'] = false;
        });
        if (!withoutExpended && selectNode) {
            me.expend(selectNode.id);
        }
    };
    nbQappTreeMgr.prototype.expend = function (id) {
        var node = this.getNodeById(id);
        var curNode = node;
        var arrNodes = [];
        if (curNode) {
            while (true) {
                curNode != node && (arrNodes.push(curNode));
                if (!curNode['$psid']) break;
                curNode = this._nodes[curNode['$psid']];
            }
        }
        arrNodes.reverse();
        arrNodes.forEach(function (ele) {
            ele['$expended'] = true
        });
    }
    nbQappTreeMgr.prototype.getSelectedNode = function () {
        var me = this;
        var ret = null;
        Object.keys(this._nodes).some(function (attr) {
            if (me._nodes[attr]['$selected']) {
                ret = me._nodes[attr];
                return true;
            }
        })
        return ret;
    }
    nbQappTreeMgr.prototype.addNode = function (node) {
        var me = this;
        var pNode = this.getNodeById(node[me._settings['pid']]);
        if (pNode && pNode['$child']) {
            var curNode = this.initNode(node);
            curNode['$psid'] = pNode['$sid'];
            pNode['$child'].push(curNode);
            me._nodes[curNode['$sid']] = curNode;
            this.$refresh();
            return curNode;
        }
        return null;
    };
    nbQappTreeMgr.prototype.deleteNodeById = function (id) {
        var me = this;
        var node = me.getNodeById(id);
        return me.deleteNode(node);
    };
    nbQappTreeMgr.prototype.deleteNode = function (node) {
        var curNode = this._nodes[node['$sid']];
        if (curNode) {
            nbQappTreeMgr.Traverse(curNode, function (curNode, args) {
                curNode['$status'] = nbQappTreeMgr.Constant.nodeStatus.del;
            }, null);
            this.$refresh();
            return curNode;
        }
        return null;
    };
    nbQappTreeMgr.prototype.createCatTree = function () {
        var me = this;
        var nodes = [];
        var newNode, tmpNode;
        Object.keys(me._nodes).forEach(function (attr) {
            tmpNode = me._nodes[attr];
            if (tmpNode) {
                newNode = {};
                Object.keys(tmpNode).forEach(function (attr) {
                    if (attr.charAt(0) !== '$' && attr !== me._settings['child'])
                        newNode[attr] = tmpNode[attr];
                });
                nodes.push(newNode);
            }
        })
        return nodes;
    }
    nbQappTreeMgr.prototype.getNodeById = function (id) {
        var me = this;
        var node = null;
        var nodeId = id && id['$id'] || id || null
        if (nodeId) {
            (nodeId != id) && Object.keys(this._nodes).some(function (attr) {
                if (me._nodes[attr] == id) {
                    node = me._nodes[attr];
                    return true;
                }
            }) || Object.keys(this._nodes).some(function (attr) {
                if (me._nodes[attr]['$id'] == nodeId) {
                    node = me._nodes[attr];
                    return true;
                }
            })
        }
        return node;
    };

    nbQappTreeMgr.prototype.getNodeByPath = function (path) {
        for (var ele in this._nodes) {
            if (this._nodes[ele]["parserPath"] === path || ele == path) {
                return this._nodes[ele];
            }
        }
        return null;
    };

    nbQappTreeMgr.prototype.getNodeByName = function (pid, name) {
        var curNode = null;
        var pNode = this.getNodeById(pid) || null;
        pNode && pNode['$child'].some(function (ele) {
            if (ele['$name'] == name) {
                curNode = ele;
                return true;
            }
        })
        return curNode;
    };

    nbQappTreeMgr.prototype.getNodesByName = function (name) {
        return _.find
        //var nodes = [];
        //for (var attr in this._nodes) {
        //    if (this._nodes.hasOwnProperty(attr)) {
        //        angular.merge(this._nodes[attr], objAttr);
        //    }
        //}
    };

    nbQappTreeMgr.prototype.cloneNodeById = function (id) {
        var me = this;
        var curNode = this.getNodeById(id);
        var ret = {};
        if (curNode) {
            for (var attr in curNode) {
                if (curNode.hasOwnProperty(attr)) {
                    if (attr === '$child' || attr === me._settings['child'])
                        ret[attr] = curNode[attr] && [] || null;
                    else if (attr.indexOf('$_') === 0) {
                        //
                    }
                    else
                        ret[attr] = curNode[attr];
                }
            }
        } else ret = null;
        return ret;
    }

    nbQappTreeMgr.prototype.refreshNode = function (oldNodeId, nodeArr, onlyChild) {
        var me = this;
        var oldNode = me.getNodeById(oldNodeId) || null;

        var pNode = oldNode && me._nodes[oldNode['$psid']] || null;
        var rootNode = [];
        if (oldNode && pNode) {
            var nodeMap = {};

            me.initNode(nodeArr, true).forEach(function (ele) {
                var node = ele;
                if (node['$id'] == undefined || node['$id'] == null || String(node['$id']).length === 0)
                    throw new Error(nbQappTreeMgr.sprintf(nbQappTreeMgr.Constant.ex.NodeIdLength, '$id'));
                nodeMap[node['$id']] = node;
            });
            if (onlyChild) {
                nodeMap[oldNode['$id']] = oldNode;
                rootNode.push(oldNode)
            } else {
                Object.keys(nodeMap).forEach(function (attr) {
                    if (!nodeMap[attr]['$pid'] || !nodeMap[nodeMap[attr]['$pid']])
                        rootNode.push(nodeMap[attr]);
                })
            }
            if (nodeArr.length > 0 && rootNode.length == 0)
                throw new Error(nbQappTreeMgr.Constant.ex.NoRoot);
            else if (rootNode.length > 1)
                throw new Error(nbQappTreeMgr.Constant.ex.MultiRoot);

            nbQappTreeMgr.Traverse(oldNode, function (curNode, arg) {
                curNode['$status'] = nbQappTreeMgr.Constant.nodeStatus.del;
            }, null)

            if (rootNode.length > 0) {
                if (onlyChild) oldNode['$status'] = nbQappTreeMgr.Constant.nodeStatus.normal;
                me.$filtNodes(nodeMap, rootNode);
                var arrId = Object.keys(nodeMap);
                arrId.forEach(function (attr) {
                    if (nodeMap[attr]['$pid']) {
                        var ele = nodeMap[nodeMap[attr]['$pid']]
                        if (ele) {
                            ele['$child'].push(nodeMap[attr]);
                            nodeMap[attr]['$psid'] = ele['$sid']
                        }
                    }
                })
                arrId.forEach(function (attr) {
                    me._nodes[nodeMap[attr]['$sid']] = nodeMap[attr];
                })
                if (!onlyChild) {
                    pNode['$child'].push(rootNode[0]);
                    rootNode[0]['$psid'] = pNode['$sid']
                }
            }
            this.$refresh();
        }
    }
    nbQappTreeMgr.prototype.refreshChildren = function (id, nodeArr) {
        var me = this;
        me.refreshNode(id, nodeArr, true);
    }
    nbQappTreeMgr.prototype.getParentById = function (id) {
        var curNode = this.getNodeById(id);
        var pNode = curNode && this._nodes[curNode['$psid']];
        return pNode || null;
    }
    nbQappTreeMgr.prototype.getRoot = function () {
        var me = this;
        var root = null;
        Object.keys(this._nodes).some(function (attr) {
            if (!me._nodes[attr]['$psid']) {
                root = me._nodes[attr];
                return true;
            }
        });
        return root;
    }
    nbQappTreeMgr.prototype.getFullName = function (node, withSelf) {
        var curNode = node;
        var name = withSelf && curNode['$name'] || '';
        while (curNode['$psid']) {
            curNode = this._nodes[curNode['$psid']];
            if (!curNode)
                return '';
            name = name.length > 0 ? (curNode['$name'] + ' > ' + name) : curNode['$name'];
        }
        return name;
    }

    nbQappTreeMgr.prototype.getFullNameArray = function (node, withSelf) {
        var nodeArr = [];
        var curNode = node;
        if (withSelf)
            nodeArr.push({ id: curNode['$id'], name: curNode['$name'] });
        while (curNode['$psid']) {
            curNode = this._nodes[curNode['$psid']];
            if (!curNode)
                return '';
            nodeArr.push({ id: curNode['$id'], name: curNode['$name'] });
        }
        nodeArr.reverse();
        return nodeArr;
    }

    nbQappTreeMgr.prototype.searchInFolder = function (node, searchFn, searchArg) {
        var nodes = [];
        nbQappTreeMgr.Traverse(node, function (curNode, arg) {
            if (searchFn(curNode, arg)) nodes.push(curNode);
        }, searchArg);
        nodes.length && nodes[0] == node && nodes.shift();
        return nodes;
    }
    nbQappTreeMgr.prototype.getNextChildName = function (node, baseName) {
        var base = baseName || 'New Node';
        var nameMap = {};
        node['$child'].forEach(function (ele) {
            nameMap[ele['$name']] = true;
        });
        var index = 1;
        while (true) {
            if (!nameMap[base + index]) break;
            else index++;
        }
        return base + index;
    }
    nbQappTreeMgr.prototype.isN1HavingN2 = function (node1, node2) {
        if (node1 == node2) return false;
        var curNode = node2;
        while (true) {
            if (node1 == curNode)
                return true;
            if (!curNode['$psid']) break;
            curNode = this._nodes[curNode['$psid']];
        }
        return false;
    }

    nbQappTreeMgr.prototype.isRootNode = function (node) {
        return node["$index"] === 0;
    };

    nbQappTreeMgr.prototype.isFolder = function (node) {
        return node['$isFolder'];
    };

    nbQappTreeMgr.prototype.renameNode = nbQappTreeMgr.prototype.rename;

    nbQappTreeMgr.prototype.cloneNode = nbQappTreeMgr.prototype.cloneNodeById;

    nbQappTreeMgr.prototype.focus = function (id) {
        var curNode = typeof id == "object" ? id : this.getNodeById(id);
        if (!curNode) {
            return;
        }

        var treeNodeId = 'editTree' + curNode.id;
        if (document.getElementById(treeNodeId)) {
            document.getElementById(treeNodeId).focus();
        } else {
            throw new Error("could not find dom object by id attribute");
        }
    };

    nbQappTreeMgr.prototype.updateAllNode = function (objAttr) {
        for (var attr in this._nodes) {
            if (this._nodes.hasOwnProperty(attr)) {
                angular.merge(this._nodes[attr], objAttr);
            }
        }
    }

    nbQappTreeMgr.prototype.filterNode = function (filterParam) {
        return _.filter(this._nodes, filterParam);
    }



    nbQappTreeMgr.prototype.updateNode = function (id, objAttr) {
        var me = this;
        var node = me.getNodeById(id);
        if (node) {
            angular.merge(node, objAttr);
        }
    }

})(window);