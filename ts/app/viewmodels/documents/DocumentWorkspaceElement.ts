namespace ap.viewmodels.documents {
    /*
    * AP-10797: no explain the purpose of this at the moment
    */
    export class DocumentWorkspaceElement {

        /*
        * Property to know if the ViewModel should display the documents list
        *
        */
        public get hasDocumentList(): boolean {
            return this._hasDocumentList;
        }

        public set hasDocumentList(value: boolean) {
            this._hasDocumentList = value;

            if (this._hasDocumentList === false) this._hasDocumentViewer = false;
        }

        /*
        * Property to know if the ViewModel should display the folders list
        */
        public get hasFolderList(): boolean {
            return this._hasFolderList;
        }

        public set hasFolderList(value: boolean) {
            this._hasFolderList = value;
        }

        /*
        * Property to know if the ViewModel should display the DocumentViewer
        */
        public get hasDocumentViewer(): boolean {
            return this._hasDocumentViewer;
        }

        public set hasDocumentViewer(value: boolean) {
            if (this._hasDocumentList === false && value === true)
                throw new Error("cannot be true if hasPlanDocumentList = false");

            this._hasDocumentViewer = value;
        }

        /*
        * Property to get the documentListOptions.  This property is used to get the PathToLoad when loading the documents list
        */
        public get documentListOption(): DocumentListOptions {
            return this._documentListOptions;
        }

        constructor(private isMeetingDocument: boolean = false) {
            this._isMeetingDocument = isMeetingDocument;
            this._hasDocumentList = true;
            this._hasFolderList = true;
            this._hasDocumentViewer = true;
            // No need to load all versions and pages by default. Need to refactor if we need to change that but it should not be normal to load them for the entire of the list.
            this._documentListOptions = new DocumentListOptions(false, false, false, true, true, true, this._isMeetingDocument);
        }
        private _isMeetingDocument: boolean;
        private _hasDocumentList: boolean;
        private _hasFolderList: boolean;
        private _hasDocumentViewer: boolean;
        private _documentListOptions: DocumentListOptions;
    }
}