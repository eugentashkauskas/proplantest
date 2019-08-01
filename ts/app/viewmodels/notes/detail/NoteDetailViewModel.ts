module ap.viewmodels.notes {
    export class NoteDetailViewModel extends NoteDetailBaseViewModel implements IDispose {

        /**
        * Method used to know if the user's browser is IE (need in UI)
        **/
        public get isIE(): boolean {
            return this.$utility.isIE();
        }

        public get note(): ap.models.notes.Note {
            return <ap.models.notes.Note>this.originalEntity;
        }

      /**
       * Used to set the note
       */
        protected setNoteBase(note: ap.models.notes.Note) {
            super.setNoteBase(note);
            this.setNoteAccessRight(new ap.models.accessRights.NoteAccessRight(this.$utility, note));
        }

        public get selectedTab(): NoteDetailTabs {
            return this._selectedTab;
        }

        public set selectedTab(newTab: NoteDetailTabs) {
            if (this._selectedTab !== newTab) {
                let originalSelectedTab = this._selectedTab;
                this._selectedTab = newTab;
                this.gotoAnchor(NoteDetailTabs[this._selectedTab]);
                this.raisePropertyChanged("selectedTab", originalSelectedTab, this);
            }
        }

        public get status(): ap.models.projects.NoteProjectStatus {
            return this._status;
        }

        public get subCell(): ap.models.projects.SubCell {
            return this._subCell;
        }

        public set subCell(value: ap.models.projects.SubCell) {
            this._subCell = value;
        }

        public get noteProjectStatusList(): ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel {
            return this._noteprojectStatusListVm;
        }

        // When using md-autocomplete, angular tries to set the property given in the ng-model but in this case we only want to get the object
        // We added this setter as a workaround and added a check to avoid angular to set a wrong value
        public set noteProjectStatusList(newValue: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel) {
            if (newValue instanceof ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel)
                this._noteprojectStatusListVm = newValue;
        }

        public get cellFullName(): string {
            if (this._cellFullName)
                return this._cellFullName;
            else
                return this.$utility.Translator.getTranslation("None");
        }

        /**
         * Return formatted cell name CODE / DESCRIPTION
         */
        public get cellFullNameWithCode(): string {
            if (this._cellFullNameWithCode)
                return this._cellFullNameWithCode;
            else
                return this.$utility.Translator.getTranslation("None");
        }

        public get problemLocation(): string {
            if (this._problemLocation)
                return ap.models.notes.ProblemLocation[this._problemLocation];
            else
                return this.$utility.Translator.getTranslation("None");
        }

        public set problemLocation(value: string) {
            this._problemLocation = ap.models.notes.ProblemLocation[value];
        }

        /**
        * The access right of the note
        */
        public get noteAccessRight(): ap.models.accessRights.NoteAccessRight {
            return <ap.models.accessRights.NoteAccessRight>this._noteAccessRight;
        }

        /**
         * Method used to set the note access right of the user
         * @param access the note access right of the user
         */
        protected setNoteAccessRight(access: ap.models.accessRights.NoteAccessRight) {
            if (access !== this._noteAccessRight) {
                this._noteAccessRight = access;
                let originalAccessRight = this._noteAccessRight;
                this.raisePropertyChanged("noteAccessRight", originalAccessRight, this);
            }
        }

        /*
        * This method is used to select to right tab based on the scroll offset of the note's details panel.
        * It's called by the activeLinkOnScroll directive
        * @param newTab The new tab id to select
        */
        public changeselectedTabOnScroll(newTab: string) {
            if (this.selectedTab !== NoteDetailTabs[newTab] && !this.preventScroll) {
                this._selectedTab = NoteDetailTabs[newTab];
            }

            this.preventScroll = false;
        }

        /**
         * This method is used to check if the view model has the same values that the underlying entity. It does not take into account the noteDocumentList and the noteActivityList which are special cases
         **/
        public get hasChanged(): boolean {
            let note: ap.models.notes.Note = (<ap.models.notes.Note>this.originalEntity);
            let result: boolean = this.originalEntity.IsNew;
            result = result || this.subject !== note.Subject;
            result = result || this.dueDate !== note.DueDate;
            result = result || this.isUrgent !== note.IsUrgent;
            result = result || this._problemLocation !== note.ProblemLocation;
            result = result || !ap.models.Entity.sameEntities(this.project, note.Project);
            result = result || !ap.models.Entity.sameEntities(this.subCell, note.Cell);
            result = result || !ap.models.Entity.sameEntities(this.meeting, note.Meeting);
            result = result || !ap.models.Entity.sameEntities(this.from, note.From);
            result = result || !ap.models.Entity.sameEntities(this.issueType, note.IssueType);
            result = result || this.noteInChargeList.hasChanged;
            result = result || this.noteCommentList.hasChanged;

            if (this._noteprojectStatusListVm.selectedViewModel)
                result = result || !ap.models.Entity.sameEntities(note.Status, this._noteprojectStatusListVm.selectedViewModel.originalEntity);

            return result;
        }

        /**
         * This property is to know if regarding the state of the view model, the save button should be available. Means that the vm should be in edit mode and mandatory fields not empty (status)
         **/
        public get maySave(): boolean {
            let isAStatusSelected = false;
            if ((this._noteprojectStatusListVm && this._noteprojectStatusListVm.selectedViewModel) || this.status !== null)
                isAStatusSelected = true;
            let subjectValid = this.subject === undefined || this.subject === null || this.subject.length <= 255;
            return isAStatusSelected && subjectValid;
        }

        public copySource(): void {
            super.copySource();
            if (this._noteprojectStatusListVm) {
                this._noteprojectStatusListVm.dispose();
            }
            if (!this.originalEntity) {
                this.initData();
            } else {
                this._noteprojectStatusListVm = new ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel(this.$utility, this.$controllersManager, this.$q, !this.isEditMode, this.meetingAccessRight, true);

                this._noteprojectStatusListVm.on("selectedItemChanged", () => {
                    /**
                    AP - 10625 : Status selector view model
                    Skip the call to vm.ChangeNoteStatus when add mode
                    **/
                    if (this.originalEntity && this.originalEntity !== null && !this.originalEntity.IsNew) {
                        this._changeNoteStatus();
                    }
                }, this);
                this._noteprojectStatusListVm.refresh((<ap.models.notes.Note>this.originalEntity).Status);

                let note: ap.models.notes.Note = (<ap.models.notes.Note>this.originalEntity);

                this._subCell = note.Cell;
                if (note.Cell && note.Cell.Code && note.Cell.Description)
                    this._cellFullNameWithCode = note.Cell.Code + " / " + note.Cell.Description;
                else
                    this._cellFullNameWithCode = "";

                if (note.Cell && note.Cell.ParentCell) {
                    this._cellFullName = note.Cell.ParentCell.Description + " / " + note.Cell.Description;
                }
                else {
                    this._cellFullName = "";
                }

                this._problemLocation = note.ProblemLocation;
            }
        }

        public postChanges(): void {
            super.postChanges();
            if (this._noteprojectStatusListVm.selectedViewModel)
                (<ap.models.notes.Note>this.originalEntity).Status = <ap.models.projects.NoteProjectStatus>this._noteprojectStatusListVm.selectedViewModel.originalEntity;
            (<ap.models.notes.Note>this.originalEntity).ProblemLocation = this._problemLocation;
        }

        /**
        * Init the screen info and th actionViewModel
        **/
        private updateScreenInfoAndActions(note: ap.models.notes.Note) {
            let actionViewModel = new ap.viewmodels.notes.NoteActionsViewModel(this.$utility, note, this.$controllersManager);
            this.screenInfo.actions = actionViewModel.actions;
            this.screenInfo.title = this.subject;
        }

        /** 
        * Method to load the infos of the note
        * @param noteId? The Id of the note to load
        **/
        public loadNote(noteId?: string, detailPanelOpened: boolean = false): angular.IPromise<any> {
            let defer = this.$q.defer();
            if (noteId && (!this.noteBase || (this.noteBase && this.noteBase.Id !== noteId) || this.needReloadEntity)) {
                this.needReloadEntity = false;
                // AP-11772: when reset node, we need to prevent the scrool to avoid the tab change randomly
                this.preventScroll = true;
                let self: ap.viewmodels.notes.NoteDetailViewModel = this;

                this.initData();

                this.$controllersManager.noteController.getFullNoteById(noteId, detailPanelOpened).then((note: ap.models.notes.Note) => {
                    self.setNoteBase(note);
                    this.updateScreenInfoAndActions(note);
                    // to adjust the scroll offset to the new note
                    self.gotoAnchor(NoteDetailTabs[self.selectedTab], true);

                    defer.resolve();
                }, (error: any) => {
                    self.$controllersManager.mainController.showError(self.$utility.Translator.getTranslation("app.cannot.load.note.data"), self.$utility.Translator.getTranslation("app.err.general_title"), error, null);

                    defer.reject(error);
                });
            }

            return defer.promise;
        }

        /**
         * Initializes the view model using the given note model
         * @param note A note model to use
         */
        public init(note: ap.models.notes.Note) {
            this.initData();
            this.setNoteBase(note);
            this.updateScreenInfoAndActions(note);
            this.gotoAnchor(NoteDetailTabs[this.selectedTab], true);
        }

        protected update(note: ap.models.notes.Note) {
            // A model received as a result of note update may not contain some ralated entities
            this.$controllersManager.noteController.getFullNoteById(note.Id, true).then((updatedNote: ap.models.notes.Note) => {
                // avoid this.initData() call to keep state of lists
                this.setNoteBase(updatedNote);
                this.updateScreenInfoAndActions(updatedNote);
                this.gotoAnchor(NoteDetailTabs[this.selectedTab], true);
            });
        }

        /**
        * This method used to clear the original entity of the vm and then clear all fields.
        **/
        public clear() {
            this.setNoteBase(null);
        }
        // This method is used in the view (html)
        public dropFiles(files: File[]) {
            if (this.noteAccessRight && (<ap.models.accessRights.NoteAccessRight>this.noteAccessRight).canUploadDoc) {
                super.dropFiles(files);
                this.selectedTab = NoteDetailTabs.Attachments;
            }
        }

        /*
        * This function is used to create a new note and initialize the property of the VM
        */
        public addNote(document: ap.models.documents.Document = null): angular.IPromise<void> {
            return this.$controllersManager.noteController.createNewNote(document).then((createdNote: ap.models.notes.Note) => {
                this.setNoteBase(createdNote);
            });
        }

        protected initData() {
            super.initData();
            this._status = null;
            this._subCell = null;
            this._cellFullName = "";
            this._problemLocation = ap.models.notes.ProblemLocation.Undefined;
        }

        public dispose() {
            super.dispose();
            if (this.$controllersManager.noteController) {
                this.$controllersManager.noteController.off("notestatusupdated", this._onNoteStatusUpdated, this);
                this.$controllersManager.noteController.off("commentsaved", this._onCommentSaved, this);
                this.$controllersManager.noteController.off("documentpreviewrequested", this.openDocument, this);
            }
        }

        private _changeNoteStatus(): void {
            /**
            AP - 10625 : Status selector view model
            Skip the call to vm.ChangeNoteStatus when add mode
            Double check here : Do nothing when adding note
            **/
            if (this.noteBase.IsNew) {
                return;
            }
            let self: ap.viewmodels.notes.NoteDetailViewModel = this;

            if ((this._noteprojectStatusListVm && this._noteprojectStatusListVm.selectedViewModel) && (!this.status ||
                this._noteprojectStatusListVm.selectedViewModel.originalEntity.Id !== this.status.Id)) {
                // initialize the status with the selected VM
                this._status = <ap.models.projects.NoteProjectStatus>this._noteprojectStatusListVm.selectedViewModel.originalEntity;
            } else if ((this._noteprojectStatusListVm && !this._noteprojectStatusListVm.selectedViewModel) && !this.status) {
                this._status = (<ap.models.notes.Note>this.originalEntity).Status;
            }

            if (!!this._status) {
                this.noteProjectStatusList.searchText = this._status.Name;
            }
        }

        private _onNoteStatusUpdated(result: any) {
            let updatedNote: ap.models.notes.Note = result.updatedNote;
            let newStatus: ap.models.projects.NoteProjectStatus = result.newStatus;
            if (this.noteBase && updatedNote && updatedNote.Id === this.noteBase.Id) {
                this.originalEntity.updateEntityPropsOnly(updatedNote);
                (<ap.models.notes.Note>this.originalEntity).Status = newStatus;
                this._status = newStatus;
                // When the status of the point had changed, the NoteComment have been updated also at server side
                // Then we need to set _needReloadNote to tell to the workspace need to reload the note for the editing
                // Why? Because when the status of a note is updated the first comment of a point is updated and it may causes errors when update the point afterwards
                this.needReloadEntity = true;
                this.loadNote(this.noteBase.Id);
            }
        }

        /**
        * This method is called when the event 'commentsaved' was fired from the NoteController
        * This method will be add or update the noteCommentList
        * @param result is the updated notecomment
        **/
        private _onCommentSaved(result: ap.controllers.CommentSavedEvent) {
            if (result && result.noteId && this.noteBase && this.noteBase.Id && result.noteId === this.noteBase.Id) {
                if (result.noteComment && result.noteComment.Id) {
                    let existingItemVm: ap.viewmodels.notes.NoteCommentViewModel = null;
                    for (let i = 0; i < this.noteCommentList.sourceItems.length; i++) {
                        let vm: ap.viewmodels.notes.NoteCommentViewModel = <ap.viewmodels.notes.NoteCommentViewModel>this.noteCommentList.sourceItems[i];
                        if (vm && vm.originalEntity.Id === result.noteComment.Id) {
                            existingItemVm = vm;
                            break;
                        }
                    }
                    if (existingItemVm === null && result.wasNew) {
                        let ncvm = new ap.viewmodels.notes.NoteCommentViewModel(this.$utility, this.$controllersManager.noteController, this.$controllersManager.mainController);
                        ncvm.init(result.noteComment, this.noteBase);
                        this.noteCommentList.addCommentToList(ncvm);
                    }
                    else if (existingItemVm !== null && !result.wasNew) {
                        existingItemVm.init(result.noteComment, this.noteBase);
                        this.updateNoteCommentProps(result.noteComment);
                    }

                    if (result.noteComment.IsFirst) {
                        this.needReloadEntity = true;
                        this.loadNote(this.noteBase.Id);
                    }

                    if (this.note.EntityVersion !== result.note.EntityVersion) {
                        // update the entityVersion of the note
                        this.note.updateEntityPropsOnly(result.note);
                    }
                }
            }
        }

        /**
         * Update base properties of a noteComment of the note after it has been updated
         * @param updatedNoteComment
         */
        private updateNoteCommentProps(updatedNoteComment: ap.models.notes.NoteComment) {
            if (this.note && this.note.Comments) {
                let comment: ap.models.notes.NoteComment = null;
                for (comment of this.note.Comments) {
                    if (comment.Id === updatedNoteComment.Id) {
                        comment.updateEntityPropsOnly(updatedNoteComment); // avoid DataConcurrencyException if the note is updated afterwards
                        break;
                    }
                }
            }
        }


        /**
         * This public method is used to add new comment
         */
        public addNewComment(): void {
            super.addNewComment();
            let noteComment: ap.models.notes.NoteComment = new ap.models.notes.NoteComment(this.$utility);
            noteComment.Note = this.noteBase;
            noteComment.Comment = this.newComment;
            this.$controllersManager.noteController.saveComment(noteComment, this.noteBase);
            this.newComment = null;
            this.isFocusOnNewComment = false;
        }

        /**
         * This public method is used to cancel adding of new comment
         */
        public cancelNewComment(): void {
            super.cancelNewComment();
            this.newComment = null;
            this.isFocusOnNewComment = false;
        }

        /**
         * Open document in picture view model
         * @param noteDocVm note's document viewmodel
         */
        public openDocument(noteDocVm: NoteDocumentViewModel) {
            if (this._isForNoteModule) {
                let documentId = noteDocVm.noteDocument ? noteDocVm.noteDocument.Id : null;
                let meetingId = this.$controllersManager.mainController.currentMeeting ? this.$controllersManager.mainController.currentMeeting.Id : null;
                if (documentId) {
                    let previewFlowStateParams = new ap.controllers.DocumentViewFlowStateParam(this.$utility, documentId, null, meetingId, this.$controllersManager.uiStateController.mainFlowState, true, noteDocVm.pictureViewModel.hasEditAccess, false, true);
                    previewFlowStateParams.documentIds = this.noteDocumentList.getLoadedItemsIds();
                    this.$controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.DocumentView, previewFlowStateParams);
                }
            } else {
                this.noteDocumentList.openDocumentInPictureViewer(noteDocVm);
            }
        }

        /**
         * Cancel the creation/edition of a note
         */
        public cancel() {
            super.cancel();
            if (this._noteprojectStatusListVm)
                this._noteprojectStatusListVm.isReadOnly = !this.isEditMode;
        }

        constructor($utility: ap.utility.UtilityHelper, $mdDialog: angular.material.IDialogService, protected $q: angular.IQService, _api: ap.services.apiHelper.Api, protected $controllersManager: ap.controllers.ControllersManager, $servicesManager: ap.services.ServicesManager, noteId?: string,
            $location?: angular.ILocationService, $anchorScroll?: angular.IAnchorScrollService, $interval?: angular.IIntervalService, private _isForNoteModule: boolean = false) {
            super($utility, $mdDialog, $q, _api, $controllersManager, $servicesManager, noteId, $location, $anchorScroll, $interval);
            this._addActions = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "note.addpoint", "/Images/html/icons/ic_add_black_48px.svg", true, [], "Add point", true);

            this.screenInfo.addAction = this._addActions;
            this.$controllersManager.noteController.on("notestatusupdated", this._onNoteStatusUpdated, this);
            this.$controllersManager.noteController.on("commentsaved", this._onCommentSaved, this);
            this.$controllersManager.noteController.on("documentpreviewrequested", this.openDocument, this);
            if (noteId) {
            this.loadNote(noteId);
            }
        }
        private _status: ap.models.projects.NoteProjectStatus;
        private _subCell: ap.models.projects.SubCell;
        private _cellFullName: string;
        private _cellFullNameWithCode: string;
        private _problemLocation: ap.models.notes.ProblemLocation;
        private _noteprojectStatusListVm: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatuslistViewModel;
        private _selectedTab: NoteDetailTabs = NoteDetailTabs.Field;
        private _addActions: ap.viewmodels.home.ActionViewModel;
    }
}