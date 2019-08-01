module ap.viewmodels.documents {

    /**
    * Enum to know which download action the user choose.
    * - WorkingFile 
    * - SourceFile 
    */
    export enum DownloadDocumentResponse {
        WorkingFile,
        SourceFile
    }

    /**
    * This class is the ViewModel of the popup to download a document.
    */
    export class DownloadDocumentViewModel {
        /**
        * Public getter to access the document
        */
        public get document(): ap.models.documents.Document {
            return this._document;
        }

        /**
        * Public getter to access the version
        */
        public get version(): ap.models.documents.Version {
            return this._version;
        }

        /**
        * Public getter to access the available delete options
        */
        public get downloadOptions(): DownloadDocumentResponse[] {
            return this._downloadOptions;
        }

        /**
        * Public method to download document
        */
        public save(): void {
            let isSourceRequested = this.downloadOption === DownloadDocumentResponse.SourceFile;
            this._documentController.downloadDocument(this._document, this._version, isSourceRequested);
        }

        /**
        * Public method to cancel the download
        */
        public close(): void {
            this.$mdDialog.cancel();
        }

        /**
        * This method is used to get the display of the DownloadDocumentResponse regarding to the language
        * @param option is the DownloadDocumentResponse which needs to be displayed
        */
        public getDownloadOptionDisplayLabel(option: DownloadDocumentResponse): string {
            return this.utility.Translator.getTranslation("app.document.download_document_options." + DownloadDocumentResponse[option].toLocaleLowerCase());
        }

        constructor(private _document: ap.models.documents.Document,
            private _version: ap.models.documents.Version,
            private _documentController: ap.controllers.DocumentController,
            public $mdDialog: angular.material.IDialogService,
            private utility: ap.utility.UtilityHelper) {

            this._downloadOptions = [
                DownloadDocumentResponse.WorkingFile,
                DownloadDocumentResponse.SourceFile
            ];
        }

        private _downloadOptions: DownloadDocumentResponse[];
        public downloadOption: DownloadDocumentResponse = DownloadDocumentResponse.WorkingFile;
    }
}