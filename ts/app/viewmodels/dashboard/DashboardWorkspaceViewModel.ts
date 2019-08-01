namespace ap.viewmodels.dashboard {

    /**
    * DueDate enum representing the different parts of "Points per due date" chart
    */
    export enum DueDate {
        NoDueDate = "No due date",
        OnTime = "On time",
        Overtime = "Overtime",
        ComingSoon = "Coming soon"
    }

    /**
    * Class representing the data get from Cumul.IO when a dashboard is clicked
    */
    export class CumulIOInfo {

        public get isCumulIoDrillDown() {
            return this._isCumulIoDrillDown;
        }

        public get dueDate(): string {
            return this._dueDate;
        }

        public get issueType(): string {
            return this._issueType;
        }

        public get status(): string {
            return this._status;
        }

        public get isArchived(): boolean | null {
            return this._isArchived;
        }

        /**
         * @constructor
         * @param _isCumulIoDrillDown To know if a cumul IO filter is applied
         * @param _dueDate DueDate category clicked on the dashboard
         * @param _issueType IssueType Id clicked in the dashboard
         * @param status Status Id clicked in the dashboard
         * @param _isArchived To know which category of notes should be displayed (archived or not)
         */
        constructor(private _dueDate?: string, private _issueType?: string, private _status?: string, private _isArchived?: boolean) {
            this._isCumulIoDrillDown = !!(_dueDate || _issueType || _status || _isArchived);
        }

        private _isCumulIoDrillDown: boolean;
    }


    export class DashboardWorkspaceViewModel implements IDispose {

        public get cumulioToken(): string {
            return this._cumulioToken;
        }

        /**
         * Sends an event to the tracking system
         */
        private sendTrackingEvent() {
            let paramValue: string = this.$controllersManager.mainController.currentMeeting === null ? "projects" : "lists";
            this.$servicesManager.toolService.sendEvent("cli-menu-open dashboard", new Dictionary([new KeyValue("cli-menu-open dashboard-screenname", paramValue)]));
        }

        /**
        * Method used to set the project or the meeting to _idToPass once the mainFlow is changed
        **/
        private _handlerMainFlowStateChange() {
            if (this.$controllersManager.uiStateController.mainFlowState !== controllers.MainFlow.Dashboard) return;
            this._getCumulioToken();
            this.initView();
        }

        private _getCumulioToken() {
            let projectId = this.$controllersManager.mainController.currentProject().Id;
            let meetingId;
            if ((this.$controllersManager.mainController.currentMeeting !== undefined) && (this.$controllersManager.mainController.currentMeeting !== null))
                meetingId = this.$controllersManager.mainController.currentMeeting.Id;

            this.$controllersManager.dashboardController.getDashboardCodes().then((codes) => {
                if (codes.length > 0) {
                    this.$servicesManager.dashboardService.getDashboardToken(codes[0], projectId, meetingId).then((token: string) => {
                        this._cumulioToken = token;
                    });
                }
            });
        }

        private exportDashboard() {
            let projectId = this.$controllersManager.mainController.currentProject().Id;
            let meetingId;
            if ((this.$controllersManager.mainController.currentMeeting !== undefined) && (this.$controllersManager.mainController.currentMeeting !== null))
                meetingId = this.$controllersManager.mainController.currentMeeting.Id;
            this.$controllersManager.dashboardController.getDashboardCodes().then((codes) => {
                if (codes.length > 0) {
                    let url = this.$servicesManager.dashboardService.getUrlToExportDashboard(codes[0], projectId, meetingId);
                    this.$utility.openPopup(url);
                }
            });
        }

        /**
         * Initialize the view
         */
        private initView() {
            let mainActions: ap.viewmodels.home.ActionViewModel[] = [];

            this._exportDashboardAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "exportdashboard", this.$utility.rootUrl + "Images/html/icons/ic_launch_black_24px.svg", true, null, "Export dashboard", true);
            mainActions.push(this._exportDashboardAction);

            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "dashboard", ap.misc.ScreenInfoType.List, mainActions, null, null);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            this.$controllersManager.mainController.initScreen(this._screenInfo);

            this.sendTrackingEvent();
        }

        /**
         * This is the handler method occurs when a action button was clicked
         * @param actionName this is the name of the action on which the click occured
         */
        private actionClickedHandler(actionName: string) {
            switch (actionName) {
                case "exportdashboard":
                    this.exportDashboard();
                    break;
            }
        }

        /**
         * Dispose the dashboardWorkspace
         */
        dispose(): void {
            if (this._screenInfo) {
                this._screenInfo.dispose();
            }

            this.$controllersManager.uiStateController.off("mainflowstatechanged", this._handlerMainFlowStateChange, this);
        }

        static $inject = ["$scope", "Utility", "ControllersManager", "$timeout", "ServicesManager", "Api", "$sce"];
        constructor(private $scope: angular.IScope, private $utility: ap.utility.UtilityHelper, private $controllersManager: ap.controllers.ControllersManager,
            private $timeout: angular.ITimeoutService, private $servicesManager: ap.services.ServicesManager, private $api: ap.services.apiHelper.Api, private $sce: angular.ISCEService) {

            if (this.$controllersManager.uiStateController.mainFlowState === ap.controllers.MainFlow.Dashboard) {
                this._handlerMainFlowStateChange();
            } else {
                this.$controllersManager.uiStateController.on("mainflowstatechanged", this._handlerMainFlowStateChange, this);
            }

            $scope.$on("$destroy", () => {
                this.dispose();
            });
        }

        private _exportDashboardAction: ap.viewmodels.home.ActionViewModel;
        private _cumulioToken: string;
        private _idToPass: string;
        private _isEntireProject: boolean;
        private _screenInfo: ap.misc.ScreenInfo;
    }
}