module ap.viewmodels.projectcontacts {
    export class ProjectContactManageFlowStateParam extends ap.controllers.MainFlowStateParam {

        public get ids(): string[] {
            return this._ids;
        }

        public createByJson(json: any) {
            super.createByJson(json);
            if (json) {
                this._ids = json.ids;
            }
        }

        public toJSON(): any {
            let json: any;
            json = super.toJSON();
            json.ids = this._ids;
            return json;
        }

        constructor($utility: ap.utility.UtilityHelper, private _ids?: string[]) {
            super($utility);
            this.nameState = "ProjectContactManageFlowStateParam";
        }
    }

    export class ManageContactsWorkspaceViewModel implements IDispose {

        /**
        * This property is to khow when need to show loader
        **/
        public get showTabBusy(): boolean {
            return this._showTabBusy;
        }

        /**
        * This property is to get screen Info
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
         * Get selected tab's number
         */
        public get selectedTab() {
            return this._selectedTab;
        }

        /**
        * Get the UserCategoryLinksListViewModel
        **/
        public get userCategoryLinks(): UserCategoryLinksListViewModel {
            return this._userCategoryLinks;
        }

        /**
        * Get the UserFolderVisibilityListViewModel
        **/
        public get userFolderVisibility(): UserFolderVisibilityListViewModel {
            return this._userFolderVisibility;
        }

        /**
        * Get the ManageUserProjectAccessRightViewModel
        **/
        public get manageUserProjectAccessVm(): ManageUserProjectAccessRightViewModel {
            return this._manageUserProjectAccessVm;
        }

        /**
        * Get the ManageUserProjectAccessRightViewModel
        **/
        public get userAccessRightsListViewModel(): UserAccessRightsListViewModel {
            return this._userAccessRightsListViewModel;
        }

        /**
         * Set selected tab's number and initialize selected tab's viewmodel
         * @param selectedTab selected tab's number
         */
        public set selectedTab(selectedTab: number) {
            if (!!this._currentProject && this._selectedTab !== selectedTab) {
                this._selectedTab = selectedTab;
                this.initializeCurrentTabVm();
            }
        }

        dispose() {
            this._controllersManager.mainController.off("gobackrequested", this.goBackRequestedHandler, this);
            this._controllersManager.uiStateController.off("mainflowstatechanged", this.currentProjectChangedHandler, this);

            this._api.off("showdetailbusy", this.showTabBusyChanged, this);

            if (this.userCategoryLinks)
                this.userCategoryLinks.dispose();
            if (this.userFolderVisibility)
                this.userFolderVisibility.dispose();
            if (this.manageUserProjectAccessVm) {
                this.manageUserProjectAccessVm.dispose();
            }
            if (this.userAccessRightsListViewModel)
                this.userAccessRightsListViewModel.dispose();
            if (this.screenInfo) {
                this._screenInfo.off("actionclicked", this._mainActionClickedHandler, this);
                this.screenInfo.dispose();
            }
        }

