module ap.viewmodels.projects {

    /**
     * This class is used to create the parameter needed for each item.
     **/
    class ProjectItemParameterBuilder implements ItemParameterBuilder {
        createItemParameter(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper): ItemConstructorParameter {
            return new ProjectItemParameter(itemIndex, dataSource, pageDesc, parameters, utility, this.projectController, this.mainController);
        }

        constructor(private projectController: ap.controllers.ProjectController, private mainController: ap.controllers.MainController) { }
    }

    export enum View {
        Thumb,
        Grid
    }

    export class ProjectListViewModel implements IDispose {
        /**
         * To know the current state of the screen
         */
        get isThumbView(): boolean {
            return this._view === View.Thumb;
        }

        /**
         * Refreshes the list of projects
         */
        refresh(): void {
            this.listVm.clearLoaderCache();
            this._loadData();
        }

        /**
         * Selects a project
         * @param id The id of the selected project
         */
        acceptSelection(id?: string): void {
            if (this.isProjectInfoOpened) {
                this.listVm.selectEntity(id);
                return;
            }
            let selectedVm: IEntityViewModel = this.listVm.selectedViewModel;
            if (selectedVm !== null && (!id || selectedVm.originalEntity.Id === id)) {
                this._servicesManager.projectService.getProjectDetailInformation(selectedVm.originalEntity.Id).then((args: ap.services.apiHelper.ApiResponse) => {
                    this._mainController.currentProject(<ap.models.projects.Project>args.data);
                });
            }
            else if (!!id) {
                this.listVm.selectEntity(id);
                selectedVm = this.listVm.selectedViewModel;
                this._mainController.currentProject(<ap.models.projects.Project>selectedVm.originalEntity);
            }
        }

        /**
         * Switch from thumbnails view to grid view
         */
        toggleView() {
            this._view = (this._view !== View.Thumb) ? View.Thumb : View.Grid;

            this.listVm.isDeferredLoadingMode = this._view !== View.Thumb;
            this._mainController.getMainAction("groupprojectlist").isVisible = !this.isThumbView;
            this._mainController.getMainAction("groupprojectgrid").isVisible = this.isThumbView;
            this._utility.Storage.Local.set("project.view", this._view);

            this.refresh();
        }

        /**
         * Toggle the right panel containing the info
         * @param selectedProject The project to show the info
         */
        toggleRight(selectedProject?: ap.models.projects.Project): void {
            if (selectedProject) {
                this._views.selectedEntityId = selectedProject.Id;
                this.screenInfo.selectedEntityId = selectedProject.Id;
            } else {
                this._views.selectedEntityId = null;
                this.screenInfo.selectedEntityId = null;
            }

            if (selectedProject && this.isProjectInfoOpened === false) {
                this.isProjectInfoOpened = true;
                this._projectInfoVm = new ap.viewmodels.projects.ProjectDetailViewModel(this._utility, this.$q, this.$timeout, this._controllersManager, this._servicesManager, false);
                this._projectInfoVm.init(selectedProject);
            }
            else if (selectedProject && this.isProjectInfoOpened === true) {
                this.disposeProjectInfoVm();
                this._projectInfoVm = new ap.viewmodels.projects.ProjectDetailViewModel(this._utility, this.$q, this.$timeout, this._controllersManager, this._servicesManager, false);
                this._projectInfoVm.init(selectedProject);
            }
            else {
                this.isProjectInfoOpened = false;
                this.disposeProjectInfoVm();
            }
        }

        private disposeProjectInfoVm() {
            if (this._projectInfoVm) {
                this._projectInfoVm.dispose();
                this._projectInfoVm = null;
            }
        }

        /**
         * Select project's entity
         * @param entity Project's entity viewmodel
         */
        public selectItem(entity: IEntityViewModel) {
            this._views.selectedEntityId = entity.originalEntity.Id;
            this.listVm.selectEntity(entity.originalEntity.Id);
            this.screenInfo.selectedEntityId = entity.originalEntity.Id;
        }

        /**
        * This property is to get ProjectDetailViewModel
        **/
        public get projectInfoVm(): ProjectDetailViewModel {
            return this._projectInfoVm;
        }

        /**
        * Use to know the filter 
        **/
        public get hasActiveFilter(): boolean {
            return this._hasActiveFilter;
        }

