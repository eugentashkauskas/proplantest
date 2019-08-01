module ap.viewmodels.projectcontacts {
    export class CategoryLinkItemViewModel extends EntityViewModel {
        /**
        * This is to ContactIssueType
        **/
        public get contactIssueType(): ap.models.projects.ContactIssueType {
            return this._contactIssueType;
        }

        public set contactIssueType(val: ap.models.projects.ContactIssueType) {
            this._contactIssueType = val;
            if (this._contactIssueType) {
                this._hasAccess = true;
            }
        }

        /**
        * This is to know if the category is a chapter or an issueType
        **/
        public get isChapter(): boolean {
            return this._isChapter;
        }

        public set isChapter(val: boolean) {
            this._isChapter = val;
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

        public set canChange(val: boolean) {
            this._canChange = val;
        }

        /**
        * This is to know if the user linked has access to the category
        **/
        public get hasAccess(): boolean {
            return this._hasAccess;
        }

        public set hasAccess(value: boolean) {
            this._hasAccess = value;
        }

        /**
        * This is to know if the user linked has access to the category
        **/
        public get issueType(): ap.models.projects.IssueType {
            return this._issueType;
        }

        public set issueType(val: ap.models.projects.IssueType) {
            this._issueType = val;
        }

        /**
        * Contact linked to the category
        */
        public get contact(): ap.models.projects.ContactDetails {
            return this._contact;
        }

        public set contact(newvalue: ap.models.projects.ContactDetails) {
            this._contact = newvalue;
            this._canChange = this._mainController.currentProject().UserAccessRight.CanEditAllContact ||
                this._contact.User.Id === this.$utility.UserContext.CurrentUser().Id || this._contact.EntityCreationUser === this.$utility.UserContext.CurrentUser().Id;
        }

        /**
        * Know if the item has changed
        */
        public get hasChanged(): boolean {
            return this._hasChanged;
        }

        /**
         * This public method is used to know the item has changed
         */
        public checkHasChanged(): void {
            if (this.hasAccess === false && this.contactIssueType || this.hasAccess === true && !this.contactIssueType)
                this._hasChanged = true;
            else if (this.hasAccess === false && !this.contactIssueType || this.hasAccess === true && this.contactIssueType)
                this._hasChanged = false;
        }

        /**
         * Reset the hasAccess property to the initial value
         */
        public setDefaultAccess() {
            this.hasAccess = !!this.contactIssueType;
        }

        constructor($utility: ap.utility.UtilityHelper, private $q: angular.IQService, private _mainController: ap.controllers.MainController, parentListVm?: ap.viewmodels.BaseListEntityViewModel) {
            super($utility, parentListVm);
        }
        private _contactIssueType: ap.models.projects.ContactIssueType;
        private _issueType: ap.models.projects.IssueType;
        private _hasChanged: boolean;
        private _canChange: boolean;
        private _rowIndex: number;
        private _colIndex: number;
        private _hasAccess: boolean = false;
        private _isChapter: boolean;
        private _contact: ap.models.projects.ContactDetails;
    }
}