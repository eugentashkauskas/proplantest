module ap.viewmodels.folders {

    /**
     * AddEditFolderViewModel is the Class used to add or modify a folder of the project.
     * One can add a new folder or change the name of an existing one.
     */
    export class AddEditFolderViewModel implements IDispose {

        /**
        * Get the title of the folder
        **/
        public get title(): string {
            return this._title;
        }

        /**
        * Public accessor to know if the folder is new
        */
        public get isNew(): boolean {
            return this._isNew;
        }

        /**
        * Use to save the changes upon on the folder
        **/
        public save(): void {
            this._folderItem.postChanges();
            if (this._folderItem.originalEntity.IsNew === false)
                this._folderItem.originalEntity.ModifiedProperties.push("Name");
            this._projectController.saveFolder(this._folderItem.originalFolder);
            this.$mdDialog.hide();
        }

        /**
        * Use to cancel the changes upon to the folder
        **/
        public cancel(): void {
            this._folderItem.copySource();
            this.$mdDialog.cancel();
        }

        dispose() {
            this.utility.Translator.off("languagechanged", this.updatePopupTitle, this);
        }

        /**
         * Update folder's add/edit popup title
         */
        private updatePopupTitle() {
            if (this._folderItem.originalFolder.IsNew) {
                this._title = this.utility.Translator.getTranslation("Edit folder name");
            } else {
                this._title = this._folderItem.name;
            }
        }

        constructor(private utility: ap.utility.UtilityHelper, $q: angular.IQService, private $mdDialog: angular.material.IDialogService, private _projectController: ap.controllers.ProjectController, private _folderItem: ap.viewmodels.folders.FolderItemViewModel) {
            this.utility.Translator.on("languagechanged", this.updatePopupTitle, this);
            this._isNew = this._folderItem.originalFolder.IsNew;
            this.updatePopupTitle();
        }

        private _title: string;
        private _isNew: boolean;
    }
}