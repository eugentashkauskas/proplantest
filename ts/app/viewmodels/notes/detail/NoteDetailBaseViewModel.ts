module ap.viewmodels.notes {

    export enum NoteDetailTabs {
        Field,
        Comments,
        Attachments,
        History
    }

    import LicenseAccess = ap.models.licensing.LicenseAccess;
    import Module = ap.models.licensing.Module;
    import projects = ap.models.projects;

    export class NoteDetailBaseViewModel extends EntityViewModel implements ap.utility.IListener, IDispose {

        /**
        * The note of the viewModel
        */
        public get noteBase(): ap.models.notes.NoteBase {
            return <ap.models.notes.NoteBase>this.originalEntity;
        }

        /**
        * Used to set the note
        */
        protected setNoteBase(note: ap.models.notes.NoteBase): void {
            let oldNote = this.noteBase;

            this._allowedNewFileType = this.$controllersManager.noteController.getAllowedNewFileType(note);

            if (note)
                this.setMeetingAccessRight(note.MeetingAccessRight);
            else
                this.setMeetingAccessRight(null);

            this.setOriginalEntity(note);
            this.raisePropertyChanged("originalEntity", oldNote, this);
        }

        /**
        * Used to know the different file the user can upload 
        */
        public get allowedNewFileType(): any {
            return this._allowedNewFileType;
        }

        /**
        * Used to know if the note is in edit mode or not
        */
        public get isEditMode(): boolean {
            return this._isEditMode;
        }

        public set isEditMode(editMode: boolean) {
            if (this.isEditMode !== editMode) {
                this._isEditMode = editMode;
            }
        }

        /**
        * Used to know if the point is for a subcontractor or not
        */
        public get isSubcontractor(): boolean {
            return this._isSubcontractor;
        }

        /*
        * This public getter is used to know if the textearea is focused
        */
        public get isFocusOnNewComment(): boolean {
            return this._isFocusOnNewComment;
        }

        /*
        * This public setter is used to set value to isFocusOnNewComment property
        */
        public set isFocusOnNewComment(value: boolean) {
            this._isFocusOnNewComment = value;
        }

        /**
        * This public getter is used to get newComment property
        **/
        public get newComment(): string {
            return this._newComment;
        }

        /*
        * This public setter is used to set value to newComment property
        */
        public set newComment(value: string) {
            this._newComment = value;
        }

        public get isValidNewComment(): boolean {
            return !StringHelper.isNullOrWhiteSpace(this._newComment);
        }

        /**
        *  This is the subject of the note
        */
        public get subject(): string {
            return this._subject;
        }

        public set subject(value: string) {
            this._subject = value;
        }

        /**
        *  This is the code of the note
        */
        public get code(): string {
            return this._code;
        }

        /**
        * This is the screen info of the view model
        */
        public get screenInfo(): ap.misc.notes.NoteDetailScreenInfo {
            return this._screenInfo;
        }

        /**
        * This is the date of the note
        */
        public get dueDate(): Date {
            return this._dueDate;
        }

        public set dueDate(value: Date) {
            this._dueDate = value;
            this.updateDueDateFormatted();
        }

        /**
        * This is the date of the note in a string format
        */
        public get dueDateFormatted(): string {
            if (this._dueDateFormatted)
                return this._dueDateFormatted;
            else
                return this.$utility.Translator.getTranslation("None");
        }

        /**
        * Used to know if the note is urgent or not
        */
        public get isUrgent(): boolean {
            return this._isUrgent;
        }

        public set isUrgent(value: boolean) {
            this._isUrgent = value;
        }

        /**
        * Used to know if we have to scroll or not
        */
        public get preventScroll(): boolean {
            return this._preventScroll;
        }

        public set preventScroll(value: boolean) {
            this._preventScroll = value;
        }

        /**
        * This is to know the note project
        */
        public get project(): ap.models.projects.Project {
            return this._project;
        }

        /**
        * This is to know the note meeting
        */
        public get meeting(): ap.models.meetings.Meeting {
            return this._meeting;
        }

        /**
        * This is to know the category linked to the note
        */
        public get issueType(): ap.models.projects.IssueType {
            return this._issueType;
        }

        /**
        * This is to know the author of the note
        */
        public get from(): ap.models.actors.User {
            return this._from;
        }

        /**
        * This is the list of user in charge of the note
        */
        public get noteInChargeList(): NoteInChargeListViewModel {
            return this._noteInChargeList;
        }

        /**
        * This is the list of documents of the note
        */
        public get noteDocumentList(): NoteDocumentListViewModel {
            return this._noteDocumentList;
        }

        /**
        * This is the list of comments of the note
        */
        public get noteCommentList(): NoteCommentListViewModel {
            return this._noteCommentList;
        }

        /**
        * This is the activity of the note
        */
        public get noteActivityList(): NoteActivityListViewModel {
            return this._noteActivityList;
        }

        /**
        * Return the linked note list viewmodel
        */
        public get noteLinkedList(): NoteLinkedListViewModel {
            return this._noteLinkedList;
        }

        /**
        * This is the paticipant(s) in charge of the note in a string format
        **/
        public get inCharge(): string {
            if (this._inCharge)
                return this._inCharge;
            else
                return this.$utility.Translator.getTranslation("None");
        }

        /**
        * The linked category of the note in string format
        */
        public get category(): string {
            if (this._category)
                return this._category;
            else
                return this.$utility.Translator.getTranslation("None");
        }

        /**
        * The note access right of the user
        */
        public get noteAccessRight(): ap.models.accessRights.NoteBaseAccessRight {
            return this._noteAccessRight;
        }

        /**
         * Method used to set the meeting access rights of the user
         * @param access the access of the user
         */
        public get meetingAccessRight(): ap.models.accessRights.MeetingAccessRight {
            return this._meetingAccessRight;
        }

        /**
        * Get the length of the subject
        **/
        public get subjectLength(): number {
            if (!this._subject) {
                return 0;
            }
            return this._subject.length;
        }

        /**
        * To know that the note entity have been changed at server and then need to reload for the editing
        **/
        public get needReloadEntity(): boolean {
            return this._needReloadEntity;
        }

        public set needReloadEntity(value: boolean) {
            this._needReloadEntity = value;
        }

        /**
         * Method used to set the meeting access rights of the user
         * @param access the access of the user
         */
        private setMeetingAccessRight(access: ap.models.accessRights.MeetingAccessRight) {
            if (access !== this._meetingAccessRight) {
                let originalAccessRight = this._meetingAccessRight;
                this._meetingAccessRight = access;

                this.raisePropertyChanged("meetingAccessRight", originalAccessRight, this);
            }
        }

        /**
         * Method used to set the properties of the vm
         */
        public copySource(): void {
            super.copySource();
            this.clearLists();
            if (!this.originalEntity) {
                this.initData();
                this.buildLists();
            } else {
                this._isEditMode = this.originalEntity.IsNew;
                this._subject = this.noteBase.Subject;
                this._dueDate = this.noteBase.DueDate;
                this._code = this.noteBase.Code;
                this.updateDueDateFormatted();
                this._isUrgent = this.noteBase.IsUrgent;
                this._project = this.noteBase.Project;
                this._meeting = this.noteBase.Meeting;
                this._from = this.noteBase.From;
                this._issueType = this.noteBase.IssueType;

                if (this.noteBase.IssueType && this.noteBase.IssueType.ParentChapter)
                    this._category = this.noteBase.IssueType.ParentChapter.Description + " / " + this.noteBase.IssueType.Description;
                else
                    this._category = "";

                this.buildLists();

                // set the viewmodel of the activityList to force it to load the activities
                this._noteActivityList.noteViewModel = this;

                // set the viewmodel of the noteInChargeList to force it to load the users in charge
                this._noteInChargeList.noteViewModel = this;

                if (this.noteInChargeList.sourceItems.length > 0) {
                    this._inCharge = (<ap.viewmodels.notes.NoteInChargeViewModel[]>this.noteInChargeList.sourceItems).map((item: ap.viewmodels.notes.NoteInChargeViewModel) => {
                        return item.noteInCharge.Tag;
                    }).join(", ");
                } else {
                    this._inCharge = null;
                }
            }
            this.noteCommentList.noteViewModel = this;
            this.noteDocumentList.noteViewModel = this;
            this.noteInChargeList.noteViewModel = this;
        }

        /**
         * Call the controller to import project's documents to the note
         */
        public requestImportDocuments() {
            this.$controllersManager.noteController.requestImportDocument(this.noteBase);
        }

        /**
         * Calculates and sets a formatted value of the due date
         */
        private updateDueDateFormatted() {
            if (this._dueDate) {
                this._dueDateFormatted = this._dueDate.format(DateFormat.Standard);
            } else {
                this._dueDateFormatted = "";
            }
        }

        /**
         * Method called when the preview of document is asked
         * @param noteDocumentVm the document to see the preview
         */
        private documentPreviewHandler(noteDocumentVm: ap.viewmodels.notes.NoteDocumentViewModel) {
            let oldValue = this._screenInfo.documentInPreview;
            let newValue = noteDocumentVm.isDisplayedInPictureViewer === true ? noteDocumentVm.originalEntity.Id : null;
            this._screenInfo.documentInPreview = noteDocumentVm.isDisplayedInPictureViewer === true ? noteDocumentVm.originalEntity.Id : null;
        }

        protected computeHasChanged(): boolean {
            if (super.computeHasChanged()) {
                return true;
            }

            let oldDate = this.noteBase.DueDate ? this.noteBase.DueDate.getTime() : 0;
            let newDate = this._dueDate ? this._dueDate.getTime() : 0;

            return oldDate !== newDate;
        }

        /**
         * Method used to save the new value of properties
         */
        public postChanges(): void {
            super.postChanges();
            this.noteBase.Subject = !!this._subject ? this._subject : "";
            this.noteBase.DueDate = this._dueDate;
            this.noteBase.IsUrgent = this._isUrgent;
            this._noteCommentList.postChanges();
            this._noteInChargeList.postChanges();
        }

        /**
         * Initializes the view model using the given note model
         * @param note A note model to use
         */
        public init(note: ap.models.notes.NoteBase) {
            this.setNoteBase(note);
        }

        /**
         * Updates a state of the view model based on updated model
         * @param note An updated version of the model
         */
        protected update(note: ap.models.notes.NoteBase) {
            this.init(note);
        }

        /**
        * This method used to clear the original entity of the vm and then clear all fields.
        **/
        public clear() {
            this.setNoteBase(null);
        }

        /**
         * This public method is used to add new comment
         */
        public addNewComment(): void {
            this.isFocusOnNewComment = false;
        }

        /**
         * This public method is used to cancel adding of new comment
         */
        public cancelNewComment(): void {
            this.isFocusOnNewComment = false;
        }

        // This method is used in the view (html)
        public dropFiles(files: File[]) {
                this._listener.raise("filesdropped", files);
            }

        /** 
        * Method to scroll the content of the selected tab in note details
        * @param tabName The anchor name of the tab's content to scroll to
        * @param deferred Specify if there should be a small dell 
        **/
        public gotoAnchor(tabName: string, deferred?: boolean) {
            if (!this.$interval || !this.$anchorScroll || !this.$location) {
                return;
            }
            let self = this;
            function scroll() {
                let newHash: string = "anchor" + tabName;
                self._preventScroll = true;
                if (self.$location.hash() !== newHash) {
                    // set the $location.hash to 'newHash' and
                    // $anchorScroll will automatically scroll to it
                    self.$location.hash("anchor" + tabName);

                } else {
                    // call $anchorScroll() explicitly,
                    // since $location.hash hasn't changed
                    self.$anchorScroll();
                }

                clearInterval(self._interval);
                self._interval = undefined;
            }

            // need to set an interval because the when the note is loaded there is a small delayed before the content is display and therefore the
            // offset used by the anchor to scroll is not corret
            if (deferred && !this._interval) {
                this._interval = setInterval(scroll, 100);
            } else {
                scroll();
            }
        }

        /**
         * Method used to init data with default values
         */
        protected initData() {
            this._isSubcontractor = false;
            this._isEditMode = false;
            this._subject = "";
            this._dueDate = null;
            this.updateDueDateFormatted();
            this._isUrgent = false;
            this._project = null;
            this._issueType = null;
            this._meeting = null;
            this._from = null;
            this._category = "";
            this._inCharge = null;
            this._code = "";
            this._canChangeMeeting = false;

            this.clearLists();
        }

        /**
         * Empty all related list of a noteBase
         */
        private clearLists() {
            if (this._noteCommentList) {
                this._noteCommentList.noteViewModel = null;
            }
            if (this._noteInChargeList) {
                this._noteInChargeList.noteViewModel = null;
            }
            if (this._noteDocumentList) {
                this._noteDocumentList.noteViewModel = null;
            }
            if (this._noteActivityList) {
                this._noteActivityList.noteViewModel = null;
            }

            if (this._noteLinkedList) {
                this._noteLinkedList.parentNoteVm = null;
            }
        }

        /**
         * Builds the NoteCommentListViewModel
         */
        private buildCommentList() {
            if (this._noteCommentList && this.originalEntity && this._noteCommentList.noteViewModel && this._noteCommentList.noteViewModel.noteBase && this._noteCommentList.noteViewModel.noteBase.Id === this.originalEntity.Id) {
                // in the case the note has been updated, refresh the list
                this._noteCommentList.noteViewModel = this;
                return;
            }

            if (this._noteCommentList) {
                this._noteCommentList.dispose();
            }
            this._noteCommentList = new NoteCommentListViewModel(this.$utility, this.$controllersManager.noteController, this.$controllersManager.mainController, this);
        }

        /**
        * Build the linked notes list
        */
        private buildLinkedNoteList() {
            if (this._noteLinkedList && this.originalEntity && this._noteLinkedList.parentNoteVm && this._noteLinkedList.parentNoteVm.noteBase && this._noteLinkedList.parentNoteVm.noteBase.Id === this.originalEntity.Id) {
                // in the case the note has been updated, refresh the list
                this._noteLinkedList.parentNoteVm = this;
            }

            if (this._noteLinkedList) {
                this._noteLinkedList.dispose();
            }
            this._noteLinkedList = new NoteLinkedListViewModel(this.$utility, this.$controllersManager, this.$q, this);
        }

        /**
         * Builds the NoteInChargeListViewModel
         */
        private buildInChargeList() {
            if (this._noteInChargeList && this.originalEntity && this._noteInChargeList.noteViewModel && this._noteInChargeList.noteViewModel.noteBase && this._noteInChargeList.noteViewModel.noteBase.Id === this.originalEntity.Id) {
                // in the case the note has been updated, there is no need to update the list
                this._noteInChargeList.noteViewModel = this;
                return;
            }
            if (this._noteInChargeList) {
                this._noteInChargeList.dispose();
            }
            this._noteInChargeList = new NoteInChargeListViewModel(this.$utility);
        }

        /**
         * Builds the NoteDocumentListViewModel
         */
        private buildDocumentList() {
            if (this._noteDocumentList) {
                if (this.originalEntity && this._noteDocumentList.noteViewModel && this._noteDocumentList.noteViewModel.noteBase && this._noteDocumentList.noteViewModel.noteBase.Id === this.originalEntity.Id) {
                    // in the case the note has been updated, there is no need to update the list
                    this._noteDocumentList.noteViewModel = this;
                }
            } else {
                this._noteDocumentList = new NoteDocumentListViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager, this.$mdDialog, this);
                if (this._noteDocumentList.selectedViewModel === null && !!this._noteDocumentList.noteViewModel.screenInfo.documentInPreview) {
                    let idToSelect = this._noteDocumentList.noteViewModel.screenInfo.documentInPreview;
                    let previewDocument = <ap.viewmodels.notes.NoteDocumentViewModel>this._noteDocumentList.getEntityById(idToSelect);
                    if (!!previewDocument) {
                        this._noteDocumentList.selectedViewModel = previewDocument;
                        this._noteDocumentList.isDisplayingPictureViewer = true;
                    }
                }
                this._noteDocumentList.on("previewdocument", this.documentPreviewHandler, this);
            }
        }

        /**
         * Builds the NoteActivityListViewModel
         */
        private buildActivityList() {
            if (this._noteActivityList && this.originalEntity && this._noteActivityList.noteViewModel && this._noteActivityList.noteViewModel.noteBase && this._noteActivityList.noteViewModel.noteBase.Id === this.originalEntity.Id) {
                // in the case the note has been updated, only refresh the activity list
                this._noteActivityList.noteViewModel = this;
                return;
            }

            if (this._noteActivityList) {
                this._noteActivityList.dispose();
            }
            this._noteActivityList = new NoteActivityListViewModel(this.$utility, this._api, this.$q, this.$controllersManager);
        }

        /**
         * Builds the different lists linked to a noteBase
         */
        private buildLists() {
            this.buildCommentList();
            this.buildInChargeList();
            this.buildDocumentList();
            this.buildActivityList();
            this.buildLinkedNoteList();
        }

        public dispose() {
            super.dispose();
            this._noteDocumentList.dispose();
            this._noteCommentList.dispose();
            this.noteInChargeList.dispose();
            this.noteActivityList.dispose();
            this._noteLinkedList && this._noteLinkedList.dispose();

            if (this.$controllersManager.noteController) {
                this.$controllersManager.noteController.off("noteupdated", this.noteUpdatedHandler, this);
                this.$controllersManager.formController.off("formupdated", this.noteUpdatedHandler, this);
                this.$controllersManager.noteController.off("notedeleted", this.noteUpdatedHandler, this);
                this.$controllersManager.noteController.off("documentdeleted", this.documentDeleted, this);
                this.$controllersManager.noteController.off("drawingssaved", this.drawingsSavedhandler, this);
            }
            if (this._screenInfo) {
                this._screenInfo.dispose();
                this._screenInfo = null;
            }
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * This handler is called when a note is updated from the note controller. 
         * @param noteUpdatedEvent information about the event raised to know which note has been updated and specific properties
         **/
        private noteUpdatedHandler(noteUpdatedEvent: ap.controllers.NoteBaseUpdatedEvent) {
            if (this.noteBase && noteUpdatedEvent && noteUpdatedEvent.notes[0].Id === this.noteBase.Id) {
                if (noteUpdatedEvent.properties) { // it means that not the entire of the note was updated but just some properties was requested. 
                    if (noteUpdatedEvent.properties.indexOf("IsUrgent") >= 0) {
                        this.isUrgent = noteUpdatedEvent.notes[0].IsUrgent;
                    }

                    if (this.originalEntity !== noteUpdatedEvent.notes[0]) {
                        if (noteUpdatedEvent.properties.indexOf("IsUrgent") >= 0) {
                            this.noteBase.IsUrgent = noteUpdatedEvent.notes[0].IsUrgent;
                    }
                    if (noteUpdatedEvent.properties.indexOf("IsArchived") >= 0) {
                            this.noteBase.IsArchived = noteUpdatedEvent.notes[0].IsArchived;
                    }
                    if (noteUpdatedEvent.properties.indexOf("Deleted") >= 0) {
                            this.noteBase.updateEntityPropsOnly(noteUpdatedEvent.notes[0]);
                    }

                        if (this.originalEntity.EntityVersion + 1 === noteUpdatedEvent.notes[0].EntityVersion) { // Check if need to increment entityversion number
                        this.originalEntity.incrementEntityVersion();
                    }
                }
                } else {
                    this.update(noteUpdatedEvent.notes[0]);
            }
        }
        }

        /*
        * Event handler, this called when there is a document delete
        * @param document: deleted note document
        */
        private documentDeleted(document: ap.models.notes.NoteDocument): void {
            if (this.noteBase.NoteDocuments) {
                let toRemoveIndex: number = -1;

                for (let i = 0; i < this.noteBase.NoteDocuments.length; i++) {
                    if (this.noteBase.NoteDocuments[i].Id === document.Id) {
                        toRemoveIndex = i;
                        break;
                    }
                }

                if (toRemoveIndex >= 0)
                    this.noteBase.NoteDocuments.splice(toRemoveIndex, 1);

                if (this.noteBase.NoteDocuments.length === 0)
                    this._listener.raise("nomoreattachement", this.noteBase);
            }
        }

        /**
         * This public method is used to add User Acronym
         */
        public addCommentUserAcronym(): string {
            return this._userAcronym;
        }

        /**
         * Handler method called when drawings are saved
         * @param noteDoc The noteDocument entity containing the drawings
         */
        private drawingsSavedhandler(noteDoc: ap.models.notes.NoteDocument) {
            if (noteDoc.Drawings && this.originalEntity) {
                let originalDrawings = (<ap.models.notes.NoteBase>this.originalEntity).getFirstComment().Drawings;
                let found: boolean = false;

                noteDoc.Drawings.forEach((drawing: ap.models.notes.Drawing) => {

                    found = false;
                    let i: number = 0;
                    for (i; i < originalDrawings.length; i++) {
                        if (originalDrawings[i].Id === drawing.Id) {
                            originalDrawings[i].updateEntityPropsOnly(drawing);
                            originalDrawings[i].createShapes(drawing.DrawingShapesXml);
                            found = true;
                        }

                        if (found) {
                            return;
                        }
                    }

                    // it was a new drawings -> add it to the comment
                    if (!found && i === originalDrawings.length) {
                        originalDrawings.push(drawing);
                    }
                });
            }
        }

        constructor($utility: ap.utility.UtilityHelper, protected $mdDialog: angular.material.IDialogService, protected $q: angular.IQService, protected _api: ap.services.apiHelper.Api, protected $controllersManager: ap.controllers.ControllersManager, protected $servicesManager: ap.services.ServicesManager, noteId?: string,
            private $location?: angular.ILocationService, private $anchorScroll?: angular.IAnchorScrollService, private $interval?: angular.IIntervalService) {
            super($utility);

            this._listener = this.$utility.EventTool.implementsListener(["propertychanged", "filesdropped", "editcommentrequested", "nomoreattachement"]);

            this._userAcronym = this.$utility.UserContext.CurrentUser().DisplayName.acronym();

            this._screenInfo = new ap.misc.notes.NoteDetailScreenInfo(this.$utility, null, null, this.subject);
            this.$controllersManager.noteController.on("noteupdated", this.noteUpdatedHandler, this);
            this.$controllersManager.formController.on("formupdated", this.noteUpdatedHandler, this);
            this.$controllersManager.noteController.on("notedeleted", this.noteUpdatedHandler, this);
            this.$controllersManager.noteController.on("documentdeleted", this.documentDeleted, this);
            this.$controllersManager.noteController.on("drawingssaved", this.drawingsSavedhandler, this);

            this.copySource();

            this._currentProject = this.$controllersManager.mainController.currentProject();
        }

        protected _noteAccessRight: ap.models.accessRights.NoteBaseAccessRight;
        private _meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        private _isSubcontractor: boolean;
        private _subject: string;
        private _dueDate: Date;
        private _dueDateFormatted: string;
        private _isUrgent: boolean;
        private _project: ap.models.projects.Project;
        private _meeting: ap.models.meetings.Meeting;
        private _issueType: ap.models.projects.IssueType;
        private _from: ap.models.actors.User;
        protected _isEditMode: boolean;
        private _category: string;
        private _allowedNewFileType: string[] = [];
        private _currentProject: ap.models.projects.Project;
        private _noteInChargeList: NoteInChargeListViewModel;
        private _noteCommentList: NoteCommentListViewModel;
        private _noteDocumentList: NoteDocumentListViewModel;
        private _noteActivityList: NoteActivityListViewModel;
        private _noteLinkedList: NoteLinkedListViewModel;
        private _canChangeMeeting: boolean;
        private _interval: any;
        private _preventScroll: boolean;
        private _screenInfo: ap.misc.notes.NoteDetailScreenInfo;
        private _needReloadEntity: boolean = false;
        private _userAcronym: string = null;
        private _inCharge: string;
        private _code: string;
        private _isFocusOnNewComment: boolean = false;
        private _newComment: string = null;
    }
}