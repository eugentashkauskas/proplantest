module ap.viewmodels.projectcontacts {
    export class FolderVisibilityViewModel  extends EntityViewModel {
        /**
        * This is to ContactIssueType
        **/
        public get folderVisibility(): ap.models.projects.FolderVisibility {
            return this._folderVisibility;
        }

        public set folderVisibility(val: ap.models.projects.FolderVisibility) {
            this._folderVisibility = val;
            if (this._folderVisibility) {
                this._hasAccess = true;
                this._originalAccess = this._hasAccess;
            }
            this.initializeCanShare();
            this.initializeCanChange();
        }

        public get folder(): ap.models.projects.Folder {
            return this._folder;
        }

        /**
        * Folder corresponding to the visibility
        */
        public set folder(newValue: ap.models.projects.Folder) {
            this._folder = newValue;
            this._hasAccess = this.hasAccess || (this._folder && !this._folder.isRootFolder && this._folder.IsPublic);
            this._originalAccess = this._hasAccess;
            this.initializeCanShare();
            this.initializeCanChange();
        }

        /**
        * This is to know the index of the column
        **/
        public get colIndex(): number {
            return this._colIndex;
        }

        public set colIndex(index: number) {
            this._colIndex = index;
        }

        /**
        * This is to know the index of the row
        **/
        public get rowIndex(): number {
            return this._rowIndex;
        }

        public set rowIndex(index: number) {
            this._rowIndex = index;
        }

        /**
        * This is to know if we can change the value (in mode edit)
        **/
        public get canChange(): boolean {
            return this._canChange;
        }

        /**
        * This is to know if the user linked has access to the category
        **/
        public get hasAccess(): boolean {
            return this._hasAccess;
        }

        public set hasAccess(val: boolean) {
            if (this._hasAccess !== val) {
                this._hasAccess = val;
                this.initializeHasChanged();
                this.raisePropertyChanged("hasAccess", !val, this);
            }
        }

        public get contact(): ap.models.projects.ContactDetails {
            return this._contact;
        }

        public set contact(newvalue: ap.models.projects.ContactDetails) {
            this._contact = newvalue;
            this.initializeCanShare();
            this.initializeCanChange();
        }

        /**
        * This is to know if entity has change the value 
        **/
        public get hasChanged(): boolean {
            return this._hasChanged;
        }

        /**
        * This is to know if user can share folder 
        **/
        public get canShare(): boolean {
            return this._canShare;
        }


        /**
        * This method use for set this._hasAccess without raise event
        **/
        public setHasAccess(access: boolean) {
            if (this._hasAccess !== access) {
                this._hasAccess = access;
                this.initializeHasChanged();
            }
        }

        /**
         * Initialize canShare property after the folder is set
         */
        private initializeCanShare() {
            if (this.folder && (this.folder.FolderType === "Photo" || this.folder.FolderType === "Report") && this.folder.Creator && this.folder.Creator.Id !== this.$utility.UserContext.CurrentUser().Id) {
                this._canShare = false;
            }
        }

        /**
         * Initialize canChange property after the folderVisibilities are loaded
         */
        private initializeCanChange() {
            if (this._folder.IsPublic && this._contact) {
                this._canChange = (!this._folderVisibility && this._contact.User.Id !== this.$utility.UserContext.CurrentUser().Id && this.canShare && this._contact.User.Id !== this.folder.EntityCreationUser);
            } else {
                this._canChange = (!this._folderVisibility || (this._folderVisibility && !this._folderVisibility.IsCreator && this._folderVisibility.InvitedUser.Id !== this.$utility.UserContext.CurrentUser().Id && this._contact && this._contact.User.Id !== this.folder.EntityCreationUser)) && this.canShare;
            }
        }

        /**
         * Initialize the hasChanged property after an access has changed
         */
        private initializeHasChanged() {
            this._hasChanged = (this.folderVisibility && !this.hasAccess)
                || (this.folder && !this.folder.IsPublic && !this.folderVisibility && this.hasAccess)
                || (this.folder && this.folder.IsPublic && !this.folderVisibility && !this.hasAccess)
                || (this.folder && this.folder.IsPublic && !this.folderVisibility && this.hasAccess);
        }

        /**
        * This method for return hasAccess to default state
        **/
        public setDefaultAccess() {
            this._hasAccess = this._originalAccess;
        }

        constructor($utility: ap.utility.UtilityHelper, private $q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, private currentProject?: ap.models.projects.Project) {
            super($utility, parentListVm);
        }

        private _folderVisibility: ap.models.projects.FolderVisibility;
        private _hasChanged: boolean;
        private _canChange: boolean;
        private _rowIndex: number;
        private _colIndex: number;
        private _hasAccess: boolean = false;
        private _folder: ap.models.projects.Folder;
        private _contact: ap.models.projects.ContactDetails;
        private _canShare: boolean = true;
        private _originalAccess: boolean = false;
    }
}