namespace ap.viewmodels.company {

    export class CompanyUserWorkspaceViewModel implements IDispose {

        public get company(): models.actors.ManagedCompany {
            return this._company;
        }

        public get listWorkspaceVm(): CompanyMemberListViewModel {
            return this._listCompanyMemberViewModel;
        }

        public get settingsLink(): string {
            return this._goToSettingsLink;
        }

        /**
         * Constructs a screen info for the form templates screen
         */
        private initView() {
            this._addAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "companymembers.add", this.$utility.rootUrl + "/Images/html/icons/ic_person_add_black_48px.svg", false, null, "Add company member", true, false);
            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "companymembers", ap.misc.ScreenInfoType.List, null, this._addAction, null);
            this.$controllersManager.uiStateController.updateScreenInfo(this._screenInfo);
            this.$controllersManager.mainController.initScreen(this._screenInfo);
            if (this.company) {
                this._listCompanyMemberViewModel = new CompanyMemberListViewModel(this.$utility, this.$q, this.$controllersManager, this._servicesManager);
                this._listCompanyMemberViewModel.loadNextPage();
            }
            this._screenInfo.on("addactionclicked", this.handleAddActionEvents, this);
            this.computeActionsVisibility();
            this.initLinkTranslation();
        }

        /**
         * This method use for compute isVisible property for actions
         */
        private computeActionsVisibility() {
            this._addAction.isVisible = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_CompanyManagement) && this.$controllersManager.companyController.isCurrentUserAtLeastManager();
        }

        private handleAddActionEvents(action: ap.controllers.AddActionClickEvent) {
            let actionName = action.name;
            switch (actionName) {
                case "companymembers.add":
                    this.openAddMembersPopup();
                    break;
            }
        }

        /**
         * This method use open popup of add Company members
         */
        private openAddMembersPopup() {
            let addCompanyMemberController = ($scope: angular.IScope) => {
                $scope["vm"] = new ap.viewmodels.company.AddCompanyMemberViewModel(this.$utility, this.$mdDialog, this.$controllersManager.mainController, this.$controllersManager.companyController, this.api, this.$q, this.$timeout);
            };
            addCompanyMemberController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Company&name=AddCompanyMemberDialog",
                fullscreen: true,
                controller: addCompanyMemberController
            }).then(() => {
                this._listCompanyMemberViewModel.clear();
                this._listCompanyMemberViewModel.loadIds();
            });
        }

        public dispose() {
            if (this._screenInfo) {
                this._screenInfo.off("addactionclicked", this.handleAddActionEvents, this);
                this._screenInfo.dispose();
            }
            if (this._listCompanyMemberViewModel) {
                this._listCompanyMemberViewModel.dispose();
            }
        }

        /**
         * Initialize the link to create a new company
         */
        private initLinkTranslation() {
            this._goToSettingsLink = this.$utility.rootUrl + "MyAccount/Members";
        }

        static $inject = ["Utility", "$scope", "ControllersManager", "Api", "$q", "$mdDialog", "$timeout", "ServicesManager"];
        constructor(private $utility: ap.utility.UtilityHelper, private $scope: angular.IScope, private $controllersManager: ap.controllers.ControllersManager, private api: ap.services.apiHelper.Api, private $q: angular.IQService, private $mdDialog: angular.material.IDialogService, private $timeout: angular.ITimeoutService, private _servicesManager: ap.services.ServicesManager) {
            if (this.$controllersManager.companyController.managedCompany) {
                this._company = this.$controllersManager.companyController.managedCompany;
                this.initView();
            } else {
                this.$controllersManager.companyController.loadManagedCompany().then((company) => {
                    this._company = this.$controllersManager.companyController.managedCompany;
                    this.initView();
                });
            }

            this.$scope.$on("$destroy", this.dispose);
        }

        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _listCompanyMemberViewModel: CompanyMemberListViewModel;
        private _company: models.actors.ManagedCompany;
        private _goToSettingsLink: string;
    }
}
