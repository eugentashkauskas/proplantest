module ap.viewmodels.projects {
    export class ProjectRoomConfigViewModel implements IDispose {
        /**
        * Method use to get parentCellListVm
        **/
        public get parentCellListVm(): ap.viewmodels.projects.ParentCellListViewModel {
            return this._parentCellListVm;
        }

        /**
        * Method use to get subCellListVm
        **/
        public get subCellListVm(): ap.viewmodels.projects.SubCellListViewModel {
            return this._subCellListVm;
        }

        /**
        * Use to get the id of last subCell created
        **/
        public get lastSubCellAddedId(): string {
            return this._lastSubCellAddedId;
        }

        /**
        * Use to set the id of the last subcell created
        **/
        public set lastSubCellAddedId(id: string) {
            this._lastSubCellAddedId = id;
        }

        /**
         * Determines whether any popup managed by this view model is currently active
         */
        public get isPopupActive(): boolean {
            return this._importExcelViewModel !== null || this._importProjectRoomViewModel !== null;
        }

        /**
        * Method use to get screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * Method use to know how many invalid items are left in the list
        **/
        public get invalidParentFomImport(): ParentCellViewModel[] {
            let parentCells: ParentCellViewModel[] = this._invalidParentFomImport.keys();
            return parentCells.filter((parent: ParentCellViewModel) => {
                return !parent.isMarkedToDelete;
            });
        }

        /**
        * Method use to know if the button save (in the view) should be available or not
        **/
        public get hasChanged(): boolean {
            return this._hasChanged;
        }

        /*
        * Private method to know if a the lists have modification or not
        * This will also enable/disable to save button
        */
        private checkHasChanged() {
            this._hasChanged = this.parentCellListVm.getChangedItems().length > 0 || this.subCellListVm.getChangedItems().length > 0;
            this._saveAction.isEnabled = this._hasChanged && this._parentCellListVm.isValid && this._subCellListVm.isValid && this.invalidParentFomImport.length === 0;
        }

        /**
        * Method use to load the cell ids
        **/
        public load(): void {
            this._dicCell.clear();
            let url = "rest/cellhierarchiesids";
            let options: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            let currentProj: ap.models.projects.Project = this.$controllersManager.mainController.currentProject();
            options.showDetailBusy = true;
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("projectId", currentProj.Id));
            options.customParams.push(new ap.services.apiHelper.ApiCustomParam("baseentityname", "parentcell"));
            this.Api.getApiResponse(url, ap.services.apiHelper.MethodType.Get, null, null, options).then((response: ap.services.apiHelper.ApiResponse) => {
                let collection = response.data;
                let num: string = null;
                let id: string = null;
                let currentParentCellId: string = null;
                let itemId: string = null;
                for (let i = 0; i < collection.length; i++) {
                    itemId = collection[i];
                    num = itemId.substr(itemId.length - 1);
                    id = itemId.substr(0, itemId.length - 1);
                    if (num === "0") {
                        currentParentCellId = id;
                        this._dicCell.add(id, []);
                    }
                    if (num === "1") {
                        this._dicCell.getValue(currentParentCellId).push(id);
                    }
                }
                this._parentCellListVm.specifyIds(this._dicCell.keys());
            });
        }

        /**
        * Method use to save the user's changes in edit mode
        **/
        public save(): angular.IPromise<ap.models.custom.ProjectRoomModification> {
            let def: angular.IDeferred<models.custom.ProjectRoomModification> = this.$q.defer();
            let toSave: ap.models.custom.ProjectRoomModification = new ap.models.custom.ProjectRoomModification(this.$utility);
            let tmp: ap.models.custom.ProjectRoomModification;

            tmp = this._parentCellListVm.postChange();
            toSave.ParentCellsToDelete = tmp.ParentCellsToDelete;
            toSave.ParentCellsToUpdate = tmp.ParentCellsToUpdate;

            tmp = this._subCellListVm.postChange();
            toSave.SubCellsToDelete = tmp.SubCellsToDelete;
            toSave.SubCellsToUpdate = tmp.SubCellsToUpdate;

            if (toSave.ParentCellsToDelete) {
                for (let i = 0; i < toSave.ParentCellsToDelete.length; i++) {
                    let parentCell: string = toSave.ParentCellsToDelete[i];
                    let issueTypes: string[] = this._dicCell.getValue(parentCell);
                    for (let j = 0; j < issueTypes.length; j++) {
                        toSave.SubCellsToDelete.push(issueTypes[j]);
                    }
                }
            }

            if (toSave.ParentCellsToDelete.length > 0 || toSave.SubCellsToDelete.length > 0 || toSave.ParentCellsToUpdate.length > 0 || toSave.SubCellsToUpdate.length > 0) {
                return this.processSave(toSave);
            } else {
                def.resolve(null);
                this.goToReadMode();
                this.$mdDialog.hide();
            }
            return def.promise;
        }

        protected processSave(toSave: ap.models.custom.ProjectRoomModification): angular.IPromise<ap.models.custom.ProjectRoomModification> {
            let def: angular.IDeferred<models.custom.ProjectRoomModification> = this.$q.defer();

            let nbPCellAdd = toSave.ParentCellsToUpdate.filter((parentCell: ap.models.projects.ParentCell) => {
                return parentCell.IsNew;
            });
            let nbSCellAdd = toSave.SubCellsToUpdate.filter((subCell: ap.models.projects.SubCell) => {
                return subCell.IsNew;
            });

            if (nbSCellAdd.length > 0) {
                this.lastSubCellAddedId = nbSCellAdd[nbSCellAdd.length - 1].Id;
            }

            this.$controllersManager.mainController.showConfirm(this.$utility.Translator.getTranslation("app.rooms.save").format(nbPCellAdd.length.toString(), nbSCellAdd.length.toString(),
                (toSave.ParentCellsToUpdate.length - nbPCellAdd.length).toString(), (toSave.SubCellsToUpdate.length - nbSCellAdd.length).toString(), toSave.ParentCellsToDelete.length.toString(), toSave.SubCellsToDelete.length.toString()),
                this.$utility.Translator.getTranslation("Please confirm"), (confirm) => {
                    if (confirm === ap.controllers.MessageResult.Positive) {
                        let lastSelectedSubCell = this.subCellListVm.selectedViewModel;
                        let updateRoomsPromise = this.$controllersManager.projectController.updateProjectRoom(toSave).then((result: ap.models.custom.ProjectRoomModification) => {
                            def.resolve(result);
                            this.goToReadMode();
                        });

                        // send Segment.IO events
                        let currentProject: ap.models.projects.Project = this.$controllersManager.mainController.currentProject();
                        let paramValues = [new KeyValue("cli-action-edit project room-add room level 1", nbPCellAdd.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project room-add room level 2", nbSCellAdd.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project room-update room level 1", (toSave.ParentCellsToUpdate.length - nbPCellAdd.length) > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project room-update room level 2", (toSave.SubCellsToUpdate.length - nbSCellAdd.length) > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project room-delete room level 1", toSave.ParentCellsToDelete.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project room-delete room level 2", toSave.SubCellsToDelete.length > 0 ? "true" : "false"),
                        new KeyValue("cli-action-edit project room-project name", currentProject.Name),
                        new KeyValue("cli-action-edit project room-project id", currentProject.Id),
                        new KeyValue("cli-action-edit project room-screenname", "projectconfig")
                        ];
                        let sendEventPromise = this.$servicesManager.toolService.sendEvent("cli-action-edit project room", new Dictionary(paramValues));
                        this.$q.all([updateRoomsPromise, sendEventPromise]).then(() => {
                            this.$mdDialog.hide(lastSelectedSubCell);
                        });
                    } else {
                        def.reject();
                    }
                });

            return def.promise;
        }

        /**
        * Method use to cancel the cells changesand close the popup (case when adding new rooms from notes)
        **/
        public cancelFromNote() {
            this.$mdDialog.cancel();
        }

        /**
         * Switch rooms config page to the edit mode
         */
        public gotoEditMode() {
            this.editRoomConfig();
            this.checkEditAccess();
        }

        /**
        * Import data from an excel file
        **/
        private importExcel(retry?: boolean) {
            this._importExcelViewModel = new ap.viewmodels.projects.ImportExcelRoomViewModel(this.$utility, this.$q, this.$mdDialog, this.$controllersManager, retry);

            let importFromExcelController = ($scope: angular.IScope) => {
                $scope["importExcelViewModel"] = this._importExcelViewModel;
            };
            importFromExcelController.$inject = ["$scope"];

            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                fullscreen: true,
                templateUrl: "me/PartialView?module=Project&name=ImportExcelDialog",
                controller: importFromExcelController
            }).then((withError: boolean) => {
                if (withError) {
                    this.$controllersManager.mainController.showErrorKey("app.err.ImportExcel_badData", "app.err.title.ImportExcel_badData", null, () => {
                        this.importExcel(true);
                    });
                } else {
                    if (this._importExcelViewModel.importedData) {
                        let importedRooms = this._importExcelViewModel.importedData.slice();
                        this.beforeImportData(importedRooms);
                    }
                }
            }).finally(() => {
                this._importExcelViewModel.dispose();
                this._importExcelViewModel = null;
            });
        }

        /**
        * Method called when the action Import from another project clicked
        * This method create new Import Project IssueType View Model
        * AND displayed mdDialog with current view model
        **/
        private importProject() {
            this._importProjectRoomViewModel = new ap.viewmodels.projects.ImportProjectRoomViewModel(this.$utility, this.$q, this.Api, this.$controllersManager, this.$servicesManager.projectService, this.$servicesManager, this.$mdDialog, this.$timeout);
            this._importProjectRoomViewModel.on("importroomfromproject", this.beforeImportData, this);
            this.$controllersManager.mainController.showBusy();

            let importFromProjectController = ($scope: angular.IScope) => {
                $scope["importProjectRoomViewModel"] = this._importProjectRoomViewModel;
            };
            importFromProjectController.$inject = ["$scope"];

            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                },
                templateUrl: "me/PartialView?module=Project&name=ImportProjectRoomDialog",
                fullscreen: true,
                controller: importFromProjectController
            }).finally(() => {
                this._importProjectRoomViewModel.dispose();
                this._importProjectRoomViewModel = null;
            });
        }

        /**
         * If there is more than 100 rooms need to load the last item to know his displayOrder
         * @param importedData
         */
        private beforeImportData(importedData: models.Entity[]) {
            let lastItem: viewmodels.projects.ParentCellViewModel = <viewmodels.projects.ParentCellViewModel>this.parentCellListVm.getItemAtIndex(this.parentCellListVm.sourceItems.length - 1);
            if (lastItem) {
                this.importData(importedData);
            } else {
                let pageIndex: number = this.parentCellListVm.getPageIndex(this.parentCellListVm.ids[this.parentCellListVm.ids.length - 1]);
                this.parentCellListVm.loadPage(pageIndex).then(() => {
                    this.importData(importedData);
                });
            }
        }

        /**
        * Import excel data to the lists
        * @param importedData imported entities
        **/
        private importData(importedData: models.Entity[]) {
            this.editRoomConfig();
            importedData.forEach((entity: models.Entity) => {
                let parentCell: models.projects.ParentCell = <models.projects.ParentCell>entity;
                let subCellsIds = new Array<string>(parentCell.SubCells.length);
                let subCells: SubCellViewModel[] = [];
                parentCell.SubCells.forEach((subCell: ap.models.projects.SubCell, index: number) => {
                    subCell.DisplayOrder = index + 10000;
                    subCellsIds[index] = subCell.Id;
                    let subCellVm = new SubCellViewModel(this.$utility);
                    subCellVm.init(subCell);
                    subCells.push(subCellVm);
                    this.subCellListVm.insertImportedItem(subCellVm);
                });
                this._dicCell.add(parentCell.Id, subCellsIds);
                parentCell.SubCells = null;
                if (this.parentCellListVm.sourceItems.length === 0) {
                    parentCell.DisplayOrder = 10000;
                } else {
                    let lastItem: viewmodels.projects.ParentCellViewModel = <viewmodels.projects.ParentCellViewModel>this.parentCellListVm.getItemAtIndex(this.parentCellListVm.sourceItems.length - 1);
                    parentCell.DisplayOrder = (<models.projects.ParentCell>lastItem.originalEntity).DisplayOrder + 10000;
                }
                let parentCellVm = new ParentCellViewModel(this.$utility);
                parentCellVm.init(parentCell);
                this.parentCellListVm.insertImportedItem(parentCellVm);
                if (this.checkDuplicatedItems(subCells)) {
                    parentCellVm.setValidityFromImport(false);
                    parentCellVm.hasDuplicatedChildren = true;
                    this._invalidParentFomImport.add(parentCellVm, subCells);
                }
            });
            this.checkHasChanged();
            this.checkEditAccess();
        }

        /**
        * Method used to know if som subcells are duplicated
        **/
        private checkDuplicatedItems(subCellList: SubCellViewModel[]): boolean {
            if (subCellList.length > 1) {
                for (let i = 0; i < subCellList.length; i++) {
                    for (let j = i + 1; j < subCellList.length; j++) {
                        if (subCellList[i].code.toUpperCase() === subCellList[j].code.toUpperCase()) {
                            if (!subCellList[i].isMarkedToDelete && !subCellList[j].isMarkedToDelete) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        }

        /**
        * Method called when the event selectedItemChanged is raised by parentCellListVm
        **/
        private _handlerSelectedParentCellChanged() {
            if (this._parentCellListVm.selectedViewModel && (<ParentCellViewModel>this._parentCellListVm.selectedViewModel).originalEntity.Id && (this._parentCellListVm.selectedViewModel.isValid() || this._parentCellListVm.selectedViewModel.originalEntity.IsNew)) {
                let parentCellId: string = (<ParentCellViewModel>this._parentCellListVm.selectedViewModel).originalEntity.Id;
                this._subCellListVm.clear();
                this._subCellListVm.specifyIds(this._dicCell.getValue(parentCellId)).then(() => {
                    this._subCellListVm.enableActions();
                    this._subCellListVm.parentCellVm = <ParentCellViewModel>this._parentCellListVm.selectedViewModel;
                    this._subCellListVm.parentCellUpdated(<ParentCellViewModel>this._parentCellListVm.selectedViewModel);
                    this._subCellListVm.checkIsDuplicated();
                });
            }
            else {
                this._subCellListVm.disableActions();
                this.subCellListVm.clear();
                this._subCellListVm.parentCellVm = <ParentCellViewModel>this._parentCellListVm.selectedViewModel;
                this._subCellListVm.checkIsDuplicated();
            }
        }

        /**
        * Set parentCellListVm.selectedViewModel to null (need after a delete for exemple)
        **/
        private setParentToNull() {
            this._parentCellListVm.selectedViewModel = null;
        }

        /**
        * Method use to know if the user can edit project room or not
        **/
        private checkEditAccess() {
            let project = this.$controllersManager.mainController.currentProject();
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectRoomConfig)) {
                if (this._screenInfo.isEditMode === false) {
                    this._editAction.isVisible = true;
                    this._importAction.isVisible = true;
                } else {
                    this._editAction.isVisible = false;
                    this._importAction.isVisible = false;
                }
            } else {
                this._editAction.isVisible = false;
                this._importAction.isVisible = false;
            }

            if (this._screenInfo.isEditMode === false) {
                if (project.UserAccessRight.CanConfig === true) {
                    this._editAction.isEnabled = true;
                    this._importAction.isEnabled = true;
                } else {
                    this._editAction.isEnabled = false;
                    this._importAction.isEnabled = false;
                }
            } else {
                this._editAction.isEnabled = false;
                this._importAction.isEnabled = false;
            }

            // save button
            this._saveAction.isVisible = this._screenInfo.isEditMode;
            this.checkHasChanged();

            // cancel button
            this._cancelAction.isVisible = this._screenInfo.isEditMode;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode;
        }

        /**
        * Method use to manage actions
        **/
        private actionClickedHandler(action: string) {
            switch (action) {
                case "rooms.edit": this.editRoomConfig(); break;
                case "rooms.save": this.save(); break;
                case "rooms.cancel": this.cancel(); break;
                case "import.excel": this.importExcel(); break;
                case "import.project": this.importProject(); break;
            }

            this.checkEditAccess();
        }

        /**
        * The private method makes the screen go to edit mode
        */
        private editRoomConfig() {
            this._screenInfo.isEditMode = true;
            this._parentCellListVm.useCacheSystem = true;
            this._subCellListVm.useCacheSystem = true;
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * The private method makes the screen go to edit mode and saves the modifications
        */
        private _saveRoomConfig() {
            this._screenInfo.isEditMode = false;
            this._parentCellListVm.useCacheSystem = false;
            this._subCellListVm.useCacheSystem = false;
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * The private method makes the screen go to edit mode and cancels the modifications
        */
        private _cancelRoomConfig() {
            this._screenInfo.isEditMode = false;
            this._parentCellListVm.useCacheSystem = false;
            this._subCellListVm.useCacheSystem = false;
            this._hasChanged = false;
            this._parentCellListVm.cancel();
            this._subCellListVm.cancel();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /*
        * This private method makes the vm goes to read mode
        * It also sets the useCacheSystem of all lists to false to clear the cache memory
        */
        protected goToReadMode() {
            this._parentCellListVm.useCacheSystem = false;
            this._subCellListVm.useCacheSystem = false;
            this.parentCellListVm.selectedViewModel = null;
            this._subCellListVm.specifyIds([]);
            if (this._screenInfo) {
                this._screenInfo.isEditMode = false;
                this.load();
                this.checkEditAccess();
            }
            this._subCellListVm.clear();

            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * Method use to cancel the user's changes in edit mode
        **/
        public cancel() {
            this._cancelRoomConfig();
            this.parentCellListVm.selectedViewModel = null;
            this._subCellListVm.specifyIds([]);
            this.load();
            this._subCellListVm.clear();

        }

        /**
         * This method will update the _dicCell dic when a new parent cell is inserted in the list.
         **/
        private handlerParentCellItemInserted(itemInfo: ItemInsertedEvent) {
            if (!this._dicCell.containsKey(itemInfo.item.originalEntity.Id))
                this._dicCell.add(itemInfo.item.originalEntity.Id, []);
        }

        /**
         * 
         * @param evt
         */
        private listPropertyChangedHandler(evt: base.PropertyChangedEventArgs) {
            if (evt.propertyName === "isValid") {
                if (this._parentCellListVm === evt.caller && this._parentCellListVm.selectedViewModel) {
                    this._handlerSelectedParentCellChanged();
                }
                if (this._subCellListVm === evt.caller) {
                    this.parentCellListVm.setValidityFromChild(this._subCellListVm.isValid);
                }
                let enable = this._parentCellListVm.isValid && this._subCellListVm.isValid;
                this._parentCellListVm.updateItemsActionsState(enable);
                this._subCellListVm.updateItemsActionsState(enable);
                this.checkHasChanged();
            }
        }

        /**
        * Method used to know if all subCells of all new parentCells are valid
        **/
        private checkSubCellsOk() {
            let noMoreParentUnvalid = true;
            let parentToCheck = <ParentCellViewModel[]>this.parentCellListVm.sourceItems.filter((parent: ParentCellViewModel) => {
                return parent.originalEntity.IsNew && !parent.isMarkedToDelete;
            });
            for (let i = 0; i < parentToCheck.length; i++) {
                let subcells: SubCellViewModel[] = this._invalidParentFomImport.getValue(parentToCheck[i]);
                if (subcells) {
                    if (this.checkDuplicatedItems(subcells)) {
                        noMoreParentUnvalid = false;
                        parentToCheck[i].setValidityFromImport(false);
                        parentToCheck[i].hasDuplicatedChildren = true;
                        this.parentCellListVm.setValidityFromChild(false);
                    } else {
                        parentToCheck[i].setValidityFromImport(true);
                        parentToCheck[i].hasDuplicatedChildren = false;
                        this._invalidParentFomImport.remove(parentToCheck[i]);
                    }
                }
            }
            if (noMoreParentUnvalid) {
                this.parentCellListVm.setValidityFromChild(true);
                this.subCellListVm.setValidityFromChild(true);
            }
        }

        /**
         * This method is used to initialize the screen the project issuetypes configuration screen
         */
        public initScreen() {
            this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "rooms.edit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit rooms", false);
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "rooms.save", this.$utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save rooms", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "rooms.cancel", this.$utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel changes", false);

            this._importAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "rooms.import", this.$utility.rootUrl + "Images/html/icons/ic_import_export_black_24px.svg", false, [
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "import.excel", null, false, false, false, "Import from Excel"),
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "import.project", null, false, false, false, "Import from another project")
            ], "Import", true);

            let actions = [this._editAction, this._saveAction, this._cancelAction, this._importAction];

            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "project.roomconfig", ap.misc.ScreenInfoType.List, actions, null, null, null, null, false);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);

            this.checkEditAccess();
        }

        public dispose() {
            if (this._screenInfo) {
                this._screenInfo.off("actionclicked", this.actionClickedHandler, this);
            }
            this._parentCellListVm.dispose();
            this._subCellListVm.dispose();
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * 
         * @param isLoaded
         */
        private restoreSelectedParentCell(isLoaded: boolean) {
            if (isLoaded === true) {
                this._parentCellListVm.selectEntity(this._selectedParentCellId);
                this._parentCellListVm.off("isLoadedChanged", this.restoreSelectedParentCell, this);
            }
        }

        constructor(private $utility: ap.utility.UtilityHelper, protected $q: angular.IQService, protected $mdDialog: angular.material.IDialogService, private Api: ap.services.apiHelper.Api,
            protected $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager, private $timeout: angular.ITimeoutService,
            private _selectedParentCellId?: string) {
            this._listener = this.$utility.EventTool.implementsListener(["editmodechanged"]);

            this._invalidParentFomImport = new Dictionary<ParentCellViewModel, SubCellViewModel[]>();

            this._importExcelViewModel = null;
            this._importProjectRoomViewModel = null;

            this._parentCellListVm = new ap.viewmodels.projects.ParentCellListViewModel($utility, $q, $controllersManager, $servicesManager.projectService);

            this._subCellListVm = new ap.viewmodels.projects.SubCellListViewModel($utility, $q, $controllersManager, $servicesManager);
            this._parentCellListVm.on("selectedItemChanged", this._handlerSelectedParentCellChanged, this);
            this._parentCellListVm.on("iteminserted", this.handlerParentCellItemInserted, this);
            this._parentCellListVm.on("hasChanged", this.checkHasChanged, this);
            this._parentCellListVm.on("checkSubCellsOk", this.checkSubCellsOk, this);
            this._subCellListVm.on("checkSubCellsOk", this.checkSubCellsOk, this);
            this._subCellListVm.on("hasChanged", this.checkHasChanged, this);
            this._subCellListVm.on("needToUnselect", this.setParentToNull, this);
            this._parentCellListVm.on("propertychanged", this.listPropertyChangedHandler, this);
            this._subCellListVm.on("propertychanged", this.listPropertyChangedHandler, this);
            this._dicCell = new Dictionary<string, string[]>();
            if (this._selectedParentCellId) {
                this._parentCellListVm.on("isLoadedChanged", this.restoreSelectedParentCell, this);
            }
            this.initScreen();
        }

        private _parentCellListVm: ap.viewmodels.projects.ParentCellListViewModel;
        private _subCellListVm: ap.viewmodels.projects.SubCellListViewModel;
        private _dicCell: IDictionary<string, string[]>;
        private _screenInfo: ap.misc.ScreenInfo;
        private _listener: ap.utility.IListenerBuilder;

        // screen actions
        private _editAction: home.ActionViewModel;
        private _importAction: home.ActionViewModel;
        protected _saveAction: home.ActionViewModel;
        private _cancelAction: home.ActionViewModel;

        private _hasChanged: boolean = false;
        private _importExcelViewModel: ImportExcelViewModel;
        private _importProjectRoomViewModel: ap.viewmodels.projects.ImportProjectRoomViewModel;
        private _invalidParentFomImport: IDictionary<ParentCellViewModel, SubCellViewModel[]>;
        private _lastSubCellAddedId: string = null;
    }
}