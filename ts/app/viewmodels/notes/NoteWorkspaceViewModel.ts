namespace ap.viewmodels.notes {

    import accessRights = ap.models.accessRights;

    export class NoteWorkspaceViewModel extends NoteBaseWorkspaceViewModel {

        /**
        * Getter  of the public noteListVm property
        */
        public get noteListVm(): NoteListViewModel {
            return <NoteListViewModel>this._noteBaseListVm;
        }

        /**
        * Getter of the public columnsIndexes property
        */
        public get columnsIndexes(): ap.misc.ColumnsIndexes {
            return this._columnsIndexes;
        }

        /**
        * Default setter without impementation to prevent overriding  noteListVm
        */
        public set noteListVm(val) {
        }

        /**
        * Getter  of the public NoteDetailVm property
        */
        public get noteDetailVm(): NoteDetailViewModel {
            return <ap.viewmodels.notes.NoteDetailViewModel>this._noteDetailBaseVm;
        }

        /**
        * To know the plan linked to the workspace when the workspace is used in the documents module
        **/
        public get document(): ap.models.documents.Document {
            return this._document;
        }

        public set document(newValue: ap.models.documents.Document) {
            this._document = newValue;
            this._addEditNoteViewModel.document = newValue;
        }

        /**
        * Get/Set the property to tells if the note detail pane is opened or not
        */
        public get isNoteDetailOpened(): boolean {
            return this._isNoteDetailOpened;
        }

        /**
        * Get/Set the property to tells if the note can saved or not
        */
        public get canSavePoint(): boolean {
            return this._canSavePoint;
        }

        public set isNoteDetailOpened(open: boolean) {
            if (this._isNoteDetailOpened !== open) {
                this._isNoteDetailOpened = open;
                if (this._isNoteDetailOpened) {
                    let titleDetail: string = "";
                    if (this.note) {
                        titleDetail = this.note.Subject;
                        if (!this.noteDetailVm.note || this.noteDetailVm.note.Id !== this.note.Id) {
                            this.noteDetailVm.loadNote(this.note.Id, true).then(() => {

                                // hotfix for PSD-613
                                this.createAddEditViewModelForDetailPane();
                                this._raiseDetailVisibilityChanged();
                                if (this.noteDetailVm.screenInfo.documentInPreview && !this._noteDocumentRestored) {
                                    let docItemVm = <NoteDocumentViewModel>this.noteDetailVm.noteDocumentList.getEntityById(this.noteDetailVm.screenInfo.documentInPreview);
                                    if (docItemVm) {
                                        this.noteDetailVm.noteDocumentList.openDocumentInPictureViewer(docItemVm);
                                    }
                                    this._noteDocumentRestored = true;
                                }
                            });
                        } else {
                            this._raiseDetailVisibilityChanged();
                        }
                    }
                    if (this.noteDetailVm.screenInfo) {
                        // When the notes list opened in the DocWorkspace, we first need to remove the previous screen
                        if (!this._isForNoteModule) {
                            this.$controllersManager.mainController.goBackToScreen(this._noteListScreenFullName);
                        }
                        this._noteDetailScreenFullName = this.$controllersManager.mainController.addScreen(this.noteDetailVm.screenInfo, true);
                    }

                    // send a Google Analytics event when the detail info is opened

                    this.$utility.sendGaPageViewEvent("pointInfo");

                    if (this.isForNoteModule) {
                        // send event to Segment.IO
                        this.$servicesManager.toolService.sendEvent("cli-button-view point details", new Dictionary([new KeyValue("cli-button-view point details-screenname", this.$controllersManager.mainController.currentMeeting === null ? "projects" : "lists")]));
                    }
                }
                else {
                    if (this.noteDetailVm && this.noteDetailVm.noteDocumentList) {
                        this.noteDetailVm.noteDocumentList.closePictureViewer();
                    }
                    this.$controllersManager.mainController.goBackToScreen(this._noteDetailScreenFullName);

                    if (this.noteDetailVm && this.noteDetailVm.noteCommentList) {
                        let comment = this.noteDetailVm.noteCommentList.sourceItems.filter((item: ap.viewmodels.notes.NoteCommentViewModel) => {
                            return item.isEditMode === true;
                        });
                        if (comment.length > 0) {
                            this.noteDetailVm.noteCommentList.cancelEditComment(<ap.viewmodels.notes.NoteCommentViewModel>comment[0]);
                        }
                    }
                    // In the DocWorkspace, open back the notes list
                    if (!this._isForNoteModule) {
                        this._noteListScreenFullName = this.$controllersManager.mainController.addScreen(this.noteListVm.screenInfo, true, true);
                        this.noteDetailVm.screenInfo.documentInPreview = null; // clear opened attachment's ID when note details panel is closed in the document's picture viewer
                    }
                    this._raiseDetailVisibilityChanged();
                }
            }
        }

        /**
        * Get/Set the edit mode of the workspace
        */
        public get isEditMode(): boolean {
            return this._isEditMode;
        }

        public set isEditMode(editMode: boolean) {
            if (this._isEditMode !== editMode) {
                this._isEditMode = editMode;
                if (this.noteDetailVm)
                    this.noteDetailVm.isEditMode = editMode;
            }
        }

        /**
        * Returns true if the Workspace is used in the notes module.  False otherwise.
        */
        public get isForNoteModule(): boolean {
            return this._isForNoteModule;
        }

        /**
        * Returns the noteAccessRight entity of the selected note of the notes list
        */
        private get noteAccessRight(): ap.models.accessRights.NoteAccessRight {
            if (this.selectedNoteViewModel)
                return this.selectedNoteViewModel.noteAccessRight;
            else
                return null;
        }

        /**
        * Returns the selected note entity from the notes lsit
        */
        private get note(): ap.models.notes.Note {
            if (this.selectedNoteViewModel && this.selectedNoteViewModel.originalNote)
                return this.selectedNoteViewModel.originalNote;
            else
                return null;
        }

        /**
        * Returns the selected note viewmodel from the notes list
        */
        private get selectedNoteViewModel(): ap.viewmodels.notes.NoteItemViewModel {
            if (this.noteListVm && this.noteListVm.listVm && this.noteListVm.listVm.selectedViewModel)
                return <ap.viewmodels.notes.NoteItemViewModel>this.noteListVm.listVm.selectedViewModel;
            else
                return null;
        }

        /**
        * To know that the refresh of the note list was invoke by the user action
        **/
        public get isRefreshing(): boolean {
            return this._isRefreshing;
        }

        /**
        * Getter of the public paneWidth property
        */
        public get paneWidth(): number {
            return this._paneWidth;
        }

        public get addEditNoteVm(): ap.viewmodels.notes.AddEditNoteViewModel {
            if (this._addEditNoteViewModel) {
                return this._addEditNoteViewModel;
            }
        }

        public set addEditNoteVm(addeditvm: ap.viewmodels.notes.AddEditNoteViewModel) { }

        /**
        * This private method raises the detailvisibilitychanged event with the isVisible parameter to know if the detail is visible or not
        * @param isVisible boolean TRUE if the detail is vsible, FALSE if the detail is hidden
        */
        private _raiseDetailVisibilityChanged() {
            this._listener.raise("noteopened");
        }

        /**
         * The Fab button (+) is visible if the user can add a point or he has a selected point on which he can add comment or doc
         **/
        private setFabButtonVisibility() {
            let action = this.noteListVm.screenInfo.addAction;

            if (action) {
                action.hasOnlySubActions = !this.canAddPoint(); // The add point is not active but the button should enable for subactions.
                action.isVisible = this.canAddPoint();
            }
        }

        /**
         * Set the Fab button subactions visibility
         */
        private setFabButtonSubActionsVisibility() {
            let subAddAction: home.SubActionViewModel = this.noteListVm.screenInfo.addAction.getSubAction("note.createfromissutypes");

            if (subAddAction) {
                subAddAction.isVisible = this.$controllersManager.mainController.currentMeeting && !this.$controllersManager.mainController.currentMeeting.IsSystem && this.canAddPoint() && this.isForNoteModule;
            }
        }

        public canEdit(): boolean {
            return !this.isEditMode && !!this.noteAccessRight && this.noteAccessRight.canEdit;
        }

        public canAddComment(): boolean {
            return !this.isEditMode && !!this.noteAccessRight && this.noteAccessRight.canAddComment;
        }

        /**
         * This method will check the user can add a point. It will depends of the selected project or if we are already in edit mode.
         **/
        public canAddPoint(): boolean {
            if (this.isEditMode)
                return false;

            if (this.$controllersManager.mainController.currentMeeting !== null && this.$controllersManager.mainController.currentMeeting !== undefined) {
                if (this._meetingAccessRight) {
                    return this._meetingAccessRight.CanAddPoint;
                }
                else {
                    return false;
                }
            }

            if (this.$controllersManager.mainController.canAddPointOnProject)
                return true;

            return false;
        }

        /**
         * This property is to know if the user can add a new document to the point by selecting an existing one in the project structure
         **/
        public canImportDocument(): boolean {
            return !this.isEditMode && !!this.noteAccessRight && this.noteAccessRight.canImportDoc;
        }

        private calculateAccessRight() {
            this.calculSubActionAccessRight(this.noteListVm.screenInfo.addAction);
            this.calculSubActionAccessRight(this.noteDetailVm.screenInfo.addAction);

            this.setFabButtonVisibility();
            this.setFabButtonSubActionsVisibility();
        }

        public get showDetailPaneBusy(): boolean {
            return this._showDetailPaneBusy;
        }

        /**
         * Status bar actions click handler
         * @param actionName Action name
         */
        public noteListStatusActionClick(actionName: string) {
            switch (actionName) {
                case "groupnotelist.date":
                    this.noteListVm.groupView = "Date";
                    break;
                case "groupnotelist.subcategory":
                    this.noteListVm.groupView = "SubCategory";
                    break;
                case "groupnotelist.duedate":
                    this.noteListVm.groupView = "DueDate";
                    break;
                case "groupnotelist.status":
                    this.noteListVm.groupView = "Status";
                    break;
                case "groupnotelist.room2":
                    this.noteListVm.groupView = "Room";
                    break;
                case "groupnotelist.none":
                    this.noteListVm.groupView = "None";
                    break;
                case "groupnotelist.userincharge":
                    this.noteListVm.groupView = "InCharge";
                    break;
                case "managenotescolumns":
                    this.showNoteColumnVisibilityPopup();
                    break;
            }
        }

        /**/

        /**
        * Used to know if the subactions are visible and enable or not
        **/
        private calculSubActionAccessRight(addAction: ap.viewmodels.home.ActionViewModel) {
            addAction.iconSrc = this.$utility.rootUrl + "/Images/html/icons/ic_add_black_48px.svg";
        }

        /**
         * This method is called when files are dropped in the note detail view. When files are dropped, we will upload them like attachment of the current note.
         **/
        private detailFileDroppedHandler(files: File[]) {
            this.uploadDoc(files);
        }

        /**
        * This method is the handler called when the main search changes
        */
        private _mainSearchChanged() {
            if (this.$controllersManager.mainController.uiStateController.mainFlowState !== ap.controllers.MainFlow.Points) return;

            this.noteListVm.updateHasActiveNotes();
            this.noteListVm.loadData();
        }

        /**
         * Handler method called when the project changes
         */
        private currentProjectChangedHandler(project: ap.models.projects.Project) {
            if (project && this.$controllersManager.mainController.currentMeeting !== undefined) {
                this.initView();
                this.$controllersManager.uiStateController.off("mainflowstatechanged", this.currentProjectChangedHandler, this);
            }
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /*
        * This public method changes the value of the isNoteDetailOpened property and will also select a point is the noteId param is given
        * @aram noteId? string The note id of the note to select
        */
        toggleRight(note?: NoteItemViewModel): void {
            // can open the details depends on the current filter and state of the note
            let canOpenDetail: boolean = (!!note && ((note.isArchived && this.noteListVm.hasActiveNotes === false) || (!note.isArchived && this.noteListVm.hasActiveNotes === true) || this.noteListVm.hasActiveNotes === null) && !note.originalNote.Deleted && !note.isMoved);
            if (note !== undefined && note !== null) {
                note.updateNoteIsRead();
                if (this.selectedNoteViewModel && canOpenDetail && this.selectedNoteViewModel.originalNote.Id !== note.originalNote.Id) {
                    this.isNoteDetailOpened = true;
                } else {
                    this.isNoteDetailOpened = !this.isNoteDetailOpened && canOpenDetail;
                }
            } else {
                this.isNoteDetailOpened = !this.isNoteDetailOpened && canOpenDetail;
            }
            if (note && note.noteActionViewModel) {
                note.noteActionViewModel.withInfo = !this.isNoteDetailOpened;
            }
            if (note && note.originalNote && !StringHelper.isNullOrEmpty(note.originalNote.Id) && note.originalNote.Id !== ap.utility.UtilityHelper.createEmptyGuid()) {
                // We should select the item only if it is not selected. Otherwise it will be unselected.
                if (!this.selectedNoteViewModel || this.selectedNoteViewModel.originalNote.Id !== note.originalNote.Id) {
                    this.selectItem(note.originalNote.Id);
                    this.saveLastSelectedItem(note.originalNote.Id, note.originalId);
                }
            }
            this.noteListVm.screenInfo.isInfoOpened = this.isNoteDetailOpened;
            this.$utility.Storage.Session.set("isnotedetailopened", this.isNoteDetailOpened);
        }

        /**
         * Handler method caller after a note is added
         * @param noteUpdatedEvent
         */
        private noteAddedHandler(noteUpdatedEvent: ap.controllers.NoteBaseUpdatedEvent) {
            if (noteUpdatedEvent.properties && noteUpdatedEvent.properties.length > 0 && noteUpdatedEvent.properties[0] === "IsCopied" && noteUpdatedEvent.notes.length < 2) { // if multimode the toast is in NoteListViewModel
                this.$controllersManager.mainController.showToast("app.note.copied", noteUpdatedEvent.notes[0], "View", [noteUpdatedEvent.notes[0].Meeting.Title]).then((data: ap.models.notes.Note) => {
                    this.noteListVm.screenInfo.selectedEntityId = data.Id;
                    this.noteListVm.screenInfo.isInfoOpened = true;
                    this.$controllersManager.mainController.setCurrentMeeting(noteUpdatedEvent.notes[0].Meeting.Id);
                });
            } else if (noteUpdatedEvent.notes.length < 2) { // if multimode the toast is in NoteListViewModel{
                this.$controllersManager.mainController.showToast("app.notes.point_just_created", noteUpdatedEvent.notes[0], "View the point", [noteUpdatedEvent.notes[0].Code, noteUpdatedEvent.notes[0].Subject]).then((noteAdded: ap.models.notes.Note) => {
                    this.selectItem(noteAdded.Id);
                    this.isNoteDetailOpened = true;
                    this._noteBaseListVm.topIndex = 0;
                });
                // Keep the correct Id for reselect when refresh
                let isGroupingInCharge: boolean = this.noteListVm.groupView === "InCharge";
                let commentOriginalId: string = null;
                if (!isGroupingInCharge) {
                    commentOriginalId = noteUpdatedEvent.notes[0].Comments[0].Id + "0";
                }
                else {
                    if (noteUpdatedEvent.notes[0].NoteInCharge && noteUpdatedEvent.notes[0].NoteInCharge !== null && noteUpdatedEvent.notes[0].NoteInCharge.length > 0)
                        commentOriginalId = noteUpdatedEvent.notes[0].NoteInCharge[0].Id + "2";
                    else
                        commentOriginalId = noteUpdatedEvent.notes[0].Id + "1";
                }
                if (this._notecommentAddedByNote.containsKey(noteUpdatedEvent.notes[0].Id))
                    this._notecommentAddedByNote.remove(noteUpdatedEvent.notes[0].Id);
                this._notecommentAddedByNote.add(noteUpdatedEvent.notes[0].Id, commentOriginalId);
            }

            if (this.isNoteDetailOpened) {
                this.noteDetailVm.needReloadEntity = true;
                this.noteDetailVm.loadNote(this.note.Id, true).then(() => {
                    if (this._addEditNoteViewModel) {
                        this.noteDetailVm.isEditMode = false;
                        this._addEditNoteViewModel.dispose();
                    }
                    if (this.isForNoteModule) {
                        this.createAddEditViewModelForDetailPane();
                    }

                    this._raiseDetailVisibilityChanged();
                });
            }
        }

        /**
         * Handler method called when a note has been updated
         * In this case, used to update the list 
         * @param evt
         */
        private noteUpdatedHandler(evt: ap.controllers.NoteBaseUpdatedEvent) {
            let updatedNote: ap.models.notes.Note = <ap.models.notes.Note>evt.notes[0];
            if (this.isNoteDetailOpened && this.noteDetailVm.meeting.Id !== updatedNote.Meeting.Id && this.$controllersManager.mainController.currentMeeting) {
                this.isNoteDetailOpened = false;
            }
        }

        /**
         * This method is the handler of the event catch from the note controller to know that a comment was saved to the API.
         **/
        private notecommentSavedHandler(commentSavedEvent: ap.controllers.CommentSavedEvent) {
            if (commentSavedEvent.wasNew) {
                let commentAdded = commentSavedEvent.noteComment;
                let needUpdateSelectedItemId: boolean = this.noteListVm.groupView !== "InCharge";
                if (needUpdateSelectedItemId) {
                    let commentOriginalId: string = commentAdded.Id + "0";
                    if (this._notecommentAddedByNote.containsKey(commentSavedEvent.noteId))
                        this._notecommentAddedByNote.remove(commentSavedEvent.noteId);
                    this._notecommentAddedByNote.add(commentSavedEvent.noteId, commentOriginalId);
                    this.saveLastSelectedItem(commentSavedEvent.noteId, commentOriginalId);
                }
            }
        }

        /**
         * This method returns the current selected note. If the note is loaded in the detail, it returns this one but if not, it returns the one of the item.
         **/
        private getCurrentEditNote(): ap.models.notes.Note {
            let result = this.note;
            // In this case, the details is opened with the selected note
            if (this.noteDetailVm.note && this.noteDetailVm.note.Id === this.note.Id)
                result = this.noteDetailVm.note;
            return result;
        }

        /**
		 * Handles a request to import a document to the specified note
         * @param note a model of the note to import a document into
         */
        private handleImportDocumentRequest(note: ap.models.notes.NoteBase) {
            this.noteListVm.listVm.selectEntity(note.Id);

            if (this._dialogOpening === true) {
                return;
            }
            this._dialogOpening = true;

            if (this.canImportDocument()) {
                let vm: ap.viewmodels.documents.DocumentSelectorViewModel;
                let documentSelectorController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                    vm = new ap.viewmodels.documents.DocumentSelectorViewModel($scope, this.$mdDialog, this.$utility, this.$api, this.$q, $timeout, "app.notes.select_documents", "Save", this.$mdSidenav,
                        this.$location, this.$anchorScroll, this.$interval, this.$controllersManager, this.$servicesManager);
                    vm.workspace.documentListVm.isListInSelector = true;

                    $scope["vm"] = vm;
                    $scope["documentWorkspaceVm"] = vm.workspace;
                };
                documentSelectorController.$inject = ["$scope", "$timeout"];
                this.$mdDialog.show({
                    clickOutsideToClose: true,
                    templateUrl: "me/PartialView?module=Document&name=DocumentSelector",
                    fullscreen: true,
                    controller: documentSelectorController
                }).then((selectedDocuments: ap.viewmodels.documents.DocumentItemViewModel[]) => {
                    this._dialogOpening = false;
                    this._importDocumentAccepted(selectedDocuments);
                    vm = null;
                }, (reason) => {
                    this._dialogOpening = false;
                    vm = null;
                });
            }
        }

        /**
         * This method will be called when the user has selected some documents in the project's structure to attach them to the note. 
         * @param selectedDocuments DocumentItemViewModel checked in the popup in the dialog to select docs to import.
         **/
        private _importDocumentAccepted(selectedDocuments: ap.viewmodels.documents.DocumentItemViewModel[]) {
            let documents: ap.models.documents.Document[] = [];
            for (let i = 0; i < selectedDocuments.length; i++) {
                documents.push(selectedDocuments[i].originalDocument);
            }
            let _selt = this;
            this.$controllersManager.noteController.importDocuments(this.getNoteToAttachDocuments(), documents).then((docs: ap.models.notes.NoteDocument[]) => {
                _selt.noteDetailVm.selectedTab = NoteDetailTabs.Attachments;
                if (_selt.note) {
                    let note = this._noteBaseListVm.listVm.getEntityById(_selt.note.Id);
                    (<ap.viewmodels.notes.NoteItemViewModel>note).hasAttachment = true;
                }
            });
        }

        /**
        * Set hasAttachment when the last note document has been detached
        * @param note the note we need to set hasattachement = false
        **/
        private updateItemAttachement(note: ap.models.notes.Note) {
            let noteItem = this._noteBaseListVm.listVm.getEntityById(note.Id);
            (<ap.viewmodels.notes.NoteItemViewModel>noteItem).hasAttachment = false;
        }

        /**
         * Opens the popup to add a note
         */
        private _addNote() {
            if (this.canAddPoint()) {
                let noteDetailToCreateNote = new ap.viewmodels.notes.NoteDetailViewModel(this.$utility, this.$mdDialog, this.$q, this.$api, this.$controllersManager, this.$servicesManager);
                this.createAddEditViewModelForDetailPane(false, noteDetailToCreateNote);
                noteDetailToCreateNote.addNote(this._document).then(() => {
                    this.showAddEditDialog(this.addEditNoteVm);
                });
            }
        }

        /**
         * Searches for a view model which represents a given note model
         * @param note a model to look a view model for
         * @returns a view model for the given model
         * @throws an error if there are no view models found for the given note model
         */
        private _getNoteViewModel(note: ap.models.notes.Note): ap.viewmodels.notes.UserCommentViewModel {
            let noteVm = this.noteListVm.getNoteViewModel(note);
            if (!noteVm) {
                throw new Error("Unable to find a view model for the given note.");
            }
            return noteVm;
        }

        /**
         * Opens the popup to edit a note
         * @param note The note to edit
         */
        private _editNote(note: ap.models.notes.Note) {
            if (this.canEdit) {
                if (note) {
                    if (!this.noteDetailVm.note || note.Id !== this.noteDetailVm.note.Id || this.noteDetailVm.needReloadEntity) {
                        this.noteDetailVm.loadNote(note.Id).then(() => {
                            this.createAddEditViewModelForDetailPane();
                            this.showAddEditDialog(this.addEditNoteVm, this._dialogOpening, this.noteDetailVm);
                        });
                    } else {
                        this.createAddEditViewModelForDetailPane();
                        this.showAddEditDialog(this.addEditNoteVm, this._dialogOpening, this.noteDetailVm);
                    }
                }
            }
        }

        /**
        * Method use to copy a note to a list
        * @param note the view model we need to copy
        **/
        private _copyToNote(note: ap.models.notes.Note) {
            let noteVm = this._getNoteViewModel(note);
            this.noteListVm.openMeetingSelectorDialog(true).then((meeting: ap.viewmodels.meetings.MeetingItemViewModel) => {
                this.noteListVm.selectedMeetingItem = null;
                this.$controllersManager.noteController.copyTo([noteVm.originalId], meeting.originalEntity.Id).then((noteMultiActionResult: ap.models.multiactions.NoteMultiActionsResult) => {
                    if (noteMultiActionResult.SkippedActionDescriptionList.length !== 0) {
                        this.noteListVm.openMultiActionResultDialog(noteMultiActionResult);
                    }
                });
            });
        }

        /**
         * This method creates a copy of the given note
         * @param note A note model to copy
         */
        private _copyNote(note: ap.models.notes.Note) {
            // THe original model is loaded in order to make sure that all needed fields are present and up to date
            this.$controllersManager.noteController.getFullNoteById(note.Id).then((originalNoteModel: ap.models.notes.Note) => {
                let copyModel = <ap.models.notes.Note>originalNoteModel.copyNoteBase();
                let copyDetailVm = new ap.viewmodels.notes.NoteDetailViewModel(this.$utility, this.$mdDialog, this.$q, this.$api, this.$controllersManager, this.$servicesManager, null, this.$location, this.$anchorScroll, this.$interval, this._isForNoteModule);
                copyDetailVm.init(copyModel);
                this.createAddEditViewModelForDetailPane(false, copyDetailVm, true);

                let focusedField = "issueType";
                if (copyModel.IssueType !== null) {
                    focusedField = "subject";
                }

                this.showAddEditDialog(this.addEditNoteVm, this._dialogOpening, copyDetailVm, focusedField);
            });
        }

        /**
         * This method move of the given note
         * @param note A note model to move
         */
        private _moveNote(note: ap.models.notes.Note) {
            let noteVm = this._getNoteViewModel(note);
            this.noteListVm.openMeetingSelectorDialog().then((meetingVM: ap.viewmodels.meetings.MeetingItemViewModel) => {
                this.$controllersManager.noteController.moveTo(noteVm.originalNote, <ap.models.meetings.Meeting>meetingVM.originalEntity).then(() => {
                    if (this.$controllersManager.mainController.currentMeeting) {
                        noteVm.isMoved = true;
                        this.isNoteDetailOpened = false;
                    } else {
                        noteVm.originalNote.Meeting.Title = meetingVM.title;
                        noteVm.copySource();

                        if (this.addEditNoteVm && this.addEditNoteVm.meetingSelector) {
                            this.addEditNoteVm.meetingSelector.selectMeetingById(meetingVM.originalEntity.Id);
                        }
                    }
                });
            });
        }

        /**
        * This method open modal add/edit point with focus on inCharge
        **/
        private _assignNote(note: ap.models.notes.Note) {
            this.noteDetailVm.loadNote(note.Id).then(() => {
                this.showAddEditDialog(this.addEditNoteVm, this._dialogOpening, this.noteDetailVm, "inCharge");
                this.createAddEditViewModelForDetailPane();
            });
        }

        /**
        * The method open the detail of the note
        **/
        public infoNote(note: ap.models.notes.Note) {
            let noteVm = this._getNoteViewModel(note);
            this.toggleRight(noteVm);
        }

        /**
        * The method open the detail of the note
        **/
        public closeInfoNote(note: ap.viewmodels.notes.NoteItemViewModel) {
            this.toggleRight();
            note.noteActionViewModel.withInfo = true;
            if (!this._isForNoteModule) {
                this.selectItem(null);
            }
        }

        /**
        * Method use to open the selectable categories popup
        **/
        private _showCreatePointFromSubcategoriesDialog() {
            let importProjectIssueTypeViewModel = new ap.viewmodels.projects.ImportProjectIssueTypeViewModel(this.$utility, this.$q, this.$api, this.$controllersManager, this.$servicesManager, this.$mdDialog, this.$timeout, false, true);
            this.$controllersManager.mainController.showBusy();

            let createController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["importProjectIssueTypeViewModel"] = importProjectIssueTypeViewModel;
            };
            createController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                },
                templateUrl: "me/PartialView?module=Project&name=ImportProjectIssueTypeDialog",
                fullscreen: true,
                controller: createController
            }).then(() => {
                importProjectIssueTypeViewModel.dispose();
                importProjectIssueTypeViewModel = null;
                this.handleRefreshNoteList();
            });
        }

        /*
        * Depend on context of detail load or note then we will have a note to edit
        */
        private getNoteToAttachDocuments(): ap.models.notes.Note {
            let note = this.note;
            if (this.noteDetailVm.note && this.noteDetailVm.note.Id === this.note.Id) {
                note = this.noteDetailVm.note;

                // When the property is empty, need to init so that controller can add the items
                if (note.NoteDocuments === null) note.NoteDocuments = [];
            }

            return note;
        }

        /*
        * This method is called after select a folder when user add NoteDocument
        */
        private uploadDocAfterSelectFolder(folder: ap.models.projects.Folder) {
            let selectedFolderId: string = null;
            let selectedFolder: ap.models.projects.Folder = folder;
            if (selectedFolder !== null)
                selectedFolderId = selectedFolder.Id;
            this.$controllersManager.noteController.uploadNoteDocuments(this.getNoteToAttachDocuments(), this._filesToUpload, selectedFolderId).then((files: ap.models.notes.NoteDocument[]) => {
                this.noteDetailVm.selectedTab = NoteDetailTabs.Attachments;
                let note = this._noteBaseListVm.listVm.getEntityById(this.noteDetailVm.note.Id);
                (<ap.viewmodels.notes.NoteItemViewModel>note).hasAttachment = true;

            });
            this.$mdDialog.hide();
        }

        /**
         * Handles a request to upload a document to the specified note
         * @param noteVm a view model of the note to upload a document into
         */
        private handleAddDocumentRequest(args: ap.controllers.AddNoteDocumentRequestedEvent) {
            this.noteListVm.listVm.selectEntity(args.note.Id);
            this.uploadDoc(args.files);
        }

        /**
         * Allows a user to choose a target folder, upload selected files to the server and link them to the selected document
         * @param files a list of files to upload and link
         */
        private uploadDoc(files: File[]) {
            if (this._dialogOpening === true) return;

            if (this.note && this.note.Id) {
                if (this.$controllersManager.mainController.currentProject().UserAccessRight.CanUploadDoc === false) {
                    this.$controllersManager.noteController.uploadNoteDocuments(this.getNoteToAttachDocuments(), files, this.$controllersManager.mainController.currentProject().PhotoFolderId).then((files: ap.models.notes.NoteDocument[]) => {
                        this.noteDetailVm.selectedTab = NoteDetailTabs.Attachments;
                        let note = this._noteBaseListVm.listVm.getEntityById(this.noteDetailVm.note.Id);
                        (<ap.viewmodels.notes.NoteItemViewModel>note).hasAttachment = true;
                    });
                } else {
                    this._dialogOpening = true;
                    this._filesToUpload = files;

                    let folderSelectorController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                        let folderSelectorVm = new ap.viewmodels.folders.FolderSelectorViewModel($scope, this.$mdDialog, this.$utility, this.$api, this.$q, $timeout, this.$mdSidenav, this.$location, this.$anchorScroll, this.$interval,
                            this.$controllersManager, this.$servicesManager);
                        folderSelectorVm.titleKey = "app.document.select_folder_for_upload_title";
                        folderSelectorVm.on("mainactionclicked", this.uploadDocAfterSelectFolder, this);

                        $scope["folderSelectorVm"] = folderSelectorVm;
                    };
                    folderSelectorController.$inject = ["$scope", "$timeout"];
                    this.$mdDialog.show({
                        clickOutsideToClose: false,
                        templateUrl: "me/PartialView?module=Document&name=FolderSelector",
                        fullscreen: true,
                        controller: folderSelectorController
                    }).then(() => {
                        this._filesToUpload = null;
                        this._dialogOpening = false;
                    }, () => { this._dialogOpening = false; });
                }
            }
        }

        private handleAddActionEvents(action: ap.controllers.AddActionClickEvent): void {
            let noteId: string = null;
            if (this.note)
                noteId = this.note.Id;
            let actionName = action.name;
            switch (actionName) {
                case "note.addpoint":
                    // the note.addpoint action is always visible, we need a condition to not start the action 
                    // if the user has not the right to do it
                    this._addNote();
                    break;
                case "note.createfromissutypes":
                    this._showCreatePointFromSubcategoriesDialog();
                    break;
            }
        }

        /**
         * This private method is used for show popup
         */
        private showNoteColumnVisibilityPopup() {
            this._downloadQueuePanel = null;
            let panelPosition = this.getNoteColumnVisibilityPopupPosition();

            let noteColumnController = () => { };
            noteColumnController.$inject = [];

            this.$mdPanel.open({
                id: "show-note-column",
                attachTo: angular.element(document.body),
                templateUrl: "me/PartialView?module=Note&name=NoteColumnVisibilityPopup",
                controller: noteColumnController,
                controllerAs: "ctrl",
                locals: {
                    noteColumnViewModel: this._noteColumnViewModel,
                    isMeeting: this.$controllersManager.mainController.currentMeeting !== null
                },
                clickOutsideToClose: true,
                escapeToClose: true,
                focusOnOpen: false,
                position: panelPosition,
                onDomRemoved: () => {
                    this.noteListVm.manageSort(this._noteColumnViewModel);
                }
            });
        }

        /**
         * This private method is used for calculate column-popup position
         */
        private getNoteColumnVisibilityPopupPosition() {
            let relativeSelector = ".show-note-column-popup";
            if (!document.querySelector(relativeSelector)) {
                relativeSelector = ".status-inner-container";
            }
            let panelPosition = this.$mdPanel.newPanelPosition()
                .relativeTo(relativeSelector)
                .addPanelPosition(this.$mdPanel.xPosition.ALIGN_END, this.$mdPanel.yPosition.BELOW);
            return panelPosition;
        }

        /**
        * This private method handles the actions of the notes list and trigger the corresponding action
        */
        private noteListActionClickedHandler(actionName: string) {
            switch (actionName) {
                case "printnotelist":
                    this.noteListVm.printReport();
                    break;
                case "refreshnotelist":
                    this.handleRefreshNoteList();
                    break;
            }
        }

        /**
        * This method used to clear the details part 
        **/
        private clearDetails() {
            if (this.noteDetailVm && this.noteDetailVm !== null)
                this.noteDetailVm.clear();
        }

        /*
        * To handle refresh action
        */
        private handleRefreshNoteList() {
            this._isRefreshing = true;
            this.noteListVm.refresh(this.noteDetailVm.screenInfo.selectedEntityId);
        }

        /**
        * This method will called when the notelist begin to refresh the data
        * We will clear the details information as the point will refresh
        * When the refesh of data was not invoke by user action, we need to closed the point details
        **/
        private noteListVmBeginLoadData() {
            this.clearDetails();
            this._notecommentAddedByNote.clear();
            if (!this._isRefreshing)
                this.isNoteDetailOpened = false;
            this._isRefreshing = false;
        }

        /**
        * This method handles the different actions possible on a note and call a specific method based on the action
        * @param action string The name of the action
        */
        noteActionClicked(action: string): void {
            switch (action) {
                case "urgentnote":
                    this.markNoteAsUrgent(true);
                    break;
                case "unurgentnote":
                    this.markNoteAsUrgent(false);
                    break;
                case "archivenote":
                    this.archiveNote();
                    break;
                case "unarchivenote":
                    this.unarchiveNote();
                    break;
                case "deletenote":
                    this.deleteNote();
                    break;
                case "editnote":
                    this._editNote(this.note);
                    break;
            }
        }
        /**
         * This method will mark the selected note as urgent or not depending of the method parameter.
         * @param isUrgent by default true, it is the flag to know if the note must be set like urgent or must be unmarked like urgent
         **/
        private markNoteAsUrgent(isUrgent: boolean) {
            if (!isUrgent)
                this.$controllersManager.noteController.markNoteAsNotUrgent(this.note);
            else
                this.$controllersManager.noteController.markNoteAsUrgent(this.note);
        }
        /**
         * This method will archive the current note
         **/
        private archiveNote(): void {
            this.$controllersManager.noteController.archiveNote(this.note);
        }

        /**
         * This method will unarchive the current note
         **/
        private unarchiveNote(): void {
            this.$controllersManager.noteController.unarchiveNote(this.note);
        }

        /**
         * This method will delete the current note
         **/
        private deleteNote(): void {
            this.$controllersManager.noteController.deleteNote(this.note);
        }

        /**
         * A handler method for property changes in the detail of a note
         * @param args event arguments
         */
        protected noteDetailVmPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            switch (args.propertyName) {
                case "selectedTab":
                    this.selectedTabChanged(this.noteDetailVm.selectedTab);
                    break;
            }
        }

        /**
        * Handler method called when a tab from the detail of a note is selected
        * @param tab NoteDetailTabs The selected tab
        */
        private selectedTabChanged(tab: NoteDetailTabs) {
            if (tab === NoteDetailTabs.Comments && this.noteListVm.listVm.selectedViewModel) {
                (<ap.viewmodels.notes.NoteItemViewModel>this.noteListVm.listVm.selectedViewModel).updateNoteIsRead();
            }
        }

        /**
        * Handler method called when a note is selected in the notes list
        */
        private selectedNoteChanged(noteVm: ap.viewmodels.notes.NoteItemViewModel) {
            // Keep the current selected id on the noteController to reselect when the user leave and comeback
            if (noteVm && noteVm !== null && noteVm.originalNote && noteVm.originalNote !== null) {
                // If there is a notecomment added for the selected note, then the lastSelectedUserCommentId must be the added comment
                // It because the current note commnet of the note will not be include on the list ids when refresh
                if (this._notecommentAddedByNote.containsKey(noteVm.originalNote.Id))
                    this.saveLastSelectedItem(this._notecommentAddedByNote.getValue(noteVm.originalNote.Id), noteVm.originalId);
            }
            if (this.noteDetailVm.selectedTab === NoteDetailTabs.Comments && noteVm) {
                noteVm.updateNoteIsRead();
            }
            if (this.isNoteDetailOpened) {
                if (noteVm && noteVm !== null) {
                    noteVm.noteActionViewModel.withInfo = false;
                }

                if (this.note && (!this.noteDetailVm.note || this.note.Id !== this.noteDetailVm.note.Id)) {
                    // noteVm.id get entity
                    this.noteDetailVm.loadNote(this.note.Id, true).then(() => {
                        if (this._addEditNoteViewModel) {
                            this.noteDetailVm.isEditMode = false;
                            if (!this._addEditNoteViewModel.isForDetailPane) {
                                this._addEditNoteViewModel.dispose();
                            }
                        }
                        this.createAddEditViewModelForDetailPane();

                        this._raiseDetailVisibilityChanged();
                    });
                } else {
                    this._raiseDetailVisibilityChanged();
                }

                let titleDetail = "";
                if (this.note) {
                    titleDetail = this.note.Subject;
                }
            }

            this.calculateAccessRight();
            if (this._lastSelectedVm) {
                let previousSelectedVm: NoteItemViewModel;
                if (this.noteListVm.listVm) {
                    previousSelectedVm = <NoteItemViewModel>this.noteListVm.listVm.getEntityById(this._lastSelectedVm.originalEntity.Id);
                }
                if (previousSelectedVm) {
                    previousSelectedVm.noteActionViewModel.withInfo = true;
                }
            }
            this._lastSelectedVm = this.selectedNoteViewModel;
            if (!!this.selectedNoteViewModel) {
                this.$utility.Storage.Session.set("lastnoteselected", this.selectedNoteViewModel.originalEntity.Id);
                this.saveLastSelectedItem(this.selectedNoteViewModel.originalEntity.Id, this.selectedNoteViewModel.originalId);
            }
        }

        private itemsUpdatedHandler() {
            this.calculateAccessRight();
        }

        /**
        * Private method to close the detail of a note
        */
        private handlerGobackRequested() {
            if (this.isNoteDetailOpened)
                this.isNoteDetailOpened = false;
        }

        /**
        * This method selects an note from the notes list.  If the note to select is already selected, then it's unselected
        * @param id string The id of the note to select
        */
        public selectItem(id: string) {
            // If the element is already selected, then unselect it.
            if (this.selectedNoteViewModel && this.selectedNoteViewModel.originalId === id) {
                this._noteBaseListVm.listVm.selectEntity(null);
            } else {
                if (id !== ap.utility.UtilityHelper.createEmptyGuid()) {
                    this._noteBaseListVm.listVm.selectEntity(id);

                    if (this.$controllersManager.mainController.isSmartphone)
                        this.isNoteDetailOpened = true;
                }
            }
        }

        private updateNoteArchived(noteUpdated: ap.controllers.NoteBaseUpdatedEvent): void {
            let isAll = this.noteListVm.screenInfo.mainSearchInfo.getPredefinedFilterCriterions() === null;
            if (this.isNoteDetailOpened)
                this.isNoteDetailOpened = false;
            if (!isAll)
                this.noteDeleted(noteUpdated);
        }

        /**
        * This method will remove the deleted note from the list
        * @param noteUpdated : The NoteUpdatedEvent object which contains the deleted note
        **/
        private noteDeleted(noteUpdated: ap.controllers.NoteBaseUpdatedEvent): void {
            let currentSelectedIndex: number = -1;
            if (this.noteListVm.listVm.selectedViewModel &&
                this.noteListVm.listVm.selectedViewModel !== null &&
                this.noteListVm.listVm.selectedViewModel.originalEntity.Id === noteUpdated.notes[0].Id) {
                this.noteListVm.listVm.selectedViewModel.originalEntity.updateEntityPropsOnly(noteUpdated.notes[0]);
                currentSelectedIndex = this.noteListVm.listVm.selectedViewModel.index;
            }
            if (currentSelectedIndex > -1) {
                let newSelectItemId: string = null;
                for (let i = currentSelectedIndex + 1; i < this.noteListVm.listVm.sourceItems.length; i++) {
                    let item: ap.viewmodels.notes.NoteItemViewModel = <ap.viewmodels.notes.NoteItemViewModel>this.noteListVm.listVm.sourceItems[i];
                    if (item && !item.isRemoved && item.originalEntity && item.originalEntity !== null) {
                        newSelectItemId = item.originalId;
                        break;
                    }
                }
                if (newSelectItemId === null && currentSelectedIndex > 0) {
                    for (let i = currentSelectedIndex - 1; i >= 0; i--) {
                        let item: ap.viewmodels.notes.NoteItemViewModel = <ap.viewmodels.notes.NoteItemViewModel>this.noteListVm.listVm.sourceItems[i];
                        if (item && !item.isRemoved && item.originalEntity && item.originalEntity !== null) {
                            newSelectItemId = item.originalId;
                            break;
                        }
                    }
                }
                if (newSelectItemId !== null)
                    this.selectItem(newSelectItemId);
            }
        }

        /**
         * Handler method called when a new page of the list is loaded
         */
        private pageLoadedHandler(items: NoteItemViewModel[]) {
            if (!this.noteListVm.screenInfo) {
                return;
            }

            // let screenInfo = this.noteDetailVm.screenInfo;
            let screenInfo = this.noteListVm.screenInfo;

            // check the items
            if (screenInfo.checkedEntitiesId && screenInfo.checkedEntitiesId.length) {
                items.forEach((item: NoteItemViewModel, index: number, array: NoteItemViewModel[]) => {
                    if (screenInfo.checkedEntitiesId.indexOf(item.originalId) >= 0) {
                        item.defaultChecked = true;
                        // this.noteListVm.listVm.listidsChecked.push(item.id);
                    }
                });
                this.noteListVm.manageMultiActionsMode();
            }

            // select the item
            if (screenInfo.selectedEntityId && this._isForNoteModule) {
                if (!this.selectedNoteViewModel || this.selectedNoteViewModel.originalEntity.Id !== screenInfo.selectedEntityId) {
                    this.selectItem(screenInfo.selectedEntityId);
                }
            }

            // open the detail pane
            if (screenInfo.isInfoOpened && !this.isNoteDetailOpened) {
                // This will restore an attachment preview as well
                this.isNoteDetailOpened = true;
            }
        }

        /**
         * This method is used to keep the last selected item and then used to reselect this item
         * @param itemId The id of the last selected note
         */
        private saveLastSelectedItem(itemId: string, commentId: string) {
            this.$utility.Storage.Session.set("lastnoteselected", itemId);
            this.$utility.Storage.Session.set("lastcommentselected", commentId);

            this.noteListVm.screenInfo.selectedEntityId = itemId;
        }

        public widthChangedHandler(value: number) {
            this.$utility.Storage.Local.set("notedetailpanewidth", value);
            this._paneWidth = value;
        }

        /**
         * Disposes the ViewModel
         */
        public dispose() {
            if (this._noteDetailBaseVm) {
                this._noteDetailBaseVm.dispose();
                this._noteDetailBaseVm = null;
            }
            if (this._addEditNoteViewModel) {
                this._addEditNoteViewModel.dispose();
                this._addEditNoteViewModel = null;
            }
            if (this._noteBaseListVm) {
                this._noteBaseListVm.dispose();
                this._noteBaseListVm = null;
            }

            this.$mdDialog.cancel();

            this.$controllersManager.uiStateController.off("mainflowstatechanged", this.currentProjectChangedHandler, this);

            this.$controllersManager.mainController.off("gobackrequested", this.handlerGobackRequested, this);
            this.$controllersManager.noteController.off("notearchived", this.updateNoteArchived, this);
            this.$controllersManager.noteController.off("noteunarchived", this.updateNoteArchived, this);
            this.$controllersManager.noteController.off("notedeleted", this.noteDeleted, this);
            this.$controllersManager.noteController.off("noteadded", this.noteAddedHandler, this);
            this.$controllersManager.noteController.off("commentsaved", this.notecommentSavedHandler, this);
            this.$controllersManager.noteController.off("editnoterequest", this._editNote, this);
            this.$controllersManager.noteController.off("assignnoterequest", this._assignNote, this);
            this.$controllersManager.noteController.off("infonoterequest", this.infoNote, this);
            this.$controllersManager.noteController.off("copytonoterequest", this._copyToNote, this);
            this.$controllersManager.noteController.off("copynoterequest", this._copyNote, this);
            this.$controllersManager.noteController.off("movetonoterequest", this._moveNote, this);
            this.$controllersManager.noteController.off("adddocumentrequest", this.handleAddDocumentRequest, this);
            this.$controllersManager.noteController.off("importdocumentrequest", this.handleImportDocumentRequest, this);
            this.$controllersManager.noteController.off("viewmoveto", this.moveToViewHandler, this);
            this.$controllersManager.noteController.off("noteupdated", this.noteUpdatedHandler, this);

            this.$api.off("showdetailbusy", this.changeVisibleDetailPaneBusy, this);

            if (this._listener) {
                this._listener.clear();
                this._listener = null;
            }
        }

        /**
         * Returns the Id of the first noteInCharge
         * @param note The Note entity to lok for noteInCharge
         */
        private getNoteInChargeNoteId(note: models.notes.Note): string {
            if (note && note.NoteInCharge && note.NoteInCharge.length) {
                return note.NoteInCharge[0].Id + "2";
            }

            return "";
        }

        /**
         * Returns the Id of the first NoteComment sorted descending on the lastModificationDate property
         * @param note The Note entity to look for NoteComment
         */
        private getCommentNoteId(note: models.notes.Note): string {
            if (note && note.Comments && note.Comments.length) {
                let sortedComments = note.Comments.sort((commentA: models.notes.NoteComment, commentB: models.notes.NoteComment) => {
                    if (commentA.LastModificationDate < commentB.LastModificationDate) {
                        return 1;
                    } else if (commentA.LastModificationDate > commentB.LastModificationDate) {
                        return -1;
                    }

                    return 0;
                });

                return sortedComments[0].Id + "0";
            }

            return "";
        }

        /**
         * Create an IdInfo object based on a Note entity
         * @param note The Note entity used to create the IdInfo
         */
        private createIdInfo(note: models.notes.Note): NoteIdInfo {
            let id: string = note.Id;
            let inChargeId: string = this.getNoteInChargeNoteId(note);
            let commentId: string = this.getCommentNoteId(note);

            return new NoteIdInfo(id, inChargeId, commentId);
        }

        /**
        * Returns a UserCommentId usefull to select a specific note in the list
        */
        private getUserCommentIdToSelect(idInfo: NoteIdInfo): string {

            if (this.noteListVm.listVm.groupDescription === NoteGroupType[NoteGroupType.InCharge].toLowerCase()) {

                // if the group is by users in charge, the ids of the list are ids of UserInCharge
                if (!StringHelper.isNullOrEmpty(idInfo.inChargeId)) {
                    return idInfo.inChargeId;
                } else {
                    return idInfo.noteId;
                }
            } else if (this.noteListVm.listVm.groupDescription === NoteGroupType[NoteGroupType.None].toLowerCase()) {
                // if there is no group, we take the id of the note
                return idInfo.noteId;
            } else {
                // the other cases, use the NoteComment Id
                return idInfo.commentId;
            }
        }

        /**
         * Initialize the view
         */
        private initView() {
            this._noteBaseListVm = new NoteListViewModel(this.$scope, this.$utility, this.$api, this.$controllersManager, this.$q, this.$servicesManager, this.$timeout, this.$mdDialog, this._isForNoteModule);
            this.noteListVm.listVm.on("selectedItemChanged", this.selectedNoteChanged, this);
            this.noteListVm.listVm.on("itemsUpdated", this.itemsUpdatedHandler, this);
            this.noteListVm.on("beginloaddata", this.noteListVmBeginLoadData, this);

            if (this.noteListVm.screenInfo) {
                this.noteListVm.screenInfo.on("actionclicked", this.noteListActionClickedHandler, this);
                this.noteListVm.screenInfo.selectedEntityId = this.$utility.Storage.Session.get("lastnoteselected");
                this.noteListVm.screenInfo.isInfoOpened = this.$utility.Storage.Session.get("isnotedetailopened");
            }
            this._noteDetailBaseVm = new ap.viewmodels.notes.NoteDetailViewModel(this.$utility, this.$mdDialog, this.$q, this.$api, this.$controllersManager, this.$servicesManager, null, this.$location, this.$anchorScroll, this.$interval, this._isForNoteModule);
            this.noteDetailVm.on("nomoreattachement", this.updateItemAttachement, this);
            if (this.noteDetailVm.screenInfo && this.noteDetailVm.screenInfo.actions) {
                this.noteDetailVm.screenInfo.on("actionclicked", this.noteListActionClickedHandler, this);
                this.noteDetailVm.screenInfo.actions = this.noteListVm.screenInfo.actions;
            }
            this.noteDetailVm.on("propertychanged", this.noteDetailVmPropertyChanged, this);
            this.noteDetailVm.on("filesdropped", this.detailFileDroppedHandler, this);

            this._addEditNoteViewModel = new ap.viewmodels.notes.AddEditNoteViewModel(this.$utility, this.$mdDialog, this.$q, this.$api, this.$timeout, this.$scope, this.$controllersManager, this.$servicesManager, this.noteDetailVm, this.document, this._isForNoteModule, true, true);
            this._addEditNoteViewModel.on("relatedentitycreationrequest", this.relatedEntityCreationRequestHandler, this);
            if (this._isForNoteModule) {
                this.$controllersManager.uiStateController.updateScreenInfo(this.noteListVm.screenInfo);
                this.$controllersManager.mainController.initScreen(this.noteListVm.screenInfo);
                this.$controllersManager.uiStateController.updateScreenInfo(this.noteDetailVm.screenInfo);

                let idInfo: NoteIdInfo = null;
                if (this.noteDetailVm.screenInfo.selectedEntityId && !this.noteDetailVm.screenInfo.selectedEntity) {
                    // it means the detail pane needs to be opened
                    this.noteListVm.screenInfo.selectedEntityId = this.noteDetailVm.screenInfo.selectedEntityId;
                    this.noteListVm.screenInfo.isInfoOpened = true;
                } else if (this.noteDetailVm.screenInfo.selectedEntity) {
                    // there is a selected entity in the screenInfi -> coming from a link
                    idInfo = this.createIdInfo(<models.notes.Note>this.noteDetailVm.screenInfo.selectedEntity);
                    this.noteListVm.screenInfo.selectedEntityId = this.getUserCommentIdToSelect(idInfo);
                    this.noteListVm.screenInfo.isInfoOpened = true;
                }

                this.noteListVm.listVm.on("pageloaded", this.pageLoadedHandler, this);

                if (this.noteListVm.screenInfo.mainSearchInfo.criterions.length === 0) { // If not default criterions defined, the default one should be the active points
                    this.noteListVm.screenInfo.mainSearchInfo.addCriterion(this.noteListVm.screenInfo.mainSearchInfo.predefinedFilters[0]);
                }

                if (this.$controllersManager.mainController.currentProject()) {
                    let paramValue: string = this.$controllersManager.mainController.currentMeeting === null ? "projects" : "lists";
                    this.$servicesManager.toolService.sendEvent("cli-menu-open points", new Dictionary([new KeyValue("cli-menu-open points-screenname", paramValue)]));
                    this.noteListVm.restoreCheckedListIds();

                    let cumulIOInfo: dashboard.CumulIOInfo = this.getCumulIOFilter();
                    if (cumulIOInfo.isCumulIoDrillDown) {
                        this.noteListVm.loadData(this.noteListVm.screenInfo.selectedEntityId, cumulIOInfo);
                    } else {
                        this.noteListVm.loadData(this.noteListVm.screenInfo.selectedEntityId, idInfo);
                    }
                }
            }

            if (this.$utility.Storage.Local.get("notedetailpanewidth")) {
                this._paneWidth = this.$utility.Storage.Local.get("notedetailpanewidth");
            }

            if (!!this.noteListVm && this.noteListVm.screenInfo) {
                this.noteListVm.screenInfo.on("addactionclicked", this.handleAddActionEvents, this);
                if (this.noteListVm.screenInfo.mainSearchInfo) {
                    this.noteListVm.screenInfo.mainSearchInfo.on("criterionschanged", this._mainSearchChanged, this);
                }
            }

            this.noteListVm.updateHasActiveNotes();

            this._isNoteDetailOpened = false;
            this._isEditMode = false;
        }

        /**
         * Public getter is used to get instance of NoteColumnViewModel
         */
        public get noteColumnViewModel(): ap.viewmodels.notes.NoteColumnViewModel {
            return this._noteColumnViewModel;
        }

        private moveToViewHandler(noteId: string) {
            this.noteListVm.screenInfo.selectedEntityId = noteId;
            this.noteListVm.screenInfo.isInfoOpened = true;
        }

        /**
         * This method use for init AddEditNoteViewModel for right pane of point
         * @param isFirstInitVm
         */
        private createAddEditViewModelForDetailPane(isFirstInitVm: boolean = false, detail: NoteDetailViewModel = null, isForCopy: boolean = false) {
            let noteDetail: NoteDetailViewModel;
            if (detail !== null) {
                noteDetail = detail;
            } else {
                noteDetail = this.noteDetailVm;
            }
            this._addEditNoteViewModel = new ap.viewmodels.notes.AddEditNoteViewModel(this.$utility, this.$mdDialog, this.$q, this.$api, this.$timeout, this.$scope, this.$controllersManager, this.$servicesManager, noteDetail, this.document, this.isForNoteModule, true, isFirstInitVm, isForCopy);
            this._addEditNoteViewModel.on("relatedentitycreationrequest", this.relatedEntityCreationRequestHandler, this);
        }

        /**
         * This method should show a modal dialog that will allow a user to edit rooms of the project
         * @param addEditNoteViewModel Note edit popup's viewmodel instance
         */
        protected openRoomsConfig(addEditNoteViewModel: ap.viewmodels.notes.AddEditNoteViewModel) {
            let roomConfigVm = new ap.viewmodels.projects.ProjectRoomConfigViewModel(this.$utility, this.$q, this.$mdDialog, this.$api, this.$controllersManager, this.$servicesManager, this.$timeout);
            roomConfigVm.load();
            let configureController = ($scope: angular.IScope, $mdDialog: angular.material.IDialogService) => {
                $scope["roomsConfigure"] = roomConfigVm;
            };
            configureController.$inject = ["$scope", "$mdDialog"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: "me/Project?name=AddNewRoomDialog",
                fullscreen: true,
                controller: configureController
            }).then((selectedSubCell: ap.viewmodels.projects.SubCellViewModel) => {
                addEditNoteViewModel.roomSelectorViewModel.searchedText = null;
                if (selectedSubCell) {
                    let subCellId = selectedSubCell.originalEntity.Id;
                    roomConfigVm.dispose();
                    addEditNoteViewModel.roomSelectorViewModel.selectRoomById(subCellId).then(() => {
                        if (!addEditNoteViewModel.isForDetailPane) {
                            this.showAddEditDialog(addEditNoteViewModel, null, null, "Cell", true);
                        } else {
                            addEditNoteViewModel.save();
                        }
                    }, () => {
                        if (!addEditNoteViewModel.isForDetailPane) {
                            this.showAddEditDialog(addEditNoteViewModel, null, null, "Cell", true);
                        }
                    });
                } else {
                    roomConfigVm.dispose();
                    let oldCell = addEditNoteViewModel.noteDetailViewModel.note.Cell;
                    addEditNoteViewModel.roomSelectorViewModel.selectRoomById(oldCell ? oldCell.Id : null);
                    if (!addEditNoteViewModel.isForDetailPane) {
                        this.showAddEditDialog(addEditNoteViewModel, null, null, "Cell", true);
                    }
                }
            }, () => {
                roomConfigVm.dispose();
                let oldCell = addEditNoteViewModel.noteDetailViewModel.note.Cell;
                addEditNoteViewModel.roomSelectorViewModel.selectRoomById(oldCell ? oldCell.Id : null).finally(() => {
                    if (!addEditNoteViewModel.isForDetailPane) {
                        this.showAddEditDialog(addEditNoteViewModel, null, null, "Cell", true);
                    }
                });
            });
        }

        /**
         * Handle related entity creation event
         * @param addResponse Edit popup response enum
         */
        private relatedEntityCreationRequestHandler(addResponse: ap.viewmodels.notes.AddEditResponse) {
            switch (addResponse) {
                case viewmodels.notes.AddEditResponse.CreateCategory:
                    this.openCategoriesConfig(this._addEditNoteViewModel);
                    break;
                case viewmodels.notes.AddEditResponse.CreateRoom:
                    this.openRoomsConfig(this._addEditNoteViewModel);
                    break;
                case viewmodels.notes.AddEditResponse.CreateMeeting:
                    this.noteListVm.openCreateNewMeetingDialog().then((newMeetingId: string) => {
                        if (this._addEditNoteViewModel.isForDetailPane) {
                            this._addEditNoteViewModel.meetingSelector.selectMeetingById(newMeetingId).then(() => {
                                this._addEditNoteViewModel.save();
                            });
                        }
                    }, () => {
                        let oldMeeting = this._addEditNoteViewModel.noteDetailBaseViewModel.meeting;
                        if (!!oldMeeting) {
                            this._addEditNoteViewModel.meetingSelector.selectMeetingById(oldMeeting.Id);
                        }
                    });
                    break;
            }
        }

        private changeVisibleDetailPaneBusy(showBusy: boolean) {
            this._showDetailPaneBusy = showBusy;
        }

        /**
        * When the noteWorkspace is opened, the URL may contains 'fromcumulio' which means that the user has clicked on a dashboard
        * Therefore we have to apply a filter to the list corresponding to the part of the chart which was clicked
        *   category = id of the issuetype OR 
        *   category = OverTime | On time | No due date
        *   statusid = id of the status
        *   isarchived = true | false
        */
        private getCumulIOFilter(): viewmodels.dashboard.CumulIOInfo {
            let issueType: string = this.$utility.UrlTool.getParam("categoryid");
            let status: string = this.$utility.UrlTool.getParam("statusid");
            let dueDate: string = this.$utility.UrlTool.getParam("duedate");
            let isArchived: string = this.$utility.UrlTool.getParam("isarchived");

            return new dashboard.CumulIOInfo(dueDate, issueType, status, isArchived ? isArchived.toLowerCase() === "true" : null);
        }

        static $inject = ["$scope", "$mdSidenav", "Utility", "Api", "$q", "$mdDialog", "$timeout", "$location", "$anchorScroll", "$interval", "ControllersManager", "ServicesManager", "$mdPanel"];
        constructor(scope: ng.IScope, mdSidenav: angular.material.ISidenavService, utility: ap.utility.UtilityHelper, api: ap.services.apiHelper.Api, q: angular.IQService, mdDialog: angular.material.IDialogService,
            timeout: angular.ITimeoutService, location: angular.ILocationService, anchorScroll: angular.IAnchorScrollService, interval: angular.IIntervalService, controllersManager: ap.controllers.ControllersManager,
            servicesManager: ap.services.ServicesManager, mdPanel?: any, isForNoteModule: boolean = true) { /*mdPanel*/
            super(scope, mdSidenav, utility, api, q, mdDialog, timeout, location, anchorScroll, interval, controllersManager, servicesManager, mdPanel, isForNoteModule);
            this.$controllersManager.mainController.on("gobackrequested", this.handlerGobackRequested, this);
            this.$controllersManager.noteController.on("editnoterequest", this._editNote, this);
            this.$controllersManager.noteController.on("notearchived", this.updateNoteArchived, this);
            this.$controllersManager.noteController.on("noteunarchived", this.updateNoteArchived, this);
            this.$controllersManager.noteController.on("notedeleted", this.noteDeleted, this);
            this.$controllersManager.noteController.on("noteadded", this.noteAddedHandler, this);
            this.$controllersManager.noteController.on("commentsaved", this.notecommentSavedHandler, this);
            this.$controllersManager.noteController.on("assignnoterequest", this._assignNote, this);
            this.$controllersManager.noteController.on("infonoterequest", this.infoNote, this);
            this.$controllersManager.noteController.on("copytonoterequest", this._copyToNote, this);
            this.$controllersManager.noteController.on("copynoterequest", this._copyNote, this);
            this.$controllersManager.noteController.on("movetonoterequest", this._moveNote, this);
            this.$controllersManager.noteController.on("adddocumentrequest", this.handleAddDocumentRequest, this);
            this.$controllersManager.noteController.on("importdocumentrequest", this.handleImportDocumentRequest, this);
            this.$controllersManager.noteController.on("viewmoveto", this.moveToViewHandler, this);
            this.$controllersManager.noteController.on("noteupdated", this.noteUpdatedHandler, this);

            this._listener = this.$utility.EventTool.implementsListener(["noteopened"]);
            if (this.$controllersManager.mainController.currentProject() && this.$controllersManager.mainController.currentMeeting !== undefined)
                this.initView();
            else {
                this.$controllersManager.uiStateController.on("mainflowstatechanged", this.currentProjectChangedHandler, this);
            }

            // Load the meeting accessright and check actions
            if (this.$controllersManager.mainController.currentMeeting !== null && this.$controllersManager.mainController.currentMeeting !== undefined) {
                this.$controllersManager.accessRightController.getMeetingAccessRight(this.$controllersManager.mainController.currentMeeting.Id).then((meetingAccessRight: ap.models.accessRights.MeetingAccessRight) => {
                    this._meetingAccessRight = meetingAccessRight;
                    this.calculateAccessRight();
                });
            }
            this.$scope.$on("$destroy", () => {
                this.dispose();
            });

            this._noteColumnViewModel = new ap.viewmodels.notes.NoteColumnViewModel(this.$utility);
            let columnNames = ["Status", "Number", "Punchlist", "Subject", "Room", "CreationDate", "DueDate", "InCharge", "Author", "Meeting", "Attachment"];
            this._columnsIndexes = new ap.misc.ColumnsIndexes(this.$utility, "notes", columnNames);
            this.$api.on("showdetailbusy", this.changeVisibleDetailPaneBusy, this);
        }

        private _canSavePoint: boolean = true;
        private _isNoteDetailOpened: boolean = false;
        private _isEditMode: boolean;
        private _filesToUpload: File[] = null;
        private _meetingAccessRight: accessRights.MeetingAccessRight = null;
        private _dialogOpening: boolean = false; // AP-12764
        private _listener: ap.utility.IListenerBuilder;
        private _lastSelectedVm: NoteItemViewModel;
        private _addEditNoteViewModel: ap.viewmodels.notes.AddEditNoteViewModel;
        private _noteDocumentRestored: boolean = false;
        private _noteListScreenFullName: string;
        private _noteDetailScreenFullName: string;

        /**
        * To know the id of the document if we are in the document module
        **/
        private _document: ap.models.documents.Document;
        /**
        * To know that the refresh of the note list was invoke by the user action
        **/
        private _isRefreshing: boolean = false;
        /**
        * To keep the last added comment for a note to reselect this note because the new added comment will be included in the new list ids
        **/
        private _notecommentAddedByNote: Dictionary<string, string> = new Dictionary<string, string>();

        private _noteColumnViewModel: ap.viewmodels.notes.NoteColumnViewModel;
        private _downloadQueuePanel: any = null;
        private _columnsIndexes: ap.misc.ColumnsIndexes;
        private _paneWidth: number;

        private _showDetailPaneBusy: boolean = false;
    }
}