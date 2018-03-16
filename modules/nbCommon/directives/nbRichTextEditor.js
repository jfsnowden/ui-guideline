/* global Quill */
(function() {
    'use strict';

    angular.module('nb.common').directive('nbRichTextEditor', RichTextEditor);

    RichTextEditor.$inject = []; // 'nb.ng.utilitySrvc'

    function RichTextEditor() { // utils
        var directive = {
            restrict: 'E',
            scope: {
                textContent: '=?',
                placeholder: '=?',
                isReadMode: '=?',
                autoSaveFn: '=?',
                editable: '&?',
                disableImage: '@?'
            },
            require: 'ngModel',
            replace: true,
            template: '<div ng-class="{active:isReadMode}" class="nb-rich-editor" ><div class="quill-editor"></div><p class="t-tip" ng-class="{rtip:isReadMode&&editable}">Click to edit.</p></div>',
            controller: [function() {}],
            controllerAs: 'vm',
            link: Link
        };

        function Link(scope, elem, attrs, ctrl) {
            var self = scope.vm;
            if (window.Quill) {
                var fonts = [
                    'sans-serif',
                    'times',
                    'arial',
                    'comic',
                    'verdana',
                    'monospace',
                    'open-sans'
                ];
                var Link2 = Quill.import('formats/link');
                var Font = Quill.import('formats/font');
                Font.whitelist = fonts;
                Quill.register(Font, true);
                Link2.sanitize = function(url) {
                    if (!/^http:\/\/|https:\/\/|\/\//.test(url)) {
                        url = '//' + url;
                    }
                    return url;
                };
                var isReadOnly = scope.isReadMode === true || scope.isReadMode === 'true';
                var wrapper = elem.find('.quill-editor');
                wrapper.css({ width: '100%', height: '100%' });
                var options = {
                    placeholder: scope.placeholder === undefined ? 'Please type here...' : scope.placeholder,
                    theme: 'snow',
                    bounds: elem.parent()[0],
                    modules: {
                        toolbar: [
                            [{ size: ['small', false, 'large', 'huge'] }],
                            [{ font: fonts }],
                            [
                                { color: [] },
                                { background: [] },
                                'bold',
                                'italic',
                                'underline',
                                'strike',
                                'blockquote',
                                'link',
                                { list: 'ordered' },
                                { list: 'bullet' },
                                { align: [] },
                                scope.disableImage ? '' : 'image'
                            ]
                        ]
                    }
                };
                self.editor = new Quill(wrapper[0], options);
                self.editor.on('text-change', function() {
                    scope.$evalAsync(function() {
                        ctrl.$setViewValue(JSON.stringify(self.editor.getContents()));
                        if (attrs.textContent) {
                            scope.textContent = self.editor.getText();
                        }
                    });
                });


                scope.$watch('isReadMode', function(val) {
                    if (val === true) {
                        elem.find('.ql-toolbar').hide();
                        self.editor.disable();
                    } else {
                        elem.find('.ql-toolbar').show();
                        self.editor.enable();
                        if (typeof scope.autoSaveFn === 'function') {
                            $(document.body).on('click', clickHandler);
                        }
                    }
                });

                var reg = new RegExp("(\'\')|(\"\")", 'g');
                var initWatcher = scope.$watch(function() {
                    return ctrl.$viewValue;
                }, function(val) {
                    if (val) {
                        if (!val.replace(reg, '')) {
                            val = JSON.stringify({ ops: [{ insert: val.replace(reg, '') }] });
                        }
                        initWatcher();
                        self.editor.setContents(JSON.parse(val));
                    } else {
                        ctrl.$setViewValue(JSON.stringify(''));
                    }
                });


                if (isReadOnly) {
                    self.editor.disable();
                    elem.find('.ql-toolbar').hide();
                }
            }

            function clickHandler(event) {
                if (!isChild(event.target, elem[0])) {
                    $(document.body).off('click');
                    scope.isReadMode = true;
                    if (typeof scope.autoSaveFn === 'function') {
                        scope.autoSaveFn.call(this, ctrl.$viewValue, self.editor.getText());
                    }
                } else { // keep editing

                }
            }

            function isChild(child, parent) {
                child = child.parentNode;
                while (child != null && child !== parent) {
                    child = child.parentNode;
                }
                return !!child;
            }
        }

        return directive;
    }
})(NetBrain);