        /**
         * Initialize selected tab's viewmodel
         */
        private initializeCurrentTabVm() {
            let currentProject: ap.models.projects.Project = this._controllersManager.mainController.currentProject();

            switch (this._selectedTab) {
                case 0:
                    this._initializeUserProjectAccessRightVm();
                    this.$utility.sendGaPageViewEvent("accessrights");
                    this._servicesManager.toolService.sendEvent("cli-action-open project participants project rights",
                        new Dictionary([
                            new KeyValue("cli-action-open project participants project rights-screenname", "projects"),
                            new KeyValue("cli-action-open project participants project rights-project name", currentProject.Name),
                            new KeyValue("cli-action-open project participants project rights-project id", currentProject.Id)
                        ]));
                    break;
                case 1:
                    this._initializeUserFolderVisibility();
                    this.$utility.sendGaPageViewEvent("foldersvisibility");
                    this._servicesManager.toolService.sendEvent("cli-action-open project participants project folder visibility",
                        new Dictionary([
                            new KeyValue("cli-action-open project participants project folder visibility-screenname", "projects"),
                            new KeyValue("cli-action-open project participants project folder visibility-project name", currentProject.Name),
                            new KeyValue("cli-action-open project participants project folder visibility-project id", currentProject.Id)
                        ]));
                    break;
                case 2:
                    this._initializeUserCategoryLinks();
                    this.$utility.sendGaPageViewEvent("categorieslinks");
                    this._servicesManager.toolService.sendEvent("cli-action-open project participants project category links",
                        new Dictionary([
                            new KeyValue("cli-action-open project participants project category links-screenname", "projects"),
                            new KeyValue("cli-action-open project participants project category links-project name", currentProject.Name),
                            new KeyValue("cli-action-open project participants project category links-project id", currentProject.Id)
                        ]));
                    break;
                case 3:
                    this._initializeUserMeetingAccessRightVm();
                    this.$utility.sendGaPageViewEvent("meetingsrights");
                    this._servicesManager.toolService.sendEvent("cli-action-open project participants project list rights",
                        new Dictionary([
                            new KeyValue("cli-action-open project participants project list rights-screenname", "projects"),
                            new KeyValue("cli-action-open project participants project list rights-project name", currentProject.Name),
                            new KeyValue("cli-action-open project participants project list rights-project id", currentProject.Id)
                        ]));
                    break;
            }
        }

        /**
        * Private method to initialize the VM of the detail config tab of a project
        */
        private _initializeUserCategoryLinks() {
            if (!this._userCategoryLinks) {
                this._userCategoryLinks = new ap.viewmodels.projectcontacts.UserCategoryLinksListViewModel(this.$utility, this.$q, this._controllersManager, this._servicesManager, this._idsSelected);
                this._userCategoryLinks.on("editmodechanged", this.editModeChanged, this);
                this._userCategoryLinks.loadPage(0);
            }
            this.initActions(this._userCategoryLinks.screenInfo.actions);
        }

        /**
        * Private method to initialize the VM of the user folder visibility config tab of a project
        */
        private _initializeUserFolderVisibility() {
            if (!this._userFolderVisibility) {
                this._userFolderVisibility = new UserFolderVisibilityListViewModel(this.$utility, this.$timeout, this._api, this.$q, this._controllersManager, this._servicesManager, this._idsSelected);
                // this._userFolderVisibility.listVm.refresh();
                this._userFolderVisibility.on("editmodechanged", this.editModeChanged, this);
            }
            this.initActions(this._userFolderVisibility.screenInfo.actions);
        }

        /**
         * Private method to initialize the VM of the user project's access rights tab
         */
        private _initializeUserProjectAccessRightVm() {
            if (!this._manageUserProjectAccessVm) {
                this._manageUserProjectAccessVm = new ap.viewmodels.projectcontacts.ManageUserProjectAccessRightViewModel(this.$utility, this._api, this.$q, this.$mdDialog, this._controllersManager, this._servicesManager, this._idsSelected);
                this._manageUserProjectAccessVm.listVm.on("editmodechanged", this.editModeChanged, this);
            }
            this.initActions(this._manageUserProjectAccessVm.listVm.screenInfo.actions);
        }

        /**
         * Private method to initialize the VM of the user meeting's access rights tab
        **/
        private _initializeUserMeetingAccessRightVm() {
            if (!this._userAccessRightsListViewModel) {
                this._userAccessRightsListViewModel = new ap.viewmodels.projectcontacts.UserAccessRightsListViewModel(this.$utility, this.$q, this._controllersManager, this._servicesManager, this.$timeout, this._idsSelected);
                this._userAccessRightsListViewModel.on("editmodechanged", this.editModeChanged, this);
            }
            this.initActions(this._userAccessRightsListViewModel.screenInfo.actions);
        }

