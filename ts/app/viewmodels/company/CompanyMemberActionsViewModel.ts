namespace ap.viewmodels.company {

    export class CompanyMemberActionsViewModel implements IDispose {

        /**
         * A public accessors for actions managed by this view model
         */
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
         * This public method is used to check isVisible of action
         */
        public actionsVisible() {
            return this._removeAction.isVisible || this._cancelAction.isVisible;
        }

        /**
         * Determines whether the current user is a manager of the company
         * @returns true if the current user is a manager, otherwise - false
         */
        private isCurrentUserManager(): boolean {
            let company = this.controllersManager.companyController.managedCompany;
            if (!company) {
                return false;
            }

            let currentUser = <ap.models.actors.User>this.$utility.UserContext.CurrentUser();
            let companyUser = company.CompanyUsers.filter((companyUser: ap.models.actors.CompanyUser) => {
                return companyUser.User.Id === currentUser.Id;
            })[0];
            return companyUser && companyUser.IsManager;
        }

        /**
         * Determines visibility and availability of actions
         */
        public computeActionsVisibility() {
            let isRemoveAvailable = false;
            let isCancelAvailable = false;
            let isDowngradable = false;
            let isUpgradable = false;

            if (this.companyMemberItemVm && this.companyMemberItemVm.originalEntity) {
                let isManager = this.isCurrentUserManager();

                if (this.companyMemberItemVm.originalEntity instanceof ap.models.actors.CompanyUser) {
                    let companyUser = this.companyMemberItemVm.originalEntity;
                    let isOwner = companyUser.IsOwner;
                    let isCurrentUser = companyUser.User.Id === this.$utility.UserContext.CurrentUser().Id;
                    isRemoveAvailable = isManager && !isOwner && !isCurrentUser;
                } else {
                    isCancelAvailable = isManager && this.companyMemberItemVm.status === ap.models.company.InvitationRequestStatus.Sent;
                }

                if (isManager && this.companyMemberItemVm.originalEntity instanceof ap.models.actors.CompanyUser) {
                    isDowngradable = this.companyMemberItemVm.isManager && (<ap.models.actors.User>this.$utility.UserContext.CurrentUser()).Id !== (<ap.models.actors.CompanyUser>this.companyMemberItemVm.originalEntity).User.Id;
                }

                if (isManager && this.companyMemberItemVm.originalEntity instanceof ap.models.actors.CompanyUser) {
                    isUpgradable = !this.companyMemberItemVm.isManager && (<ap.models.actors.User>this.$utility.UserContext.CurrentUser()).Id !== (<ap.models.actors.CompanyUser>this.companyMemberItemVm.originalEntity).User.Id;
                }

            }

            this._removeAction.isVisible = isRemoveAvailable;
            this._removeAction.isEnabled = isRemoveAvailable;
            this._cancelAction.isVisible = isCancelAvailable;
            this._cancelAction.isEnabled = isCancelAvailable;
            this._downgradeAction.isEnabled = isDowngradable;
            this._downgradeAction.isVisible = isDowngradable;
            this._upgradeMemberAction.isEnabled = isUpgradable;
            this._upgradeMemberAction.isVisible = isUpgradable;
        }

        /**
         * This public method is used to set action disabled
         */
        public setActionDisabled(): void {
            this.actions.forEach((action: home.ActionViewModel) => {
                action.isVisible = false;
                action.isEnabled = false;
            });
        }

        public dispose() {
        }

        constructor(private $utility: ap.utility.UtilityHelper, private companyMemberItemVm: ap.viewmodels.company.CompanyMemberItemViewModel, private controllersManager: ap.controllers.ControllersManager) {
            this._removeAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "companymembers.remove", null, false, null, "Remove member", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "companymembers.cancel", $utility.rootUrl + "Images/html/icons/ic_not_interested_black_48px.svg", false, null, "Cancel request", false);
            this._downgradeAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "companymembers.downgrade", null, false, null, "Downgrade to member", false, false, null, false, true);
            this._upgradeMemberAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "companymembers.upgrade", null, false, null, "Upgrade to manager", false, false, null, false, true);
            this._actions = [
                this._upgradeMemberAction,
                this._downgradeAction,
                this._removeAction,
                this._cancelAction
            ];

            this.computeActionsVisibility();
        }

        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _removeAction: ap.viewmodels.home.ActionViewModel;
        private _cancelAction: ap.viewmodels.home.ActionViewModel;
        private _downgradeAction: ap.viewmodels.home.ActionViewModel;
        private _upgradeMemberAction: ap.viewmodels.home.ActionViewModel;
    }

}
