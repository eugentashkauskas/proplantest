module ap.viewmodels.projectcontacts {

    export class ProjectContactItemParameter extends ItemConstructorParameter {

        public get contactController(): ap.controllers.ContactController {
            return this.$contactController;
        }

        public get mainController(): ap.controllers.MainController {
            return this.$mainController;
        }

        public get isForImportComponent(): boolean {
            return this._isForImportComponent;
        }

        constructor(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper, private $contactController: ap.controllers.ContactController, private $mainController: ap.controllers.MainController, private _isForImportComponent: boolean = false) {
            super(itemIndex, dataSource, pageDesc, parameters, utility);
        }
    }

    export class ProjectContactItemViewModel extends ap.viewmodels.EntityViewModel {

        /**
        * Get original entity for current view model
        **/
        get originalContactItem(): ap.models.projects.ContactDetails {
            return <ap.models.projects.ContactDetails>this.originalEntity;
        }

        /**
        * Get display name of a view model
        **/
        get displayName(): string {
            return this._displayName;
        }

        /**
        * Get contact person's project access rights
        **/
        get projectAccess(): ap.models.accessRights.AccessRightLevel {
            return this._projectAccess;
        }

        get displayProjectAccess(): string {
            return this.$utility.Translator.getTranslation(ap.models.accessRights.AccessRightLevel[this._projectAccess]);
        }

        /**
         * Get contact user's email
        **/
        get email(): string {
            return this._email;
        }

        /**
        * Get contact person's company name
        **/
        get company(): string {
            return this._company;
        }

        /**
        * Get contact person's role in the current project
        **/
        get role(): string {
            return this._role;
        }

        get projectName(): string {
            return this._projectName;
        }

        /**
        * Get item action object for current user contact details
        **/
        get contactActions(): ap.viewmodels.projectcontacts.ProjectContactsActionViewModel {
            return this._action;
        }

        /**
        * Copy needed entity values to the current ViewModel
        **/
        copySource() {
            super.copySource();
            if (this.originalEntity !== null) {
                this._displayName = this.originalContactItem.DisplayName;
                this._projectAccess = this.originalContactItem.AccessRightLevel;
                this._company = this.originalContactItem.Company;
                this._role = this.originalContactItem.Role;
                this._projectName = this.originalContactItem.Project ? this.originalContactItem.Project.Name : "";
                let user = this.originalContactItem.User;
                if (user && user !== null) {
                    this._email = user.DefaultEmail;
                }
            }
            this.buildActions();
        }

        /**
        * This method is used to update this vm when the contacts have been invited
        **/
        private contactsInvitedHandler(contactDetails: ap.models.projects.ContactDetails[]) {
            let contact: ap.models.projects.ContactDetails = null;

            contactDetails.forEach((item) => {
                if (item.Id === this.originalContactItem.Id) {
                    contact = item;
                }
            });

            if (contact !== null) {
                this.originalContactItem.IsInvited = true;
                this.originalContactItem.updateEntityPropsOnly(contact);
                this.copySource();
            }
        }

        /**
         * To remove listened events 
         **/
        public dispose() {
            super.dispose();
            if (this._parameters) {
                this._parameters.contactController.off("contactsinvited", this.contactsInvitedHandler, this);
            }
            if (this._action)
                this._action.dispose();
        }

        private get contactItem(): ap.models.projects.ContactDetails {
            return <ap.models.projects.ContactDetails>this._parameters.dataSource;
        }

        private buildActions() {
            if (this._action)
                this._action.dispose();
            if (this._parameters && !this._parameters.isForImportComponent) {
                this._action = new ap.viewmodels.projectcontacts.ProjectContactsActionViewModel(this.$utility, this.contactItem, this._parameters.contactController, this._parameters.mainController);
            }
        }

        constructor(utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: ap.viewmodels.BaseListEntityViewModel, parameters?: ItemConstructorParameter) {
            super(utility, parentListVm, parameters ? parameters.itemIndex : null);
            if (parameters != null && parameters instanceof ap.viewmodels.projectcontacts.ProjectContactItemParameter) {
                this._parameters = <ap.viewmodels.projectcontacts.ProjectContactItemParameter>parameters;
                this._parameters.contactController.on("contactsinvited", this.contactsInvitedHandler, this);
            }
        }

        private _parameters: ap.viewmodels.projectcontacts.ProjectContactItemParameter;
        private _displayName: string;
        private _projectAccess: ap.models.accessRights.AccessRightLevel;
        private _email: string;
        private _company: string;
        private _role: string;
        private _projectName: string;
        private _action: ap.viewmodels.projectcontacts.ProjectContactsActionViewModel;
    }
}