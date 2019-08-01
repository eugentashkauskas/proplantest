module ap.viewmodels.meetings {

    export class MeetingReportInfoViewModel implements ap.utility.IListener, IDispose {

        /**
        * This property is to get screen Info
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        public get meetingVm(): ap.viewmodels.meetings.MeetingViewModel {
            return this._meetingViewModel;
        }

        /**
        * To know if the header is null or has only white spaces
        **/
        public get isHeaderNullOrEmpty(): boolean {
            return StringHelper.isNullOrWhiteSpace(this._meetingViewModel.header);
        }

        /**
        * To know if the footer is null or has only white spaces
        **/
        public get isFooterNullOrEmpty(): boolean {
            return StringHelper.isNullOrWhiteSpace(this._meetingViewModel.footer);
        }

        /**
        * To know if the additionalInformation is null or has only white spaces
        **/
        public get isAdditionalInformationNullOrEmpty(): boolean {
            return StringHelper.isNullOrWhiteSpace(this._meetingViewModel.remarks);
        }

        /**
        * This top handle actions click on UI
        **/
        private actionClickedHandler(actionName: string) {
            switch (actionName) {
                case "reportinfo.edit":
                    this._screenInfo.isEditMode = true;
                    this._listener.raise("editmodechanged", new base.EditModeEvent(this));
                    break;
                case "reportinfo.save":
                    this._meetingViewModel.postChanges(false);
                    this._controllersManager.meetingController.saveMeeting(this._meetingViewModel.meeting).then(() => {
                        this._screenInfo.isEditMode = false;
                        this._listener.raise("editmodechanged", new base.EditModeEvent(this, false, false));
                        this.checkEditAccess();
                    });
                    break;
                case "reportinfo.cancel":
                    this._meetingViewModel.copySource();
                    this._screenInfo.isEditMode = false;
                    this._listener.raise("editmodechanged", new base.EditModeEvent(this, false, true));
                    break;
            }

            this.checkEditAccess();
        }

        private checkEditAccess() {
            let meeting = this._meetingViewModel ? this._meetingViewModel.meeting : null;
            this._editAction.isVisible = meeting && this.screenInfo.isEditMode === false && this._meetingViewModel.meetingAccessRightHelper.canAccessReportInfo;
            this._editAction.isEnabled = meeting && this.screenInfo.isEditMode === false && this._meetingViewModel.meetingAccessRightHelper.canAccessReportInfo;
            this._saveAction.isVisible = this._screenInfo.isEditMode === true;
            this._saveAction.isEnabled = this._screenInfo.isEditMode === true && this._meetingViewModel.isValid() && this._meetingViewModel.hasChanged;
            this._cancelAction.isVisible = this._screenInfo.isEditMode === true;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode === true;
        }

        /**
         * This method check all property changed in the meeting view model to adapt access
         * @param args This is the PropertyChangedEventArgs to know the property changed and to have old value if necessary
         */
        private meetingVmPropertyChangedHandler(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            this.checkEditAccess();
        }

        /**
         * Dispose the element
         */
        public dispose() {
            this._listener.clear();
            if (this._meetingViewModel)
                this._meetingViewModel.off("propertychanged", this.meetingVmPropertyChangedHandler, this);
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(private $utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager, private _meetingViewModel: ap.viewmodels.meetings.MeetingViewModel) {
            this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, $utility.EventTool, "reportinfo.edit", $utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit", false, false, new misc.Shortcut("e"));
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, $utility.EventTool, "reportinfo.save", $utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save", true);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, $utility.EventTool, "reportinfo.cancel", $utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel", true);
            this._screenInfo = new ap.misc.ScreenInfo($utility, "meeting.reportinfoconfig", ap.misc.ScreenInfoType.Detail, [this._editAction, this._saveAction, this._cancelAction], null, null, "meetingconfig", true, false);

            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            this._listener = $utility.EventTool.implementsListener(["editmodechanged"]);

            if (this._meetingViewModel)
                this._meetingViewModel.on("propertychanged", this.meetingVmPropertyChangedHandler, this);
            this.checkEditAccess();
        }

        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _saveAction: ap.viewmodels.home.ActionViewModel;
        private _cancelAction: ap.viewmodels.home.ActionViewModel;
        private _listener: ap.utility.IListenerBuilder;
    }
}