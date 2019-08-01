module ap.viewmodels.meetings {
 /**
  * This view model is to display the general information tab in the configuration of a meeting
  */
    export class MeetingGeneralViewModel implements ap.utility.IListener, IDispose {

        /**
         * This is the view model used to edit/display general information of the meeting
         **/
        public get meetingVm(): ap.viewmodels.meetings.MeetingViewModel {
            return this._meetingViewModel;
        }

        /**
        * Use to get the screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }


        /**
        * This method use for set validForm
        * @paam isValid it form validity parameter
        **/
        public setFormIsValid(isValid: boolean) {
            this._formIsValid = isValid;
            this.checkEditAccess();
        }

        /**
        * Method use to cancel changes done in Meeting general informations
        **/
        public cancel() {
            this.meetingVm.cancel();
            this._screenInfo.isEditMode = false;
            this._listener.raise("editmodechanged", new base.EditModeEvent(this, this.meetingVm.meeting.IsNew, true));
        }

        public save(wasNew: boolean) {
            this.meetingVm.postChanges(wasNew);
            this._controllersManager.meetingController.saveMeeting(this.meetingVm.meeting).then((meeting) => {
                this._screenInfo.isEditMode = false;
                this._listener.raise("editmodechanged", new base.EditModeEvent(this, wasNew, false));
                this.checkEditAccess();
            });
        }

        /**
          * This top handle actions click on UI
          **/
        private actionClickedHandler(actionName: string) {

            let wasNew = this.meetingVm.meeting.IsNew;
            switch (actionName) {
                case "meetinginfo.edit":
                    this._screenInfo.isEditMode = true;
                    this._listener.raise("editmodechanged", new base.EditModeEvent(this));
                    break;
                case "meetinginfo.save":
                    this.save(wasNew);
                    break;
                case "meetinginfo.cancel":
                    this.cancel();
                    break;
                case "meetinginfo.occurrence":
                    this._controllersManager.meetingController.goToCreateNextOccurrence(<ap.models.meetings.Meeting>this.meetingVm.originalEntity);
                    break;
            }

            this.checkEditAccess();
        }

        private checkEditAccess() {
            let meeting = this.meetingVm ? this.meetingVm.meeting : null;
            this._occurrenceAction.isVisible = this.meetingVm.meetingAccessRightHelper.hasAccessCreateNextMeeting && this.screenInfo.isEditMode === false;
            this._occurrenceAction.isEnabled = this.meetingVm.meetingAccessRightHelper.hasAccessCreateNextMeeting && this.meetingVm.meetingAccessRightHelper.canCreateNextMeeting;
            this._editAction.isVisible = meeting && this.screenInfo.isEditMode === false && this.meetingVm.meetingAccessRightHelper.hasConfig;
            this._editAction.isEnabled = meeting && this.screenInfo.isEditMode === false && this.meetingVm.meetingAccessRightHelper.canConfig;
            this._saveAction.isVisible = this._screenInfo.isEditMode === true;
            this.computeSaveActionState();
            this._cancelAction.isVisible = this._screenInfo.isEditMode === true;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode === true;
        }

        /**
         * This method check all property changed in the meeting view model to adapt access
         * @param args This is the PropertyChangedEventArgs to know the property changed and to have old value if necessary
         */
        private meetingVmPropertyChangedHandler(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            this.computeSaveActionState();
        }

        private computeSaveActionState() {
            this._saveAction.isEnabled = this._screenInfo.isEditMode === true && this.meetingVm.hasChanged && this.meetingVm.isValid() && this._formIsValid;
        }

        /**
         * Dispose the element
         */
        public dispose() {
            this._listener.clear();

            if (this._meetingViewModel)
                this._meetingViewModel.off("propertychanged", this.meetingVmPropertyChangedHandler, this);

            if (this.screenInfo) {
                this.screenInfo.dispose();
                this._screenInfo = null;
            }

            this._controllersManager.meetingController.off("createnextoccurrentrequested", this.createNextOccurrence, this);
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        private checkHasChanged() {
            this._saveAction.isEnabled = this.meetingVm.hasChanged && this.meetingVm.isValid();
        }

        /**
         * Create next meeting occurrence and go to edit mode
         */
        private createNextOccurrence() {
            if (this.meetingVm)
                this.meetingVm.createNextOccurrence();
            this._screenInfo.isEditMode = true;
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
            this.checkEditAccess();
        }

        constructor(private $utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager, private _meetingViewModel: ap.viewmodels.meetings.MeetingViewModel) {
            this._listener = this.$utility.EventTool.implementsListener(["editmodechanged"]);

            this._occurrenceAction = new ap.viewmodels.home.ActionViewModel(this.$utility, $utility.EventTool, "meetinginfo.occurrence", $utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", false, null, "Create occurrence", false);
            this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, $utility.EventTool, "meetinginfo.edit", $utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", true, null, "Edit", true, false, new misc.Shortcut("e"));
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, $utility.EventTool, "meetinginfo.save", $utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save", true);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, $utility.EventTool, "meetinginfo.cancel", $utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel", true);
            this._screenInfo = new ap.misc.ScreenInfo($utility, "meeting.generalinfoconfig", ap.misc.ScreenInfoType.Detail, [this._occurrenceAction, this._editAction, this._saveAction, this._cancelAction], null, null, "meetingconfig", true, false);

            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            if (this._meetingViewModel) {
                this._meetingViewModel.on("propertychanged", this.meetingVmPropertyChangedHandler, this);
                if (this.meetingVm.meeting.IsNew === true) {
                    this.actionClickedHandler(this._editAction.name);
                }
            }
            this._controllersManager.meetingController.on("createnextoccurrentrequested", this.createNextOccurrence, this);
            this.checkEditAccess();
        }

        private _formIsValid: boolean = true;
        private _listener: ap.utility.IListenerBuilder;
        private _screenInfo: ap.misc.ScreenInfo;
        private _occurrenceAction: ap.viewmodels.home.ActionViewModel;
        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _saveAction: ap.viewmodels.home.ActionViewModel;
        private _cancelAction: ap.viewmodels.home.ActionViewModel;
    }
}