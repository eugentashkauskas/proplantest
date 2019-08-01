namespace ap.viewmodels.meetingcontacts {

    export class MeetingContactsActionViewModel {

        /**
         * A property to access the currently available actions
         */
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
         * This method checks the visibility and availability of actions
         */
        private computeActionsVisibility() {
            let meeting = this._meetingContact.Meeting;
            let project = this._mainController.currentProject();
            this._deleteAction.isVisible = meeting && !meeting.IsSystem && ((meeting.UserAccessRight && meeting.UserAccessRight.CanEdit) || project.UserAccessRight.CanEditAllList);
            this._deleteAction.isEnabled = this._deleteAction.isVisible && (this._meetingContact.AccessRightLevel <= meeting.UserAccessRight.Level || project.UserAccessRight.CanEditAllList) &&
                this._meetingContact.User.Id !== this._Utility.UserContext.CurrentUser().Id && /* canoot delete current user*/
                !this._meetingContact.HasSuperAdminModule;
        }

        /**
         * This method handles action clicks
         * @param name a name of the clicked action
         */
        public actionClick(name: string) {
            switch (name) {
                case "meetingcontacts.delete":
                    this._contactController.deleteMeetingContact(this._meetingContact);
                    break;
            }
        }

        constructor(private _Utility: ap.utility.UtilityHelper, private _meetingContact: ap.models.meetings.MeetingConcern,
            private _contactController: ap.controllers.ContactController, private _mainController: ap.controllers.MainController) {

            this._deleteAction = new ap.viewmodels.home.ActionViewModel(this._Utility, this._Utility.EventTool, "meetingcontacts.delete", this._Utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete", false, false);
            this._actions = [this._deleteAction];

            this.computeActionsVisibility();
        }

        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _deleteAction: ap.viewmodels.home.ActionViewModel;
    }

}
