module ap.viewmodels.documents {
    /**
    * Enum to know the status of Add document action
    *   - Save: Save ation make by the user
    *   - Cancel: Cancel action make by the user
    *   - RequestFolder: Request the folder to save the documents
    */
    export enum AddDocumentStatus {
        Save,
        Cancel,
        RequestFolder,
        ImportDropbox
    }

    /**
    * The object to keep the response of the add documents action
    **/
    export class AddNewDocumentResponse {
        /**
        * The list of files select by the user to add
        **/
        public get files(): File[] {
            return this._files;
        }

        public get documentsToImport() {
            return this._documentsToImport;
        }
        /**
        * To know the status of Add document action
        **/
        public get status(): AddDocumentStatus {
            return this._status;
        }

        constructor(files: File[], importDropboxDocuments: ap.models.cloud.CloudDocument[], status: AddDocumentStatus) {
            this._files = files;
            this._documentsToImport = importDropboxDocuments;
            this._status = status;
        }
        private _files: File[];
        private _documentsToImport: ap.models.cloud.CloudDocument[];
        private _status: AddDocumentStatus;
    }

    export class AddNewDocumentViewModel implements ap.utility.IListener, IDispose {

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
        * The list of document to upload make by the user
        **/
        public get newDocuments(): ap.misc.DocumentToUpload[] {
            return this._newDocuments;
        }

        /**
         * A result of documents saving
         */
        public get saveResult(): ap.controllers.DocumentsToUploadResult {
            return this._saveResult;
        }

        /**
        * The title of the dialog
        **/
        public get title(): string {
            return this._title;
        }

        /**
        * To know that can upload selected documents or not
        **/
        public get canSave(): boolean {
            return this._canSave;
        }

        /**
        * To know allow upload only immage files
        **/
        public get isOnlyPicture(): boolean {
            return this._onlyPicture;
        }

        /**
        * Return currently selected folder
        **/
        public get selectedFolder(): ap.models.projects.Folder {
            return this._folder;
        }

        /**
        * To check can save action or not
        **/
        private checkCanSave() {
            this._canSave = this._newDocuments && this._newDocuments !== null && this._newDocuments.length > 0;
        }

        dispose() {
            if (this._listener) {
                this._listener.clear();
                this._listener = null;
            }
            this.$utility.Translator.off("languagechanged", this.updatePopupTitle, this);
        }

        /**
        * This method is used to add the list of file selected by the user into the vm
        * @param files is the files selected by the user
        * @param folder is the aproplan folder selected by the user 
        **/
        public addFiles(files: File[], folder?: ap.models.projects.Folder) {
            if ((this._folder === undefined || this._folder === null) && folder)
                this._folder = folder;

            let invalidFiles: File[] = [];
            if (this._onlyPicture) {
                for (let i = 0; i < files.length; i++) {
                    if (!this.$utility.FileHelper.hasImageExtension(files[i].name)) {
                        invalidFiles.push(files[i]);
                    }
                }
                if (invalidFiles.length > 0) {
                    let filesName = invalidFiles.map(f => f.name).join(", ");
                    let msg = this.$utility.Translator.getTranslation("app.err.adddoc_wrong_extensionMsg_onlyPicture").format(filesName);
                    let title = this.$utility.Translator.getTranslation("app.err.adddoc_wrong_extensionTitle");
                    this._mainController.showError(msg, title, null, null);
                }
            }
            let validFiles: File[] = [];
            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                if (invalidFiles.indexOf(file) < 0)
                    validFiles.push(file);
            }
            if (validFiles.length > 0) {
                let currentFolder: ap.models.projects.Folder = null;
                if (folder && folder !== null)
                    currentFolder = folder;
                if (currentFolder === null)
                    currentFolder = this._folder;
                if (currentFolder !== undefined && currentFolder !== null) {
                    if (!this._newDocuments || this._newDocuments === null)
                        this._newDocuments = [];
                    for (let i = 0; i < validFiles.length; i++) {
                        let documentToUpload: ap.misc.DocumentToUpload = new ap.misc.DocumentToUpload(this.$utility, currentFolder, validFiles[i]);
                        this._newDocuments.push(documentToUpload);
                        this._documentController.uploadDocument(documentToUpload).then(null, (doc: ap.misc.DocumentToUpload) => {
                            if (doc.uploadFailError !== "CANCEL") {
                                let message = this.$utility.Translator.getTranslation("app.document.uploadfile_fail").format(doc.displayFileName);
                                let title = this.$utility.Translator.getTranslation("app.err.general_error");
                                this._mainController.showError(message, title, doc.uploadFailError, null);
                            }
                        });
                    }
                }
                else {
                    let addNewDocumentResponse: AddNewDocumentResponse = new AddNewDocumentResponse(validFiles, null, AddDocumentStatus.RequestFolder);
                    if (!this.isForMeetingMultiEdit) {
                        this.$mdDialog.hide(addNewDocumentResponse);
                    }
                }
            }
            this.checkCanSave();

        }

