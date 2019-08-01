module ap.viewmodels.meetings {

    /**
     * This class manages actions of a meeting in a meetings list
     */
    export class MeetingActionViewModel implements IDispose {

        /**
        * Use to know if the action info should be displayed
        **/
        public get withInfo(): boolean {
            return this._withInfo;
        }

        /**
        * Use to set withInfo which determines if the action should be displayed
        **/
        public set withInfo(withInfo: boolean) {
            if (withInfo !== this._withInfo) {
                this._withInfo = withInfo;
                this.computeActionInfoVisibility();
            }
        }

        /**
         * A meeting model this action view models is related to
         */
        public get meeting(): ap.models.meetings.Meeting {
            return this._meeting;
        }

        /**
         * A list of configured action
         */
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * Event handler when the note updated
        * @param e: EntityUpdatedEvent
        **/
        private meetingUpdated(e: ap.controllers.EntityUpdatedEvent<ap.models.meetings.Meeting>) {
            if (this._meeting.Id === e.entity.Id) {
                let project = this._mainController.currentProject();
                this._meeting = <ap.models.meetings.Meeting>e.entity;
                this._accessRightHelper = new ap.models.accessRights.MeetingAccessRightHelper(this._utility, this._meeting, project);
                this.computeActionsVisibility();
            }
        }

        /**
         * Handles clicks on the actions
         * @param actionName a name of the clicked action
         */
        public actionClick(actionName: string) {
            let action = ap.viewmodels.home.ActionViewModel.getAction(this.actions, actionName);
            if (!action) {
                throw new Error("The action " + actionName + " is not available");
            }
            switch (actionName) {
                case "meeting.config":
                    this._mainController.setCurrentMeeting(this._meeting.Id, ap.controllers.MainFlow.MeetingConfig);
                    break;
                case "meeting.archive":
                    this._meetingController.archiveMeeting(this.meeting);
                    break;
                case "meeting.unarchive":
                    this._meetingController.unarchiveMeeting(this.meeting);
                    break;
                case "meeting.info":
                    this._meetingController.getMeetingDetailInformation(this._meeting.Id, true);
                    break;
                case "meeting.occurrence":
                    this._meetingController.goToCreateNextOccurrence(this._meeting);
                    break;
            }
        }

        /**
         * Configures visibility of meeting actions
         */
        protected computeActionsVisibility() {
            this._occurrenceAction.isVisible = this._accessRightHelper.hasAccessCreateNextMeeting && this._accessRightHelper.canCreateNextMeeting;
            this._occurrenceAction.isEnabled = this._accessRightHelper.hasAccessCreateNextMeeting && this._accessRightHelper.canCreateNextMeeting;
            this._configAction.isVisible = this._accessRightHelper.hasConfig;
            this._configAction.isEnabled = this._accessRightHelper.canConfig;
            this._archiveAction.isVisible = this._accessRightHelper.canArchive;
            this._archiveAction.isEnabled = this._accessRightHelper.canArchive;
            this._unarchiveAction.isVisible = this._accessRightHelper.canUnarchive;
            this._unarchiveAction.isEnabled = this._accessRightHelper.canUnarchive;
            this.computeActionInfoVisibility();
        }

        /**
        * Set infoAction visible/enable to true or false depends on withAction
        **/
        private computeActionInfoVisibility() {
            if (this._withInfo && !this._meeting.IsSystem) {
                this._infoAction.isVisible = true;
                this._infoAction.isEnabled = true;
            } else {
                this._infoAction.isVisible = false;
                this._infoAction.isEnabled = false;
            }
        }


        /**
         * Disposes the instance of action view model
         */
        public dispose() {
            this._meetingController.off("meetingarchived", this.meetingUpdated, this);
            this._meetingController.off("meetingunarchived", this.meetingUpdated, this);
        }

        constructor(protected _utility: ap.utility.UtilityHelper, protected _mainController: ap.controllers.MainController, private _meetingController: ap.controllers.MeetingController, protected _meeting: ap.models.meetings.Meeting, private _withInfo: boolean = true) {
            let project = this._mainController.currentProject();

            this._meetingController.on("meetingarchived", this.meetingUpdated, this);
            this._meetingController.on("meetingunarchived", this.meetingUpdated, this);

            this._accessRightHelper = new ap.models.accessRights.MeetingAccessRightHelper(_utility, _meeting, project);

            this._occurrenceAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meeting.occurrence", _utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", false, null, "Create occurrence", false);
            this._configAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meeting.config", _utility.rootUrl + "Images/html/icons/ic_settings_black_48px.svg", false, null, "Settings", false);
            this._infoAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meeting.info", _utility.rootUrl + "Images/html/icons/ic_info_black_48px.svg", false, null, "Info", false);
            this._archiveAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meeting.archive", _utility.rootUrl + "Images/html/icons/ic_archive_black_48px.svg", false, null, "Archive the list", false);
            this._unarchiveAction = new ap.viewmodels.home.ActionViewModel(_utility, _utility.EventTool, "meeting.unarchive", _utility.rootUrl + "Images/html/icons/ic_unarchive_black_48px.svg", false, null, "Unarchive the list", false);
            this._actions = [];
            this._actions.push(this._occurrenceAction, this._configAction, this._infoAction, this._archiveAction, this._unarchiveAction);

            this.computeActionsVisibility();
        }

        // Private

        protected _accessRightHelper: ap.models.accessRights.MeetingAccessRightHelper;
        protected _actions: ap.viewmodels.home.ActionViewModel[];
        protected _occurrenceAction: ap.viewmodels.home.ActionViewModel;
        protected _configAction: ap.viewmodels.home.ActionViewModel;
        protected _infoAction: ap.viewmodels.home.ActionViewModel;
        protected _unarchiveAction: ap.viewmodels.home.ActionViewModel;
        protected _archiveAction: ap.viewmodels.home.ActionViewModel;
    }
}
