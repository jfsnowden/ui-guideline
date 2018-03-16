(function () {
    'use strict';

    angular.module('nb.common').service('nb.common.nbResourceIOSrvc', nbService);

    nbService.$inject = ['$uibModal', '$q', '$rootScope', '$timeout', '$upload', 'nb.ng.httpDownloadingSrvc'];

    function nbService($uibModal, $q, $rootScope, $timeout, $upload, httpDownloadingSrvc) {
        this.getService = function(serviceFullName){
            var serviceGetter = angular.element(document);
            return serviceGetter.injector().get(serviceFullName);
        };

        this.Const = {
            fileReaderEvents: ['loadstart', 'progress', 'load', 'abort', 'error', 'loadend'],
            resourceTypeMap: {
                'Parser': { name: 'Parser', displayName: 'Parser', description: '' },
                'Qapp': { name: 'Qapp', displayName: 'Qapp', description: '' },
                'QappGroup': { name: 'QappGroup', displayName: 'Qapp Group', description: '' },
                'Runbook': { name: 'Runbook', displayName: 'Runbook', description: '' },
                'VariableMapping': { name: 'VariableMapping', displayName: 'Variable Mapping', description: '' }
            }
        };

        this.taskModel = {
            businessId: '',
            ResourceExportCallbackToken: undefined,
            ResourceImportCallbackToken: undefined,
            exportJobs: [],//{ jobId: '', businessId: '', jobInfo: {} } 
            importJobs: []
        };

        this.getTypeModel = function (type) {
            return this.Const.resourceTypeMap[type] || '';
        }

        this.converToPath = function (type, space, location) {
            var typeModel = this.Const.resourceTypeMap[type];
            if (typeModel) {
                if (space == 1) {
                    return 'Built-in ' + typeModel.displayName + 's' + location;
                } else if (space == 2) {
                    return 'Shared ' + typeModel.displayName + 's in Company' + location;
                } else if (space == 4) {
                    return 'Shared ' + typeModel.displayName + 's in Tenant' + location;
                } else if (space == 8) {
                    return 'My ' + typeModel.displayName + 's' + location;
                } else {
                    return '';
                }
            } else {
                return '';
            }
        }

        this.openPopup = function (type, importTo, options) {
            return $uibModal.open({
                templateUrl: 'modules/nbCommon/resourceIO/views/nbResourceImport.html',
                controller: 'nb.common.nbResourceImportCtrl',
                windowClass: 'resource-io-import',
                backdrop: 'static',
                resolve: {
                    resolveData: {
                        type: type,
                        importTo: importTo,
                        options: options
                    }
                }
            }).result;
        };

        this.readFile = function (fileInfo, fnCallBackMap) {
            var me = this;
            var reader = new FileReader();

            me.Const.fileReaderEvents.forEach(function (eventName) {
                reader['on' + eventName] = function (e) {
                    fnCallBackMap[eventName] && fnCallBackMap[eventName](e, fileInfo);
                    //if (eventName == 'loadend') {
                    //    groupFileDone();
                    //}
                };
            });
            reader.readAsArrayBuffer(fileInfo.file);
        }

        this.getInventory = function (arg) {
            var inventory = {
                "packageInfo": {
                    "exportDate": "2018-01-26T12:40:50Z", //导出时的utc时间
                    "exportUser": "admin", //导出用户
                    "packageSize": 1000 //package 大小，单位Byte
                },
                "resources": [
                    {
                        "key": "...",
                        "type": "QappGroup",
                        "name": "runbook1",
                        "size": 1000,
                        "space": 4, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                        "location": "/shared1/", //资源导入路径，前不包含空间
                        "isExists": false,
                        "dependencies": [ 
                            {
                                "key": "...", 
                                "type": "QappGroup",
                                "name": "OSPF",
                                "space": 4, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                                "location": "/QappGroup1/", //资源导入路径，前不包含空间
                                "isExists": false 
                            }, {
                                "key": "...",
                                "type": "Qapp",
                                "name": "OSPF",
                                "space": 1, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                                "location": "/Qapp1/", //资源导入路径，前不包含空间
                                "isExists": false
                            }, {
                                "key": "...",
                                "type": "Qapp",
                                "name": "OSPF",
                                "space": 2, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                                "location": "/Qapp2/", //资源导入路径，前不包含空间
                                "isExists": false
                            }, {
                                "key": "...",
                                "type": "Qapp",
                                "name": "OSPF",
                                "space": 4, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                                "location": "/Qapp3/", //资源导入路径，前不包含空间
                                "isExists": false
                            }, {
                                "key": "...",
                                "type": "Qapp",
                                "name": "OSPF",
                                "space": 8, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                                "location": "/Qapp4/", //资源导入路径，前不包含空间
                                "isExists": false
                            }, {
                                "key": "...",
                                "type": "Qapp",
                                "name": "OSPF",
                                "space": 4, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                                "location": "/Qapp5/", //资源导入路径，前不包含空间
                                "isExists": false
                            }, {
                                "key": "...",
                                "type": "Parser",
                                "name": "OSPF",
                                "space": 4, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                                "location": "/Parser1/", //资源导入路径，前不包含空间
                                "isExists": false
                            }, {
                                "key": "...",
                                "type": "Parser",
                                "name": "OSPF",
                                "space": 1, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                                "location": "/Parser2/", //资源导入路径，前不包含空间
                                "isExists": false
                            }, {
                                "key": "...",
                                "type": "VariableMapping",
                                "name": "VariableMappingXXX001"
                            }
                        ],
                        "counts": [ //依赖的所有资源类型及数量
                            { "type": "QappGroup", "count": 5 },
                            { "type": "Qapp", "count": 10 },
                            { "type": "Parser", "count": 20 },
                            { "type": "VariableMapping", "count": 50 }
                        ]
                    }
                ],
                "resourceTypes": [ //包含资源类型列表，已按依赖关系排序
                    {
                        "name": "QappGroup", //Resource Type name
                        "displayName": "Qapp Group", //用于显示的名称
                        "description": "" //Resource Type description
                    }
                ]
            };
            //return $q.when(inventory);
            var nbHttp = this.getService('nb.ng.nbHttp');
            return nbHttp.post('resourceIO/inventory', arg);
        };

        this.uploadFile = function (arg, callbackMap, callbaclArg) {
            if (arg && arg.bAsync) {
                this.importAsync(arg, callbackMap, callbaclArg);
            } else {
                this.importSync(arg, callbackMap, callbaclArg);
            }
        }

        this.preAddTask = function () {
            var me = this;
            var serviceGetter = angular.element(document);
            var userSrvc = serviceGetter.injector().get('nb.ng.userSrvc');
            var miniTaskHubSrvc = serviceGetter.injector().get('nb.miniTask.miniTaskHubSrvc');
            if (me.taskModel.businessId == userSrvc.getUserID()) {
                return;
            } else {
                if (me.taskModel.ResourceExportCallbackToken) {
                    me.taskModel.ResourceExportCallbackToken.destroy();
                }
                if (me.taskModel.ResourceImportCallbackToken) {
                    me.taskModel.ResourceImportCallbackToken.destroy();
                }
                me.taskModel.businessId = userSrvc.getUserID();
                me.taskModel.exportJobs = me.taskModel.exportJobs.filter(function (eleJob) {
                    return eleJob.businessId == me.taskModel.businessId;
                });
                me.taskModel.importJobs = me.taskModel.importJobs.filter(function (eleJob) {
                    return eleJob.businessId == me.taskModel.businessId;
                });
                
                me.taskModel.ResourceExportCallbackToken = miniTaskHubSrvc.register('ResourceExport', me.taskModel.businessId, function (data) {
                    me.onExport(data);
                });
                me.taskModel.ResourceImportCallbackToken = miniTaskHubSrvc.register('ResourceImport', me.taskModel.businessId, function (data) {
                    me.onImport(data);
                })
            }
        }

        this.addExportTask = function (task) {
            var me = this;
            if (!me.taskModel.exportJobs.some(function (ele) { return ele.jobId == task.jobId; })) {
                me.taskModel.exportJobs.push({
                    jobId: task.jobId,
                    businessId: me.taskModel.businessId,
                    jobInfo: task
                })
            }
        }

        this.addImportTask = function (task) {
            var me = this;
            if (!me.taskModel.importJobs.some(function (ele) { return ele.jobId == task.jobId; })) {
                me.taskModel.importJobs.push({
                    jobId: task.jobId,
                    businessId: me.taskModel.businessId,
                    jobInfo: task
                })
            }
        }

        this.onExport = function (data) {
            var me = this;
            var nbAlertSrvc = this.getService('nb.common.nbAlertSrvc');
            if (data) {
                var curJobIndex = null;
                me.taskModel.exportJobs.some(function (ele, index) {
                    if (ele.jobId == data.jobId) {
                        curJobIndex = index;
                        return true;
                    }
                });
                if(curJobIndex >= 0){
                    var curJob = me.taskModel.exportJobs[curJobIndex];
                    curJob.jobInfo = data;
                    if (curJob.jobInfo.status == 3) {
                        me.taskModel.exportJobs.splice(curJobIndex, 1);
                        me.download(curJob, { defer: curJob.defer });
                    } else if (curJob.jobInfo.status == 4 || curJob.jobInfo.status == 5) {
                        me.taskModel.exportJobs.splice(curJobIndex, 1);
                        nbAlertSrvc.alert(curJob.jobInfo.errorMsg);
                        curJob.jobInfo.defer && curJob.jobInfo.defer.reject(curJob.jobInfo.status);
                    }
                }
            }
        }

        this.onImport = function (data) {
            var me = this;
            if (data) {
                var curJobIndex = null;
                me.taskModel.importJobs.some(function (ele, index) {
                    if (ele.jobId == data.jobId) {
                        curJobIndex = index;
                        return true;
                    }
                });
                if (curJobIndex >= 0) {
                    var curJob = me.taskModel.importJobs[curJobIndex];
                    curJob.jobInfo = data;
                    if (curJob.jobInfo.status == 3) {
                        me.taskModel.importJobs.splice(curJobIndex, 1);
                        curJob.fnCallbackMap && curJob.fnCallbackMap['success'] && curJob.fnCallbackMap['success'](curJob.jobInfo, curJob.callbackArg);
                    } else if (curJob.jobInfo.status == 4) {
                        me.taskModel.importJobs.splice(curJobIndex, 1);
                        curJob.fnCallbackMap && curJob.fnCallbackMap['error'] && curJob.fnCallbackMap['error'](curJob.jobInfo, curJob.callbackArg);
                    } else if (curJob.jobInfo.status == 5) {
                        me.taskModel.importJobs.splice(curJobIndex, 1);
                        curJob.fnCallbackMap && curJob.fnCallbackMap['abort'] && curJob.fnCallbackMap['abort'](curJob.jobInfo, curJob.callbackArg);
                    }
                }
            }
        }
        /*
        type: 文件类型, Parser, Qapp, QappGroup RunBook, VariableMapping;
        space: 资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
        location: "/runbook1/", //资源导入路径，前不包含空间
        options: {bAsync: false, accept: '*.xapp'}
        */
        this.import = function (type, space, location, options) {
            var me = this;
            var opt = options || {};
            opt.space = space;
            opt.location = location;
            this.preAddTask();
            return this.getAllTypes().then(function () {
                return me.openPopup(type, me.converToPath(type, space, location), opt);
            }, function () {
                return me.openPopup(type, me.converToPath(type, space, location), opt);
            });  
        };

        this.importAsync = function (arg, fnCallbackMap, callbackArg) {
            $upload.upload({
                url: NetBrain.NG.ConfigSettings.API_ROOT + 'resourceIO/import/',
                method: 'POST',
                headers: arg.headers,
                data: arg.data,
                file: arg.fileInfo.file,
                fileName: arg.fileInfo.file.name
            });
            this.addImportTask({
                jobId: arg.fileInfo.structure.gidTask,
                status: 1,
                fnCallbackMap: fnCallbackMap,
                callbackArg: callbackArg
            })
        }

        this.importSync = function (arg, fnCallbackMap, callbackArg) {
            $upload.upload({
                url: NetBrain.NG.ConfigSettings.API_ROOT + 'resourceIO/import/',
                method: 'POST',
                headers: arg.headers,
                data: arg.data,
                file: arg.fileInfo.file,
                fileName: arg.fileInfo.file.name
            }).progress(function () { // skip percentage function
            }).success(function (data) {
                fnCallbackMap && fnCallbackMap['success'] && fnCallbackMap['success'](data, callbackArg);
            }).error(function (err) {
                fnCallbackMap && fnCallbackMap['error'] && fnCallbackMap['error'](err, callbackArg);
            });
        }
        /*   
        {
            "resourceKeys": [ //resource key 数组，每种resource Type对应的resourceKey对象成员需在resourceType扩展时与服务端约定好，且这里需要额外加上type，框架前端组件不需要关系内部数据
                {
                    "type": "QappGroup", //resource type name，需与服务端扩展resourceType时定义的type保持一致
                    "path": "string", //qapp,qapp group,runbook,parser将拥有此成员
                    "parserPath": "string", //variable mapping拥有此成员，parser path
                    "varFullName": "string" //variable mapping拥有此成员，parser 中variable fullname
                }
            ],
            "options": { //导出配置对象
                "jobId": "a31866e3-806f-499a-8c19-5bf849970c20" //调用者生成的导出/导入任务Job Id，必须唯一，在状态监听时可用于事件归属判断
            },
            bAsync: false //异步或者同步
        }
        */
        this.export = function (arg) {
            var defer = $q.defer();
            arg.defer = defer;
            this.preAddTask();
            if (arg && arg.options && arg.options.bAsync) {
                this.exportAsync(arg);
            } else {
                this.exportSync(arg);
            }
            return defer.promise;
        };

        this.exportAsync = function (arg) {
            var me = this;
            var nbHttp = me.getService('nb.ng.nbHttp');
            var nbAlertSrvc = this.getService('nb.common.nbAlertSrvc');
            return nbHttp.post('resourceIO/export?async=1', arg).then(function (data) {
                if (data && [1, 2, 3].indexOf(data.status) >= 0) {
                    data.defer = arg.defer;
                    me.addExportTask(data);
                } else {
                    console.warn('download failed.');
                    nbAlertSrvc.alert(data.errorMsg);
                    arg.defer && arg.defer.reject(data);
                }
            }, function (err) {
                console.warn('download failed.');
                nbAlertSrvc.alert(err.errorMsg);
                arg.defer && arg.defer.reject(err);
            });
        }

        this.exportSync = function (arg) {
            var me = this;
            var nbHttp = me.getService('nb.ng.nbHttp');
            var nbAlertSrvc = this.getService('nb.common.nbAlertSrvc');
            return nbHttp.post('resourceIO/export', arg).then(function (data) {
                if (data && data.status == 3) {// && data.status == 3
                    me.download(data, arg);
                } else {
                    console.warn('download failed.');
                    nbAlertSrvc.alert(data.errorMsg);
                    arg.defer && arg.defer.reject(data);
                }
            }, function (err) {
                console.warn('download failed.');
                nbAlertSrvc.alert(err.errorMsg);
                arg.defer && arg.defer.reject(err);
            });
        }

        this.getAllTypes = function(){
            var me = this;
            var nbHttp = me.getService('nb.ng.nbHttp');
            return nbHttp.get("resourceIO/allType").then(function (data) {
                if (data) {
                    data.forEach(function(eleType){
                        me.Const.resourceTypeMap[eleType.name] = eleType;
                    })
                }
                return true;
            }, function (err) {
                return false;
            });
        }

        this.download = function (task, arg) {
            var me = this;
            httpDownloadingSrvc.getTicket().then(function (ticketData) {
                me.startDownloading(ticketData, task, arg);
            }, function (err) {
                alert("failed to get downloading ticket...");
            });
            
        };

        this.startDownloading = function (ticket, task, arg) {
            var me = this;
            var nbHttp = me.getService('nb.ng.nbHttp');
            var httpAuthSrvc = me.getService('nb.ng.httpAuthSrvc');
            var utilitySrvc = me.getService('nb.ng.utilitySrvc');
            var dataSrc = httpAuthSrvc.getDataSrc(utilitySrvc);
            var url = NetBrain.NG.ConfigSettings.API_ROOT +
                'resourceIO/package/' + task.jobId +
                '?tenantGuid=' + dataSrc.TenantGuid +
                '&domainGuid=' + dataSrc.DomainGuid;

            url += '&dl_ticket=' + ticket;
            arg.defer && arg.defer.resolve(task);
            httpDownloadingSrvc.downloadFile(url);
        };

        /*
        resourceKey: { // 要导出的Resource Key对象，拥有C#中定义的ResourceKey相同的成员，并多一个type成员存储resource type Name
            type: '', // resource type Name
            path: '', // qapp,qapp group,runbook,parser将拥有此成员
            parserPath: '', // variable mapping拥有此成员，parser path
            varFullName: '' // variable mapping拥有此成员，parser 中variable fullname
        }
        options: { // 导出配置对象
        }
        */
        this.exportOne = function (resourceKey, options) {
            return this.export({
                resourceKeys: [resourceKey],
                options: angular.merge({
                    jobId: window.nbPLM.nbParserLibCM.getGUID(),
                    bAsync: false
                }, options || {})
            });
        }

        /*
        resourceKeys: [ // resourceKeys 要导出的Resource Key对象数组，拥有C#中定义的ResourceKey相同的成员，并多一个type成员存储resource type Name
            { 
                type: '', // resource type Name
                path: '', // qapp,qapp group,runbook,parser将拥有此成员
                parserPath: '', // variable mapping拥有此成员，parser path
                varFullName: '' // variable mapping拥有此成员，parser 中variable fullname
            }
        ]
        options: { // 导出配置对象
        }
        */
        this.exportMulti = function (resourceKeys, options) {
            return this.export({
                resourceKeys: resourceKeys,
                options: angular.merge({
                    jobId: window.nbPLM.nbParserLibCM.getGUID(),
                    bAsync: false
                }, options || {})
            });
        }

        /*
        resourceTypeName: 要导入Resource type name，需与服务端定义的Resouce type name一致,
        options: { // 导入配置对象
            allowedPackageFileSuffix: [""], // 允许的Resouce包文件后缀数组，后缀需要带“.”
            isVisibleRelatedResource: true, // 依赖资源是否可见，如parser因是最后一级，应给false
            expectedImportLocation: { // 期望导入的位置，用户导入时选中的Folder路径
                space: number, //资源导入空间，1：Built In，2：Shared in Company，4：Shared in Tenant，8：My Files
                location: string //资源导入位置，比如"/Runbook1/"，前不包含空间
            }
        }
        */
        this.openImportDialog = function (resourceTypeName, options) {
            var curOptions = {
                accept: '*',
                isVisibleRelatedResource: true,
                mainDialogSize: {
                    width: 760,
                    height: 374
                },
                relatedDialogSize: {
                    width: 668,
                    height: 342
                }
            };
            angular.merge(curOptions, options);
            curOptions.accept = curOptions.allowedPackageFileSuffix && curOptions.allowedPackageFileSuffix.join(',') || '*';
            return this.import(resourceTypeName, curOptions.expectedImportLocation.space, curOptions.expectedImportLocation.location, curOptions);
        }
    }
})(NetBrain);
