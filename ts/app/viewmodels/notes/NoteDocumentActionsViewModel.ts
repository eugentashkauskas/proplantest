module ap.viewmodels.notes {

    /**
    * This class to managed actions of a note in notes list
    **/
    export class NoteDocumentActionsViewModel implements IDispose {

        /**
         * A public accessor for a list of actions defined in this view model
         */
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
         * A public accessor for a list of visible actions defined in this view model
         */
        public get visibleActions(): ap.viewmodels.home.ActionViewModel[] {
            return this._visibleActions;
        }

        /**
         * Determines whether a user can delete a document
         */
        public set canDelete(val: boolean) {
            this._canDelete = val;
            this.calculateActionsVisibility();
        }

        /**
         * Determines whether a user can download a document
         */
        public set canDownload(val: boolean) {
            this._canDownload = val;
            this.calculateActionsVisibility();
        }

        /**
         * Determines whether a user can preview a document
         */
        public set canPreview(val: boolean) {
            this._canPreview = val;
            this.calculateActionsVisibility();
        }

        /**
         * Determines whether a document is currently displayed in the preview mode
         */
        public set isPreviewMode(val: boolean) {
            this._isPreviewMode = val;
            this.calculateActionsVisibility();
        }

        /**
         * Calculates availablility of actions defined in this view model
         */
        private calculateActionsVisibility() {
            this._previewAction.isVisible = !this._isPreviewMode && this._canPreview;
            this._previewAction.isEnabled = !this._isPreviewMode && this._canPreview && this._document.ProcessingStatus === ap.models.documents.ProcessingStatus.FullyCompleted;
            this._downloadAction.isVisible = this._canDownload;
            this._downloadAction.isEnabled = this._canDownload;
            this._deleteAction.isVisible = !this._isPreviewMode && this._canDelete;
            this._deleteAction.isEnabled = !this._isPreviewMode && this._canDelete;
            this.updateVisibleActions();
        }

        /**
         * Updates a list of visible actions
         */
        private updateVisibleActions() {
            this._visibleActions = this._actions.filter((action: ap.viewmodels.home.ActionViewModel) => {
                return action.isVisible;
            });
        }

        /**
         * Dispose method
         */
        public dispose() {
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _document: ap.models.documents.Document, private _documentController: ap.controllers.DocumentController, private _mainController: ap.controllers.MainController) {
            this._meeting = this._mainController.currentMeeting ? this._mainController.currentMeeting : null;
            this._accessright = new ap.models.accessRights.DocumentAccessRight(_utility, _document, _mainController.currentProject(), this._meeting);

            this._previewAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "notedoc.preview", this._utility.rootUrl + "Images/html/icons/ic_preview_black_48px.svg", true, null, "Preview", true);
            this._downloadAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "notedoc.download", this._utility.rootUrl + "Images/html/icons/ic_get_app_black_24px.svg", true, null, "Download", true);
            this._deleteAction = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "notedoc.delete", this._utility.rootUrl + "Images/html/icons/ic_remove_circle_black_24px.svg", true, null, "Detach", true);

            this._actions = [
                this._previewAction,
                this._downloadAction,
                this._deleteAction
            ];

            this.calculateActionsVisibility();
        }

        private _canDelete: boolean = false;
        private _canDownload: boolean = false;
        private _canPreview: boolean = false;
        private _isPreviewMode: boolean = false;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _visibleActions: ap.viewmodels.home.ActionViewModel[];
        private _previewAction: ap.viewmodels.home.ActionViewModel;
        private _downloadAction: ap.viewmodels.home.ActionViewModel;
        private _deleteAction: ap.viewmodels.home.ActionViewModel;
        private _meeting: ap.models.meetings.Meeting;
        private _accessright: ap.models.accessRights.DocumentAccessRight;
    }
}