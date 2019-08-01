module ap.viewmodels.projects {

    export class ProjectStatusViewModel implements IDispose {

        /**
        * Method use to get noteprojectStatusListVm
        **/
        public get noteProjectStatusListVm(): ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel {
            return this._noteProjectStatusListVm;
        }

        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * Dispose method
        **/
        dispose(): void {
            this._screenInfo.dispose();
        }

        /**
         * This method changes the screen to edit mode
         */
        public gotoEditMode() {
            this._screenInfo.isEditMode = true;
            this.computeButtonAccessibility();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * Peform save
        **/
        private save(): angular.IPromise<any> {
            let deferred: angular.IDeferred<any> = this.$q.defer();

            if (!this.checkDataOK()) {
                this.controllersManager.mainController.showErrorKey("app.err.Status_InvalidData", "app.err.general_error", null, null);
                deferred.reject("app.err.Status_InvalidData");
            } else {
                let toSave: ap.models.projects.NoteProjectStatus[] = [];
                angular.forEach(this.noteProjectStatusListVm.sourceItems, (statusVM: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel) => {
                    statusVM.postChanges();
                    toSave.push(statusVM.noteProjectStatus);
                });

                let self = this;
                this.controllersManager.projectController.saveNoteStatusList(toSave).then(() => {
                    self.noteProjectStatusListVm.refresh(null).then(() => {
                        return deferred.resolve();
                    }, (reason) => { deferred.reject(reason); });
                }, (reason) => { deferred.reject(reason); });

                // send Segment.IO event
                let currentProject: ap.models.projects.Project = this.controllersManager.mainController.currentProject();
                let paramvalues = [
                    new KeyValue("cli-action-edit project status-project id", currentProject.Id),
                    new KeyValue("cli-action-edit project status-project name", currentProject.Name),
                    new KeyValue("cli-action-edit project status-screenname", "projectconfig")
                ];
                this.$servicesManager.toolService.sendEvent("cli-action-edit project status", new Dictionary(paramvalues));
            }

            return deferred.promise;
        }

        /**
        * Peform cancel
        **/
        private cancel(): angular.IPromise<ap.models.projects.NoteProjectStatus[]> {
            return this.noteProjectStatusListVm.refresh(null);
        }

        /**
        * Check edit access
        **/
        private checkEditImportAccess() {
            this._editAction.isVisible = this.utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectStatusConfig) &&
                this._screenInfo.isEditMode === false;
            this._editAction.isEnabled = this._screenInfo.isEditMode === false && this.controllersManager.mainController.currentProject().UserAccessRight.CanConfig === true;
            this._importAction.isVisible = this.utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectStatusConfig) &&
                this._screenInfo.isEditMode === false;
            this._importAction.isEnabled = this._screenInfo.isEditMode === false && this.controllersManager.mainController.currentProject().UserAccessRight.CanConfig === true;
        }

        /**
        * This top handle actions click on UI
        **/
        private actionClickedHandler(actionName: string) {
            switch (actionName) {
                case "status.edit": this.gotoEditMode(); break;
                case "status.save": this._saveStatuses(); break;
                case "status.cancel": this._cancelModifications(); break;
                case "status.import": this.importFromProject(); break;
            }
        }

        /**
         * This method is to compute the availibility and visibility of each buttons of the screen + dragoption
         */
        private computeButtonAccessibility() {
            this.checkEditImportAccess();
            this._saveAction.isEnabled = this.screenInfo.isEditMode && this.noteProjectStatusListVm.canSave;
            this._saveAction.isVisible = this.screenInfo.isEditMode;
            this._cancelAction.isVisible = this.screenInfo.isEditMode;
            this._cancelAction.isEnabled = this.screenInfo.isEditMode;
            this._noteProjectStatusListVm.dragOptions.isEnabled = this.screenInfo.isEditMode;
        }

        /**
        * This private method calls the save method to save the statuses and then changes the screen to read mode
        */
        private _saveStatuses() {
            this.controllersManager.mainController.showBusy();
            this.save().then(() => {
                this._screenInfo.isEditMode = false;
                this.noteProjectStatusListVm.isImport = false;
                this.computeButtonAccessibility();
                this._listener.raise("editmodechanged", new base.EditModeEvent(this));
                this.controllersManager.mainController.hideBusy();
            }, () => {
                this.controllersManager.mainController.hideBusy();
                this.computeButtonAccessibility();
            });
        }

        /**
        * Method called when the action Import from another project clicked
        * This method create new Import Project Status View Model
        * AND displayed mdDialog with current view model
        **/
        private importFromProject() {
            this._importNoteProjectStatusViewModel = new ap.viewmodels.projects.ImportNoteProjectStatusViewModel(this.utility, this.$q, this.controllersManager, this._api, this.$mdDialog, this.meetingAccessRight, this.$timeout);
            this._importNoteProjectStatusViewModel.on("importstatusfromproject", this.importStatus, this);
            this.controllersManager.mainController.showBusy();

            let importFromProjectController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["importNoteProjectStatusViewModel"] = this._importNoteProjectStatusViewModel;
            };
            importFromProjectController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                onComplete: () => {
                    this.controllersManager.mainController.hideBusy();
                },
                templateUrl: "me/PartialView?module=Project&name=ImportProjectStatusDialog",
                fullscreen: true,
                controller: importFromProjectController
            }).then((val: ImportStatusResponse) => {
                if (val === ImportStatusResponse.Import) {
                    this.noteProjectStatusListVm.isImport = true;
                    this.computeButtonAccessibility();
                }
            });
        }

        /**
        * Method use to import the new statuses
        * @param items: the list of statuses to load
        **/
        public importStatus(items: IEntityViewModel[]) {
            this.gotoEditMode();
            for (let i = 0; i < items.length; i++) {
                let newStatus: ap.models.projects.NoteProjectStatus = <ap.models.projects.NoteProjectStatus>items[i].originalEntity;
                if (!StringHelper.isNullOrWhiteSpace(newStatus.Code)) {
                    for (let j = 0; j < this.noteProjectStatusListVm.sourceItems.length; j++) {
                        let status: noteProjectStatus.NoteProjectStatusViewModel = <noteProjectStatus.NoteProjectStatusViewModel>this.noteProjectStatusListVm.sourceItems[j];
                        if (newStatus.Code === (<ap.models.projects.NoteProjectStatus>status.originalEntity).Code) {
                            (<noteProjectStatus.NoteProjectStatusViewModel>this.noteProjectStatusListVm.sourceItems[j]).updateViewModel(<noteProjectStatus.NoteProjectStatusViewModel>items[i]);
                            if ((<noteProjectStatus.NoteProjectStatusViewModel>this.noteProjectStatusListVm.sourceItems[j]).doneAction) {
                                this.noteProjectStatusListVm.closingStatusId = this.noteProjectStatusListVm.sourceItems[j].originalEntity.Id;
                            }
                            break;
                        }
                    }
                } else {
                    if (!newStatus.IsDisabled) {
                        let duplicatedName = this.noteProjectStatusListVm.sourceItems.filter((item: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel) => {
                            return item.name === newStatus.Name;
                        });
                        if (duplicatedName.length === 0) {
                            let copyStatus = (<noteProjectStatus.NoteProjectStatusViewModel>items[i]).noteProjectStatus.copy(ap.models.projects.NoteProjectStatus);
                            copyStatus.Project = null; // Project is added at the save

                            let copyVm = new noteProjectStatus.NoteProjectStatusViewModel(this.utility);
                            copyVm.init(copyStatus);

                            this.noteProjectStatusListVm.addNewStatus(copyVm, copyVm.displayOrder);
                            if ((<noteProjectStatus.NoteProjectStatusViewModel>items[i]).doneAction) {
                                this.noteProjectStatusListVm.closingStatusId = items[i].originalEntity.Id;
                            }
                        } else {
                            for (let k = 0; k < duplicatedName.length; k++) {
                                (<noteProjectStatus.NoteProjectStatusViewModel>duplicatedName[k]).updateViewModel(<noteProjectStatus.NoteProjectStatusViewModel>items[i]);
                            }
                        }
                    }
                }
            }
        }

        /**
        * This private method calls the cancel method to revert the changes and then changes the view to read mode
        */
        private _cancelModifications() {
            this.controllersManager.mainController.showBusy();
            this.cancel().then(() => {
                this._screenInfo.isEditMode = false;
                this.noteProjectStatusListVm.isImport = false;
                this.computeButtonAccessibility();
                this._listener.raise("editmodechanged", new base.EditModeEvent(this));
                this.controllersManager.mainController.hideBusy();
            }, () => {
                this.controllersManager.mainController.hideBusy();
            });
        }

        /**
        * This to check if data ok to save
        **/
        private checkDataOK(): boolean {
            for (let i = 0; i < this.noteProjectStatusListVm.sourceItems.length; i++) {
                let statusVM = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>this.noteProjectStatusListVm.sourceItems[i];
                if (statusVM.isValid() === false) return false;
            }

            return true;
        }

        /**
        * Method use to load the data
        **/
        public loadData(): void {
            let refreshPromise = this._noteProjectStatusListVm.refresh(null);
            refreshPromise.then(() => {
                if (this._selectedStatusId) {
                    this._noteProjectStatusListVm.selectEntity(this._selectedStatusId);
                    this._selectedStatusId = null;
                }
            });
        }

        private canSaveChangedHandler() {
            this.computeButtonAccessibility();
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private utility: ap.utility.UtilityHelper, private $q: angular.IQService, private controllersManager: ap.controllers.ControllersManager,
            private meetingAccessRight: ap.models.accessRights.MeetingAccessRight, private _api: ap.services.apiHelper.Api, private $mdDialog: angular.material.IDialogService,
            private $servicesManager: ap.services.ServicesManager, private $timeout: ng.ITimeoutService, private _selectedStatusId?: string) {
            this._noteProjectStatusListVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(utility, controllersManager, $q, false, meetingAccessRight, false, true);

            this._noteProjectStatusListVm.on("cansavechanged", this.canSaveChangedHandler, this);

            this._editAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "status.edit", utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg",
                true /*visible*/, null /*sub*/, "Edit", true, null /*file*/, new ap.misc.Shortcut("e"));
            this._saveAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "status.save", utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg",
                false /*visible*/, null /*sub*/, "Save", true, null /*file*/, new ap.misc.Shortcut("s"));
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "status.cancel", utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg",
                false /*visible*/, null /*sub*/, "Cancel", true, null /*file*/, new ap.misc.Shortcut("x"));
            this._importAction = new ap.viewmodels.home.ActionViewModel(utility, utility.EventTool, "status.import", utility.rootUrl + "Images/html/icons/ic_import_export_black_24px.svg",
                true /*visible*/, null /*sub*/, "Import", true, null /*file*/);


            this._screenInfo = new ap.misc.ScreenInfo(utility, "project.statusconfig", ap.misc.ScreenInfoType.List, [this._editAction, this._saveAction, this._cancelAction, this._importAction],
                null, null, "projectconfig", true, false/*edit*/);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);

            this._listener = utility.EventTool.implementsListener(["editmodechanged"]);

            this.checkEditImportAccess();
        }

        private _noteProjectStatusListVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
        protected _listener: ap.utility.IListenerBuilder;
        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _saveAction: ap.viewmodels.home.ActionViewModel;
        private _importAction: ap.viewmodels.home.ActionViewModel;
        private _cancelAction: ap.viewmodels.home.ActionViewModel;
        private _importNoteProjectStatusViewModel: ap.viewmodels.projects.ImportNoteProjectStatusViewModel;
    }
}