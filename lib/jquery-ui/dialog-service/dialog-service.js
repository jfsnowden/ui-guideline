angular.module('dialogService', []).service('dialogService', function ($rootScope, $q, $compile, $templateCache, $timeout) {

        var _this = this;
        this.dialogs = {};

        this.open = function (id, template, model, options) {
            //var tempVar=id&&id.charAt(id.length-1);
            // Check our required arguments
            if (!angular.isDefined(id)) {
                throw "dialogService requires id in call to open";
            }

            var dialogExist = _this.dialogs[id];
            if ('undefined' !== typeof dialogExist && angular.isDefined(dialogExist)) {
                this.close(id, dialogExist.scope.model);
            }

            if (!angular.isDefined(template)) {
                throw "dialogService requires template in call to open";
            }

            // Set the defaults for model
            if (!angular.isDefined(model)) {
                model = null;
            }

            // Copy options so the change ot close isn't propogated back.
            // Extend is used instead of copy because window references are
            // often used in the options for positioning and they can't be deep
            // copied.
            var dialogOptions = {};
            if (angular.isDefined(options)) {
                angular.extend(dialogOptions, options);
            }

            // Initialize our dialog structure
            var dialog = {scope: null, ref: null, deferred: null};

            // Get the template and trim to make it valid
            var dialogTemplate = $templateCache.get(template);
            if (!angular.isDefined(dialogTemplate)) {
                throw "dialogService could not find template " + template;
            }
            dialogTemplate = dialogTemplate.trim();

            // Create a new scope, inherited from the parent.
            dialog.scope = $rootScope.$new();
            dialog.scope.model = model;
            var dialogLinker = $compile(dialogTemplate);
            dialog.ref = $(dialogLinker(dialog.scope));

            // Hande the case where the user provides a custom close and also
            // the case where the user clicks the X or ESC and doesn't call
            // close or cancel.
            var customCloseFn = dialogOptions.close;
            var cleanupFn = this.cleanup;
            dialog.ref.resetId=function(newId,oldId){
               // console.error("--------------"+tempVar+"\noldId:"+oldId+"\nnewId:"+newId+"\nid"+id);
                if(id==oldId){
                    id=newId;
                }
            }
            dialogOptions.close = function (event, ui) {
                if (customCloseFn) {
                    customCloseFn(event, ui);
                }
                //console.error("--------------"+tempVar+"\nid"+id);
                cleanupFn(id);
            };

            // Initialize the dialog and open it

            dialog.ref.dialog(dialogOptions);

            //Prevents dragging from starting on specified elements.
            if (dialogOptions.draggable && $.isPlainObject(dialogOptions.draggable)) {
                dialog.ref.dialog({draggable: false}).parent().draggable(dialogOptions.draggable);
            } else {
                dialog.ref.dialog({draggable: false}).parent().draggable();
            }
            $timeout(function () {

                dialog.ref.dialog("open");
                // Cache the dialog
                _this.dialogs[id] = dialog;

                // Create our promise, cache it to complete later, and return it
                dialog.deferred = $q.defer();
                return dialog.deferred.promise;

            }, 1)

        };
        this.resetDialogId = function(newId, oldId) {
            var dialog = this.getExistingDialog(oldId);
            if (dialog) {
                dialog.ref.resetId(newId,oldId);
                delete _this.dialogs[oldId];
                _this.dialogs[newId] = dialog
            }
        };
        this.close = function (id, result) {
            // Get the dialog and throw exception if not found
            var dialog = _this.getExistingDialog(id);

            // Notify those waiting for the result
            // This occurs first because the close calls the close handler on the
            // dialog whose default action is to cancel.
            if (dialog != null) {

                dialog.deferred.resolve(result);

                // Close the dialog (must be last)
                dialog.ref.dialog("close");
            }

        };

        this.cancel = function (id) {
            // Get the dialog and throw exception if not found
            var dialog = _this.getExistingDialog(id);

            // Notify those waiting for the result
            // This occurs first because the cancel calls the close handler on the
            // dialog whose default action is to cancel.
            dialog.deferred.reject();

            // Cancel and close the dialog (must be last)
            dialog.ref.dialog("close");
        };

        /* private */
        this.cleanup = function (id) {
            // Get the dialog and throw exception if not found
            var dialog = _this.getExistingDialog(id);
            // This is only called from the close handler of the dialog
            // in case the x or escape are used to cancel the dialog. Don't
            // call this from close, cancel, or externally.
            dialog.deferred.reject();
            dialog.scope.$destroy();

            // Remove the object from the DOM
            dialog.ref.remove();

            // Delete the dialog from the cache
            delete _this.dialogs[id];
        };

        /* private */
        this.getExistingDialog = function (id) {
            // Get the dialog from the cache
            var dialog = _this.dialogs[id];
            // Throw an exception if the dialog is not found
            if (!angular.isDefined(dialog)) {
                return null;
            }

            return dialog;
        };

    }
);