        /**
        * This method is used to cancel the uploading of the specified document
        * @param documentToUpload is the document need to cancel
        **/
        public cancelDocument(documentToUpload: ap.misc.DocumentToUpload) {
            let self = this;
            this._documentController.cancelUploadDocument(documentToUpload);
            if (self._newDocuments && self._newDocuments !== null) {
                let index = self._newDocuments.indexOf(documentToUpload);
                if (index >= 0) {
                    self._newDocuments.splice(index, 1);
                }
            }
            self.checkCanSave();
        }

        /**
        * This method is used to cancel the uploading of all documents
        **/
        public cancel() {
            let self = this;
            if (self._newDocuments && self._newDocuments !== null && self._newDocuments.length > 0) {
                let numberDocument = self._newDocuments.length;
                for (let i = 0; i < self._newDocuments.length; i++) {
                    self._documentController.cancelUploadDocument(self._newDocuments[i]).then(() => {
                        numberDocument--;
                        if (numberDocument === 0) {
                            self.$mdDialog.hide(AddDocumentStatus.Cancel);
                        }
                    });
                }
            }
            else {
                self.$mdDialog.hide(AddDocumentStatus.Cancel);
            }

        }
        /**
        * This method is used to save the files selected by the use into aproplan
        **/
        public save(): angular.IPromise<ap.controllers.DocumentsToUploadResult> {
            if (this._isSaving) return;
            this._isSaving = true;

            if (!this.canSave)
                throw new Error("Cannot call save when canSave = false");

            return this._documentController.saveDocumentToUpload(this.newDocuments).then((saveResult: ap.controllers.DocumentsToUploadResult) => {
                this._saveResult = saveResult;
                if (!this.isForMeetingMultiEdit) {
                    this.$mdDialog.hide(AddDocumentStatus.Save);
                }
                this._isSaving = false;
                return saveResult;
            });
        }

        /**
         * Show popup with select dropbox account
         */
        private showDropboxView() {
            let dropBoxVm = new ap.viewmodels.cloud.DropboxViewModel(this.$utility, this.interval, this.cloudService);
            dropBoxVm.on("importdocumentsrequested", this.requestImportDropboxDocumentsHandler, this);

            let dropboxController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["dropboxViewModel"] = dropBoxVm;
                $scope.$on("$destroy", () => {
                    dropBoxVm.dispose();
                });
                $scope["hideModal"] = this.$mdDialog.hide;
            };
            dropboxController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Cloud&name=DropboxView",
                fullscreen: false,
                controller: dropboxController
            });
        }

        /**
         * Save documents imported from dropbox if folder was selected, otherwise open folder selection dialog
         * @param documentsToImport Documents to import from dropbox
         */
        private requestImportDropboxDocumentsHandler(documentsToImport: ap.models.cloud.CloudDocument[]) {
            if (documentsToImport) {
                let importDropboxResponse = new AddNewDocumentResponse(null, documentsToImport, this._folder ? AddDocumentStatus.ImportDropbox : AddDocumentStatus.RequestFolder);
                this._listener.raise("importdropboxprocessed", importDropboxResponse);
            }
        }

        private updatePopupTitle() {
            if (this._onlyPicture) {
                this._title = (!this._meetingTitle) ? this.$utility.Translator.getTranslation("app.document.upload_picture_title").format(this._mainController.currentProject().Name) : this.$utility.Translator.getTranslation("app.document.upload_picture_title_with_meetitng").format(this._mainController.currentProject().Name, this._meetingTitle);
            } else {
                this._title = (!this._meetingTitle) ? this.$utility.Translator.getTranslation("app.document.upload_document_title").format(this._mainController.currentProject().Name) : this.$utility.Translator.getTranslation("app.document.upload_document_title_with_meetitng").format(this._mainController.currentProject().Name, this._meetingTitle);
            }
        }

        /**
         * @param onlyPicture boolean To know if the user can select only images
         * @param folder This is the folder where the document will be uploaded
         **/
        constructor(private $utility: utility.UtilityHelper, private _documentController: ap.controllers.DocumentController, private _mainController: ap.controllers.MainController,
            private $mdDialog: angular.material.IDialogService, private cloudService: ap.services.CloudService, private interval: ng.IIntervalService, private _onlyPicture: boolean = true, private _folder?: ap.models.projects.Folder, private _meetingTitle?: string, private isForMeetingMultiEdit: boolean = false) {
            this._listener = this.$utility.EventTool.implementsListener(["importdropboxprocessed"]);
            this.$utility.Translator.on("languagechanged", this.updatePopupTitle, this);
            this.updatePopupTitle();
        }

        private _newDocuments: ap.misc.DocumentToUpload[];
        private _saveResult: ap.controllers.DocumentsToUploadResult = null;
        private _title: string;
        private _canSave: boolean = false;
        // To know we are saving documents
        private _isSaving: boolean = false;
        private _listener: ap.utility.IListenerBuilder;
    }
}