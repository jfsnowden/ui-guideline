(function() {
    'use strict';

    angular.module('nb.common').service('nb.common.nbTextEditorSrvc', NbTextEditorSrvc);

    NbTextEditorSrvc.$inject = ['$rootScope', '$uibModal'];

    function NbTextEditorSrvc($rootScope, $uibModal) {
        this.showTextEditorModal = function(params) {
            var modalTextEditorOptions = {
                templateUrl: 'modules/nbCommon/views/nbTextEditorPopup.html',
                controller: 'nb.common.nbTextEditorPopupCtrl',
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    args: function() {
                        return params;
                    }
                }
            };

            var modalInstance = $uibModal.open(modalTextEditorOptions);

            modalInstance.result.then(function(dataContentNew) {
                if (angular.isDefined(dataContentNew)) {
                    $rootScope.$broadcast('script changed', dataContentNew);
                }
            }, function() {
                // do nothing
            });
        };

        this._getAceSession = function(ace) {
            return ace && ace.getSession() || null;
        };

        this.getAceSelection = function(ace) {
            var session = this._getAceSession(ace);
            return session && session.selection.getRange() || null;
        };

        this._setAceContent = function(ace, content) {
            var session = this._getAceSession(ace);
            return session && session.doc.setValue(content || '');
        };
        this._getAceContent = function(ace) {
            var session = this._getAceSession(ace);
            return session && session.doc.getValue() || null;
        };

        this.getAttr = function(dataModel, attr) {
            if (dataModel && dataModel.__attrs) {
                return dataModel.__attrs[attr];
            }
            return undefined;
        };

        this.setAttr = function(dataModel, attr, value) {
            if (dataModel) {
                if (!dataModel.__attrs) dataModel.__attrs = {};
                dataModel.__attrs[attr] = value;
            }
        };

        this.registerAcee = function(dataModel, ace) {
            var me = this;
            dataModel.ace = ace;
            if (dataModel.acePlaceHolder) {
                this.$setPlaceHolder(ace, dataModel.acePlaceHolder, dataModel);
            }
            dataModel.model.scripting = dataModel.content;
            this._setAceContent(ace, dataModel.content);
            dataModel.ace.setShowPrintMargin(false);
            ace.session.on('changeScrollLeft', function(scrollLeft) {
                me.setAttr(dataModel, 'scrollLeft', scrollLeft);
            });
            ace.session.on('changeScrollTop', function(scrollTop) {
                me.setAttr(dataModel, 'scrollTop', scrollTop);
            });
        };

        this.setSelection = function(dataModel, range) {
            var aceSess = this._getAceSession(dataModel.ace);
            aceSess && aceSess.selection.setSelectionRange(range, false);
        };

        this.getScroll = function(dataModel) {
            return {
                sLeft: this.getAttr(dataModel, 'scrollLeft'),
                sTop: this.getAttr(dataModel, 'scrollTop')
            };
        };

        this.setScroll = function(dataModel, sLeft, sTop) {
            var aceSess = this._getAceSession(dataModel.ace);
            if (aceSess) {
                if (sLeft !== undefined) {
                    aceSess.setScrollLeft(sLeft);
                }
                if (sTop !== undefined) {
                    aceSess.setScrollTop(sTop);
                }
            }
        };

        this.keepOldScroll = function(dataModel, sLeft, sTop) {
            var fnOp = dataModel.fnOptions;
            if (fnOp && fnOp.scroll) {
                this.setScroll(dataModel, sLeft, sTop);
            }
        };

        this.$setPlaceHolder = function(ace, placeHolder, dataModel, isRefresh) {
            var editor = ace;

            function update() {
                var shouldShow = !editor.session.getValue().length;
                var node = editor.renderer.emptyMessageNode;
                if (!shouldShow && node) {
                    editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode);
                    editor.renderer.emptyMessageNode = null;
                } else if (shouldShow) {
                    if (node && node.textContent !== dataModel.acePlaceHolder) {
                        editor.renderer.scroller.removeChild(editor.renderer.emptyMessageNode);
                        editor.renderer.emptyMessageNode = null;
                    }
                    node = editor.renderer.emptyMessageNode = document.createElement('div');
                    node.textContent = dataModel.acePlaceHolder || 'placeholder';
                    node.className = 'ace_invisible ace_emptyMessage';
                    node.style.padding = '0 9px';
                    editor.renderer.scroller.appendChild(node);
                }
            }
            if (!isRefresh) {
                editor.on('input', update);
            }
            setTimeout(update, 100);
        };

        this.refreshPlaceHolder = function(dataModel, placeHolder) {
            if (placeHolder) {
                dataModel.acePlaceHolder = placeHolder;
            }
            if (dataModel.ace) {
                this.$setPlaceHolder(dataModel.ace, dataModel.acePlaceHolder, dataModel, true);
            }
        };

        this.init = function(dataModel) {
            var langTools = window.ace.require('ace/ext/language_tools');
            var aceKeywords = [];
            if (dataModel.aceOptions.mode === 'python') {
                aceKeywords = 'and,del,from,not,while,as,elif,global,or,with,assert,else,if,pass,yield,break,except,import,print,class,exec,in,raise,continue,finally,is,return,,def,for,lambda,try'.split(',');
            }
            var tangideCompleter = {
                identifierRegexps: [/[a-zA-Z_0-9\.\$\-\u00A2-\uFFFF]/],
                getCompletions: function(editor, session, pos, prefix, callback) {
                    var ID_REGEX = /[a-zA-Z_0-9\.\$\-\u00A2-\uFFFF]/;
                    var retrievePrecedingIdentifier = function(text, pos2, regex) {
                        regex = regex || ID_REGEX;
                        var buf = [];
                        for (var i = pos2 - 1; i >= 0; i--) {
                            if (regex.test(text[i])) {
                                buf.push(text[i]);
                            } else {
                                break;
                            }
                        }
                        return buf.reverse().join('');
                    };
                    var sessionVar = editor.getSession();
                    var posVar = editor.getCursorPosition();
                    var line = sessionVar.getLine(posVar.row);
                    var newPrefix = retrievePrecedingIdentifier(line, posVar.column);
                    if (newPrefix.indexOf('.') !== -1) {
                        var result1 = [];

                        var fun1 = function(tagList) {
                            callback(null, tagList.map(function(qtag) {
                                return { name: qtag.caption, value: qtag.value, meta: qtag.meta };
                            }));
                        };

                        fun1(result1);
                    } else {
                        var result2 = [];
                        if (aceKeywords.length) {
                            aceKeywords.forEach(function(ele) {
                                result2.push({
                                    meta: 'python',
                                    caption: ele,
                                    value: ele
                                });
                            });
                        }

                        var fun2 = function(tagList) {
                            callback(null, tagList.map(function(qtag) {
                                return { name: qtag.caption, value: qtag.value, meta: qtag.meta };
                            }));
                        };

                        fun2(result2);
                    }
                }
            };
            if (dataModel.aceOptions.mode === 'textnb' || dataModel.aceOptions.mode === 'text') {
                langTools.setCompleters([]);
            } else {
                langTools.addCompleter(tangideCompleter);
            }
        };

        this.refresh = function(dataModel) {
            this.getContent(dataModel);
        };

        this.setContent = function(dataModel, content) {
            var sLeft = this.getAttr(dataModel, 'scrollLeft');
            var sTop = this.getAttr(dataModel, 'scrollTop');
            dataModel.content = content;
            this._setAceContent(dataModel.ace, content);
            this.keepOldScroll(dataModel, sLeft, sTop);
        };

        this.getContent = function(dataModel) {
            var ctnt = this._getAceContent(dataModel.ace);
            if (ctnt) {
                dataModel.content = ctnt;
            }
            return dataModel.content;
        };
    }
})(NetBrain);
