namespace ap.viewmodels.company {
    /**
    * Interface for status displayed options
    */
    export interface StatusInfo {
        text: string;
        color: string;
    }

    export class CompanyMemberItemViewModel extends ap.viewmodels.EntityViewModel {

        /**
         * A public accessor for an entity the view models is based on
         */
        public get originalEntity(): ap.models.actors.CompanyUser | ap.models.company.CompanyUserInvitationRequest {
            return this._originalEntity;
        }

        /**
         * A view model that handles actions related to this view model
         */
        public get actionsVm(): ap.viewmodels.company.CompanyMemberActionsViewModel {
            return this._actionsVm;
        }

        /**
         * This is getter for company member display name
         **/
        public get displayName(): string {
            return this._displayName;
        }

        /**
         * This is getter for company member avatar
         **/
        public get avatarName(): string {
            return this._avatarName;
        }

        /**
         * This is getter for company member status
         **/
        public get status(): ap.models.company.InvitationRequestStatus {
            return this._status;
        }

        /**
         * This is getter for company member status
         **/
        public get statusInfo(): StatusInfo {
            return this._statusInfo;
        }

        /**
         * This is getter for company member position
         **/
        public get position(): string {
            return this._position;
        }

        /**
         * This is the isManager property for company member
         **/
        public get isManager(): boolean {
            return this._isManager;
        }

        public set isManager(value: boolean) {
            this._isManager = value;
        }

        copySource() {
            if (this.originalEntity instanceof ap.models.actors.CompanyUser) {
                let user = <ap.models.actors.CompanyUser>this.originalEntity;
                this._status = (user.IsDisabled) ? ap.models.company.InvitationRequestStatus.Deactivated : ap.models.company.InvitationRequestStatus.Accepted;
                this._displayName = user.User.DisplayName;
                this._avatarName = user.User.AvatarFileName;
                this._isManager = user.IsManager;
                if (user.User.Profession)
                    this._position = user.User.Profession.Name;
            } else if (this.originalEntity instanceof ap.models.company.CompanyUserInvitationRequest) {
                let user = <ap.models.company.CompanyUserInvitationRequest>this.originalEntity;
                this._status = user.Status;
                this._displayName = user.InvitedUser.DisplayName;
            }
            this.computeStatusInfo();
            this._actionsVm = new ap.viewmodels.company.CompanyMemberActionsViewModel(this.$utility, this, this._controllersManager);
        }

        /**
         * Re-calculate status info depending on status property change
         */
        private computeStatusInfo() {
            switch (this._status) {
                case ap.models.company.InvitationRequestStatus.Accepted:
                    this._statusInfo = { text: this.$utility.Translator.getTranslation("Active").toUpperCase(), color: "#4CAF50" };
                    break;
                case ap.models.company.InvitationRequestStatus.Cancelled:
                    this._statusInfo = { text: this.$utility.Translator.getTranslation("Cancelled").toUpperCase(), color: "#F62439" };
                    break;
                case ap.models.company.InvitationRequestStatus.Deactivated:
                    this._statusInfo = { text: this.$utility.Translator.getTranslation("Deactivated").toUpperCase(), color: "#FFFFFFF" };
                    break;
                case ap.models.company.InvitationRequestStatus.Refused:
                    this._statusInfo = { text: this.$utility.Translator.getTranslation("Refused").toUpperCase(), color: "#F5A623" };
                    break;
                case ap.models.company.InvitationRequestStatus.Sent:
                    this._statusInfo = { text: this.$utility.Translator.getTranslation("Pending").toUpperCase(), color: "#4A90E2" };
                    break;
                default:
                    this._statusInfo = null;
                    break;
            }
        }

        /**
         * This private method is used handle invitationcancelled action
         * @param companyUserInvitationRequest is instance of CompanyUserInvitationRequest
         */
        private invitationCancelledHandler(companyUserInvitationRequest: ap.models.company.CompanyUserInvitationRequest) {
            (<ap.models.company.CompanyUserInvitationRequest>this.originalEntity).Status = ap.models.company.InvitationRequestStatus.Cancelled;
            this._status = ap.models.company.InvitationRequestStatus.Cancelled;
            this.actionsVm.setActionDisabled();
            this.computeStatusInfo();
        }

        /**
         * This private method is used to handle companyuserdeleted action
         * @param companyUser is instance of CompanyUser
         */
        private companyUserRemoveHandler(companyUser: ap.models.actors.CompanyUser) {
            this.actionsVm.setActionDisabled();
        }

        /**
         * This method is used to handle cancel action
         * @param actionName is name of action
         */
        public actionClick(actionName: string) {
            switch (actionName) {
                case "companymembers.cancel":
                    this._controllersManager.companyController.cancelInvitation(<ap.models.company.CompanyUserInvitationRequest>this.originalEntity).then((companyUserInvitationRequest: ap.models.company.CompanyUserInvitationRequest) => {
                        this.invitationCancelledHandler(companyUserInvitationRequest);
                    });
                    break;
                case "companymembers.downgrade":
                    this._servicesManager.companyService.downgradeToMember(<ap.models.actors.CompanyUser>this.originalEntity).then((companyUser: ap.models.actors.CompanyUser) => {
                        this.isManager = false;
                        this.actionsVm.computeActionsVisibility();
                    });
                    break;
                case "companymembers.remove":
                    this._controllersManager.companyController.removeCompanyUser(<ap.models.actors.CompanyUser>this.originalEntity).then((companyUser: ap.models.actors.CompanyUser) => {
                        this.companyUserRemoveHandler(companyUser);
                    });
                    break;
                case "companymembers.upgrade":
                    this._servicesManager.companyService.upgradeToManager(<ap.models.actors.CompanyUser>this.originalEntity).then((companyUser: ap.models.actors.CompanyUser) => {
                        this.isManager = true;
                        this.actionsVm.computeActionsVisibility();
                    });
                    break;
            }
        }

        dispose() {
            super.dispose();
            this._actionsVm.dispose();
        }

        static $inject = ["Utility", "ControllersManager", "ServicesManager"];
        constructor($utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager) {
            super($utility);
        }

        private _displayName: string = null;
        private _avatarName: string = null;
        private _isManager: boolean = false;
        private _position: string = null;
        private _status: ap.models.company.InvitationRequestStatus;
        private _statusInfo: StatusInfo;
        protected _originalEntity: ap.models.actors.CompanyUser | ap.models.company.CompanyUserInvitationRequest;
        private _actionsVm: ap.viewmodels.company.CompanyMemberActionsViewModel = null;
    }
}
