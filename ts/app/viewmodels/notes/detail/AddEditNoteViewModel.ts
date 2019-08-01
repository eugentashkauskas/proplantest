module ap.viewmodels.notes {

    export class SaveNoteParameters {
        constructor(public needToClosePopup: boolean, public propertyName: string) { }
    }

    export class AddEditNoteViewModel extends EditNoteBaseViewModel {

        public get noteDetailViewModel(): NoteDetailViewModel {
            return <ap.viewmodels.notes.NoteDetailViewModel>this._noteDetailBaseVm;
        }

        public get roomSelectorViewModel(): ap.viewmodels.projects.RoomSelectorViewModel {
            return this._roomSelectorVm;
        }

        public set roomSelectorViewModel(r: ap.viewmodels.projects.RoomSelectorViewModel) {
        }
        /**
        * Use to get the ProjectRoomConfigViewModel
        **/
        public get roomsConfigure(): ap.viewmodels.projects.ProjectRoomConfigDialogViewModel {
            return this._roomsConfigure;
        }

        public set document(value: ap.models.documents.Document) {
            this._document = value;
        }

        public get document(): ap.models.documents.Document {
            return this._document;
        }

        protected checkHasChanged(): boolean {
            if (super.checkHasChanged()) {
                return true;
            }

            if (!this._roomSelectorVm) {
                return false;
            }

            let cellHasChanged = false;
            if (this.noteDetailViewModel.note && this.noteDetailViewModel.note.Cell) {
                cellHasChanged = this.createNewRoom.id !== this._roomSelectorVm.selectedRoomId &&
                    this.noteDetailViewModel.note.Cell.Id !== this._roomSelectorVm.selectedRoomId;
            } else if (this._roomSelectorVm.selectedRoomId && this.createNewRoom.id !== this._roomSelectorVm.selectedRoomId) {
                cellHasChanged = true;
            }

            let statusHasChanged: boolean = false;
            if (this.noteDetailViewModel.note && this.noteDetailViewModel.note.Status) {
                statusHasChanged = this.noteDetailViewModel.note.Status.Name !== this.noteDetailViewModel.status.Name;
            }

            return cellHasChanged || statusHasChanged;
        }

        /**
         * Method used to load a room with the gievn ID tp the room selector
         * @param subCellId an id of the room to load into the room selector
         */
        public loadRoomSelector(subCellId: string): angular.IPromise<any> {
            return this._roomSelectorVm.selectRoomById(subCellId);
        }

        /**
         * This property will check if the user can save the note. Means to check if the NoteDetailVm has maySave = true and if there is changed in this vm. 
         **/
        public canSave(): boolean {
            let meetingOk: boolean = false;
            if (this.hasEditMeeting === false || (this.meetingSelector && this.meetingSelector.selectedItem && this.meetingSelector.selectedItem !== null))
                meetingOk = true;
            return this.noteDetailViewModel.maySave && (this.hasChanged || this._isForCopy) && meetingOk && !this._saveRequested;
        }

        /**
         * Save the note
         * @param saveParameters {
         *            needToClosePopup: boolean = false, // to know if the popup should be closed
         *            propertyName?: string // the name of the property to updated
         *        }
         */
        public save(saveParameters?: SaveNoteParameters) {
            if (this.noteDetailViewModel && this.canSave()) {
                super.save();
                if (this._roomSelectorVm.selectedRoomId !== null) {
                    this.noteDetailViewModel.note.Cell = new ap.models.projects.SubCell(this.$utility);
                    let parentCell = this._roomSelectorVm.getParentCell();
                    this.noteDetailViewModel.note.Cell.createByJson({
                        Id: this._roomSelectorVm.selectedRoomId, // need to do this to have the correct id of the issuetype without the  last char
                        Code: (<ap.models.projects.CellHierarchy>this._roomSelectorVm.selectedItem.originalEntity).Code,
                        Description: (<ap.models.projects.CellHierarchy>this._roomSelectorVm.selectedItem.originalEntity).Description,
                        ParentCell: {
                            Id: parentCell.EntityId,
                            Code: parentCell.Code,
                            Description: parentCell.Description
                        }
                    });
                }
                else
                    this.noteDetailViewModel.note.Cell = null;
                this.noteDetailViewModel.postChanges();

                if (saveParameters && saveParameters.propertyName) {
                    this.noteDetailViewModel.note.ModifiedProperties.push(saveParameters.propertyName);
                    // when the issueType is changed, the inCharge may have been changed so need to update them as well
                    if (saveParameters.propertyName === "IssueType") {
                        this.noteDetailViewModel.note.ModifiedProperties.push("NoteInCharge");
                    }
                }

                this.$controllersManager.noteController.saveNote(this.noteDetailViewModel.note).then((apiResponse: ap.services.apiHelper.ApiResponse) => {
                    let updatedNote = <ap.models.notes.Note>apiResponse.data;
                    this.noteDetailViewModel.note.updateFromJson(<ap.models.notes.Note>apiResponse.data.toJSON());
                    if (saveParameters && saveParameters.needToClosePopup) {
                        this.$mdDialog.hide(ap.viewmodels.notes.AddEditResponse.CloseAddEditPopup);
                    }
                    this._saveRequested = false;
                }, (error) => {
                    this._saveRequested = false;
                });
            }
        }

        /**
        * Method call when the room selected is changing
        * @param item the new room selected
        **/
        private _roomSelectorSelectedItemChanged(item: ap.viewmodels.projects.RoomHierarchyItemViewModel) {
            if (item && item.originalEntity.Id === ap.utility.UtilityHelper.createEmptyGuid() + "0") {
                this._roomsConfigure = new ap.viewmodels.projects.ProjectRoomConfigDialogViewModel(this.$utility, this.$q, this.$mdDialog, this._api, this.$controllersManager, this.$servicesManager, this.$timeout);
                this._roomsConfigure.parentCellListVm.useCacheSystem = true;
                this._roomsConfigure.subCellListVm.useCacheSystem = true;
                if (this._isforNoteDetail) {
                    this._listener.raise("relatedentitycreationrequest", AddEditResponse.CreateRoom);
                } else {
                    this.$mdDialog.hide(AddEditResponse.CreateRoom);
                }
            }
        }

        /**
         * This method is called when the note was saved then, leave the edit mode and close the popup
         **/
        private _noteSavedHandler() {
            if (!this._isforNoteDetail) {
                this.noteDetailViewModel.isEditMode = false;
                this.$mdDialog.hide(ap.viewmodels.notes.AddEditResponse.CloseAddEditPopup);
                this.$scope.$destroy();
                this.dispose();
            }
        }

        /**
         * Dispose method
         */
        public dispose() {
            super.dispose();
            if (this._roomSelectorVm) {
                this._roomSelectorVm.listVm.dispose();
                this._roomSelectorVm = null;
            }
        }

        /**
         * This method use for init room selector
         */
        private initRoomSelector() {
            let project = this.$controllersManager.mainController.currentProject();
            let user = this.$utility.UserContext.CurrentUser();
            let zeroId = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid());
            let room: ap.models.projects.CellHierarchy = new ap.models.projects.CellHierarchy(this.$utility);
            room.createByJson({ EntityId: zeroId, Id: zeroId, EntityName: "SubCell", Description: this.$utility.Translator.getTranslation("Create new room"), IsPredefined: true });
            let roomVm: ap.viewmodels.projects.RoomHierarchyItemViewModel = new ap.viewmodels.projects.RoomHierarchyItemViewModel(this.$utility, this.$q, undefined, undefined, true);
            roomVm.init(room);
            this.createNewRoom = new ap.viewmodels.PredefinedItemParameter(0, zeroId, roomVm);

            let predefinedRooms = [];
            if ((project.Creator && project.Creator.Id === user.Id || project.UserAccessRight.CanConfig) && this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectRoomConfig)) {
                predefinedRooms.push(this.createNewRoom);
            }

            this._roomSelectorVm = new ap.viewmodels.projects.RoomSelectorViewModel(this.$utility, this.$q, this.$controllersManager, this.$timeout, predefinedRooms);
            this._roomSelectorVm.on("selectedItemChanged", this._roomSelectorSelectedItemChanged, this);
            if (this.noteDetailViewModel.subCell) {
                this.loadRoomSelector(this.noteDetailViewModel.subCell.Id);
            }
        }

        /**
         * This metod return true if browser IE
         */
        public get isIE() {
            return this.$utility.isIE();
        }

        public init(notedetail: ap.viewmodels.notes.NoteDetailViewModel) {
            super.init(notedetail);
            this.initRoomSelector();
        }

        /**
         * Update contact details edit lists when entity is updated
         * @param args Event object
         */
        protected _noteDetailsPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            super._noteDetailsPropertyChanged(args);
            if (args.propertyName === "originalEntity" && this.noteDetailViewModel.note) {
                this._roomSelectorVm.selectRoomById(this.noteDetailViewModel.note.Cell ? this.noteDetailViewModel.note.Cell.Id : null);
            }
        }

        static $inject = ["Utility", "$mdDialog", "$q", "Api", "$timeout", "$scope", "ControllersManager", "ServicesManager"];
        constructor($utility: ap.utility.UtilityHelper, $mdDialog: angular.material.IDialogService, $q: angular.IQService, _api: ap.services.apiHelper.Api, $timeout: angular.ITimeoutService, $scope: ng.IScope,
            $controllersManager: ap.controllers.ControllersManager, $servicesManager: ap.services.ServicesManager, noteVm?: ap.viewmodels.notes.NoteDetailViewModel, document: ap.models.documents.Document = null, isForNoteModule: boolean = true, isforNoteDetail: boolean = false, isFirstInit: boolean = false, private _isForCopy: boolean = false) {
            super($utility, $mdDialog, $q, _api, $timeout, $scope, $controllersManager, $servicesManager, noteVm, document, isForNoteModule, isforNoteDetail, isFirstInit);

            if (noteVm) {
                this.init(noteVm);
                this._editTitleMessage = null;
                if (this.noteDetailViewModel.note) { // case when created a new point
                    this._editTitleMessage = $utility.Translator.getTranslation("app.addEditNote.editTitle").format(this.noteDetailViewModel.note.Code);
                }
            }

            let saveAction: ap.viewmodels.home.ActionViewModel = new ap.viewmodels.home.ActionViewModel($utility, $utility.EventTool, "note.save", null, true, null, null, true, false, new ap.misc.Shortcut(KEY_CODE.ENTER));
            this._shortcutActions = [saveAction];
        }

        private _roomSelectorVm: ap.viewmodels.projects.RoomSelectorViewModel;
        private createNewRoom: ap.viewmodels.PredefinedItemParameter;
        private _roomsConfigure: ap.viewmodels.projects.ProjectRoomConfigDialogViewModel;
    }
}