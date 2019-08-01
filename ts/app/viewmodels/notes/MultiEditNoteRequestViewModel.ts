module ap.viewmodels.notes {
    export class MultiEditNoteRequestViewModel implements IDispose {
        /**
         * This is the status selector where there is the value to edit multiple notes
         **/
        public get statusSelector() {
            return this._statusSelector;
        }

        /**
         * This is the room selector where there is the value to edit multiple notes
         **/
        public get roomSelector() {
            return this._roomSelector;
        }

        /**
         * This is the issueType selector where there is the value to edit multiple notes
         **/
        public get issueTypeSelector() {
            return this._issueTypeSelector;
        }

        /**
         * This is the contact selector where there is the value to edit multiple notes
         **/
        public get contactSelector() {
            return this._contactSelector;
        }

        /**
         * This is the new due date value to edit multiple notes
         **/
        public get dueDate(): Date {
            return this._dueDate;
        }

        public set dueDate(val: Date) {
            if (val !== this._dueDate) {
                let oldValue = this._dueDate;
                this._dueDate = val;
                if (!this._mustUpdateDueDate && !oldValue && this.dueDate)
                    this._mustUpdateDueDate = true;
                this.computeCanSave();
            }
        }

        /**
         * This is the new subject value to edit multiple notes
         **/
        public get subject(): string {
            return this._subject;
        }

        public set subject(val: string) {
            if (!((this._subject === undefined || this._subject === null || StringHelper.isNullOrEmpty(this._subject)) && (val === undefined || val === null || StringHelper.isNullOrEmpty(val)))) {
                let oldVal = this._subject;
                this._subject = val;
                if (!this.mustUpdateSubject && StringHelper.isNullOrEmpty(oldVal) && !StringHelper.isNullOrEmpty(this._subject))
                    this.mustUpdateSubject = true;

                else if (StringHelper.isNullOrEmpty(this._subject)) {
                    this.mustUpdateSubject = false;
                }
                this.computeCanSave();
            }
        }

        /**
         * This is the flag to know if the update must change the status
         **/
        public get mustUpdateStatus(): boolean {
            return this._mustUpdateStatus;
        }

        public set mustUpdateStatus(val: boolean) {
            if (val !== this._mustUpdateStatus) {
                this._mustUpdateStatus = val;
                if (!this._mustUpdateStatus) {
                    this.statusSelector.searchText = "";
                    this.statusSelector.selectStatus(null);
                }
                this.computeCanSave();
            }
        }

        /**
         * This is the flag to know if the update must change the due date
         **/
        public get mustUpdateDueDate(): boolean {
            return this._mustUpdateDueDate;
        }

        public set mustUpdateDueDate(val: boolean) {
            if (val !== this._mustUpdateDueDate) {
                this._mustUpdateDueDate = val;
                if (!this._mustUpdateDueDate)
                    this.dueDate = null;
                else if (!this.dueDate)
                    this.dueDate = new Date();

                this.computeCanSave();
            }
        }

        /**
         * This is the flag to know if the update must change the subject
         **/
        public get mustUpdateSubject(): boolean {
            return this._mustUpdateSubject;
        }

        public set mustUpdateSubject(val: boolean) {
            if (val !== this._mustUpdateSubject) {
                this._mustUpdateSubject = val;
                if (!this._mustUpdateSubject)
                    this.subject = "";
                this.computeCanSave();
            }
        }

        /**
         * This is the flag to know if the update must change the room
         **/
        public get mustUpdateRoom(): boolean {
            return this._mustUpdateRoom;
        }

        public set mustUpdateRoom(val: boolean) {
            if (val !== this._mustUpdateRoom) {
                this._mustUpdateRoom = val;
                if (!this._mustUpdateRoom) {
                    this.roomSelector.searchedText = "";
                    this.roomSelector.selectedItem = null;
                } else if (!this.roomSelector.selectedItem) {
                    this.selectClearRoomOption();
                }
                this.computeCanSave();
            }
        }

        /**
         * Selects the "Clear field" option in the room selector
         */
        private selectClearRoomOption() {
            this.roomSelector.selectedItem = this._clearFieldRoom.item;
        }

        /**
         * This is the flag to know if the update must change the issueType
         **/
        public get mustUpdateIssueType(): boolean {
            return this._mustUpdateIssueType;
        }

        public set mustUpdateIssueType(val: boolean) {
            if (val !== this._mustUpdateIssueType) {
                this._mustUpdateIssueType = val;
                if (!this._mustUpdateIssueType) {
                    this.issueTypeSelector.searchedText = "";
                    this.issueTypeSelector.selectedItem = null;
                } else if (!this.issueTypeSelector.selectedItem) {
                    this.selectClearIssueTypeOption();
                }
                this.computeCanSave();
            }
        }

        /**
         * Selects the "Clear field" option in the issue type selector
         */
        private selectClearIssueTypeOption() {
            this.issueTypeSelector.selectedItem = this._clearFieldIssueType.item;
        }

        /**
         * This is the flag to know if the update must change the user in charge
         **/
        public get mustUpdateInCharge(): boolean {
            return this._mustUpdateInCharge;
        }

        public set mustUpdateInCharge(val: boolean) {
            if (val !== this._mustUpdateInCharge) {
                this._mustUpdateInCharge = val;
                if (!this._mustUpdateInCharge) {
                    this.contactSelector.searchText = "";
                    this.contactSelector.selectedContacts.splice(0);
                } else if (!this.contactSelector.selectedContacts.length) {
                    this.clearUsersInCharge();
                }
                this.computeCanSave();
            }
        }

        /**
         * This flag determines whether it should be possible to add new users in charge.
         */
        public get canAddInCharge(): boolean {
            let selectedContacts = this.contactSelector.selectedContacts;
            // The "Clear field" option (if present) has an empty id and is the only value in the list of selected contacts.
            // A user should not be able to select new users in charge while this option is selected.
            return !selectedContacts[0] || !ap.utility.UtilityHelper.isEmptyGuid(selectedContacts[0].userId);
        }

        /**
         * If the multi edit is requested from a meeting, we can know if the user can edit subject. This is the value of this property
         **/
        public get hasEditSubject(): boolean {
            return this._hasEditSubject;
        }

        /**
         * If the multi edit is requested from a meeting, we can know if the user can edit status. This is the value of this property
         **/
        public get hasEditStatus(): boolean {
            return this._hasEditStatus;
        }

        /**
         * If the multi edit is requested from a meeting, we can know if the user can edit room. This is the value of this property
         **/
        public get hasEditRoom(): boolean {
            return this._hasEditRoom;
        }

        /**
         * If the multi edit is requested from a meeting, we can know if the user can edit issueType. This is the value of this property
         **/
        public get hasEditIssueType(): boolean {
            return this._hasEditIssueType;
        }

        /**
        * If the multi edit is requested from a meeting, we can know if the user can edit user in charge. This is the value of this property
        **/
        public get hasEditInCharge(): boolean {
            return this._hasEditInCharge;
        }

        /**
         * If the multi edit is requested from a meeting, we can know if the user can edit due date. This is the value of this property
         **/
        public get hasEditDueDate(): boolean {
            return this._hasEditDueDate;
        }

        /**
         * This is the flag to know if the data are valid to be able to make the multiple edit
         **/
        public get canSave(): boolean {
            return this._canSave;
        }

        /**
        * Use to know if the date enter by the user is a valid date (used in the view
        **/
        public get minDate(): Date {
            return this._minDate;
        }

        /**
         * User to get a view model for rooms management
         */
        public get roomsConfigure(): ap.viewmodels.projects.ProjectRoomConfigViewModel {
            return this._roomsConfigure;
        }

        /**
         * This method will create the NoteMultiEdit object with value set by the user
         *
         */
        postChanges(): ap.models.multiactions.NoteMultiEdit {
            let multiEditValues = new ap.models.multiactions.NoteMultiEdit(this.$utility);
            if (this.canSave) {
                if (this.hasEditDueDate && this.mustUpdateDueDate) {
                    multiEditValues.UpdateDueDate = true;
                    multiEditValues.DueDate = this.dueDate;
                }
                if (this.hasEditSubject && this.mustUpdateSubject) {
                    multiEditValues.UpdateSubject = true;
                    multiEditValues.Subject = this.subject;
                }
                if (this.hasEditStatus && this.mustUpdateStatus) {
                    multiEditValues.UpdateStatus = true;
                    multiEditValues.StatusId = this.statusSelector.selectedViewModel.originalEntity.Id;
                }
                if (this.hasEditRoom && this.mustUpdateRoom) {
                    multiEditValues.UpdateRoom = true;
                    if (StringHelper.isNullOrEmpty(this.roomSelector.selectedItem.originalEntity.Id) || this.roomSelector.selectedItem.originalEntity.Id === ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid())) {
                        multiEditValues.RoomId = null;
                    } else {
                        multiEditValues.RoomId = this.roomSelector.selectedItem.originalEntity.Id.slice(0, this.roomSelector.selectedItem.originalEntity.Id.length - 1);
                    }
                }
                if (this.hasEditIssueType && this.mustUpdateIssueType) {
                    multiEditValues.UpdateIssueType = true;
                    if (StringHelper.isNullOrEmpty(this.issueTypeSelector.selectedItem.originalEntity.Id) || this.issueTypeSelector.selectedItem.originalEntity.Id === ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid())) {
                        multiEditValues.IssueTypeId = null;
                    } else {
                        multiEditValues.IssueTypeId = this.issueTypeSelector.selectedItem.originalEntity.Id.slice(0, this.issueTypeSelector.selectedItem.originalEntity.Id.length - 1);
                    }
                }
                if (this.hasEditInCharge && this.mustUpdateInCharge) {
                    multiEditValues.UpdateNoteInCharge = true;
                    if (this.contactSelector.selectedContacts.length === 1 && ap.utility.UtilityHelper.isEmptyGuid(this.contactSelector.selectedContacts[0].userId)) {
                        multiEditValues.NoteInCharge = [];
                    } else {
                        let noteInChargeList: ap.models.notes.NoteInCharge[] = [];
                        for (let i = 0; i < this.contactSelector.selectedContacts.length; i++) {
                            let noteInCharge: ap.models.notes.NoteInCharge = new ap.models.notes.NoteInCharge(this.$utility);
                            noteInCharge.Tag = this.contactSelector.selectedContacts[i].displayText;
                            noteInCharge.UserId = this.contactSelector.selectedContacts[i].userId;
                            noteInChargeList.push(noteInCharge);
                        }
                        multiEditValues.NoteInCharge = noteInChargeList;
                    }
                }
            }

            return multiEditValues;
        }

        /**
         * This method will make the multi edit through the api and close the dialog when the call is successfully complete
         */
        public save() {
            let multiEditValues = this.postChanges();
            this.controllersManager.noteController.multiEditNotes(this.userCommentIds, multiEditValues).then((result) => {
                this.$mdDialog.hide(result);
            });
        }

        public cancel() {
            this.$mdDialog.cancel();
            this.$scope.$destroy();
        }

        /**
        * This method use for set validForm
        * @paam isValid it form validity parameter
        **/
        public setFormIsValid(isValid: boolean) {
            this._formIsValid = isValid;
            this.computeCanSave();
        }

        /**
         * This method will compute which field the user can edit depending of the current meeting. If no meeting defined, all fields are available.
         */
        private computeHasEditAccess() {
            this._hasEditDueDate = this.meetingAccessRight && this.meetingAccessRight.CanEditPoint;
            this._hasEditSubject = this.meetingAccessRight && this.meetingAccessRight.CanEditPoint;
            this._hasEditStatus = this.meetingAccessRight && (this.meetingAccessRight.CanEditPoint || this.meetingAccessRight.CanEditPointStatus);
            this._hasEditRoom = this.meetingAccessRight && this.meetingAccessRight.CanEditPoint;
            this._hasEditIssueType = this.meetingAccessRight && (this.meetingAccessRight.CanEditPoint || this.meetingAccessRight.CanEditPointIssueType);
            this._hasEditInCharge = this.meetingAccessRight && (this.meetingAccessRight.CanEditPoint || this.meetingAccessRight.CanEditPointInCharge);
        }

        /**
         * This method will compute the canSave flag. False if there is nothing to update or one field checked but empty
         */
        private computeCanSave() {
            this._canSave = this.mustUpdateDueDate || this.mustUpdateStatus || this.mustUpdateSubject || this.mustUpdateRoom || this.mustUpdateIssueType || this.mustUpdateInCharge; // there at least one field checked
            this._canSave = this._canSave && (!this.mustUpdateDueDate || !this.dueDate || this.dueDate && this.dueDate.getTime() >= this.minDate.getTime()) && (!this.mustUpdateStatus || !!this.statusSelector.selectedViewModel)
                && (!this.mustUpdateSubject || !StringHelper.isNullOrEmpty(this.subject)) && (!this.mustUpdateRoom || !!this.roomSelector.selectedItem) && (!this.mustUpdateIssueType || !!this.issueTypeSelector.selectedItem) && (!this.mustUpdateInCharge || !!this.contactSelector.selectedContacts.length) && this._formIsValid; // No field empty if checked
        }

        /**
         * This method is the handler that will be called when the selected status changed
         */
        private statusSelectedHandler(newStatus: ap.models.projects.NoteProjectStatus) {
            this._mustUpdateStatus = newStatus !== null;
            this.computeCanSave();
        }

        /**
         * This method is the handler that will be called when the selected room changed
         */
        private issueTypeSelectedHandler(newIssueType: ap.viewmodels.projects.ChapterHierarchyItemViewModel) {
            if (newIssueType === null && this.mustUpdateIssueType) {
                this.selectClearIssueTypeOption();
            } else if (newIssueType === this._addCategoryIssueType.item) {
                this.issueTypeSelector.selectedItem = null;
                this.issueTypeSelector.searchedText = null;
                this.$mdDialog.hide(ap.viewmodels.notes.AddEditResponse.CreateCategory);
            }
            this._mustUpdateIssueType = this.issueTypeSelector.selectedItem !== null;
            this.computeCanSave();
        }

        /**
         * This method is the handler that will be called when the selected room changed
         */
        private roomSelectedHandler(newRoom: ap.viewmodels.projects.RoomHierarchyItemViewModel) {
            if (newRoom === null && this.mustUpdateRoom) {
                this.selectClearRoomOption();
            } else if (newRoom === this._createNewRoom.item) {
                this._roomsConfigure = new ap.viewmodels.projects.ProjectRoomConfigViewModel(this.$utility, this.$q, this.$mdDialog, this._api, this.controllersManager, this.servicesManager, this.$timeout);
                this._roomsConfigure.parentCellListVm.useCacheSystem = true;
                this._roomsConfigure.subCellListVm.useCacheSystem = true;
                this.$mdDialog.hide(ap.viewmodels.notes.AddEditResponse.CreateRoom);
            }
            this._mustUpdateRoom = this.roomSelector.selectedItem !== null;
            this.computeCanSave();
        }

        /**
        * Method used to load the roomSelector
        **/
        public loadRoomSelector(subCellId: string): angular.IPromise<any> {
            return this._roomSelector.selectRoomById(subCellId);
        }

        /**
         * This method is the handler that will be called when the list of users in charge is changed
         */
        onUsersInChargeChanged() {
            this._mustUpdateInCharge = this.contactSelector.selectedContacts.length > 0;
            this.computeCanSave();
        }

        /**
         * Marks the Users In Charge field to be cleared
         */
        public clearUsersInCharge() {
            this.contactSelector.selectedContacts.splice(0);
            this.contactSelector.selectedContacts.push(this._clearFieldUsersInCharge);
        }

        public dispose() {
            this.$utility.Translator.off("languagechanged", this.languageChangedHandler, this);
            if (this._statusSelector)
                this._statusSelector.dispose();
            if (this._roomSelector)
                this._roomSelector.dispose();
            if (this._contactSelector)
                this._contactSelector.dispose();
        }

        /**
         * Determines whether a user can change configuration of the current project
         */
        private isProjectConfigAvailable(): boolean {
            let project = this.controllersManager.mainController.currentProject();
            let user = this.$utility.UserContext.CurrentUser();
            return project.Creator.Id === user.Id || project.UserAccessRight.CanConfig;
        }

        /**
         * Initializes a status selector
         */
        private initStatusSelector() {
            this._statusSelector = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(this.$utility, this.controllersManager, this.$q, false, this.meetingAccessRight, true);
            this._statusSelector.on("selectedItemChanged", this.statusSelectedHandler, this);
            this._statusSelector.refresh(null);
        }

        /**
         * Initializes a room selector
         */
        private initRoomSelector() {
            let zeroId = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid());
            let clearRoom = new ap.models.projects.CellHierarchy(this.$utility);
            clearRoom.createByJson({ EntityId: zeroId, Id: zeroId, EntityName: "SubCell", Description: this.$utility.Translator.getTranslation("Clear field"), IsPredefined: true });
            let clearRoomVm = new ap.viewmodels.projects.RoomHierarchyItemViewModel(this.$utility, this.$q, undefined, undefined, true);
            clearRoomVm.init(clearRoom);
            this._clearFieldRoom = new ap.viewmodels.PredefinedItemParameter(0, zeroId, clearRoomVm);
            let zeroId2 = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createPredefinedGuid(1));
            let createRoom = new ap.models.projects.CellHierarchy(this.$utility);
            createRoom.createByJson({ EntityId: zeroId2, Id: zeroId2, EntityName: "SubCell", Description: this.$utility.Translator.getTranslation("Create new room"), IsPredefined: true });

            let createRoomVm = new ap.viewmodels.projects.RoomHierarchyItemViewModel(this.$utility, this.$q, undefined, undefined, true);
            createRoomVm.init(createRoom);
            this._createNewRoom = new ap.viewmodels.PredefinedItemParameter(1, zeroId2, createRoomVm);

            let predefinedRooms = [this._clearFieldRoom];
            if (this.isProjectConfigAvailable()) {
                predefinedRooms.push(this._createNewRoom);
            }

            this._roomSelector = new ap.viewmodels.projects.RoomSelectorViewModel(this.$utility, this.$q, this.controllersManager, this.$timeout, predefinedRooms);
            this._roomSelector.on("selectedItemChanged", this.roomSelectedHandler, this);
            this._roomSelector.load();
        }

        /**
         * Initializes an issue type selector
         */
        private initIssueTypeSelector() {
            let zeroId = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createEmptyGuid());

            let clearIssueType = new ap.models.projects.ChapterHierarchy(this.$utility);
            clearIssueType.createByJson({ EntityId: zeroId, Id: zeroId, EntityName: "IssueType", Description: this.$utility.Translator.getTranslation("Clear field"), IsPredefined: true });
            let clearIssueTypeVm = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(this.$utility, this.$q, undefined, undefined, true);
            clearIssueTypeVm.init(clearIssueType);
            this._clearFieldIssueType = new ap.viewmodels.PredefinedItemParameter(0, zeroId, clearIssueTypeVm);
            let zeroId2 = ap.utility.UtilityHelper.createHierarchyGuid(ap.utility.UtilityHelper.createPredefinedGuid(1));
            let createIssueType = new ap.models.projects.ChapterHierarchy(this.$utility);
            createIssueType.createByJson({ EntityId: zeroId2, Id: zeroId2, EntityName: "IssueType", Description: this.$utility.Translator.getTranslation("app.notes.edit.add_category"), IsPredefined: true });
            let createIssueTypeVm = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(this.$utility, this.$q, undefined, undefined, true);
            createIssueTypeVm.init(createIssueType);
            this._addCategoryIssueType = new ap.viewmodels.PredefinedItemParameter(1, zeroId2, createIssueTypeVm);

            let predefinedIssueTypes = [this._clearFieldIssueType];
            if (this.isProjectConfigAvailable()) {
                predefinedIssueTypes.push(this._addCategoryIssueType);
            }

            this._issueTypeSelector = new ap.viewmodels.projects.IssueTypeSelectorViewModel(this.$utility, this.$q, this.controllersManager, this.$timeout, predefinedIssueTypes);
            this._issueTypeSelector.on("selectedItemChanged", this.issueTypeSelectedHandler, this);
            this._issueTypeSelector.load();
        }

        /**
         * Initializes a contact selector
         */
        private initContactSelector() {
            let zeroContactId = ap.utility.UtilityHelper.createEmptyGuid();
            this._clearFieldUsersInCharge = new ap.viewmodels.projects.ContactItemViewModel(this.$utility.Translator.getTranslation("Clear field"), zeroContactId);
            this._contactSelector = new ap.viewmodels.projects.ContactSelectorViewModel(this.$utility, this._api, this.$q, this.controllersManager.mainController, this.controllersManager.projectController);
        }

        /**
         * This method is used to select issue type after config popup is closed
         * @param issueType
         */
        public selectIssueType(issueType: ap.viewmodels.projects.IssueTypeViewModel) {
            if (issueType !== null) {
                let issueTypeVm: ap.viewmodels.projects.ChapterHierarchyItemViewModel = new ap.viewmodels.projects.ChapterHierarchyItemViewModel(this.$utility, this.$q);
                let issueTypeCH: ap.models.projects.ChapterHierarchy = new ap.models.projects.ChapterHierarchy(this.$utility);
                issueTypeCH.createByJson({ EntityId: issueType.issueType.Id + "0", Id: issueType.issueType.Id + "0", EntityName: "IssueType", Description: issueType.issueType.Description, ParentEntityId: issueType.issueType.ParentChapter.Id });
                issueTypeVm.init(issueTypeCH);
                this._issueTypeSelector.selectedItem = issueTypeVm;
            }
        }

        /**
         * Language changed handler, updates special dropdown fields description when app language is changed
         */
        private languageChangedHandler() {
            if (this._createNewRoom) {
                let createRoomVm = <ap.viewmodels.projects.RoomHierarchyItemViewModel>this._createNewRoom.item;
                createRoomVm.description = this.$utility.Translator.getTranslation("Create new room");
            }
            if (this._clearFieldRoom) {
                let clearRoomVm = <ap.viewmodels.projects.RoomHierarchyItemViewModel>this._clearFieldRoom.item;
                clearRoomVm.description = this.$utility.Translator.getTranslation("Clear field");
            }
            if (this._clearFieldIssueType) {
                let clearIssueTypeVm = <ap.viewmodels.projects.ChapterHierarchyItemViewModel>this._clearFieldIssueType.item;
                clearIssueTypeVm.description = this.$utility.Translator.getTranslation("Clear field");
            }
            if (this._addCategoryIssueType) {
                let createIssueTypeVm = <ap.viewmodels.projects.ChapterHierarchyItemViewModel>this._addCategoryIssueType.item;
                createIssueTypeVm.description = this.$utility.Translator.getTranslation("app.notes.edit.add_category");
            }
            if (this._clearFieldUsersInCharge) {
                this._clearFieldUsersInCharge.displayText = this.$utility.Translator.getTranslation("Clear field");
            }
        }


        static $inject = ["Utility", "$mdDialog", "Api", "$scope", "$timeout", "$q", "ControllersManager", "ServicesManager"];
        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private _api: ap.services.apiHelper.Api, private $scope: ng.IScope, private $timeout: angular.ITimeoutService, private $q: angular.IQService,
            private controllersManager: ap.controllers.ControllersManager, private servicesManager: ap.services.ServicesManager,
            private meetingAccessRight: ap.models.accessRights.MeetingAccessRight, private userCommentIds: string[]) {

            this.$utility.Translator.on("languagechanged", this.languageChangedHandler, this);
            this.initStatusSelector();
            this.initRoomSelector();
            this.initIssueTypeSelector();
            this.initContactSelector();

            this.computeHasEditAccess();
            this.computeCanSave();
            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _statusSelector: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
        private _roomSelector: ap.viewmodels.projects.RoomSelectorViewModel;
        private _issueTypeSelector: ap.viewmodels.projects.IssueTypeSelectorViewModel;
        private _contactSelector: ap.viewmodels.projects.ContactSelectorViewModel;
        private _dueDate: Date = null;
        private _subject: string = null;
        private _mustUpdateRoom: boolean = false;
        private _mustUpdateIssueType: boolean = false;
        private _mustUpdateStatus: boolean = false;
        private _mustUpdateSubject: boolean = false;
        private _mustUpdateInCharge: boolean = false;
        private _mustUpdateDueDate: boolean = false;
        private _hasEditSubject: boolean = false;
        private _hasEditDueDate: boolean = false;
        private _hasEditStatus: boolean = false;
        private _hasEditRoom: boolean = false;
        private _hasEditIssueType: boolean = false;
        private _hasEditInCharge: boolean = false;
        private _canSave: boolean = false;
        private _minDate: Date = new Date(1950, 0, 1);
        private _formIsValid: boolean = true;
        private _clearFieldRoom: ap.viewmodels.PredefinedItemParameter;
        private _clearFieldIssueType: ap.viewmodels.PredefinedItemParameter;
        private _clearFieldUsersInCharge: ap.viewmodels.projects.ContactItemViewModel;
        private _createNewRoom: ap.viewmodels.PredefinedItemParameter;
        private _addCategoryIssueType: ap.viewmodels.PredefinedItemParameter;
        private _roomsConfigure: ap.viewmodels.projects.ProjectRoomConfigViewModel;
    }
}