        public get screenInfo() {
            return this._screenInfo;
        }

        /**
        * To know if the detail pane is opened or not
        **/
        public get isProjectInfoOpened(): boolean {
            return this.screenInfo.isInfoOpened;
        }

        public set isProjectInfoOpened(open: boolean) {
            if (this.screenInfo.isInfoOpened !== open) {
                this._views.isInfoOpened = open;
                this.screenInfo.isInfoOpened = open;

                if (open) {
                    // send a Google Analytics event when the project info is opened
                    this._utility.sendGaPageViewEvent("projectInfo");
                }
            }
        }

        /**
         * Loads the data
         */
        private _loadData() {
            this._buildFilter();

            this.listVm.loadIds(this._filter, null).then(() => {
                this.listVm.loadNextPage().then(() => {
                    if (this._views) {
                        if (this._views.isInfoOpened !== undefined) {
                            this.isProjectInfoOpened = this._views.isInfoOpened;
                        }
                        if (this._views.selectedEntityId) {
                            this.listVm.selectEntity(this._views.selectedEntityId);
                            this.screenInfo.selectedEntityId = this._views.selectedEntityId;
                            if (this.listVm.ids.indexOf(this._views.selectedEntityId) === -1) {
                                this.isProjectInfoOpened = false;
                            }
                        }
                    }
                });
            });
        }

        /**
         * Creates the filter to load the list of projects
         */
        private _buildFilter(): void {
            if (this.screenInfo.mainSearchInfo.filterString !== null)
                this._filter = this.screenInfo.mainSearchInfo.filterString;
            else
                this._filter = "";
        }

        /**
         * Method called when the value of the mainSearch changes
         * @param newValue The new value of the mainSearch
         */
        private _mainSearchChanged(newValue: string) {
            this._updateHasActiveFilter();
            if (this._mainController.uiStateController.mainFlowState !== ap.controllers.MainFlow.Projects) return;
            this._loadData();
        }

