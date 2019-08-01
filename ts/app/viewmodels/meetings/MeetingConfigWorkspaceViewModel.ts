module ap.viewmodels.meetings {
    export class MeetingConfigWorkspaceViewModel implements IDispose {

        /**
        * This property is the meetingViewModel init with the meeting in constructor param or with the currectMeeting
        **/
        public get meetingVm(): ap.viewmodels.meetings.MeetingViewModel {
            return this._meetingVm;
        }

        /**
         * This is the view model to be used in the general information tab
         **/
        public get meetingGeneralInfo(): ap.viewmodels.meetings.MeetingGeneralViewModel {
            return this._meetingGeneralInfo;
        }

        /**
        * This property is the meetingReportInfo
        **/
        public get meetingReportInfo(): ap.viewmodels.meetings.MeetingReportInfoViewModel {
            return this._meetingReportInfo;
        }

        /**
        * This property is the meetingReportInfo
        **/
        public get meetingTransferredDocList(): ap.viewmodels.meetings.MeetingTransferredDocListViewModel {
            return this._meetingTransferredDocList;
        }

        /**
        * This property is to get screen Info
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * This property is to know which tab is selected
        **/
        public get selectedTab(): number {
            return this._selectedTab;
        }

        /**
        * This proprety is to set the tab selected
        **/
        public set selectedTab(selectedTabNumber: number) {
            if (this._selectedTab !== selectedTabNumber && this._meeting) {
                this._selectedTab = selectedTabNumber;
                this._initializeCurrentTabVm(selectedTabNumber);
            }
        }

        /**
        * This property is to know if the user has the acces to see the tab reportInfo
        **/
        public get hasReportInfoAccess(): boolean {
            return this._hasReportInfoAccess;
        }

        /**
        * This property is to know if the user has the acces to see the tab transferred doc
        **/
        public get hasTransferredDocAccess(): boolean {
            return this._hasTransferredDocAccess;
        }

        /**
        * Handle edit mode change of status tab
        **/
        private editModeChanged(args: base.EditModeEvent) {
            let vm = args.vm;
            this._screenInfo.isEditMode = vm.screenInfo.isEditMode;
            let mainFlowStateParam = <ap.controllers.MeetingConfigFlowStateParam>this._controllersManager.uiStateController.mainFlowStateParam;
            if (args.isCancelAction && vm.screenInfo.isEditMode === false && mainFlowStateParam && mainFlowStateParam.previousState) {
                this._controllersManager.uiStateController.changeFlowState((<ap.controllers.MeetingConfigFlowStateParam>this._controllersManager.uiStateController.mainFlowStateParam).previousState);
            }
        }

        /**
        * Method use to know if we have the access
        **/
        private checkHasAccess() {
            this._hasReportInfoAccess = this.meetingVm.meeting && this.meetingVm.meetingAccessRightHelper.canAccessReportInfo;
            this._hasTransferredDocAccess = this.meetingVm.meeting && this.meetingVm.meetingAccessRightHelper.canAccessTransferredDoc;
        }

        /**
        * Method use to init the actions depends on the viewModel which raised the event
        **/
        private initActions(actions: ap.viewmodels.home.ActionViewModel[], addAction?: ap.viewmodels.home.ActionViewModel) {
            this._screenInfo.actions = actions;
            this._screenInfo.addAction = addAction || null;
        }

        /**
        * Method use to charge the viewModel of the selected tab if it has not been initialized yet
        **/
        private _initializeCurrentTabVm(selectedTabNumber: number) {
            switch (selectedTabNumber) {
                case 0:
                    this._initializeMeetingInfo();
                    this.$utility.sendGaPageViewEvent("detail");
                    break;
                case 1:
                    this._initializeMeetingReportInfo();
                    this.$utility.sendGaPageViewEvent("reportinfo");
                    break;
                case 2:
                    this._initializeMeetingTransferredDoc();
                    this.$utility.sendGaPageViewEvent("transferredocs");
                    break;
            }
        }

        /**
        * Private method to initialize the VM of the general info tab of a meeting
        */
        private _initializeMeetingInfo() {
            if (!this._meetingGeneralInfo) {
                this._meetingGeneralInfo = new ap.viewmodels.meetings.MeetingGeneralViewModel(this.$utility, this._controllersManager, this.meetingVm);
                this._meetingGeneralInfo.on("editmodechanged", this.editModeChanged, this);
            }
            this.initActions(this._meetingGeneralInfo.screenInfo.actions);
        }

        /**
        * Private method to initialize the VM of the report info tab of a meeting
        */
        private _initializeMeetingReportInfo() {
            if (!this._meetingReportInfo) {
                this._meetingReportInfo = new ap.viewmodels.meetings.MeetingReportInfoViewModel(this.$utility, this._controllersManager, this.meetingVm);
                this._meetingReportInfo.on("editmodechanged", this.editModeChanged, this);
            }
            this.initActions(this._meetingReportInfo.screenInfo.actions);
        }

        /**
        * Private method to initialize the VM of the transferred doc tab of a meeting
        */
        private _initializeMeetingTransferredDoc() {
            if (!this._meetingTransferredDocList) {
                this._meetingTransferredDocList = new ap.viewmodels.meetings.MeetingTransferredDocListViewModel(this.$utility, this._controllersManager, this.$q, this._api, this.$timeout, this.$mdDialog, this._meeting);
                this._meetingTransferredDocList.load();
                this._meetingTransferredDocList.on("editmodechanged", this.editModeChanged, this);
            }
            this.initActions(this._meetingTransferredDocList.screenInfo.actions, this._meetingTransferredDocList.screenInfo.addAction);
        }


        /**
         * This method will handle the user clicks on an action and will call the correct screenInfo.actionClicked depending of the selected tab
         **/
        private _addActionClickedHandler(addArgs: controllers.AddActionClickEvent) {
            switch (this.selectedTab) {
                case 2: // tranfferred tab
                    this._meetingTransferredDocList.screenInfo.addActionClick(addArgs);
                    break;
            }
        }

        /**
         * This method will handle the user clicks on an action and will call the correct screenInfo.actionClicked depending of the selected tab
         **/
        private _mainActionClickedHandler(actionName: string) {
            switch (this.selectedTab) {
                case 0: // generalInfo tab
                    this._meetingGeneralInfo.screenInfo.actionClick(actionName);
                    break;
                case 1: // reportInfo tab
                    this._meetingReportInfo.screenInfo.actionClick(actionName);
                    break;
                case 2: // tranfferred tab
                    this._meetingTransferredDocList.screenInfo.actionClick(actionName);
                    break;
            }
        }

        /**
        * This methods update mainFlowState when event "gobackrequested" is fired.
        **/
        private _goBackRequestHandler() {
            this._controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.Meetings);
        }

        private currentMeetingChanged(meeting: ap.models.meetings.Meeting) {
            this._meeting = meeting;
            this.initView();
        }
        /**
         * THis method handle the case the user requested to generate the report of the meeting before to create the next occurrence
         * @param meeting This is the meeting for which the report generation was requested.
         */
        private generateReportForNewOccurence(meeting: ap.models.meetings.Meeting) {
            this._reportHelper.printAllNoteReport(meeting).then((response) => {
                if (response !== ap.viewmodels.reports.ReportGeneratorResponse.Preview)
                    this._controllersManager.meetingController.goToCreateNextOccurrence(meeting, true);
            });

        }

        private initView() {
            this._meetingVm = new ap.viewmodels.meetings.MeetingViewModel(this.$utility, this._controllersManager.mainController, this._controllersManager.meetingController);
            if (!!this._meeting && !this._meeting.IsNew) {
                this._reportHelper = new ap.viewmodels.reports.ReportHelper(this.$scope, this.$q, this.$timeout, this.$mdDialog, this.$utility, this._api, this.servicesManager, this._controllersManager);
            }
            if (this._meeting) {
                this._meetingVm.init(this._meeting);
            }

            this.checkHasAccess();
            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "meetingconfig", ap.misc.ScreenInfoType.Detail, null, null, null, "", true);
            this.selectedTab = 0;

            this._controllersManager.mainController.initScreen(this._screenInfo);
            this._controllersManager.mainController.on("gobackrequested", this._goBackRequestHandler, this);


            this._controllersManager.meetingController.off("generatereportnextoccurrence", this.generateReportForNewOccurence, this);
            this._controllersManager.meetingController.on("generatereportnextoccurrence", this.generateReportForNewOccurence, this);

            this._screenInfo.on("actionclicked", this._mainActionClickedHandler, this);
            this._screenInfo.on("addactionclicked", this._addActionClickedHandler, this);
            if (this._meeting && this._meeting.IsNew) {
                this.editModeChanged(new base.EditModeEvent(this._meetingGeneralInfo));
            }
        }

        /**
         * Dispose the elements
         */
        public dispose() {
            if (this._meetingVm)
                this._meetingVm.dispose();
            this._meeting = null;

            if (this._reportHelper)
                this._reportHelper.dispose();

            if (this._meetingGeneralInfo) {
                this._meetingGeneralInfo.dispose();
                this._meetingGeneralInfo = null;
            }

            if (this._meetingReportInfo) {
                this._meetingReportInfo.dispose();
                this._meetingReportInfo = null;
            }

            if (this._meetingTransferredDocList) {
                this._meetingTransferredDocList.dispose();
                this._meetingTransferredDocList = null;
            }
            if (this._screenInfo) {
                this._screenInfo.dispose();
                this._screenInfo = null;
            }

            this._controllersManager.mainController.off("gobackrequested", this._goBackRequestHandler, this);
            this._controllersManager.meetingController.off("generatereportnextoccurrence", this.generateReportForNewOccurence, this);
        }

        static $inject = ["$scope", "Utility", "$q", "ControllersManager", "Api", "$timeout", "$mdDialog", "ServicesManager"];
        constructor(private $scope, private $utility: ap.utility.UtilityHelper, private $q: ng.IQService, private _controllersManager: ap.controllers.ControllersManager, private _api: ap.services.apiHelper.Api,
            private $timeout: ng.ITimeoutService, private $mdDialog: angular.material.IDialogService, private servicesManager: ap.services.ServicesManager, private meeting: ap.models.meetings.Meeting = null) {
            if (meeting === null) {
                this._meeting = this._controllersManager.mainController.currentMeeting;
            } else {
                this._meeting = meeting;
            }

            if (this._meeting)
                this.initView();
            else
                this._controllersManager.mainController.on("currentmeetingchanged", this.currentMeetingChanged, this);

            if (this._controllersManager.uiStateController.mainFlowStateParam) {
                if ((<ap.controllers.MeetingConfigFlowStateParam>this._controllersManager.uiStateController.mainFlowStateParam).createNextOccurence) {
                    this.meetingGeneralInfo.meetingVm.createNextOccurrence();
                    this.meetingGeneralInfo.screenInfo.isEditMode = true;
                    this.editModeChanged(new base.EditModeEvent(this.meetingGeneralInfo));
                }
            }

            $scope.$on("$destroy", () => this.dispose());
        }

        private _reportHelper: ap.viewmodels.reports.ReportHelper;
        private _meeting: ap.models.meetings.Meeting;
        private _meetingVm: ap.viewmodels.meetings.MeetingViewModel;
        private _selectedTab: number;
        private _screenInfo: ap.misc.ScreenInfo;
        private _hasReportInfoAccess: boolean = false;
        private _hasTransferredDocAccess: boolean = false;
        private _meetingGeneralInfo: ap.viewmodels.meetings.MeetingGeneralViewModel;
        private _meetingReportInfo: ap.viewmodels.meetings.MeetingReportInfoViewModel;
        private _meetingTransferredDocList: ap.viewmodels.meetings.MeetingTransferredDocListViewModel;
    }
}