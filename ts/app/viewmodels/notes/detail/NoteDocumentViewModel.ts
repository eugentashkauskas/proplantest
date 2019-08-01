module ap.viewmodels.notes {
    export class NoteDocumentViewModel extends EntityViewModel {

        public isShowMetaData: boolean;

        public get note(): ap.models.notes.Note {
            return <ap.models.notes.Note>this._parentEntity;
        }

        public get noteAccessRight(): ap.models.accessRights.NoteAccessRight {
            return this._noteAccessRight;
        }

        /**
         * A list of actions for the attachment
         */
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            if (this._actionsVm) {
                return this._actionsVm.actions;
            }
            return [];
        }

        /**
        * Use to get only visible actions of the attachement
        **/
        public get visibleActions(): ap.viewmodels.home.ActionViewModel[] {
            this._actionsVm.canPreview = this.canPreview && this._documentViewModel.isProcessedSuccess;
            return this._actionsVm ? this._actionsVm.visibleActions : [];
        }

        public get canDelete(): boolean {
            return this._canDelete;
        }

        public get canDownload(): boolean {
            return this._canDownload;
        }

        /**
        * Getter on the propreties isDisplayedInPictureViewer
        **/
        public get isDisplayedInPictureViewer(): boolean {
            return this._isDisplayedInPictureViewer;
        }

        /**
        * Setter on the propreties isDisplayedInPictureViewer
        **/
        public set isDisplayedInPictureViewer(b: boolean) {
            if (this._isDisplayedInPictureViewer !== b) {
                let oldValue = this._isDisplayedInPictureViewer;
                this._isDisplayedInPictureViewer = b;
                this.checkPictureVmEditMode();
                if (this._actionsVm) {
                    this._actionsVm.isPreviewMode = this._isDisplayedInPictureViewer;
                }
                this.raisePropertyChanged("isDisplayedInPictureViewer", oldValue, this);
            }
        }

        /**
         * This property is to know if the user can makes a preview of the document. Sometimes, there is no document linked to the attachment then, in this case, it is not possible to make a preview
         **/
        public get canPreview(): boolean {
            return this._canPreview;
        }

        /**
         * This property is to know if there are some drawings on the linked document
         **/
        public get hasDrawings(): boolean {
            return this._hasDrawings;
        }

        public get pictureViewModel(): ap.viewmodels.documents.PictureViewModel {
            return this._pictureViewModel;
        }

        public get documentVm(): ap.viewmodels.documents.DocumentViewModel {
            return this._documentViewModel;
        }

        public get noteDocument(): ap.models.notes.NoteDocument {
            return <ap.models.notes.NoteDocument>this.originalEntity;
        }

        public copySource() {
            super.copySource();
            if (this.noteDocument !== null) {
                this._noteAccessRight = new ap.models.accessRights.NoteAccessRight(this.$utility, this.note);

                this._hasDrawings = this.noteDocument && this.noteDocument.Drawings && this.noteDocument.Drawings.length > 0;
                this._documentViewModel = new ap.viewmodels.documents.DocumentViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager);
                this._documentViewModel.on("savedrawingsrequested", this.saveDrawingsRequested, this);
                this._documentViewModel.init(this.noteDocument ? this.noteDocument.Document : null, this.noteDocument);
                let currentProject = this.$controllersManager.mainController.currentProject();
                this.checkCanDownload();
                this.checkCanDelete();
                if (this.noteDocument.Document)
                    this._canPreview = true;
                else
                    this._canPreview = false;
            }
            else {
                this.initData();
            }

            this.buildActions();
            this.buildPictureViewModel();
            this.checkCanDrawOnDoc();
            this.checkPictureVmEditMode();
        }

        private initData() {
            this._noteAccessRight = null;

            this._documentViewModel = null;
            this._hasDrawings = false;
            this._canDelete = false;
            this._canDownload = false;
            this._canPreview = false;
        }

        /**
         * This method call saveDrawings if noteDocument id as the same id of the current Vm
         **/
        private saveDrawingsRequested(saveDrawingRequestedEvent: ap.viewmodels.documents.SaveDrawingsRequestedEvent) {
            if (saveDrawingRequestedEvent.noteDocument.Id === this.noteDocument.Id) {
                this.$controllersManager.noteController.saveDrawings(this.note, saveDrawingRequestedEvent.noteDocument).then((resNoteDoc: ap.models.notes.NoteDocument) => {
                    saveDrawingRequestedEvent.successCallback(resNoteDoc);
                }, (err) => {
                    saveDrawingRequestedEvent.errorCallback(err);
                });
            }
        }

        /**
         * This method will check if the current user can delete the linked document of the note
         **/
        private checkCanDelete(): void {
            this._canDelete = !!this.noteAccessRight && this.noteAccessRight.checkCanDeleteDoc(this.noteDocument);
            if (this._actionsVm) {
                this._actionsVm.canDelete = this._canDelete;
            }
        }

        /**
         * This method will check if the current user can download the linked document
         **/
        private checkCanDownload(): void {
            this._canDownload = this._documentViewModel && this._documentViewModel.document &&
                this._documentViewModel.document.Status !== ap.models.documents.DocumentStatus.NotUploaded &&
                this.$controllersManager.mainController.currentProject() && this.$controllersManager.mainController.currentProject().UserAccessRight.CanDownloadDoc;
            if (this._actionsVm) {
                this._actionsVm.canDownload = this._canDownload;
            }
        }

        /**
         * This method will create the picture view model on which drawings could be created. 
         * It will concats all drawing's shapes to specify them in the picture view model.
         **/
        private buildPictureViewModel() {
            let minPageIndex = 999999;
            if (this.noteDocument && this.noteDocument.Drawings) {
                let drawing: ap.models.notes.Drawing;

                for (let i = 0; i < this.noteDocument.Drawings.length; i++) {
                    drawing = this.noteDocument.Drawings[i];
                    if (drawing.PageIndex < minPageIndex) // we want to display the first page having drawing
                        minPageIndex = drawing.PageIndex;
                }
            }
            if (minPageIndex === 999999)
                minPageIndex = 0;
            this._documentViewModel.pageIndex = minPageIndex;
            this._pictureViewModel = new ap.viewmodels.documents.PictureViewModel(this.$utility, this.$controllersManager, this._documentViewModel);
            this._pictureViewModel.on("closerequested", this.closePictureViewerHandler, this);
        }

        private closePictureViewerHandler() {
            this._listener.raise("documentclosed", this);
        }

        private buildActions() {
            if (!this._actionsVm) {
                this._actionsVm = new ap.viewmodels.notes.NoteDocumentActionsViewModel(this.$utility, this.documentVm.document, this.$controllersManager.documentController, this.$controllersManager.mainController);
            }
            this._actionsVm.canPreview = this.canPreview && this._documentViewModel.isProcessedSuccess;
            this._actionsVm.canDownload = this.canDownload;
            this._actionsVm.canDelete = this.canDelete;
        }

        /**
         * This function is used to specify that one action has been clicked. Then, it raised the corresponding event. If the event name is not found then, a exception is thrown
         * @param name this is the name of the event. 
         **/
        public actionClick(name: string) {
            let action = ap.viewmodels.home.ActionViewModel.getAction(this.actions, name);
            if (!action) {
                throw new Error("The action " + name + " is not available");
            }
            switch (name) {
                case "notedoc.preview":
                    if (action.isEnabled) {
                        this.$controllersManager.noteController.requestDocumentPreview(this);
                    }
                    break;
                case "notedoc.delete":
                    if (action.isEnabled) {
                        let message: string = this.$utility.Translator.getTranslation("app.notes.detachdocument_confirm_message").format(this.noteDocument.Document.Name);
                        this.$controllersManager.mainController.showConfirm(message, this.$utility.Translator.getTranslation("app.notes.detachdocument_confirm_title"), (confirm) => {
                                if (confirm === ap.controllers.MessageResult.Positive) {
                                    this._listener.raise("deleteclicked", this);
                                }
                            }, true /*isMultilines*/);
                    }
                    break;
                case "notedoc.download":
                    if (action.isEnabled) {
                        this._listener.raise("downloadclicked", this);
                    }
                    break;
            }
        }

        /**
        * Method use to know if the user can draw something on the document
        **/
        private checkCanDrawOnDoc() {
            if (this.noteAccessRight && (this.noteAccessRight.canEditEntirePoint ||
                (this.noteAccessRight.canAddComment && (this.noteAccessRight.canUploadDoc || this.noteAccessRight.canImportDoc) && (this.noteDocument.EntityCreationUser === this.$utility.UserContext.CurrentUser().Id)))) {
                this._pictureViewModel.hasEditAccess = true;
            } else {
                this._pictureViewModel.hasEditAccess = false;
            }
        }

        /**
        * Method use to know if the user can draw something on the document
        **/
        private checkPictureVmEditMode() {
            if (this.isDisplayedInPictureViewer && this._pictureViewModel.hasEditAccess) {
                this._pictureViewModel.isEditMode = true;
            } else {
                this._pictureViewModel.isEditMode = false;
            }
        }

        dispose() {
            super.dispose();
        }

        constructor($utility: ap.utility.UtilityHelper, private $q: angular.IQService, private $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager) {
            super($utility);
            this.initData();

            this._listener.addEventsName(["deleteclicked", "downloadclicked", "documentclosed"]);
        }

        private _canDownload: boolean;
        private _canDelete: boolean;
        private _canPreview: boolean;

        private _hasDrawings: boolean;
        private _documentViewModel: ap.viewmodels.documents.DocumentViewModel;
        private _pictureViewModel: ap.viewmodels.documents.PictureViewModel;
        private _isDisplayedInPictureViewer: boolean = false;
        private _actionsVm: ap.viewmodels.notes.NoteDocumentActionsViewModel;
        private _noteAccessRight: ap.models.accessRights.NoteAccessRight;
    }
}