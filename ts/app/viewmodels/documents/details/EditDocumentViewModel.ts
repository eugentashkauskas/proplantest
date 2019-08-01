module ap.viewmodels.documents {
    export enum EditDocumentDialogResult {
        Cancel,
        DocumentUpdated,
        VersionAdded
    }

    export class EditDocumentViewModel implements IDispose {

        /**
        * The title of the dialog
        **/
        public get title(): string {
            return this._title;
        }

        /*
        * Property to access internal document viewmodel
        */
        public get documentViewModel(): ap.viewmodels.documents.DocumentViewModel {
            return this._documentViewModel;
        }

        /**
        * The original DocumentViewModel for add new version
        **/
        public get originalDocumentViewModel(): ap.viewmodels.documents.DocumentViewModel {
            return this._originalDocumentViewModel;
        }

        /**
        * To know in add version mode or not
        **/
        public get isToAddVersion(): boolean {
            return this._isToAddVersion;
        }

        /**
        * Contains files to upload for the new version or source file when edit document
        **/
        public get documentToUpload(): ap.misc.DocumentToUpload {
            return this._documentToUpload;
        }

        /**
        * To know that the vm contains document to upload
        **/
        public get hasDocumentToUpload(): boolean {
            return this._documentToUpload && this._documentToUpload !== null;
        }

        /**
        * To know the vm contains working file to upload  
        **/
        public get hasWorkingFile(): boolean {
            return this._documentToUpload && this._documentToUpload !== null && this._documentToUpload.workingFile && this._documentToUpload.workingFile !== null;
        }

        /**
        * To know the vm contains source file to upload
        **/
        public get hasSourceFile(): boolean {
            return this._documentToUpload && this._documentToUpload !== null && this._documentToUpload.sourceFile && this._documentToUpload.sourceFile !== null;
        }

        /**
        * Name of the new verion document
        **/
        public get newVersionName(): string {
            if (this.hasWorkingFile)
                return this.$utility.FileHelper.getFileNameWithoutExtension(this._documentToUpload.workingFile.name);
            else if (this.hasSourceFile)
                return this.$utility.FileHelper.getFileNameWithoutExtension(this._documentToUpload.sourceFile.name);
            return null;
        }

        public get isIE(): boolean {
            return this.$utility.isIE();
        }
        /**
         * This property will check if the user can save the document. Means to check if the vm has maySave = true and if there is changed in this vm. 
         **/
        public get canSave(): boolean {
            if (this._documentViewModel === undefined || this._documentViewModel === null)
                return false;
            if (!this._isToAddVersion) {
                return this._documentViewModel.hasChanged && this._documentViewModel.maySave
                    && (this._documentToUpload === undefined || this._documentToUpload === null
                    || this._documentToUpload.uploadStatus === ap.misc.UploadStatus.Done);
            }
            else {
                if (this._documentToUpload && this._documentToUpload !== null)
                    return true;
            }
            return false;
        }

        /**
        * Called from save button to perform save the curernt document
        **/
        public save() {
            let self = this;
            this._documentViewModel.postChanges();
            if (!this._isToAddVersion) {
                if (this._documentToUpload && this._documentToUpload != null) {
                    this._documentViewModel.document.OriginalSourceName = this._documentToUpload.originalSourceFileName;
                    this._documentViewModel.document.SourceUrl = this._documentToUpload.sourceUrl;
                }
                else if (this._documentViewModel.document.SourceUrl !== "" && this._documentViewModel.documentSourceFile === "") {
                    this._documentViewModel.document.SourceUrl = null;
                    this._documentViewModel.document.SourceFileStatus = ap.models.documents.DocumentStatus.Processed;
                }
                this.$controllersManager.documentController.saveDocument(this._documentViewModel.document);
            }
            else {
                // As the method documentViewModel.postChanges(); will be set the name of the document to the new version name event if the document name have manage well on the documentToUpload
                // Then we need to check if documentToUpload.keepOldName and correct the name
                if (self._documentToUpload.keepOldName)
                    (<ap.models.documents.Document>self._documentToUpload.document).Name = self._documentToUpload.originalDocument.Name;
                self.$controllersManager.documentController.saveNewVersion(self._documentToUpload, self._pathToLoadDocument, self._pathToLoadVersion).then(() => {
                    this.$controllersManager.mainController.showToast("app.document.addversion.processing", null);
                });
            }
        }

        /**
        * Abort the changes
        **/
        public cancel() {
            let self = this;
            if (this._documentToUpload) {
                this.$controllersManager.documentController.cancelUploadDocument(this._documentToUpload).then(() => {
                    if (self._documentViewModel && self._documentViewModel !== null)
                        self._documentViewModel.documentSourceFile = "";
                    self.internalCancel();
                });
            }
            else {
                self.internalCancel();
            }
        }

        dispose() {
            this.$utility.Translator.off("languagechanged", this.updatePopupTitle, this);
        }

        /**
        *  Internal method to cancel and close the dialog
        **/
        private internalCancel() {
            if (this._documentViewModel) {
                this._documentViewModel.cancel();
            }
            this.$mdDialog.hide(EditDocumentDialogResult.Cancel);
        }

        private documentSavedHandler() {
            this.$mdDialog.hide(this._isToAddVersion ? EditDocumentDialogResult.VersionAdded : EditDocumentDialogResult.DocumentUpdated);
            this.$scope.$destroy();
        }
        /**
        * This method to open file dialog then updateDocumentSourceFile
        **/
        public addSourceFile(files: File[]) {
            if (files && files.length > 0) {

                // when there are more than one file, we show error and do nothing
                if (files && files.length > 1) {
                    this.$controllersManager.mainController.showErrorKey("app.document.select_namyfiles", "app.err.general_error", null, null);
                    return;
                }
                this._documentToUpload = new ap.misc.DocumentToUpload(this.$utility, this._documentViewModel.document);
                this._documentToUpload.updateSourceFile(files[0]);
                this._documentViewModel.documentSourceFile = this._documentToUpload.originalSourceFileName;
                // Upload directly
                this.$controllersManager.documentController.uploadDocument(this._documentToUpload).then(null
                    , (doc: ap.misc.DocumentToUpload) => {
                        if (doc.uploadFailError !== "CANCEL") {
                            this.$controllersManager.mainController.showErrorKey("app.document.uploadsource_fail", "app.err.general_error", doc.uploadFailError, null);
                        }
                    });
                this.$scope.$digest(); // to refresh UI
            }
        }

        /**
        * This method is to add a new version on the current document
        * @param file is the file to create the new version
        **/
        public addVersion(file: File) {
            if (!this._isToAddVersion)
                throw new Error("addVersion is available only for add version mode");
            let self = this;
            if (this._documentToUpload === null) {
                this._documentToUpload = new ap.misc.DocumentToUpload(this.$utility, this._originalDocumentViewModel.document, file, true);
                this._documentToUpload.on("workingfilechanged", self.onVersionFileToUploadChanged, self);
                this._documentToUpload.on("sourcefilechanged", self.onVersionFileToUploadChanged, self);
            }
            else {
                if (this._documentToUpload.sourceFile === null) {
                    this._documentToUpload.updateSourceFile(file);
                }
                else if (this._documentToUpload.workingFile === null) {
                    let extension = this.$utility.FileHelper.getExtension(file.name);
                    if (extension !== "pdf" && extension !== "png" && extension !== "jpg" && extension !== "jpeg" && extension !== "gif") {
                        // It's better to show the message to the user known that he cannot add working file for this kind of file
                        this.$controllersManager.mainController.showError(this.$utility.Translator.getTranslation("app.document.addversion.wrong_workingfile").format(extension), this.$utility.Translator.getTranslation("app.err.general_error"), null, null);
                        return;
                    }
                    this._documentToUpload.updateWorkingFile(file);
                }
                else {
                    throw new Error("Working file and source file already specifiled");
                }
            }
            if (this._documentViewModel === null) {
                this._documentViewModel = new ap.viewmodels.documents.DocumentViewModel(this.$utility, this.$q, this.$controllersManager, this.$servicesManager);
                this._documentViewModel.init(this._documentToUpload.document);
                this._documentViewModel.references = this._originalDocumentViewModel.references;
                this._documentViewModel.subject = this._originalDocumentViewModel.subject;
            }
            this.$controllersManager.documentController.uploadDocument(this._documentToUpload).then(null, (doc: ap.misc.DocumentToUpload) => {
                if (doc.uploadFailError !== "CANCEL") {
                        let fileUploadFailed: string = null;
                        if (doc.workingFileStatus === ap.misc.UploadStatus.Failed && doc.workingFile !== null)
                            fileUploadFailed = doc.workingFile.name;
                        if (doc.sourceFileStatus === ap.misc.UploadStatus.Failed && doc.sourceFile !== null) {
                            if (StringHelper.isNullOrEmpty(fileUploadFailed))
                                fileUploadFailed = doc.sourceFile.name;
                            else
                                fileUploadFailed += ", " + doc.sourceFile.name;
                        }
                        let message = this.$utility.Translator.getTranslation("app.document.uploadfile_fail").format(fileUploadFailed);
                        let title = this.$utility.Translator.getTranslation("app.err.general_error");
                        self.$controllersManager.mainController.showError(message, title, doc.uploadFailError, null);
                    }
                    if (doc.workingFileStatus === ap.misc.UploadStatus.Failed && doc.workingFile !== null)
                        self.documentToUpload.updateWorkingFile(null);
                    if (doc.sourceFileStatus === ap.misc.UploadStatus.Failed && doc.sourceFile !== null)
                        self.documentToUpload.updateSourceFile(null);
            });
        }

        /**
       * This method is to remove source file of the editing document
       **/
        public removeSourceFile(needConfirm: boolean = true) {
            if (this._documentToUpload && this._documentToUpload !== null
                && (this._documentToUpload.sourceFile === undefined || this._documentToUpload.sourceFile === null))
                throw Error("Sourcefile already empty");

            let self = this;
            if (needConfirm) {
                this.$controllersManager.mainController.showConfirmKey("Do you want to remove the existing source file?", "Confirm",
                    (confirm) => {
                        if (confirm === ap.controllers.MessageResult.Positive) {
                            self.clearSourceFile();
                        }
                    }, false, "Remove", "Cancel");
            }
            else
                self.clearSourceFile();
        }

        private clearSourceFile() {
            let self = this;
            if (this._documentToUpload) {
                this.$controllersManager.documentController.cancelUploadDocument(this._documentToUpload, ap.controllers.DocumentToUploadType.SourceFile).then(() => {
                    self._documentViewModel.documentSourceFile = "";
                    self._documentToUpload.updateSourceFile(null);
                });
            }
            else
                self._documentViewModel.documentSourceFile = "";
        }

        /**
       * This method is used to remove the working file when add new version
       **/
        public removeWorkingFile() {
            let self = this;
            this.$controllersManager.documentController.cancelUploadDocument(this._documentToUpload, ap.controllers.DocumentToUploadType.WorkingFile).then(() => {
                self._documentToUpload.updateWorkingFile(null);
            });
        }

        /**
        * This method will be call when the working file or source file of the VersionToUpload changed
        **/
        private onVersionFileToUploadChanged() {
            if (this._documentToUpload.sourceFile === null && this._documentToUpload.workingFile === null)
                this._documentToUpload = null;
        }

        /**
         * Update edit document popup title
         */
        private updatePopupTitle() {
            if (this._isToAddVersion)
                this._title = this.$utility.Translator.getTranslation("app.document.addversion.title").format(this._originalDocumentViewModel.document.Name);
            else
                this._title = this.$utility.Translator.getTranslation("app.document.editmetadata.title");
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private $timeout: angular.ITimeoutService, private $q: angular.IQService,
            private $scope: ng.IScope, private $controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager, docVm: ap.viewmodels.documents.DocumentViewModel, isToAddVersion: boolean = false, private _pathToLoadDocument?: string, private _pathToLoadVersion?: string) {

            this._isToAddVersion = isToAddVersion;
            if (isToAddVersion) {
                this._originalDocumentViewModel = docVm;
                this._documentViewModel = null;
            }
            else {
                this._documentViewModel = docVm;
            }

            let self = this;
            this.$controllersManager.documentController.on("documentupdated", self.documentSavedHandler, self);
            this.$controllersManager.documentController.on("versionadded", self.documentSavedHandler, self);

            $scope.$on("$destroy", () => {
                self.$controllersManager.documentController.off("documentupdated", self.documentSavedHandler, self);
                self.$controllersManager.documentController.off("documentuploadedsaved", self.documentSavedHandler, self);
            });
            this.$utility.Translator.on("languagechanged", this.updatePopupTitle, this);
            this.updatePopupTitle();
        }

        // Private zone
        private _documentViewModel: ap.viewmodels.documents.DocumentViewModel;
        private _originalDocumentViewModel: ap.viewmodels.documents.DocumentViewModel;
        private _isToAddVersion: boolean;
        private _documentToUpload: ap.misc.DocumentToUpload = null;
        private _title: string = null;
    }
}