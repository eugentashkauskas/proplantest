module ap.viewmodels.folders {

    /**
    * This class to managed actions of a folder in folder list
    **/
    export class FolderItemActionViewModel implements ap.utility.IListener, IDispose {

        /**
        * Actionclick method use in _FolderList.cshtml
        * @param action the name of the actions the user clicked on
        **/
        public actionClick(action: string): void {
            if (action) {
                switch (action) {
                    case "folder.moveup":
                        this._listener.raise("movefolderup");
                        break;
                    case "folder.movedown":
                        this._listener.raise("movefolderdown");
                        break;
                    case "folder.edit":
                        this._projectController.requestEditFolder(this._folderItem.originalFolder);
                        break;
                    case "folder.add":
                        this._projectController.requestAddFolder(this._folderItem.originalFolder);
                        break;
                    case "folder.delete":
                        this._projectController.deleteFolder(this._folderItem.originalFolder);
                        break;
                    case "folder.sync":
                        this._projectController.syncChapoo(this._folderItem.originalFolder);
                        break;
                    case "folder.uploaddocument":
                        this._documentController.requestUploadDocument(this._folderItem.originalFolder);
                        break;
                    case "folder.move":
                        this._projectController.requestMoveFolder(this._folderItem.originalFolder.Id);
                        break;
                    default:
                        throw new Error("The '" + action + "' action does not exist");
                }
            } else {
                throw new Error("The action is null");
            }
        }

        /**
         * Get menu action groups
         **/
        public get actionGroups() {
            return this._actionGroups;
        }

        /**
        *  This method use to count how many items can be visible on UI
        */
        public get visibleActionsCount(): number {
            let result = 0;
            this._actionGroups.forEach((group: ap.viewmodels.home.ActionGroupViewModel) => {
                group.actions.forEach((action: ap.viewmodels.home.ActionViewModel) => {
                    if (action.isVisible) {
                        result++;
                    }
                });
            });
            return result;
        }

        dispose() {
            this._listener.clear();
            if (this._actionGroups) {
                this._actionGroups.forEach((group: ap.viewmodels.home.ActionGroupViewModel) => {
                    group.dispose();
                });
            }
        }

        /*
        * Build available actions for a single document
        */
        private computeActionsVisibility(): void {
            this._folderEdit.isVisible = this._accessright.hasEditAccess;
            this._folderEdit.isEnabled = this._accessright.canEdit;
            this._folderAdd.isVisible = this._accessright.hasAddAccess;
            this._folderAdd.isEnabled = this._accessright.canAdd;
            this._folderDelete.isVisible = this._accessright.hasDeleteAccess;
            this._folderDelete.isEnabled = this._accessright.canDelete;
            this._folderSynchronization.isVisible = this._utility.UserContext.CurrentUser().AllowSync && this._accessright.hasEditAccess && this._accessright.canEdit;
            this._folderSynchronization.isEnabled = this._utility.UserContext.CurrentUser().AllowSync && this._accessright.hasEditAccess && this._accessright.canEdit;

            this._uploadDocument.isVisible = this._docAccessRight.canUploadDoc || this._docAccessRight.canUploadPicture || this._docAccessRight.canAddMeetingDoc || this._docAccessRight.canUploadMeetingDoc;
            this._uploadDocument.isEnabled = this._docAccessRight.canUploadDoc || this._docAccessRight.canUploadPicture;

            this._folderMoveUp.isEnabled = this._folderItem.moveUpAvailable;
            this._folderMoveDown.isEnabled = this._folderItem.moveDownAvailable;
        }

        /**
        * Method used to set the visibility of move actions depends of the place the item have in the list
        **/

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * Manage item's actions movement
         * @param event
         */
        private manageMoveActionsHandler(event: ap.viewmodels.base.PropertyChangedEventArgs) {
            switch (event.propertyName) {
                case "moveUpAvailable":
                    this._folderMoveUp.isEnabled = this._folderItem.moveUpAvailable;
                    break;
                case "moveDownAvailable":
                    this._folderMoveDown.isEnabled = this._folderItem.moveDownAvailable;
                    break;
            }
        }

        constructor(private _utility: ap.utility.UtilityHelper, private _projectController: ap.controllers.ProjectController, private _folderItem: ap.viewmodels.folders.FolderItemViewModel, private _mainController: ap.controllers.MainController, private _documentController: ap.controllers.DocumentController) {
            let self = this;
            this._listener = this._utility.EventTool.implementsListener(["movefolderup", "movefolderdown"]);
            this._accessright = new ap.models.accessRights.FolderAccessRight(_utility, this._folderItem.originalFolder, _mainController);
            this._docAccessRight = new ap.models.accessRights.DocumentAccessRight(_utility, null, this._mainController.currentProject(), this._mainController.currentMeeting, this._folderItem.originalFolder);

            this._folderMoveUp = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "folder.moveup", null, true, null, "Up", false);
            this._folderMoveDown = new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "folder.movedown", null, true, null, "Down", false);

            this._folderEdit = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "folder.edit", _utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit folder name", false);
            this._folderAdd = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "folder.add", _utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", false, null, "Add subfolder", false);
            this._folderDelete = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "folder.delete", _utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", false, null, "Delete folder", false);
            this._folderSynchronization = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "folder.sync", _utility.rootUrl + "Images/html/icons/ic_sync_black_24px.svg", false, null, "Synchronization", false);

            this._uploadDocument = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "folder.uploaddocument", null, false, null, "Upload document inside folder", false);
            this._moveFolder = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "folder.move", null, true, null, "Move folder to another folder", true);
            let moveActions = [this._folderMoveUp, this._folderMoveDown];
            let otherActions = [this._folderAdd, this._folderEdit, this._folderSynchronization, this._uploadDocument, this._moveFolder, this._folderDelete];
            this._actionGroups = [
                new ap.viewmodels.home.ActionGroupViewModel(this._utility, "Move", null, moveActions),
                new ap.viewmodels.home.ActionGroupViewModel(this._utility, "Other actions", null, otherActions)
            ];
            this.computeActionsVisibility();
            this._folderItem.on("propertychanged", this.manageMoveActionsHandler, this);
        }

        // Private
        private _listener: ap.utility.IListenerBuilder;
        private _accessright: ap.models.accessRights.FolderAccessRight;
        private _docAccessRight: ap.models.accessRights.DocumentAccessRight;
        // private _actions: ap.viewmodels.home.ActionViewModel[];
        private _actionGroups: ap.viewmodels.home.ActionGroupViewModel[];
        private _folderMoveUp: ap.viewmodels.home.ActionViewModel;
        private _folderMoveDown: ap.viewmodels.home.ActionViewModel;

        private _folderEdit: ap.viewmodels.home.ActionViewModel;
        private _folderAdd: ap.viewmodels.home.ActionViewModel;
        private _folderDelete: ap.viewmodels.home.ActionViewModel;
        private _folderSynchronization: ap.viewmodels.home.ActionViewModel;
        private _uploadDocument: ap.viewmodels.home.ActionViewModel;
        private _moveFolder: ap.viewmodels.home.ActionViewModel;
    }
}