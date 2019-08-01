module ap.viewmodels.documents {
    export enum DocumentMetadataTab {
        Fields,
        Versions
    }

    export class DocumentMetadataViewModel extends EntityViewModel implements ap.utility.IListener, IDispose {
        /**
         * Retrieves the currently selected tab
         */
        get selectedTab(): DocumentMetadataTab {
            return this._selectedTab;
        }

        /**
         * Sets the currently selected tab
         */
        set selectedTab(newTab: DocumentMetadataTab) {
            if (this._selectedTab !== newTab) {
                this._selectedTab = newTab;
                this.gotoAnchor(DocumentMetadataTab[this._selectedTab]);
                this._listener.raise("selectedTabChanged", this._selectedTab);
            }
        }

        /**
         * Retrieves a title of the current document
         */
        get title(): string {
            return this.document ? this.document.Name : null;
        }

        /**
         * Retrieves a comment for the current document
         */
        get comment(): string {
            return this.document ? this.document.Subject : null;
        }

        /**
         * Retrieves a version for the current document
         */
        get versionDisplay(): string {
            return this.document ? (this.document.VersionCount + 1).toString() : null;
        }

        /**
         * Retrieves a name of the uploader for the current document
         */
        get uploadedByName(): string {
            return this.document ? this.document.UploadedByName : null;
        }

        /**
         * Retrieves an upload date of the current document
         */
        get uploadDate(): Date {
            return this.document ? this.document.UploadedDate : null;
        }

        /**
         * Retrieves recipients for the current document
         */
        get recipientsDisplay(): string {
            if (!this.document) {
                return null;
            }

            let result = null;
            let recipients: ap.models.reports.ReportRecipients[] = this.document.Recipients;
            if (recipients && recipients.length > 0) {
                result = recipients.map(u => u.DisplayName).join(", ");
            }
            return result;
        }

        /**
         * Retrieves an indicator of whether the current document is report
         */
        get isReport(): boolean {
            return this.document ? this.document.IsReport : false;
        }

        /**
         * Retrieves a file type of the current document
         */
        get fileType(): ap.models.documents.FileType {
            return this.document ? this.document.FileType : null;
        }

        /**
         * Retrieves the currently displayed document
         */
        get document(): ap.models.documents.Document {
            return <ap.models.documents.Document>this.originalEntity;
        }

        /**
         * Retrieves a list of versions of the currently displayed document
         */
        get versions(): ap.viewmodels.documents.DocumentVersionViewModel[] {
            return this._versions;
        }

        get showDetailPaneBusy(): boolean {
            return this._showDetailPaneBusy;
        }

        set showDetailPaneBusy(value: boolean) {
            this._showDetailPaneBusy = value;
        }

        /** 
         * Method to scroll the content of the selected tab
         * @param tabName The anchor name of the tab's content to scroll to
         * @param deferred Specify if there should be a small dellay
         **/
        public gotoAnchor(tabName: string, deferred?: boolean) {
            let self = this;

            // need to set an interval because when the document is loaded there is a small delayed before the content is display and therefore the
            // offset used by the anchor to scroll is not corret
            if (deferred && !this._interval) {
                this._interval = setInterval(scroll, 100);
            } else {
                scroll();
            }

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
        }

        /**
         * This method is used to select to right tab based on the scroll offset of the note's details panel.
         * It's called by the activeLinkOnScroll directive
         * @param newTab The new tab id to select
         */
        public changeSelectedTabOnScroll(newTab: string) {
            if (this.selectedTab !== DocumentMetadataTab[newTab] && !this._preventScroll) {
                this._selectedTab = DocumentMetadataTab[newTab];
            }

            this._preventScroll = false;
        }

        /**
         * Loads an information about a document by the given ID
         * @param documentId id of the document to load from the server
         */
        public loadDocument(documentId?: string): angular.IPromise<any> {
            let defer = this.$q.defer();

            if (documentId) {
                let self: ap.viewmodels.documents.DocumentMetadataViewModel = this;

                this._preventScroll = true;
                this.$controllersManager.documentController.getFullDocumentById(documentId, false, true).then((fullDocument: ap.controllers.FullDocumentResponse) => {
                    self.setOriginalEntity(fullDocument.document);
                    self.initVersionsList();
                    self.gotoAnchor(DocumentMetadataTab[self.selectedTab], true);
                    defer.resolve();
                }, (error: any) => {
                    self.$controllersManager.mainController.showError(self.$utility.Translator.getTranslation("app.cannot.load.document.data"), self.$utility.Translator.getTranslation("app.err.general_title"), error, null);
                    defer.reject(error);
                });
            } else {
                defer.resolve();
            }

            return defer.promise;
        }

        /**
         * Configures the view model to use a given document model
         */
        public init(entity: ap.models.Entity) {
            super.init(entity);
            this.initVersionsList();
        }

        /**
         * Initializes a list of versions of the document
         */
        private initVersionsList() {
            let document: ap.models.documents.Document = this.document;
            let versionViewModel: DocumentVersionViewModel;
            if (document.Versions) {
                this._versions = document.Versions.map((version: ap.models.documents.Version) => {
                    versionViewModel = new DocumentVersionViewModel(this.$utility, this.$controllersManager);
                    versionViewModel.init(version, document);
                    return versionViewModel;
                });
            } else {
                this._versions = [];
            }
        }

        dispose() {
            this._listener.clear();
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }

        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor($utility: ap.utility.UtilityHelper, private $interval: angular.IIntervalService, private $q: angular.IQService, private $controllersManager: ap.controllers.ControllersManager, private $location?: angular.ILocationService, private $anchorScroll?: angular.IAnchorScrollService) {
            super($utility);

            this._listener = this.$utility.EventTool.implementsListener(["selectedTabChanged"]);
            this._versions = [];
        }

        private _selectedTab: DocumentMetadataTab = DocumentMetadataTab.Fields;
        private _interval: any;
        private _preventScroll: boolean;
        private _versions: DocumentVersionViewModel[];
        private _showDetailPaneBusy: boolean = false;
    }
}