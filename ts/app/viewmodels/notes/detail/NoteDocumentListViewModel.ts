module ap.viewmodels.notes {

    export class NoteDocumentListViewModel extends ListEntityViewModel implements IDispose {
        /**
         * This is the parent note detail view model containing the parent note of the list of attached documents
         **/
        public get noteViewModel(): NoteDetailBaseViewModel {
            return this._noteViewModel;
        }

        /**
         * This property is to know if the selected view model is shown in the pictureview or not
         **/
        public get isDisplayingPictureViewer(): boolean {
            let vm = <ap.viewmodels.notes.NoteDocumentViewModel>this.selectedViewModel;
            return !!vm ? vm.isDisplayedInPictureViewer : false;
        }

        public get noteDocumentsActions() {
            return this._noteDocumentsActions;
        }

        public set isDisplayingPictureViewer(value: boolean) {
            let selectedVm = <ap.viewmodels.notes.NoteDocumentViewModel>this.selectedViewModel;
            if (value === true && selectedVm && selectedVm.canPreview) {
                let documentPreviewScreenInfo = selectedVm.pictureViewModel.documentViewModel.screenInfo;
                this.$controllersManager.uiStateController.updateScreenInfo(documentPreviewScreenInfo);
                let found: boolean = false;
                this.$controllersManager.mainController.currentVisibleScreens.forEach((screen) => {
                    if (screen.screen.name === documentPreviewScreenInfo.name)
                        found = true;
                });
                if (!found) {
                    this._documentDisplayedScreenFullName = this.$controllersManager.mainController.addScreen(documentPreviewScreenInfo, false);
                }
            }
            if (selectedVm) {
                selectedVm.isDisplayedInPictureViewer = value;
            }
        }

        public set noteViewModel(noteVm: NoteDetailBaseViewModel) {
            this._nbUnprocessedDoc = 0;

            if (this._noteViewModel !== noteVm) {
                this.closePictureViewer();
                this._noteViewModel = noteVm;
            }

            if (this._noteViewModel) {
                this._note = this._noteViewModel.noteBase;
                this.manageActionsVisibility();
            } else {
                this._note = null;
            }

            this.clearRegisterRefresh();
            this.initCollection();
        }

        public dispose() {
            super.dispose();
            if (this.noteViewModel)
                this.noteViewModel.off("propertychanged", this.noteAccessRightChanged, this);
            this.$controllersManager.documentController.off("docdownloadsourcerequested", this.openDownloadDocumentPopup, this);
            this.$controllersManager.documentController.off("documentstatusrefreshed", this.updateStatusHandler, this);
            this.clearRegisterRefresh();
            if (this.$controllersManager.noteController) {
                this.$controllersManager.noteController.off("notedocumentuploaded", this.noteDocumentAddedHandler, this);
                this.$controllersManager.noteController.off("notedocumentadded", this.noteDocumentAddedHandler, this);
                this.$controllersManager.noteController.off("documentdeleted", this.documentDeleted, this);
            }
        }

        private clearRegisterRefresh() {
            if (this._note && this._note.NoteDocuments) {

                this._note.NoteDocuments.forEach((document) => {
                    this.$controllersManager.documentController.unregisterDocumentStatusRefresh(document.Document);
                });
            }
        }

        /**
        * This methode is used to call previewDocument() with the noteDocumentViewModel selected
        * @param noteDocVm is the NoteDocumentViewModel selected
        **/
        public openDocumentInPictureViewer(noteDocVm: NoteDocumentViewModel) {
            this.previewDocument(noteDocVm);
        }

        /**
         * This method is used to closed the picture viewer when a document is displayed in detailed. IF already closed, nothing happens
         **/
        public closePictureViewer() {
            if (this.isDisplayingPictureViewer) {
                if (this._documentDisplayedScreenFullName) {
                    this.$controllersManager.mainController.goBackToScreen(this._documentDisplayedScreenFullName);
                    this._documentDisplayedScreenFullName = undefined;
                }
                this.isDisplayingPictureViewer = false;
                this.$utility.Intercom.show();
            }
        }

        /**
         * nbUnprocessedDocument concerns the number of document not yet processed by the system (error means processed)
         **/
        get nbUnprocessedDocument(): number {
            return this._nbUnprocessedDoc;
        }

        /**
         * Actions click event handler
         * @param actionName Action name
         * @param actionArgs Action arguments - files to be uploaded
         */
        public actionClicked(actionName: string, actionArgs: File[]) {
            switch (actionName) {
                case "notedocument.import":
                    this.$controllersManager.noteController.requestImportDocument(this.noteViewModel.noteBase);
                    break;
                case "notedocument.upload":
                    this.noteViewModel.dropFiles(actionArgs);
                    break;
                default:
                    break;
            }

        }

        /**
         * This method is called when the event "documentstatusrefreshed" of document controller is raised to be checked if it concerns a document of the list to update the date of this document.
         * @param document the document for which the status has been refreshed
         **/
        private updateStatusHandler(document: ap.models.documents.Document) {
            for (let i = 0; i < this.sourceItems.length; i++) {
                let ndvm = <ap.viewmodels.notes.NoteDocumentViewModel>this.sourceItems[i];
                if (ndvm.noteDocument.Document && ndvm.noteDocument.Document.Id === document.Id) {
                    this.$controllersManager.documentController.getFullDocumentById(document.Id).then(() => {
                        ndvm.documentVm.init(ndvm.noteDocument.Document, ndvm.noteDocument);
                        this.calculateNbUnprocessedDoc();
                    });
                    break;
                }
            }
        }

        /**
      * Private handler method to opened the download document popup when the event 'docdownloadsourcerequested' is raised
      */
        private openDownloadDocumentPopup(data: ap.controllers.DocumentDownloadSourceEvent) {
            this.$controllersManager.mainController.showBusy();

            let downloadDocController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = new ap.viewmodels.documents.DownloadDocumentViewModel(data.document, data.version, this.$controllersManager.documentController, this.$mdDialog, this.$utility);
            };
            downloadDocController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Document&name=DownloadDocumentDialog",
                fullscreen: true,
                controller: downloadDocController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            });
        }

        /** 
          * This function is called when the event "notedocumentuploaded", "notedocumentadded" of note controller is raised. If the new note document uploaded concerns the note of this list then, the note document is added to the list
          * @param noteDocument the new notedocument uploaded
          **/
        private noteDocumentAddedHandler(noteDocument: ap.models.notes.NoteDocument) {
            if (this._note && noteDocument.Note.Id === this._note.Id && this.sourceItems) {
                // The api only return UploadedBy so need to set the Author of the new document
                noteDocument.Document.Author = noteDocument.Document.UploadedBy;
                let ndvm = new ap.viewmodels.notes.NoteDocumentViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager);
                this.registerDocumentViewModelEvent(ndvm);
                ndvm.init(noteDocument, this._note);
                ndvm.on("propertychanged", this.handleNoteDocumentPropertyChanged, this);
                this.$controllersManager.documentController.registerDocumentStatusRefresh(noteDocument.Document);
                this.sourceItems.push(ndvm);
                this.calculateNbUnprocessedDoc();
            }
        }

        /**
         * This function will calculate the number of documents not yet processed and then, set the property nbUnprocessedDoc
         **/
        private calculateNbUnprocessedDoc() {
            let nb = 0;
            if (this.sourceItems) {
                this.sourceItems.forEach((ndvm: ap.viewmodels.notes.NoteDocumentViewModel) => {
                    if (ndvm.documentVm && ndvm.documentVm.document) {
                        if (ndvm.documentVm.document.Status !== ap.models.documents.DocumentStatus.Processed && !ndvm.documentVm.document.Deleted)
                            nb++;
                    }
                });
            }
            this._nbUnprocessedDoc = nb;
        }

        /*
        * Event handler, this called when there is a document delete
        * @param document: deleted document
        */
        private documentDeleted(document: ap.models.notes.NoteDocument): void {
            if (this.sourceItems) {
                let toRemoveIndex: number = -1;

                for (let i = 0; i < this.sourceItems.length; i++) {
                    if ((<NoteDocumentViewModel>this.sourceItems[i]).noteDocument.Id === document.Id) {
                        toRemoveIndex = i;
                        break;
                    }
                }

                if (toRemoveIndex >= 0)
                    this.sourceItems.splice(toRemoveIndex, 1);

                this.calculateNbUnprocessedDoc();
            }
        }

        /**
         * Initialize the list with noteDocuments entities
         */
        private initCollection(): void {
            let items: ap.viewmodels.notes.NoteDocumentViewModel[] = [];

            if (this._note && this._note.NoteDocuments) {
                this._note.NoteDocuments.forEach((document: ap.models.notes.NoteDocument) => {
                    let documentVm: NoteDocumentViewModel = new NoteDocumentViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager);
                    this.registerDocumentViewModelEvent(documentVm);
                    if (document.Document) {
                        this.$controllersManager.documentController.registerDocumentStatusRefresh(document.Document);
                        if (document.Document.Status !== ap.models.documents.DocumentStatus.Processed)
                            this._nbUnprocessedDoc++;
                    }
                    documentVm.init(document, this._note);
                    documentVm.on("propertychanged", this.handleNoteDocumentPropertyChanged, this);

                    let previousVersion = <NoteDocumentViewModel>this.getEntityById(document.Id);
                    if (previousVersion && previousVersion.isDisplayedInPictureViewer) {
                        // Restore a state of the picture viewer if it was opened before
                        documentVm.isDisplayedInPictureViewer = true;
                    }

                    items.push(documentVm);
                });
            }

            if (this.sourceItems) {
                for (let i = 0; i < this.sourceItems.length; i++)
                    this.sourceItems[i].dispose();
            }

            this.onLoadItems(items, false);
        }

        protected _setSelectedViewModel(value: ap.viewmodels.notes.NoteDocumentViewModel) {
            if (this._selectedViewModel === value && this.sourceItems.indexOf(value) !== -1) {
                // This test may fail when a list of note documents is updated from the server side
                // If view models are the same, but they are not present in the list it means that
                // a list was updated from the server side. In this case a list may either contain
                // updated versions of old view models or completely new view models.
                return;
            }

            if (this._selectedViewModel) {
                this._selectedViewModel.isSelected = false;
            }

            this._selectedViewModel = null;

            if (!!value) {
                // It is possible that the given view model doesn't exist in  the list because
                // it was re-fetched from the server side. In this case we should find a respective
                // view model to select instead of the given one.
                let targetViewModel = this.getEntityById(value.originalEntity.Id);

                if (targetViewModel) {
                    this._selectedViewModel = targetViewModel;
                } else {
                    // This line is added in order to provide a backwards compatibility in case something in
                    // the code base relates on a default logic of view models selection defined in the
                    // BaseListEntityViewModel class
                    this._selectedViewModel = value;
                }

                this._selectedViewModel.isSelected = true;
            }

            this._listener.raise("selectedItemChanged", this._selectedViewModel);
        }

        /**
         * Handle note document property changed event, raise "previewdocument" event when document is opened/closed in the picture viewer
         * @param args Event arguments container object
         */
        private handleNoteDocumentPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            let noteDocVm = <NoteDocumentViewModel>args.caller;
            if (args.propertyName === "isDisplayedInPictureViewer") {
                this._listener.raise("previewdocument", noteDocVm);
            }
        }

        private previewDocument(noteDocVm: ap.viewmodels.notes.NoteDocumentViewModel) {
            if (noteDocVm.canPreview) {
                this._setSelectedViewModel(noteDocVm);
                this.isDisplayingPictureViewer = true;
                this.$utility.Intercom.hide();
            }
        }

        private downloadDocument(noteDocVm: ap.viewmodels.notes.NoteDocumentViewModel) {
            if (noteDocVm.canDownload) {
                this._setSelectedViewModel(noteDocVm);
                let version: ap.models.documents.Version;
                if (noteDocVm.documentVm.currentVersion instanceof ap.models.documents.Version)
                    version = <ap.models.documents.Version>noteDocVm.documentVm.currentVersion;

                this.$controllersManager.documentController.downloadDocument(noteDocVm.documentVm.document, version);
            }
        }

        private deletedDocument(noteDocVm: ap.viewmodels.notes.NoteDocumentViewModel) {
            if (noteDocVm.canDelete) {
                this.$controllersManager.noteController.deleteDocument(noteDocVm.noteDocument);
            }
        }


        private registerDocumentViewModelEvent(noteDocVm: NoteDocumentViewModel) {
            if (noteDocVm) {
                noteDocVm.on("documentclosed", this.closePictureViewer, this);
                noteDocVm.on("downloadclicked", this.downloadDocument, this);
                noteDocVm.on("deleteclicked", this.deletedDocument, this);
            }
        }

        /**
         * Recalculate actions visibility when note access rights have been changed
         * @param args Property change arguments
         */
        private noteAccessRightChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            if (this.noteViewModel && args.propertyName === "noteAccessRight") {
                this.manageActionsVisibility();
            }
        }

        /**
         * Manage list actions' visibility
         */
        private manageActionsVisibility() {
            if (this._noteViewModel.noteAccessRight) {
                if (this._uploadDocument) {
                    this._uploadDocument.isVisible = (<ap.models.accessRights.NoteAccessRight>this._noteViewModel.noteAccessRight).canUploadDoc;
                    this._uploadDocument.isEnabled = (<ap.models.accessRights.NoteAccessRight>this._noteViewModel.noteAccessRight).canUploadDoc;
                }
                if (this._importDocument) {
                    this._importDocument.isVisible = (<ap.models.accessRights.NoteAccessRight>this._noteViewModel.noteAccessRight).canImportDoc;
                    this._importDocument.isEnabled = (<ap.models.accessRights.NoteAccessRight>this._noteViewModel.noteAccessRight).canImportDoc;
                }
            }
        }

        constructor(utility: ap.utility.UtilityHelper, private $q: angular.IQService, private $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager, private $mdDialog: angular.material.IDialogService, noteVm?: ap.viewmodels.notes.NoteDetailBaseViewModel) {
            super(utility, "NoteDocument", null, null, null);
            this._listener.addEventsName(["previewdocument"]);

            this.$controllersManager.documentController.on("documentstatusrefreshed", this.updateStatusHandler, this);
            this.$controllersManager.documentController.on("docdownloadsourcerequested", this.openDownloadDocumentPopup, this);
            this.$controllersManager.noteController.on("notedocumentuploaded", this.noteDocumentAddedHandler, this);
            this.$controllersManager.noteController.on("notedocumentadded", this.noteDocumentAddedHandler, this);
            this.$controllersManager.noteController.on("documentdeleted", this.documentDeleted, this);

            this.noteViewModel = noteVm;
            this._uploadDocument = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "notedocument.upload", this.$utility.rootUrl + "Images/html/icons/ic_cloud_upload_black_48px.svg", false, null, "Upload documents", false, true);
            this._importDocument = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "notedocument.import", this.$utility.rootUrl + "Images/html/icons/ic_attach_file_black_48px.svg", false, null, "Import documents", false);
            this._noteDocumentsActions = [this._uploadDocument, this._importDocument];
            if (this.noteViewModel) {
                this.noteViewModel.on("propertychanged", this.noteAccessRightChanged, this);
                this.manageActionsVisibility();
            }
        }

        private _nbUnprocessedDoc: number;
        private _noteViewModel: NoteDetailBaseViewModel;
        private _note: ap.models.notes.NoteBase = null;
        private _documentDisplayedScreenFullName: string;
        private _noteDocumentsActions: ap.viewmodels.home.ActionViewModel[];
        private _uploadDocument: ap.viewmodels.home.ActionViewModel;
        private _importDocument: ap.viewmodels.home.ActionViewModel;
    }
}