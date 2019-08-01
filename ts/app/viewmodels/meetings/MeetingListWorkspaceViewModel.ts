module ap.viewmodels.meetings {

    /**
    * This enum is used to store the different possible sort of the meetings list
    **/
    export enum SortView {
        Code,
        Name,
        Date
    }

    /**
    * This class is used to create the parameter needed for each item.
    **/
    class MeetingItemParameterBuilder implements ItemParameterBuilder {
        createItemParameter(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper): ItemConstructorParameter {
            return new MeetingItemParameter(itemIndex, dataSource, pageDesc, parameters, utility, this.mainController, this.meetingController);
        }
        constructor(private mainController: ap.controllers.MainController, private meetingController: ap.controllers.MeetingController) {

        }
    }

    export class MeetingListWorkSpaceViewModel extends ListWorkspaceViewModel implements IDispose {

        /**
         *  To know if the predefined filter active or archived is selected. Null means both are not selected.
         **/
        public get hasActiveFilter(): boolean {
            return this._hasActiveFilter;
        }

        /**
        * The item was keep the information of the entire project
        **/
        public get entireProject(): ap.viewmodels.projects.ProjectItemViewModel {
            return this._entireProject;
        }

        /**
        * This method is to get screenInfo
        **/
        public get screenInfo() {
            return this._screenInfo;
        }

        public get meetingMetadataVm(): ap.viewmodels.meetings.MeetingViewModel {
            return this._meetingMetadataVm;
        }

        public get openMetadataPane(): boolean {
            if (this.screenInfo) {
                return this.screenInfo.isInfoOpened;
            } else {
                return false;
            }
        }

        public set openMetadataPane(val: boolean) {
            if (this.screenInfo) {
                this.screenInfo.isInfoOpened = val;
            }
        }

        public get sortState(): ap.misc.sort.MeetingListSortingInfo {
            return this._sortState;
        }

        /**
       * Method used to know if the item in param is the last of the list
       * @param item the note we want to know if it is the last of the list
       **/
        public isLast(item: ap.viewmodels.meetings.MeetingItemViewModel): boolean {
            if (item && this.listVm.sourceItems[this.listVm.sourceItems.length - 1] && this.listVm.sourceItems[this.listVm.sourceItems.length - 1].originalEntity
                && this.listVm.sourceItems[this.listVm.sourceItems.length - 1].originalEntity.Id === item.originalEntity.Id) {
                return true;
            }
            return false;
        }

        /**
        * This method is overrided to build the default filter to get the entities.
        **/
        protected buildCustomFilter(): angular.IPromise<string> {
            let deferred: ng.IDeferred<string> = this.$q.defer();
            let filter: string;
            filter = Filter.eq("Project.Id", this.$controllersManager.mainController.currentProject().Id);
            if (this.screenInfo && this.screenInfo.mainSearchInfo && this.screenInfo.mainSearchInfo.filterString !== null) {
                filter = Filter.and(filter, this.screenInfo.mainSearchInfo.filterString);
                if (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Archived"))
                    this._hasActiveFilter = false;
                else if (this.screenInfo.mainSearchInfo.hasPredefinedFilterCriterion("Active"))
                    this._hasActiveFilter = true;
                else
                    this._hasActiveFilter = null;
            } else {
                this._hasActiveFilter = null;
            }
            deferred.resolve(filter);
            return deferred.promise;
        }
        /**
        * This method will called when the filterchanged event of the mainSearch was fired
        **/
        private _mainSearchChanged() {
            if (this.$controllersManager.mainController.uiStateController.mainFlowState !== ap.controllers.MainFlow.Meetings) return;
            this.load();
        }

        /**
         * This method opens the project instead of to open a meeting.
         **/
        public openEntireProject() {
            this.$controllersManager.mainController.setCurrentMeeting(null);
        }

        /**
         * This method opens a meeting then, set the current meeting with the id specified in argument
         * @param meetingId this is the id of the meeting to open.
         **/
        public openMeeting(meetingId: string, alreadyOpen: boolean, needToloadDetails: boolean = true) {
            if (alreadyOpen === false) {
                if (this.screenInfo.selectedEntityId === meetingId) {
                    this.openMetadataPane = !this.openMetadataPane;
                } else if (!this.openMetadataPane) {
                    this.openMetadataPane = true;

                    // send a Google Analytics event when the project info is opened
                    this.$utility.sendGaPageViewEvent("listInfo");
                }
                this._screenInfo.isInfoOpened = this.openMetadataPane;
            }
            if (!this.openMetadataPane) {
                this.$controllersManager.mainController.setCurrentMeeting(meetingId);
            } else {
                this.listVm.selectEntity(meetingId);
                this.screenInfo.selectedEntityId = meetingId;
                if (needToloadDetails) {
                    this.$controllersManager.meetingController.off("meetingdetailsloaded", this._handleOpenMeetingMetadata, this);
                    this.$controllersManager.meetingController.getMeetingDetailInformation(meetingId, true).then((meeting) => {
                        this.$controllersManager.meetingController.on("meetingdetailsloaded", this._handleOpenMeetingMetadata, this);
                        if (!meeting.IsSystem) {
                            this.meetingMetadataVm.init(meeting);
                            this.meetingMetadataVm.meetingActionViewModel.withInfo = false;
                        }
                        else {
                            this._screenInfo.isInfoOpened = this.openMetadataPane;
                            this.openMetadataPane = false;
                        }
                    });
                } else {
                    let meeting = (<ap.viewmodels.meetings.MeetingItemViewModel>this._listVm.getEntityById(meetingId)).meeting;
                    if (!meeting.IsSystem) {
                        this.meetingMetadataVm.init(meeting);
                        this.meetingMetadataVm.meetingActionViewModel.withInfo = false;
                    }
                    else {
                        this._screenInfo.isInfoOpened = this.openMetadataPane;
                        this.openMetadataPane = false;
                    }
                }
            }
        }

        public dispose() {
            super.dispose();

            this._multiActionVm.dispose();
            this.$controllersManager.uiStateController.off("mainflowstatechanged", this.refresh, this);
            this.$controllersManager.mainController.off("currentprojectchanged", this.refresh, this);
            this.$controllersManager.meetingController.off("generatereportnextoccurrence", this.generateReportForNewOccurence, this);
            this.$controllersManager.meetingController.off("meetingdetailsloaded", this._handleOpenMeetingMetadata, this);
            this.$controllersManager.mainController.off("multiactioncloserequested", this.uncheckMeetings, this);
            this._sortState.off("sortingchanged", this.onSortStateChanged, this);
            this._api.off("showdetailbusy", this.changeVisibleDetailPaneBusy, this);

            if (this._reportHelper) {
                this._reportHelper.dispose();
                this._reportHelper = null;
            }

            if (this._entireProject) {
                this._entireProject.dispose();
                this._entireProject = null;
            }

            if (this._mainSearchInfo) {
                this._mainSearchInfo.dispose();
                this._mainSearchInfo = null;
            }

            if (this.screenInfo) {
                this._screenInfo.dispose();
                this._screenInfo = null;
            }
        }

        /**
        * Handler method called when a MainAction from the MainController is raised
        * @param action string The name of the action
        */
        private _handleMainActionEvents(action: string): void {
            switch (action) {
                case "refreshlists":
                    this.refresh();
                    break;
            }
        }

        private importAccessHandler() {
            this._importExcelViewModel = new ap.viewmodels.meetings.ImportExcelMeetingViewModel(this.$utility, this.$q, this.$mdDialog, this.$controllersManager);
            this.$controllersManager.mainController.showBusy();
            let importExcelController = ($scope: angular.IScope) => {
                $scope["importExcelViewModel"] = this._importExcelViewModel;
                $scope.$on("$destroy", () => {
                    if (this._importExcelViewModel) {
                        this._importExcelViewModel.dispose();
                        this._importExcelViewModel = null;
                    }
                });
            };
            importExcelController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: true,
                preserveScope: true,
                templateUrl: "me/PartialView?module=Project&name=ImportExcelDialog",
                fullscreen: true,
                controller: importExcelController,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                }
            }).then(() => {
                if (this._importExcelViewModel.importedData) {
                    this.showImportProgressPopup();
                }
            });
        }

        private showImportProgressPopup() {
            let meetingCreationProgressViewModel = new ap.viewmodels.meetings.MeetingCreationProgressViewModel(this.$utility, this.$q, this.$mdDialog, this.$controllersManager, <ap.models.meetings.Meeting[]>this._importExcelViewModel.importedData);
            let creationProgressController = (scope: angular.IScope) => {
                scope["meetingCreationProgressViewModel"] = meetingCreationProgressViewModel;
                scope.$on("$destroy", () => {
                    if (this._importExcelViewModel) {
                        this._importExcelViewModel.dispose();
                        this._importExcelViewModel = null;
                    }
                });
            };
            creationProgressController.$inject = ["$scope"];
            this.$mdDialog.show({
                clickOutsideToClose: false,
                templateUrl: "me/PartialView?module=Meeting&name=MeetingListsCreationProgress",
                fullscreen: true,
                controller: creationProgressController
            }).then(() => {
                this.refresh(); // refresh the list after the popup is closed to see the imported lists
            });
        }

        /**
         * This method is to handle the click on the add action.
         **/
        private handleAddActionClick(addAction: ap.controllers.AddActionClickEvent) {
            if (addAction) {
                switch (addAction.name) {
                    case "meeting.add":
                        let newMeeting = this.$controllersManager.meetingController.createNewMeeting();
                        let meetingConfigFlowState = new ap.controllers.MeetingConfigFlowStateParam(this.$utility, false, this.$controllersManager.uiStateController.mainFlowState);
                        this.$controllersManager.mainController.setCurrentMeeting(newMeeting.Id, ap.controllers.MainFlow.MeetingConfig, newMeeting, meetingConfigFlowState);
                        break;
                    case "meeting.importAccess":
                        this.importAccessHandler();
                        break;
                }
            }
        }

        /**
         * Handle multi-actions buttons' click event
         * @param actionName Action name
         */
        private multiActionClickedHandler(actionName: string) {
            switch (actionName) {
                case "multiedit": {
                    this.openMultiEditWindow();
                    break;
                }
            }
        }

        /**
         * Handles changes in the sorting model
         */
        private onSortStateChanged() {
            this._sortState.saveToStorage();
            this.load();
        }

        /**
         * Open multi-edit popup window when user clicks "Edit" button for multiple checked meetings
         */
        private openMultiEditWindow() {
            this.$controllersManager.mainController.showBusy();
            let checkedMeetingItems = this._listVm.getCheckedItems();
            let checkedMeetings = new Array<ap.models.meetings.Meeting>(checkedMeetingItems.length);
            checkedMeetingItems.forEach((item: MeetingItemViewModel, index: number) => {
                checkedMeetings[index] = item.meeting;
            });

            let multiEditController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                $scope["vm"] = new ap.viewmodels.multiactions.MeetingMultiEditViewModel(this.$utility, $scope, this._api, this.$q, this.$controllersManager, this.servicesManager, $timeout, this.$mdDialog, this.$mdSidenav, this.$location, this.$anchorScroll, this.$interval, checkedMeetings);
            };
            multiEditController.$inject = ["$scope", "$timeout"];
            this.$mdDialog.show({
                fullscreen: true,
                clickOutsideToClose: false,
                escapeToClose: false,
                onComplete: () => {
                    this.$controllersManager.mainController.hideBusy();
                },
                templateUrl: "me/PartialView?module=MultiActions&name=MeetingMultiEditDialog",
                controller: multiEditController
            }).then((result: ap.models.multiactions.MeetingMultiActionResult) => {
                this.updateCounters(<ap.models.meetings.Meeting[]>result.Meetings);
                if (this.$controllersManager.mainController.isMultiActionMode)
                    this.$controllersManager.mainController.closeMultiActionsMode();
            });
        }

        /**
        * This method use for updating counters in meetings after multi actions
        * @meetings - meetings for updating
        **/
        private updateCounters(meetings: ap.models.meetings.Meeting[]) {
            if (!!meetings && meetings.length > 0) {
                for (let i = 0; i < meetings.length; i++) {
                    let meeting = meetings[i];
                    let meetingVm = <ap.viewmodels.meetings.MeetingItemViewModel>this.listVm.getEntityById(meeting.Id);
                    if (!!meeting.MeetingConcerns) {
                        meetingVm.participantsCount = meeting.MeetingConcerns.length;
                    }
                    if (!!meeting.MeetingDocuments) {
                        meetingVm.documentsCount = meeting.MeetingDocuments.length;
                    }
                    meetingVm.canCreateNextMeeting = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_CreateNextMeeting) && !meeting.IsSystem && (meeting.NumberingType === ap.models.meetings.MeetingNumberingType.CodeOccSequential || meeting.NumberingType === ap.models.meetings.MeetingNumberingType.OccSequential);
                    meetingVm.meeting.NumberingType = meeting.NumberingType;
                }
            }
        }

        /**
        * Overrided method from the base class.  This method created the needed custom params used to load the meeting entities.
        */
        protected createCustomParams() {
            if (this._sortState) {
                this._listVm.changeSortOrder(this._sortState.toQueryParam());
            }
        }

        /**
         * This method make a complete refresh of the list and project banner data
         **/
        public refresh(): void {
            // load the entire project part
            this.loadProjectData();

            let idToSelect: string = undefined;
            if (this._screenInfo && this._screenInfo.selectedEntityId) {
                idToSelect = this._screenInfo.selectedEntityId;
            }

            // load the meetings
            this.load(idToSelect).then(() => {
                if (idToSelect) {
                    let vm = this.listVm.getEntityById(idToSelect);
                    if (vm)
                        this.openMeeting(vm.originalEntity.Id, this._screenInfo.isInfoOpened);
                }
            });
        }

        /**
         * This method will load the data concerning the entire project. 
         **/
        private loadProjectData(): void {
            let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            option.onlyPathToLoadData = true;
            option.async = true;
            option.isShowBusy = false;
            this._api.getEntityById("Project", this.$controllersManager.mainController.currentProject().Id, "Code,Name,LogoUrl,Cover.Status,Creator,NotesNumber,DocumentsNumber,ParticipantsNumber,StartDate", option).then((apiResponse: services.apiHelper.ApiResponse) => {
                let project: ap.models.projects.Project = <ap.models.projects.Project>apiResponse.data;
                this._entireProject.init(project);
                let proj: ap.models.projects.Project = this.$controllersManager.mainController.currentProject();
                if (proj.StartDate === null) {
                    this._entireProject.startDate = proj.EntityCreationDate;
                } else {
                    this._entireProject.startDate = proj.StartDate;
                }
            });
        }

        /**
        * This method is used to check the user can do Add action or not
        **/
        private calculateAddActionAccess() {
            let project = this.$controllersManager.mainController.currentProject();
            if (this._addAction && this._addAction !== null && project) {
                this._addAction.isEnabled = project.UserAccessRight.CanAddMeeting;
                this._addAction.isVisible = project.UserAccessRight.CanAddMeeting;
                this.calculateAddSubActionAccess();
            }
        }
        /**
         * This method is used to check the user can do Add sub action or not
         */
        private calculateAddSubActionAccess() {
            let accessRight: boolean = (this.$controllersManager.mainController.currentProject() && this.$controllersManager.mainController.currentProject().UserAccessRight.CanAddMeeting) && this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingImportFromExcel);
            this._addAction.getSubAction("meeting.importAccess").isVisible = accessRight;
            this._addAction.getSubAction("meeting.importAccess").isEnabled = accessRight;
        }

        private _handleOpenMeetingMetadata(meeting: ap.models.meetings.Meeting) {
            this.openMeeting(meeting.Id, false, false);
        }

        /**
         * THis method handle the case the user requested to generate the report of the meeting before to create the next occurrence
         * @param meeting This is the meeting for which the report generation was requested.
         */
        private generateReportForNewOccurence(meeting: ap.models.meetings.Meeting) {
            this._reportHelper.printAllNoteReport(meeting).then((response) => {
                if (response !== ap.viewmodels.reports.ReportGeneratorResponse.Preview)
                    this.$controllersManager.meetingController.goToCreateNextOccurrence(meeting, true);
            });

        }
        /**
         * Set the openMetadata property to false
         */
        public closeMetadata() {
            this.openMetadataPane = false;
            this._screenInfo.isInfoOpened = this.openMetadataPane;
        }

        /**
         * Go to multiaction mode or close it when item is checked/unchecked. Depends on checked items count
         * @param meetingItem Checked/unchecked item entity
         */
        private meetingCheckedChanged(meetingItem: MeetingItemViewModel) {
            let checkedItems = this._listVm.getCheckedItems();
            if (checkedItems.length >= 1) {
                this._multiActionVm.itemsChecked = checkedItems.map((entity: EntityViewModel) => { return entity.originalEntity.Id; });
                if (!this.$controllersManager.mainController.isMultiActionMode)
                    this.$controllersManager.mainController.gotoMultiActionsMode(this._multiActionVm);
            } else {
                this.$controllersManager.mainController.closeMultiActionsMode();
            }
            let checkedIds = new Array<string>(checkedItems.length);
            checkedItems.forEach((item: MeetingItemViewModel, index: number) => {
                checkedIds[index] = item.originalEntity.Id;
            });
            this._screenInfo.checkedEntitiesId = checkedIds;
        }

        /**
         * Uncheck all items when multiactions mode is closed, if there are more than 1 meeting checked
         */
        private uncheckMeetings() {
            if (this._listVm.getCheckedItems().length > 1)
                this._listVm.uncheckAll();
        }

        private _handlerMainFlowStateChange() {
            if (this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Meetings) {
                if (this.$controllersManager.uiStateController.mainFlowStateParam) {
                    this.$controllersManager.uiStateController.off("mainflowstatechanged", this._handlerMainFlowStateChange, this);
                }

                if (this._isMeetingModule) {
                    this.calculateAddActionAccess();
                }
                this.refresh();
            }
        }

        /**
         * Page loaded handler - restore item's checked status from session
         * @param items Array of Meeting viewmodels
         */
        private meetingsPageLoaded(items: MeetingItemViewModel[]) {
            let dicIdsLoad: Dictionary<string, MeetingItemViewModel> = new Dictionary<string, MeetingItemViewModel>();
            let dicIdsNotPublic: Dictionary<string, MeetingItemViewModel> = new Dictionary<string, MeetingItemViewModel>();
            let dicIdsNotSystem: Dictionary<string, MeetingItemViewModel> = new Dictionary<string, MeetingItemViewModel>();

            items.forEach((item: MeetingItemViewModel) => {
                if (this._screenInfo.checkedEntitiesId && this._screenInfo.checkedEntitiesId.length > 0 && this._screenInfo.checkedEntitiesId.indexOf(item.originalEntity.Id) >= 0) {
                    item.defaultChecked = true;
                }
                dicIdsLoad.add(item.originalEntity.Id, item);
                if (!item.meeting.IsSystem)
                    dicIdsNotSystem.add(item.originalEntity.Id, item);
                else
                    item.documentsCount = 0;
                if (!item.meeting.IsPublic)
                    dicIdsNotPublic.add(item.originalEntity.Id, item);
                else {
                    // verify if the project exists because it can be null if the user switches quickly between project
                    item.participantsCount = this.$controllersManager.mainController.currentProject() ? this.entireProject.participantsCount : -1;
                }
            });
            let opt = new ap.services.apiHelper.ApiOption();
            opt.async = true;
            if (dicIdsLoad.count > 0) {
                this._api.getApiResponseStatList("notestats", "Meeting.Id", "Filter.And(Filter.In(Meeting.Id," + dicIdsLoad.keys().join(",") + "),Filter.IsFalse(IsArchived))", opt).then((res) => {
                    if (res.data && res.data.length > 0) {
                        res.data[0].forEach((stat: ap.models.stats.StatResult) => {
                            let item = dicIdsLoad.getValue(stat.GroupByValue);
                            item.notesCount = stat.Count;
                        });
                        dicIdsLoad.values().forEach((item) => {
                            if (item.notesCount < 0)
                                item.notesCount = 0;
                        });
                    }
                });
                if (dicIdsNotSystem.count > 0) {
                    this._api.getApiResponseStatList("meetingdocumentstats", "Meeting.Id", "Filter.In(Meeting.Id," + dicIdsNotSystem.keys().join(",") + ")", opt).then((res) => {
                        if (res.data && res.data.length > 0) {
                            res.data[0].forEach((stat: ap.models.stats.StatResult) => {
                                let item = dicIdsLoad.getValue(stat.GroupByValue);
                                item.documentsCount = stat.Count;
                            });
                            dicIdsLoad.values().forEach((item) => {
                                if (item.documentsCount < 0)
                                    item.documentsCount = 0;
                            });
                        }
                    });
                }
                if (dicIdsNotPublic.count > 0) {
                    this._api.getApiResponseStatList("meetingconcernstats", "Meeting.Id", "Filter.In(Meeting.Id," + dicIdsNotPublic.keys().join(",") + ")", opt).then((res) => {
                        if (res.data && res.data.length > 0) {
                            res.data[0].forEach((stat: ap.models.stats.StatResult) => {
                                let item = dicIdsLoad.getValue(stat.GroupByValue);
                                item.participantsCount = stat.Count;
                            });
                            dicIdsLoad.values().forEach((item) => {
                                if (item.participantsCount < 0)
                                    item.participantsCount = 0;
                            });
                        }
                    });
                }
            }
            if (this._screenInfo.checkedEntitiesId && this._screenInfo.checkedEntitiesId.length > 1) {
                this._multiActionVm.itemsChecked = this._screenInfo.checkedEntitiesId;
                if (!this.$controllersManager.mainController.isMultiActionMode)
                    this.$controllersManager.mainController.gotoMultiActionsMode(this._multiActionVm);
            }
        }

        /**
         * This method will set selected entity 
         * @param entity EntityViewModem The entity to select
         */
        public selectEntity(entity: EntityViewModel): boolean {
            if (!entity) return false;

            this._listVm.selectEntity(entity.originalEntity.Id);

            return true;
        }

        /**
         * Determines a name that is used by storage to store a sorting state of the list
         * @param isForMeetingModule an indicator of whether this meetings list is shown in the meetings module
         */
        private static getSortingStorageName(isForMeetingModule: boolean): string {
            if (isForMeetingModule) {
                return "meetings.meetingmodule";
            } else {
                return "meetings";
            }
        }

        /**
         * Method to delete sorting models saved in storage
         * @param utility an instance of the utility helper of the application
         */
        public static resetSortingInfo(utility: ap.utility.UtilityHelper) {
            ap.misc.sort.SortingInfo.removeFromStorage(utility, MeetingListWorkSpaceViewModel.getSortingStorageName(true));
            ap.misc.sort.SortingInfo.removeFromStorage(utility, MeetingListWorkSpaceViewModel.getSortingStorageName(false));
        }

        private changeVisibleDetailPaneBusy(showBusy: boolean) {
            this.meetingMetadataVm.showDetailPaneBusy = showBusy;
        }

        static $inject = ["$scope", "Utility", "Api", "$q", "ControllersManager", "ServicesManager", "$mdDialog", "$timeout", "$mdSidenav", "$location", "$anchorScroll", "$interval"];
        constructor(private $scope: ng.IScope, $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, $q: angular.IQService, $controllersManager: ap.controllers.ControllersManager, private servicesManager: ap.services.ServicesManager,
            private $mdDialog: angular.material.IDialogService, $timeout: angular.ITimeoutService, private $mdSidenav: angular.material.ISidenavService, private $location: angular.ILocationService, private $anchorScroll: angular.IAnchorScrollService, private $interval: angular.IIntervalService, private _isMeetingModule: boolean = true) {

            super($utility, $controllersManager, $q, new GenericPagedListOptions("Meeting", MeetingItemViewModel, "EntityVersion,Title,Code,Date,IsPublic,IsSystem,IsArchived,MeetingAuthor,UserAccessRight,Occurrence,NumberingType", undefined, 50, false, true,
                undefined, undefined, new MeetingItemParameterBuilder($controllersManager.mainController, $controllersManager.meetingController)));

            this._meetingMetadataVm = new ap.viewmodels.meetings.MeetingViewModel(this.$utility, this.$controllersManager.mainController, this.$controllersManager.meetingController, undefined, undefined, true);

            let sortingStorageName = MeetingListWorkSpaceViewModel.getSortingStorageName(_isMeetingModule);
            this._sortState = ap.misc.sort.SortingInfo.createFromStorage(ap.misc.sort.MeetingListSortingInfo, $utility, sortingStorageName);
            this._sortState.on("sortingchanged", this.onSortStateChanged, this);

            let mainActions: Array<ap.viewmodels.home.ActionViewModel> = [
                new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "refreshlists", this.$utility.rootUrl + "Images/html/icons/ic_refresh_black_48px.svg", true, null, "Refresh list", true)
            ];

            this._editMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "multiedit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", true, null, "Edit", true);
            this._multiActionVm = new ap.viewmodels.home.MultiActionsViewModel(this.$utility, [this._editMultiAction]);
            this._multiActionVm.on("actionClicked", this.multiActionClickedHandler, this);
            this.$controllersManager.mainController.on("multiactioncloserequested", this.uncheckMeetings, this);

            this._listVm.on("isCheckedChanged", this.meetingCheckedChanged, this);
            this._listVm.on("pageloaded", this.meetingsPageLoaded, this);

            if (_isMeetingModule) {
                let predefinedFilters = [
                    new ap.misc.PredefinedFilter("Active", "Opened lists", true, "Filter.IsFalse(IsArchived)", null, ["Archived"]),
                    new ap.misc.PredefinedFilter("Archived", "Archived lists", true, "Filter.IsTrue(IsArchived)", null, ["Active"])
                ];

                let collectionInfo: ap.misc.CollectionInfo = new ap.misc.CollectionInfo(Filter.isTrue("IsOwner"), new ap.misc.PropertyInfo("User.DisplayName"));

                this._mainSearchInfo = new ap.misc.MainSearchInfo($utility, $timeout, [], [
                    new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Code"), null),
                    new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Title", "Name"), null),
                    new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("Date", "Date", false, ap.misc.PropertyType.Date, "Date"), null),
                    new ap.misc.AdvancedFilter(new ap.misc.PropertyInfo("MeetingConcerns", "Author", false, ap.misc.PropertyType.Collection, "Author", collectionInfo), null)
                ], predefinedFilters);
                this._mainSearchInfo.isVisible = true;
                this._mainSearchInfo.isEnabled = true;
                this._addAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meeting.add", this.$utility.rootUrl + "/Images/html/icons/ic_add_black_48px.svg", false, [
                    new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "meeting.importAccess", this.$utility.rootUrl + "/Images/html/icons/ic_import_export_black_24px.svg", false, true, false, "Import from Excel")
                ], "Add list", false, false, new ap.misc.Shortcut("c"));
                this._screenInfo = new ap.misc.ScreenInfo($utility, "meeting.list", ap.misc.ScreenInfoType.List, mainActions, this._addAction, this._mainSearchInfo);
                this.$controllersManager.uiStateController.updateScreenInfo(this._screenInfo);
                this.$controllersManager.mainController.initScreen(this._screenInfo);
                if (this._screenInfo.mainSearchInfo.criterions.length === 0) {
                    this._screenInfo.mainSearchInfo.addCriterion(predefinedFilters[0]);
                }
                this.calculateAddActionAccess();
                this._reportHelper = new ap.viewmodels.reports.ReportHelper($scope, this.$q, $timeout, this.$mdDialog, this.$utility, this._api, this.servicesManager, this.$controllersManager);
            }

            if (this._screenInfo.mainSearchInfo) {
                this._screenInfo.mainSearchInfo.on("criterionschanged", this._mainSearchChanged, this);
            }
            this._screenInfo.on("actionclicked", this._handleMainActionEvents, this);
            this._screenInfo.on("addactionclicked", this.handleAddActionClick, this);

            this._entireProject = new ap.viewmodels.projects.ProjectItemViewModel($utility, $q);

            if (this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Meetings) {
                this._handlerMainFlowStateChange();
            } else {
                this.$controllersManager.uiStateController.on("mainflowstatechanged", this._handlerMainFlowStateChange, this);
            }

            $controllersManager.meetingController.on("meetingdetailsloaded", this._handleOpenMeetingMetadata, this);
            $controllersManager.meetingController.on("generatereportnextoccurrence", this.generateReportForNewOccurence, this);
            this._api.on("showdetailbusy", this.changeVisibleDetailPaneBusy, this);

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _reportHelper: ap.viewmodels.reports.ReportHelper;
        private _addAction: ap.viewmodels.home.ActionViewModel;
        private _entireProject: ap.viewmodels.projects.ProjectItemViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _meetingMetadataVm: ap.viewmodels.meetings.MeetingViewModel;
        private _hasActiveFilter: boolean;
        private _multiActionVm: ap.viewmodels.home.MultiActionsViewModel;
        private _editMultiAction: ap.viewmodels.home.ActionViewModel;
        private _mainSearchInfo: ap.misc.MainSearchInfo;
        private _sortState: ap.misc.sort.MeetingListSortingInfo;
        private _importExcelViewModel: ap.viewmodels.meetings.ImportExcelMeetingViewModel;
    }
}