        /**
         * Initialize workspace's view
         */
        private initView() {
            if (this._currentProject) {
                let mainFlowStateparam = this._controllersManager.uiStateController.mainFlowStateParam;
                if (!!mainFlowStateparam && mainFlowStateparam instanceof ProjectContactManageFlowStateParam) {
                    this._idsSelected = mainFlowStateparam.ids;
                }
                this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "projectmanage", ap.misc.ScreenInfoType.Detail, null, null, null, this._currentProject.Name, true);
                this._controllersManager.uiStateController.updateScreenInfo(this._screenInfo);
                this._controllersManager.mainController.initScreen(this._screenInfo);
                this._controllersManager.mainController.on("gobackrequested", this.goBackRequestedHandler, this);
                this._screenInfo.on("actionclicked", this._mainActionClickedHandler, this);
                this.selectedTab = 0;
            }
        }

        /**
         * Handler for 'gobackrequested' event, used to go to Participants page when Manage page is closed
         */
        private goBackRequestedHandler() {
            this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.Contacts);
        }

        /**
         * This method is called when the current project of the app changed. In this case, we need to init the view with new project value
         **/
        private currentProjectChangedHandler() {
            this._currentProject = this._controllersManager.mainController.currentProject();
            this.initView();
        }

        /**
        * Handle edit mode change of tab
        **/
        private editModeChanged(args: base.EditModeEvent) {
            let vm = args.vm;
            this._screenInfo.isEditMode = vm.screenInfo.isEditMode;

            if (args.wasNewEntity && args.isCancelAction && vm.screenInfo.isEditMode === false) { // means we are cancelling a new project then, we can go back to the project selection.
                this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.ManageContacts);
            }
        }

        /**
        * Init actions in screen info
        **/
        private initActions(actions: ap.viewmodels.home.ActionViewModel[]) {
            this._screenInfo.actions = actions;
        }

        /**
         * This method will handle the user clicks on an action and will call the correct screenInfo.actionClicked depending of the selected tab
         **/
        private _mainActionClickedHandler(actionName: string) {
            switch (this.selectedTab) {
                case 0: // UserProjectAccessRightVm
                    this._manageUserProjectAccessVm.listVm.screenInfo.actionClick(actionName);
                    break;
                case 1: // UserFolderVisibility
                    this._userFolderVisibility.screenInfo.actionClick(actionName);
                    break;
                case 2: // UserCategoryLinks
                    this._userCategoryLinks.screenInfo.actionClick(actionName);
                    break;
                case 3: // UserAccessRightsList
                    this._userAccessRightsListViewModel.screenInfo.actionClick(actionName);
                    break;
            }
        }

        /**
         * This handler used to change the visibility of the loader 
         * @param showBusyTab - true - to show tab busy / false - to show global busy
         */
        private showTabBusyChanged(showBusyTab: boolean) {
            this._showTabBusy = showBusyTab;
        }

        static $inject = ["$scope", "$timeout", "Utility", "Api", "$q", "$mdDialog", "ControllersManager", "ServicesManager"];
        constructor(private $scope: angular.IScope, private $timeout: angular.ITimeoutService, private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api,
            private $q: angular.IQService, private $mdDialog: angular.material.IDialogService, private _controllersManager: ap.controllers.ControllersManager,
            private _servicesManager: ap.services.ServicesManager) {
            this._api.on("showdetailbusy", this.showTabBusyChanged, this);
            this._currentProject = this._controllersManager.mainController.currentProject();
            if (this._currentProject) {
                this.initView();
            } else {
                this._controllersManager.uiStateController.on("mainflowstatechanged", this.currentProjectChangedHandler, this);
            }

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }
        private _userCategoryLinks: ap.viewmodels.projectcontacts.UserCategoryLinksListViewModel;
        private _userFolderVisibility: ap.viewmodels.projectcontacts.UserFolderVisibilityListViewModel;
        private _manageUserProjectAccessVm: ap.viewmodels.projectcontacts.ManageUserProjectAccessRightViewModel;
        private _userAccessRightsListViewModel: ap.viewmodels.projectcontacts.UserAccessRightsListViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _currentProject: ap.models.projects.Project;
        private _idsSelected: string[];
        private _selectedTab: number;
        private _showTabBusy: boolean = false;
    }
}