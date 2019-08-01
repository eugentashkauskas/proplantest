module ap.viewmodels.documents {

    /**
    * This class to mamaged actions of a document in document list
    **/
    export class DocumentActionsViewModel implements IDispose {

        /**
        * Event handler when the document updated
        * @param e: DocumentUpdatedEvent
        */
        private documentUpdated(e: ap.controllers.EntityUpdatedEvent<ap.models.documents.Document>) {
            this.updated(e.entity);
        }

        /**
        * Event handler when the document status refreshed
        * @param document: document had been refresh
        */
        private documentStatusRefreshed(document: ap.models.documents.Document) {
            if (this._document !== null && document.Id === this._document.Id) {
                this._document.copyStandardProperties(document);
                let meeting = this._mainController.currentMeeting ? this._mainController.currentMeeting.Id : null;
                this._accessright = new ap.models.accessRights.DocumentAccessRight(this._utility, this._document, this._mainController.currentProject());
                this.computeActionsVisibility();
            }
        }

        /**
        * Handler method called when version added to the document
        **/
        private documentVersionAdded(versionAddedResult: KeyValue<ap.models.documents.Document, ap.models.documents.Version>) {
            if (versionAddedResult && versionAddedResult.key && versionAddedResult.key !== null) {
                let document = versionAddedResult.key;
                this.updated(document);
            }
        }
        /**
        * Public getter to document
        **/
        public get document(): ap.models.documents.Document {
            return this._document;
        }

        /**
        * Public getter to documentAccessRight
        */
        public get documentAccessRight(): ap.models.accessRights.DocumentAccessRight {
            return this._accessright;
        }

        /**
        * This will be called by documentUpdated and documentStatusRefreshed
        **/
        private updated(document: ap.models.documents.Document): void {
            if (document.Id === this._document.Id) {
                let meeting = this._mainController.currentMeeting ? this._mainController.currentMeeting : null;
                this._accessright = new ap.models.accessRights.DocumentAccessRight(this._utility, document, this._mainController.currentProject(), meeting);
                if (document.EntityVersion !== this._document.EntityVersion) {
                    this._document = document;
                    this.computeActionsVisibility();
                }
            }
        }

        /*
        * This private method compute the visibility/enable of each actions
        */
        private computeActionsVisibility(): void {
            this._downloadAction.isEnabled = this._accessright.canDownloadDoc;
            this._archiveAction.isVisible = this._accessright.hasArchiveDocAccess;
            this._archiveAction.isEnabled = this._accessright.canArchiveDoc;
            this._unarchiveAction.isVisible = this._accessright.hasUnarchivedDocAccess;
            this._unarchiveAction.isEnabled = this._accessright.canUnarchiveDoc;
            this._deleteAction.isEnabled = this._accessright.canDeleteDoc;
            this._deleteAction.isVisible = this._meeting !== null ? true : this._accessright.hasDeleteDocAccess;
            this._editAction.isVisible = this._accessright.hasEditDocAccess;
            this._editAction.isEnabled = this._accessright.canEditDoc;
            this._addVersionAction.isVisible = this._accessright.canAddVersion;
            this._addVersionAction.isEnabled = this._accessright.hasAddVersionAccess;
            this._sendReportAction.isVisible = this._accessright.hasSendReport;
            this._sendReportAction.isEnabled = this._accessright.canSendReport;
            this.computePreviewActionVisibility();
            this.computeMetadataActionVisibility();
            this.computeRotateActionsVisibility();

            this.updateVisibleActionsArray();
        }

        /**
         * Computes visibility and availability for the preview action
         */
        private computePreviewActionVisibility() {
            this._previewAction.isVisible = !this._isPreviewMode;
            this._previewAction.isEnabled = !this._isPreviewMode && this._document && this._document.ProcessingStatus === ap.models.documents.ProcessingStatus.FullyCompleted;
        }

        /**
         * Computes visibility and availability for the metadata action
         */
        private computeMetadataActionVisibility() {
            let isActionAvailable = !this._isPreviewMode && !this._isShowingMetaData;
            this._metadataAction.isVisible = isActionAvailable;
            this._metadataAction.isEnabled = isActionAvailable;
        }

        /**
         * Computes visibility and availability for the rotate actions
         */
        private computeRotateActionsVisibility() {
            let areActionsVisible = this._isPreviewMode;
            let areActionsEnabled = areActionsVisible && this._document && this._document.ProcessingStatus === ap.models.documents.ProcessingStatus.FullyCompleted;
            this._rotateLeftAction.isVisible = areActionsVisible;
            this._rotateLeftAction.isEnabled = areActionsEnabled;
            this._rotateRightAction.isVisible = areActionsVisible;
            this._rotateRightAction.isEnabled = areActionsEnabled;
        }

        private updateVisibleActionsArray() {
            this._visibleActions = this._actions.filter((currentAction: ap.viewmodels.home.ActionViewModel) => {
                return currentAction.isVisible && currentAction.isEnabled;
            });
        }

        /**
        * Property to access the curent available actions
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * Property to access the curent visible available actions
        **/
        public get visibleActions(): ap.viewmodels.home.ActionViewModel[] {
            return this._visibleActions;
        }

        /**
        * Property to access add actions 
        **/
        public get addActions(): ap.viewmodels.home.SubActionViewModel[] {
            return this._addActions;
        }

        /**
           This method use to count how many items can be visible on UI
           for instance: this is use on binding action menu to hind a part if there is not visible items (document grid view and thumbview)
       */
        public get visibleActionsCount(): number {
            let result = 0;
            if (this._actions && this._actions.length > 0) {
                for (let i = 0; i < this._actions.length; i++) {
                    let action = this._actions[i];
                    if (action.isVisible) result++;
                }
            }

            return result;
        }

        /**
       * This methode update the document
       **/
        public updateDocument(document: ap.models.documents.Document) {
            if (document.Id !== this._document.Id) throw new Error("The document is not the same, cannot update it");
            this._document = document;
            let meeting = this._mainController.currentMeeting ? this._mainController.currentMeeting : null;
            this._accessright = new ap.models.accessRights.DocumentAccessRight(this._utility, this._document, this._mainController.currentProject(), meeting);
            this.computeActionsVisibility();
        }

        /**
         * Determines whether a document is in the edit mode at the moment
         */
        public get isPreviewMode(): boolean {
            return this._isPreviewMode;
        }

        public set isPreviewMode(value: boolean) {
            if (this._isPreviewMode !== value) {
                this._isPreviewMode = value;
                this.computePreviewActionVisibility();
                this.computeMetadataActionVisibility();
                this.computeRotateActionsVisibility();
            }
        }

        /**
         * Determines whether a metadata of a document is displayed at the moment
         */
        public get isShowingMetaData(): boolean {
            return this._isShowingMetaData;
        }

        public set isShowingMetaData(val: boolean) {
            this._isShowingMetaData = val;
            this.computeMetadataActionVisibility();
        }

        /**
        * Method used to set rotation action visibility to false
        **/
        public hideRotateAction() {
            this._rotateLeftAction.isVisible = false;
            this._rotateRightAction.isVisible = false;
        }

        /**
        * Method used to set rotation action visibility to true
        **/
        public showRotateAction() {
            this._rotateLeftAction.isVisible = true;
            this._rotateRightAction.isVisible = true;
        }


        /**
        * Dispose method
        */
        public dispose() {
            this._documentController.off("documentupdated", this.documentUpdated, this);
            this._documentController.off("documentstatusrefreshed", this.documentStatusRefreshed, this);
            this._documentController.off("versionadded", this.documentVersionAdded, this);
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _document: ap.models.documents.Document, private _documentController: ap.controllers.DocumentController,
            private _mainController: ap.controllers.MainController, private _isPreviewMode: boolean) {
            this._meeting = this._mainController.currentMeeting ? this._mainController.currentMeeting : null;
            this._accessright = new ap.models.accessRights.DocumentAccessRight(_utility, _document, _mainController.currentProject(), this._meeting);

            let self = this;
            this._documentController.on("documentupdated", self.documentUpdated, self);
            this._documentController.on("documentstatusrefreshed", self.documentStatusRefreshed, self);
            this._documentController.on("versionadded", self.documentVersionAdded, self);

            this._previewAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.preview", _utility.rootUrl + "Images/html/icons/ic_preview_black_48px.svg", true, null, "Preview", true);
            this._downloadAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.download", _utility.rootUrl + "Images/html/icons/ic_get_app_black_24px.svg", true, null, "Download", true);
            this._archiveAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.archive", _utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", true, null, "Archive", true);
            this._unarchiveAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.unarchive", _utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", true, null, "Unarchive", true);
            this._deleteAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.delete", _utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete", true, false, new ap.misc.Shortcut("d"));
            this._editAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.edit", _utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", true, null, "Edit", true, false, new ap.misc.Shortcut("e"));
            this._metadataAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.info", _utility.rootUrl + "Images/html/icons/ic_info_black_48px.svg", true, null, "Show details of the document", true);
            this._addVersionAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.addversion", _utility.rootUrl + "Images/html/icons/ic_collections_black_36px.svg", false, null, "Add version", true);
            this._rotateLeftAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.rotateleft", _utility.rootUrl + "Images/html/icons/ic_rotate_left_white_48px.svg", false, null, "Rotate left", false);
            this._rotateRightAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "document.rotateright", _utility.rootUrl + "Images/html/icons/ic_rotate_right_white_48px.svg", false, null, "Rotate right", false);
            this._sendReportAction = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "report.sendByEmail", _utility.rootUrl + "Images/html/icons/ic_email_black_48px.svg", false, null, "app.report.report_sent_title", false);
            this._actions = [
                this._previewAction,
                this._rotateLeftAction,
                this._rotateRightAction,
                this._sendReportAction,
                this._downloadAction,
                this._editAction,
                this._archiveAction,
                this._unarchiveAction,
                this._deleteAction,
                this._metadataAction,
                this._addVersionAction
            ];
            this._addActions = [];

            this.computeActionsVisibility();
        }

        // Private zone
        private _meeting: ap.models.meetings.Meeting;
        private _accessright: ap.models.accessRights.DocumentAccessRight;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _visibleActions: ap.viewmodels.home.ActionViewModel[];
        private _previewAction: ap.viewmodels.home.ActionViewModel;
        private _downloadAction: ap.viewmodels.home.ActionViewModel;
        private _archiveAction: ap.viewmodels.home.ActionViewModel;
        private _unarchiveAction: ap.viewmodels.home.ActionViewModel;
        private _deleteAction: ap.viewmodels.home.ActionViewModel;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _metadataAction: ap.viewmodels.home.ActionViewModel;
        private _addVersionAction: ap.viewmodels.home.ActionViewModel;
        private _rotateLeftAction: ap.viewmodels.home.ActionViewModel;
        private _rotateRightAction: ap.viewmodels.home.ActionViewModel;
        private _addActions: ap.viewmodels.home.SubActionViewModel[];
        private _sendReportAction: ap.viewmodels.home.ActionViewModel;
        private _isShowingMetaData: boolean = false;
        // End Private zone
    }
}