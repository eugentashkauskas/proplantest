module ap.viewmodels.projects {

    export enum ProjectConfigTab {
        Details = 0,
        Categories = 1,
        Rooms = 2,
        Statuses = 3
    }

    export class ProjectConfigWorkspaceViewModel implements IDispose {

        /**
        * This property is to khow when need to show loader
        **/
        public get showTabBusy(): boolean {
            return this._showTabBusy;
        }

        /**
        * This property is to get ProjectDetailViewModel
        **/
        public get projectDetailVm(): ProjectDetailViewModel {
            return this._projectDetailVm;
        }

        /**
        * This property is to get ProjectStatusViewModel
        **/
        public get projectStatusVm(): ProjectStatusViewModel {
            return this._projectStatusVm;
        }

        /**
        * This property is to get ProjectRoomConfigViewModel 
        **/
        public get projectRoomConfigVm(): ProjectRoomConfigViewModel {
            return this._projectRoomConfigVm;
        }

        /**
        * This property is to get ProjectIssueTypeConfigViewModel
        **/
        public get projectIssueTypeConfigVm(): ProjectIssueTypeConfigViewModel {
            return this._projectIssueTypeConfigVm;
        }

        /**
        * This property is to get screen Info
        **/
        public get screenInfo(): ap.misc.projects.ProjectConfigScreenInfo {
            return this._screenInfo;
        }

        /**
        * This property is to get hasStatusAccess
        **/
        public get hasStatusAccess(): boolean {
            return this._hasStatusAccess;
        }

        /**
        * This property is to get hasIssueTypeConfigAccess
        **/
        public get hasIssueTypeConfigAccess(): boolean {
            return this._hasIssueTypeConfigAccess;
        }

        /**
        * This property is to get hasRoomConfigAccess
        **/
        public get hasRoomConfigAccess(): boolean {
            return this._hasRoomConfigAccess;
        }

        /**
        * This property is to know any item has blocked status
        **/
        public get disableBlocked(): boolean {
            return this._disableBlocked;
        }

        /**
        * This proprety is to know which tab is selected
        **/
        public get selectedTab(): ProjectConfigTab {
            return this._selectedTab;
        }

        /**
        * This proprety is to set the tab selected
        **/
        public set selectedTab(n: ProjectConfigTab) {
            if (this._selectedTab !== n && this._currentProject) {
                this._selectedTab = n;
                this._screenInfo.selectedTab = this._selectedTab;
                this._initializeCurrentTabVm(n);
            }
        }

        public get validationErrorDisplay(): boolean {
            return this._validationErrorDisplay;
        }

        public set validationErrorDisplay(value: boolean) {
            this._validationErrorDisplay = value;
        }

        public get validationMessage(): string {
            return this._validationMessage;
        }

        public set validationMessage(value: string) {
            this._validationMessage = value;
        }

        /**
        * This methods update mainFlowState when event "gobackrequested" is fired.
        **/
        private _goBackRequestHandler() {
            this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.Projects);
        }

        private checkTabsAccess() {
            this.checkHasStatusAccess();
            this.checkHasIssueTypeConfigAccess();
            this.checkHasRoomConfigAccess();
        }

        /**
        * Method use to know if we have the status access
        **/
        private checkHasStatusAccess() {
            this._hasStatusAccess = this._currentProject && this.Utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectStatusConfig);
        }

        /**
        * Method use to know if we have the status access
        **/
        private checkHasIssueTypeConfigAccess() {
            this._hasIssueTypeConfigAccess = this._currentProject && this.Utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectIssueTypeConfig);
        }

        /**
        * Handle edit mode change of status tab
        **/
        private editModeChanged(args: base.EditModeEvent) {
            let vm = args.vm;
            this._screenInfo.isEditMode = vm.screenInfo.isEditMode;
            if (args.wasNewEntity && args.isCancelAction && vm.screenInfo.isEditMode === false) { // means we are cancelling a new project then, we can go back to the project selection.
                this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.Projects);
            }
        }

        /**
        * Method use to know if we have the room config access
        **/
        private checkHasRoomConfigAccess() {
            this._hasRoomConfigAccess = this._currentProject && this.Utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectRoomConfig);
        }

        /**
        * Method use to charge the viewModel of the selected tab if it has not been initialized yet
        **/
        private _initializeCurrentTabVm(tab: ProjectConfigTab) {
            switch (tab) {
                case ProjectConfigTab.Details:
                    this._initializeProjectDetailVm();
                    this.Utility.sendGaPageViewEvent("detail");
                    break;
                case ProjectConfigTab.Categories:
                    this._initializeProjectIssueTypeConfigVm();
                    this.Utility.sendGaPageViewEvent("categories");
                    break;
                case ProjectConfigTab.Rooms:
                    this._initializeProjectRoomConfigVm();
                    this.Utility.sendGaPageViewEvent("rooms");
                    break;
                case ProjectConfigTab.Statuses:
                    this._initializeProjectStatusVm();
                    this.Utility.sendGaPageViewEvent("statuses");
                    break;
            }
        }

        /**
        * Private method to initialize the VM of the detail config tab of a project
        */
        private _initializeProjectDetailVm() {
            if (!this._projectDetailVm) {
                this._projectDetailVm = new ProjectDetailViewModel(this.Utility, this.$q, this.$timeout, this._controllersManager, this.servicesManager, true);
                this._projectDetailVm.on("editmodechanged", this.editModeChanged, this);
                if (this._screenInfo.isEditMode && this._controllersManager.mainController.currentProject().UserAccessRight.CanEdit) {
                    this._projectDetailVm.gotoEditMode();
                }
            }
            this.initActions(this._projectDetailVm.screenInfo.actions);
        }

        /**
        * Private method to initialize the VM of the issues types config tab of a project
        */
        private _initializeProjectIssueTypeConfigVm() {
            if (!this._projectIssueTypeConfigVm) {
                this._projectIssueTypeConfigVm = new ProjectIssueTypeConfigViewModel(this.$scope, this.Utility, this.$q, this._api, this._controllersManager, this.servicesManager, this.$mdDialog, this.$timeout, this._screenInfo.selectedChapter, this._screenInfo.selectedIssueType);
                this._projectIssueTypeConfigVm.on("editmodechanged", this.editModeChanged, this);
                this._projectIssueTypeConfigVm.chapterListVm.on("selectedItemChanged", this.selectedChapterChanged, this);
                this._projectIssueTypeConfigVm.issueTypeListVm.on("selectedItemChanged", this.selectedIssueTypeChanged, this);
                this._projectIssueTypeConfigVm.initScreen();
                if (this._screenInfo.isEditMode && this.Utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectIssueTypeConfig)) {
                    this._projectIssueTypeConfigVm.gotoEditMode();
                }
            } else {
                this._projectIssueTypeConfigVm.initScreen();
            }
            this._projectIssueTypeConfigVm.loadIdsData();
            this.initActions(this._projectIssueTypeConfigVm.screenInfo.actions);
        }

        /**
        * Private method to initialize the VM of the rooms config of a project
        */
        private _initializeProjectRoomConfigVm() {
            if (!this._projectRoomConfigVm) {
                this._projectRoomConfigVm = new ProjectRoomConfigViewModel(this.Utility, this.$q, this.$mdDialog, this._api, this._controllersManager, this.servicesManager, this.$timeout,
                    this._screenInfo.selectedParentCell);
                this._projectRoomConfigVm.on("editmodechanged", this.editModeChanged, this);
                this._projectRoomConfigVm.parentCellListVm.on("selectedItemChanged", this.selectedParentCellChanged, this);
                this._projectRoomConfigVm.initScreen();
                if (this._screenInfo.isEditMode && this.Utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectRoomConfig)) {
                    this._projectRoomConfigVm.gotoEditMode();
                }
            } else {
                this._projectRoomConfigVm.initScreen();
            }
            this._projectRoomConfigVm.load();
            this.initActions(this._projectRoomConfigVm.screenInfo.actions);
        }

        /**
        * Private method to initialize the VM of the statuses config tab of a project
        */
        private _initializeProjectStatusVm() {
            if (!this._projectStatusVm) {
                this._projectStatusVm = new ProjectStatusViewModel(this.Utility, this.$q, this._controllersManager, null, this._api, this.$mdDialog, this.servicesManager, this.$timeout, this._screenInfo.selectedStatus);
                this._projectStatusVm.on("editmodechanged", this.editModeChanged, this);
                this._projectStatusVm.noteProjectStatusListVm.on("selectedItemChanged", this.selectedStatusChanged, this);
                if (this._screenInfo.isEditMode && this.Utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectStatusConfig)) {
                    this._projectStatusVm.gotoEditMode();
                }
            }
            this._projectStatusVm.loadData();
            this.initActions(this._projectStatusVm.screenInfo.actions);
        }

        private initActions(actions: ap.viewmodels.home.ActionViewModel[]) {
            this._screenInfo.actions = actions;
        }

        /**
         * This method will handle the user clicks on an action and will call the correct screenInfo.actionClicked depending of the selected tab
         **/
        private _mainActionClickedHandler(actionName: string) {
            switch (this.selectedTab) {
                case ProjectConfigTab.Details:
                    this.projectDetailVm.screenInfo.actionClick(actionName);
                    break;
                case ProjectConfigTab.Categories:
                    this._projectIssueTypeConfigVm.screenInfo.actionClick(actionName);
                    break;
                case ProjectConfigTab.Rooms:
                    this._projectRoomConfigVm.screenInfo.actionClick(actionName);
                    break;
                case ProjectConfigTab.Statuses:
                    this._projectStatusVm.screenInfo.actionClick(actionName);
                    break;
            }
        }

        /**
        * Dispose method
        **/
        dispose(): void {
            this._api.off("showdetailbusy", this.showTabBusyChanged, this);
            this._controllersManager.uiStateController.off("mainflowstatechanged", this.currentProjectChangedHandler, this);
            if (this._controllersManager.mainController) {
                this._controllersManager.mainController.off("gobackrequested", this._goBackRequestHandler, this);
                this._controllersManager.mainController.off("mainactionitemclicked", this._mainActionClickedHandler, this);
            }
            if (this._screenInfo)
                this._screenInfo.dispose();

            if (this.projectStatusVm) this.projectStatusVm.dispose();
            if (this.projectDetailVm) {
                this.projectDetailVm.dispose();
            }
            if (this.projectRoomConfigVm) {
                this.projectRoomConfigVm.dispose();
            }
            if (this.projectStatusVm) {
                this.projectStatusVm.dispose();
            }
            if (this.projectIssueTypeConfigVm) {
                this.projectIssueTypeConfigVm.dispose();
            }
        }

        /**
         * This method is to initialize the view with the current project
         **/
        private initView() {
            this.checkTabsAccess();
            if (this._currentProject) {
                this._screenInfo = new ap.misc.projects.ProjectConfigScreenInfo(this.Utility, this._currentProject.Name);
                this._controllersManager.uiStateController.updateScreenInfo(this._screenInfo);
                this._controllersManager.mainController.initScreen(this._screenInfo);
                this.selectedTab = this._screenInfo.selectedTab !== undefined ? this._screenInfo.selectedTab : 0;
                this._controllersManager.mainController.on("gobackrequested", this._goBackRequestHandler, this);
                this._screenInfo.on("actionclicked", this._mainActionClickedHandler, this);
                if (this._currentProject.IsNew) {
                    this.editModeChanged(new base.EditModeEvent(this._projectDetailVm));
                }
            }
        }

        /**
         * This method is called when the current project of the app changed. In this case, we need to init the view with new project value
         **/
        private currentProjectChangedHandler() {
            this._currentProject = this._controllersManager.mainController.currentProject();
            if (this._currentProject) {
                this.initView();
            }
        }

        /**
         * Save selected chapter's ID to the session storage when selected chapter is changed
         * @param selectedChapter Selected chapter entity
         */
        private selectedChapterChanged(selectedChapter: ap.viewmodels.EntityViewModel) {
            if (selectedChapter) {
                this._screenInfo.selectedChapter = selectedChapter.originalEntity.Id;
                this._screenInfo.selectedIssueType = null;
            }
        }

        /**
         * Save selected issue type's ID to the session storage when selected issue type is changed
         * @param selectedIssueType  Selected issue type entity
         */
        private selectedIssueTypeChanged(selectedIssueType: ap.viewmodels.EntityViewModel) {
            if (selectedIssueType) {
                this._screenInfo.selectedIssueType = selectedIssueType.originalEntity.Id;
            }
        }

        /**
         * Save selected parent cell's ID to the session storage when selected parent cell is changed
         * @param selectedParentCell Selected parent cell entity
         */
        private selectedParentCellChanged(selectedParentCell: ap.viewmodels.EntityViewModel) {
            if (selectedParentCell) {
                this._screenInfo.selectedParentCell = selectedParentCell.originalEntity.Id;
            }
        }

        /**
         * Save selected status' ID to the session storage when selected status is changed
         * @param selectedStatus Selected status entity
         */
        private selectedStatusChanged(selectedStatus: ap.viewmodels.EntityViewModel) {
            if (selectedStatus) {
                this._screenInfo.selectedStatus = selectedStatus.originalEntity.Id;
            }
        }

        /**
         * This handler used to change the visibility of the loader 
         * @param showBusyTab - true - to show tab busy / false - to show global busy
         */
        private showTabBusyChanged(showBusyTab: boolean) {
            if (showBusyTab === false) {
                // Hide a loading indicator if a loading is finished. We don't care if the loading was
                // originated from a nesterd tab or from a popup window. This is needed to ensure
                // that we won't miss a nested tab loading finish event because of the opened popup.
                this._showTabBusy = false;
                return;
            }

            let isEventFromPopup = false;
            if (this.selectedTab === ProjectConfigTab.Categories && this._projectIssueTypeConfigVm) {
                isEventFromPopup = this._projectIssueTypeConfigVm.isPopupActive;
            } else if (this.selectedTab === ProjectConfigTab.Rooms && this._projectRoomConfigVm) {
                isEventFromPopup = this._projectRoomConfigVm.isPopupActive;
            }

            if (isEventFromPopup) {
                // If some of the nested tabs has an active popup then we assume that
                // this event is originated from this popup. In this case the popup
                // is responsible to handle it.
                return;
            }

            this._showTabBusy = showBusyTab;
        }

        static $inject = ["$scope", "ControllersManager", "Utility", "$q", "Api", "ServicesManager", "$mdDialog", "$timeout"];
        constructor(private $scope: angular.IScope, private _controllersManager: ap.controllers.ControllersManager, private Utility: ap.utility.UtilityHelper,
            private $q: angular.IQService, private _api: ap.services.apiHelper.Api, private servicesManager: ap.services.ServicesManager, private $mdDialog: angular.material.IDialogService, private $timeout: angular.ITimeoutService) {
            this._currentProject = this._controllersManager.mainController.currentProject();
            this._api.on("showdetailbusy", this.showTabBusyChanged, this);
            if (!!this._currentProject) {
                this.initView();
            } else {
                this._controllersManager.uiStateController.on("mainflowstatechanged", this.currentProjectChangedHandler, this);
            }
            $scope.$on("$destroy", () => this.dispose());
        }

        private _selectedTab: ProjectConfigTab;
        private _currentProject: ap.models.projects.Project;
        private _projectDetailVm: ProjectDetailViewModel;
        private _projectStatusVm: ProjectStatusViewModel;
        private _projectRoomConfigVm: ProjectRoomConfigViewModel;
        private _projectIssueTypeConfigVm: ProjectIssueTypeConfigViewModel;
        private _screenInfo: ap.misc.projects.ProjectConfigScreenInfo;
        private _hasRoomConfigAccess: boolean = false;
        private _hasStatusAccess: boolean = false;
        private _hasIssueTypeConfigAccess: boolean = false;
        private _disableBlocked: boolean = false;
        private _validationErrorDisplay: boolean = false;
        private _showTabBusy: boolean = false;
        private _validationMessage: string = "";
    }
}