        /**
        * Method use to know the current filter into the mainsearch
        **/
        private _updateHasActiveFilter() {
            if (this.screenInfo.mainSearchInfo.filterString !== null) {
                if (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived"))
                    this._hasActiveFilter = false;
                else if (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active"))
                    this._hasActiveFilter = true;
                else {
                    this._hasActiveFilter = null;
                }
            } else {
                this._hasActiveFilter = null;
            }
        }

        /**
         * Method called when the state of the app changes
         * @param newValue The new state
         */
        private _mainFlowStateChanged(newValue: string) {
            this.screenInfo.mainSearchInfo.off("filterchanged", this._mainSearchChanged, this);
        }

        /**
         * This method handles mainactions clicks on the main tool bar to know what to do in the list of projects.
         **/
        private handleMainControllerEvents(action: string): void {
            switch (action) {
                case "groupprojectlist":
                case "groupprojectgrid":
                    this.toggleView();
                    break;
                case "refreshprojects":
                    this.refresh();
                    break;
            }
        }

        /**
         * This method is to handle the click on the add action.
         **/
        private handleAddActionClick(addAction: ap.controllers.AddActionClickEvent) {
            if (addAction) {
                switch (addAction.name) {
                    case "project.addproject":
                        let newProject: ap.models.projects.Project = new ap.models.projects.Project(this._utility);
                        this._mainController.currentProject(newProject, ap.controllers.MainFlow.ProjectConfig);
                }
            }
        }

        /**
         * Handler method called when a project is selected 
         */
        private _selectedProjectChangedHandler() {
            if (!this.isProjectInfoOpened)
                return;

            if (this.listVm.selectedViewModel && this.listVm.selectedViewModel.originalEntity) {
                this._views.selectedEntityId = this.listVm.selectedViewModel.originalEntity.Id;
                this.screenInfo.selectedEntityId = this.listVm.selectedViewModel.originalEntity.Id;
            }
            this._projectInfoVm = new ap.viewmodels.projects.ProjectDetailViewModel(this._utility, this.$q, this.$timeout, this._controllersManager, this._servicesManager, false);
            this._projectInfoVm.init(this.listVm.selectedViewModel ? <ap.models.projects.Project>this.listVm.selectedViewModel.originalEntity : null);
        }

        /**
         * PageLoadedHandler method called when a page of projects is loaded
         * @param items The loaded projects
         */
        private pageLoadedHandler(items: ProjectItemViewModel[]) {
            let loadedItemsDic: Dictionary<string, ProjectItemViewModel> = new Dictionary<string, ProjectItemViewModel>();

            items.forEach((project: ProjectItemViewModel) => {
                loadedItemsDic.add(project.originalEntity.Id, project);
            });

            let opt = new ap.services.apiHelper.ApiOption();
            opt.async = true;
            opt.isShowBusy = false;
            opt.isShowError = false;

            if (loadedItemsDic.count > 0) {
                // load notes count per project
                this._api.getApiResponseStatList("notestats", "Project.Id", "Filter.And(Filter.In(Project.Id," + loadedItemsDic.keys().join(",") + "),Filter.IsFalse(IsArchived))", opt).then((res: ap.services.apiHelper.ApiResponse) => {
                    if (res.data && res.data.length > 0) {
                        res.data[0].forEach((stat: ap.models.stats.StatResult) => {
                            let item = loadedItemsDic.getValue(stat.GroupByValue);
                            item.notesCount = stat.Count;
                        });
                    }
                });

                // load documents count per project
                this._api.getApiResponseStatList("documentstats", "Folder.Project.Id", "Filter.And(Filter.In(Folder.Project.Id," + loadedItemsDic.keys().join(",") + "),Filter.IsFalse(IsArchived))", opt).then((res: ap.services.apiHelper.ApiResponse) => {
                    if (res.data && res.data.length > 0) {
                        res.data[0].forEach((stat: ap.models.stats.StatResult) => {
                            let item = loadedItemsDic.getValue(stat.GroupByValue);
                            item.documentsCount = stat.Count;
                        });
                    }
                });

                // load contactdetails count per project
                this._api.getApiResponseStatList("contactdetailsstats", "Project.Id", "Filter.And(Filter.In(Project.Id," + loadedItemsDic.keys().join(",") + "),Filter.IsFalse(IsDisabled))", opt).then((res: ap.services.apiHelper.ApiResponse) => {
                    if (res.data && res.data.length > 0) {
                        res.data[0].forEach((stat: ap.models.stats.StatResult) => {
                            let item = loadedItemsDic.getValue(stat.GroupByValue);
                            item.documentsCount = stat.Count;
                        });
                    }
                });
            }
        }

        /**
         * Dispose the object
         */
        dispose() {
            this._uiStateController.off("mainflowstatechanged", this._mainFlowStateChanged, this);
            this._projectController.off("openprojectinfopane", this.toggleRight, this);
            this._api.off("showdetailbusy", this.changeVisibleDetailPaneBusy, this);

            if (this._projectInfoVm) {
                this._projectInfoVm.dispose();
                this._projectInfoVm = null;
            }
            if (this._screenInfo) {
                this._screenInfo.dispose();
                this._screenInfo = null;
            }

            if (this.listVm) {
                this.listVm.dispose();
                this.listVm = null;
            }
        }

        private changeVisibleDetailPaneBusy(showBusy: boolean) {
            this._projectInfoVm.showDetailPaneBusy = showBusy;
        }

        /**
        * Dispose not private objects
        */
        private interalDispose(mainSearchInfo: misc.MainSearchInfo, predefinedFilters: misc.PredefinedFilter[], ) {
            if (mainSearchInfo) {
                mainSearchInfo.dispose();
                mainSearchInfo = null;
            }

            if (predefinedFilters) {
                predefinedFilters.splice(0);
                predefinedFilters = null;
            }
        }

        static $inject = ["$scope", "Utility", "Api", "MainController", "UIStateController", "$q", "$timeout", "ProjectController", "ControllersManager", "ServicesManager"];
        constructor($scope: IProjectsViewModel, private _utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private _mainController: ap.controllers.MainController, private _uiStateController: ap.controllers.UIStateController,
            private $q: angular.IQService, private $timeout: angular.ITimeoutService, private _projectController: ap.controllers.ProjectController, private _controllersManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager) {
            this._api.on("showdetailbusy", this.changeVisibleDetailPaneBusy, this);
            this._views = new ap.misc.ViewInfo(this._utility);

            if (this._controllersManager.uiStateController.mainFlowStateParam && this._controllersManager.uiStateController.mainFlowStateParam.openedViews[0]) {
                this._views = this._controllersManager.uiStateController.mainFlowStateParam.openedViews[0];
            }

            this._view = this._utility.Storage.Local.get("project.view");
            if (this._view === null)
                this._view = View.Thumb;

            this.listVm = new GenericPagedListViewModels(_utility, _controllersManager.listController, $q, new GenericPagedListOptions("Project", ProjectItemViewModel, this._pathToLoad, undefined, undefined, undefined, undefined, undefined, undefined,
                new ProjectItemParameterBuilder(this._projectController, this._mainController)));

            this.listVm.isDeferredLoadingMode = this._view !== View.Thumb;
            this.listVm.on("selectedItemChanged", this._selectedProjectChangedHandler, this);
            this.listVm.on("pageloaded", this.pageLoadedHandler, this);

            this.itemsInfinite = this.listVm;

            let mainActions: Array<ap.viewmodels.home.ActionViewModel> = [
                new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "groupprojectgrid", this._utility.rootUrl + "Images/html/icons/ic_view_list_black_48px.svg", this.isThumbView, null, "Grid view", true),
                new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "groupprojectlist", this._utility.rootUrl + "Images/html/icons/thumb_view.svg", !this.isThumbView, null, "Thumb view", true),
                new ap.viewmodels.home.ActionViewModel(this._utility, this._utility.EventTool, "refreshprojects", this._utility.rootUrl + "Images/html/icons/ic_refresh_black_48px.svg", true, null, "Refresh projects", true)
            ];

            let addActions = new ap.viewmodels.home.ActionViewModel(this._utility, _utility.EventTool, "project.addproject", "/Images/html/icons/ic_add_black_48px.svg", true, null, "Add project", true, null, new ap.misc.Shortcut("c"));

            this._uiStateController.on("mainflowstatechanged", this._mainFlowStateChanged, this);

            let predefinedFilters = [
                new ap.misc.PredefinedFilter("Active", "Active projects", true, "Filter.IsTrue(IsActive)", null, ["Archived"]),
                new ap.misc.PredefinedFilter("Archived", "Inactive projects", true, "Filter.IsFalse(IsActive)", null, ["Active"])
            ];
            let mainSearcheInfo = new ap.misc.MainSearchInfo(_utility, $timeout, [], [
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Code", "Code"), null),
                new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Name", "Name"), null)],
                predefinedFilters, true);
            mainSearcheInfo.isVisible = true;
            mainSearcheInfo.isEnabled = true;

            this._screenInfo = new ap.misc.projects.ProjectListScreenInfo(_utility, mainActions, addActions, mainSearcheInfo);
            this._mainController.initScreen(this._screenInfo);
            if (this._screenInfo.mainSearchInfo.criterions.length === 0) { // If not default criterions defined, the default one should be the active projects
                this._screenInfo.mainSearchInfo.addCriterion(predefinedFilters[0]);
            }
            this._screenInfo.on("addactionclicked", this.handleAddActionClick, this);
            this._screenInfo.mainSearchInfo.on("criterionschanged", this._mainSearchChanged, this);
            this._projectController.on("openprojectinfopane", this.toggleRight, this);
            this._screenInfo.on("actionclicked", this.handleMainControllerEvents, this);

            this._loadData();

            ap.viewmodels.meetings.MeetingListWorkSpaceViewModel.resetSortingInfo(_utility);
            ap.viewmodels.notes.NoteListViewModel.resetSortingInfo(_utility);
            ap.viewmodels.documents.DocumentListViewModel.resetSortingInfo(_utility);

            $scope.$on("$destroy", () => {
                this.dispose();

                this.interalDispose(mainSearcheInfo, predefinedFilters);
            });

            this._updateHasActiveFilter();
        }

        public listVm: ap.viewmodels.GenericPagedListViewModels;
        public itemsInfinite: ap.viewmodels.GenericPagedListViewModels;
        private _views: ap.misc.IViewInfo;
        private _projectInfoVm: ProjectDetailViewModel;
        private _filter: string = null;
        private _view: View;
        private _pathToLoad: string = "Creator,UserAccessRight";
        private _screenInfo: ap.misc.ScreenInfo;
        private _hasActiveFilter: boolean;
        private _isProjectInfoOpened: boolean = false;
    }
}