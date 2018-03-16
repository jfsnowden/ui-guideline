(function () {
    'use strict';

    angular.module('nb.common').service('nb.common.nbResourceImportSrvc', nbService);

    nbService.$inject = ['$uibModal', '$q', '$rootScope', '$timeout', 'nb.ng.utilitySrvc', 'nb.ng.httpAuthSrvc', 'nb.common.nbResourceIOSrvc'];

    function nbService($uibModal, $q, $rootScope, $timeout, utilitySrvc, httpAuthSrvc, nbResourceIOSrvc) {
        this.Const = {
            FileStatus: {
                0: '',// 'Select',
                1: '',// 'Validating',
                2: 'Ready',
                3: 'Validate failed',
                4: 'Uploading...',
                5: 'Succeeded',
                6: 'Failed' 
            },
            FileStatus2: {
                201: 'Ready',
                202: 'Already in current category',
                301: 'Invalid file type', //'file length doesn\'t equal header define',
                302: 'Invalid file type', //'abstract block and list block are larger than 5M',
                303: 'Invalid file type', //'abstract block is 0.',
                304: 'Invalid file type', //'file size is less than 16',
                305: 'Invalid file type', //'block size is less than 0',
                310: 'Invalid file type', //'read file failed',
                351: 'Invalid file type', //'file structure is error',
                352: 'Invalid file type',
                601: 'xxxxxx'
            }
        };

        this.onInit = function (dm) {
            if (!dm.options.isVisibleRelatedResource) {
                dm.tblDef.columnDefs[0].width = "40%";
                dm.tblDef.columnDefs[1].width = "10%";
                dm.tblDef.columnDefs[2].width = "33%";
                dm.tblDef.columnDefs[3].width = "12%";
                dm.tblDef.columnDefs[4].width = "25%";
                dm.tblDef.columnDefs[5].width = "5%";
                dm.tblDef.columnDefs.splice(4, 1);
            }
            var typeModel = dm.typeModel;
            if (typeModel.packageFileSuffix) {
                if (dm.fileSelect.opts.accept.indexOf(typeModel.packageFileSuffix) < 0) {
                    dm.fileSelect.opts.accept += ',' + typeModel.packageFileSuffix;
                }
            }
        }

        this.onFileSelect = function (dm, files, gidSelect) {
            var me = this;
            if (!files.length) {
                return;
            }
            files.forEach(function (file) {
                var fileInfo = { //window.nbPLM.nbParserLibCM.getGUID()
                                 //window.nbPLM.nbParserLibCM.getGUID()
                    file: file, checked: true, gidSelect: gidSelect, name: file.name, size: file.size, status: 0, status2: 0, isExists: false, overwritable: true, related: '', structure: { version: 0, size1: 0, size2: 0, size3: 0, sliceByteArray: undefined, gidTask: window.nbPLM.nbParserLibCM.getGUID(), inventory: undefined }
                };
                if (!dm.fileArray.some(function (eleFileInfo) {
                    if (me.compareFiles(eleFileInfo, fileInfo)) {
                        eleFileInfo.checked = true;
                        return true;
                }
                })) {
                    dm.fileArray.push(fileInfo);
                }
            })
            dm.tblDef.data = dm.fileArray.filter(function (ele) {
                return ele.checked;
            });

            this.validateFiles(dm);
        };

        this.onItemDelete = function (dm, fileInfo) {
            fileInfo.checked = false;
            dm.tblDef.data = dm.fileArray.filter(function (ele) {
                return ele.checked;
            });
        }

        this.onOpenRelated = function (dm, fileInfo) {
            $uibModal.open({
                templateUrl: 'modules/nbCommon/resourceIO/views/nbResourceImportRelated.html',
                controller: 'nb.common.nbResourceImportRelatedCtrl',
                windowClass: 'resource-io-import-related',
                backdrop: 'static',
                resolve: {
                    resolveData: {
                        fileInfo: fileInfo,
                        options: dm.options
                    }
                }
            });
        }

        this.validateFiles = function (dm, fnCallback) {
            var me = this;
            dm.fileArray.forEach(function (eleFileInfo) {
                if (eleFileInfo.checked && eleFileInfo.status == 0) {
                    eleFileInfo.status = 1;
                    if (eleFileInfo.size < 16) {
                        eleFileInfo.status = 3;
                        eleFileInfo.status2 = 304
                        return;
                    }
                    nbResourceIOSrvc.readFile(eleFileInfo, {
                        progress: function (e) {
                            me.onProgress(e, dm, eleFileInfo);
                        },
                        load: function (e) {
                            me.onComplete(e, dm, eleFileInfo, fnCallback);
                        },
                        abort: function (e) {
                            me.onComplete(e, dm, eleFileInfo, fnCallback);
                        },
                        error: function (e) {
                            me.onComplete(e, dm, eleFileInfo, fnCallback);
                        }
                    })
                }
            })
        }

        this.onProgress = function (e, dm, eleFileInfo) {
            this.onReadFile(e, dm, eleFileInfo);
        };

        this.onReadFile = function (e, dm, eleFileInfo, bNoAbort) {
            var objTarget = e.currentTarget || e.target;
            var byteLength = 0;
            if (!objTarget || !objTarget.result) {
                return;
            }
            if (objTarget.result.byteLength >= 16) {
                var uint32Array = new Uint32Array(objTarget.result.slice(0, 16));
                eleFileInfo.structure.version = uint32Array[0];
                eleFileInfo.structure.size1 = uint32Array[1];
                eleFileInfo.structure.size2 = uint32Array[2];
                eleFileInfo.structure.size3 = uint32Array[3];
                if (eleFileInfo.structure.size1 + eleFileInfo.structure.size2 + eleFileInfo.structure.size3 + 16 != eleFileInfo.size) {
                    eleFileInfo.status = 3;
                    eleFileInfo.status2 = 301;
                } else if (eleFileInfo.structure.size1 + eleFileInfo.structure.size2 > 5 * 1024 * 1024) {
                    eleFileInfo.status = 3;
                    eleFileInfo.status2 = 302;
                } else if (eleFileInfo.structure.size1 == 0) {
                    eleFileInfo.status = 3;
                    eleFileInfo.status2 = 303;
                }

            }
            if (eleFileInfo.status == 3) {
                !bNoAbort && e.target.abort();
                return;
            }
            if (objTarget.result.byteLength >= eleFileInfo.structure.size1 + eleFileInfo.structure.size2 + 16) {
                eleFileInfo.structure.sliceByteArray = objTarget.result.slice(0, eleFileInfo.structure.size1 + eleFileInfo.structure.size2 + 16);
                !bNoAbort && e.target.abort();
                return;
            }
        }

        this.onComplete = function (e, dm, eleFileInfo, fnCallback) {
            if (!eleFileInfo.structure.sliceByteArray && eleFileInfo.status != 3) {
                this.onReadFile(e, dm, eleFileInfo, true);
            }
            $timeout(function () {
                if (!eleFileInfo.structure.sliceByteArray && eleFileInfo.status != 3) {
                    eleFileInfo.status = 3;
                    eleFileInfo.status2 = 310;
                }
                if (eleFileInfo.status == 1) {
                    nbResourceIOSrvc.getInventory({
                        packageVersion: eleFileInfo.structure.version,
                        summaryDataLength: eleFileInfo.structure.size1,
                        listDataLength: eleFileInfo.structure.size2,
                        packageFileName: eleFileInfo.name,
                        base64Data: btoa(String.fromCharCode.apply(null, new Uint8Array(eleFileInfo.structure.sliceByteArray))),
                        expectedImportLocation: {
                            space: dm.options && dm.options.space || 8,
                            location: dm.options && dm.options.location || '/'
                        },
                        options: {
                            dependencyType: dm.options && dm.options.dependencyType || 1,
                            locationType: dm.options && dm.options.locationType || 1
                        }
                    }).then(function (data) {
                        if (data) {
                            eleFileInfo.status = 2;
                            eleFileInfo.inventory = data;
                            if (eleFileInfo.inventory && eleFileInfo.inventory.resources && eleFileInfo.inventory.resources.length) {
                                var curResource = eleFileInfo.inventory.resources[0];
                                if(curResource.type != dm.type){
                                    eleFileInfo.status = 3;
                                    eleFileInfo.status2 = 352;
                                } else {
                                    eleFileInfo.isExists = curResource.isExists;
                                    //if (!eleFileInfo.isExists) {
                                    //    eleFileInfo.overwritable = false;
                                    //} else {
                                    //    eleFileInfo.overwritable = true;
                                    //}
                                    curResource.dependencies && curResource.dependencies.forEach(function (eleDpd) {
                                        eleDpd.overwritable = true;
                                        eleDpd.check = true;
                                        eleDpd.ignoreImport = false;
                                        //if (!eleDpd.isExists) {
                                        //    eleDpd.overwritable = false;
                                        //}
                                        if (eleDpd.space == 1) {
                                            eleDpd.overwritable = false;
                                        }
                                        eleDpd.path = nbResourceIOSrvc.converToPath(eleDpd.type, eleDpd.space, eleDpd.location);
                                    });
                                    if (curResource.counts && curResource.counts.length) {
                                        eleFileInfo.related = curResource.counts.map(function (ele) {
                                            var xxType = nbResourceIOSrvc.getTypeModel(ele.type);
                                            return ele.count + ' ' + (xxType && xxType.displayName || ele.type) + 's';
                                        }).join('; ');
                                    }
                                }
                            } else {
                                eleFileInfo.status = 3;
                                eleFileInfo.status2 = 352;
                            }
                        } else {
                            eleFileInfo.status = 3;
                            eleFileInfo.status2 = 351;
                        }
                    }, function (error) {
                        eleFileInfo.status = 3;
                        eleFileInfo.status2 = 351;
                    }).then(function () {
                        if (fnCallback && dm.fileArray.every(function (eleFileInfo) {
                            return eleFileInfo.status == 2 || eleFileInfo.status == 3;
                        })) {
                            fnCallback(dm);
                        }
                    })
                }
            })
            console.warn('complete');
        };
        this.onError = function (e, dm, eleFileInfo) {
            $timeout(function () {
                eleFileInfo.status = 3;
                eleFileInfo.status2 = 310;
            })
            console.warn('error');
        };

        this.onUpload = function (dm) {
            var dataSrc = httpAuthSrvc.getDataSrc(utilitySrvc);
            var headers = {
                TenantGuid: dataSrc.TenantGuid,
                DomainGuid: dataSrc.DomainGuid
            };
            dm.fileArray.forEach(function (eleFileInfo) {
                if (eleFileInfo.status == 2) {
                    eleFileInfo.status = 4;
                    if (eleFileInfo.inventory && eleFileInfo.inventory.resources && eleFileInfo.inventory.resources.length) {
                        var curResource = eleFileInfo.inventory.resources[0];
                        curResource.dependencies && curResource.dependencies.forEach(function (eleDpd) {
                            eleDpd.ignoreImport = !eleDpd.check;
                        });
                    }
                    nbResourceIOSrvc.uploadFile({
                        headers: headers,
                        data: {
                            json: {
                                expectedImportLocation: {
                                    space: dm.options && dm.options.space || 8,
                                    location: dm.options && dm.options.location || '/'
                                },
                                resources: eleFileInfo.inventory && eleFileInfo.inventory.resources || [],
                                options: {
                                    jobId: eleFileInfo.structure.gidTask,
                                    attachedParameter: dm.options && dm.options.attachedParameter || undefined
                                }
                            }
                        },
                        fileInfo: eleFileInfo
                    }, {
                        success: function (data) {
                            if (data && data.data) {
                                if (data.data.status == 3) {
                                    eleFileInfo.status = 5;
                                } else {
                                    eleFileInfo.status = 6;
                                }
                                eleFileInfo.result = data.data;
                            } else {
                                eleFileInfo.status = 6;
                            }
                        }, error: function (err) {
                            eleFileInfo.result = err;
                            eleFileInfo.status = 6;
                        }
                    })
                }
            })
        }

        this.compareFiles = function (fileInfo1, fileInfo2) {
            var ret = 0;
            if (fileInfo1.file.lastModified == fileInfo2.file.lastModified && fileInfo1.file.name == fileInfo2.file.name && fileInfo1.file.size == fileInfo2.file.size) {
                ret = 1;
                if (fileInfo1.gidSelect == fileInfo2.gidSelect) {
                    ret = 2;
                }
            }
            return ret;
        }
    }

    angular.module('nb.common').filter('nbResourceIOFileSize', function () {
        return function (size) {
            if (!size) {
                return '';
            }
            var iSize = 0;
            var tSize = 'B';
            if (size >= 1024 * 1024 * 1024) {
                iSize = size / (1024 * 1024 * 1024);
                tSize = 'G'
            } else if (size >= 1024 * 1024) {
                iSize = size / (1024 * 1024);
                tSize = 'M'
            } else if (size >= 1024) {
                iSize = size / 1024;
                tSize = 'K';
            } else {
                iSize = size;
            }
            return Math.floor(iSize * 100) / 100 + tSize;
        };
    }).filter('nbResourceIOExists', function () {
        return function (isExists) {
            return isExists ? 'Already in current category' : 'Ready';
        };
    }).filter('nbResourceIOTextColor', function () {
        return function (text) {
            var colorMap = {
                'Already in current category': '#dfa722',
                'Ready': '#0f0;',
                'Succeeded': '#0f0',
                'Failed': '#f00',
                '': 'unset',
                'Uploading...': 'unset'
            }
            return 'color:' + (colorMap[text] || '#f00');
        };
    });
})(NetBrain);
