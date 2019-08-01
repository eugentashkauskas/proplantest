﻿module ap.viewmodels.projectcontacts {

    export class ProjectContactsActionViewModel implements ap.utility.IListener, IDispose {

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
        * Property to access the curent available actions
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * Proprety used to know if there is at least one visible action
        **/
        public get isOneActionVisible(): boolean {
            return this._isOneActionVisible;
        }

        /**
            * This method is to specify that one action was clicked
            * @param name this is the name of the action clicked
            */
        public actionClick(name: string) {
            switch (name) {
                case "projectcontacts.invitecontacts":
                    this._contactController.requestInviteContact([this._contact]);
                    break;
                case "projectcontacts.sendtasksmail":
                    if (this._sendmailtasksAction.isEnabled)
                        this._contactController.sendUserTasksMail(this._contact);
                    break;
                case "projectcontacts.contactinfo":
                    this._contactController.needToBeSelected(this._contact.Id);
                    break;
                case "projectcontacts.editcontact":
                    this._contactController.requestEditContact(this._contact);
                    break;
                case "projectcontacts.delete":
                    this._contactController.deleteContact(this._contact);
                    break;
            }
        }

        /**
        * Method used to set the info action when the panel is opened or closed
        * @param val: boolean the value represents the visibility of the actions
        **/
        public infoActionVisible(val: boolean) {
            this._contactinfoAction.isEnabled = val;
            this._contactinfoAction.isVisible = val;
        }

        /**
        * This method is used to update contact invitation status
        * @param contactDetails: ContactDetails[]
        **/
        private _changeInvitationStatus(contactDetails: ap.models.projects.ContactDetails[]) {
            for (let contact of contactDetails) {
                if (contact.Id === this._contact.Id) {
                    this._contact.IsInvited = contact.IsInvited;
                    break;
                }
            }
            this.computeActionsVisibility();
        }

        /**
        * This method checks the visibility and availability of action for contacts.
        **/
        private computeActionsVisibility() {
            this._canInvite = this._contact && this._contact.IsInvited === false;
            this._invitecontactsAction.isEnabled = this._contact && this._canInvite;
            this._invitecontactsAction.isVisible = this._contact && this._canInvite;
            this._sendmailtasksAction.isEnabled = this._contact && this._contact.IsInvited;
            this._sendmailtasksAction.isVisible = !!this._contact;
            this._editContactAction.isVisible = !!this._contact;
            if (this._mainController.currentProject()) {
                this.computeEditActionVisibility();
                this.computeDeleteActionEnable();
            }
            this._isOneActionVisible = false;
            for (let i = 0; i < this.actions.length; i++) {
                if (this.actions[i].isVisible) {
                    this._isOneActionVisible = true;
                }
            }
        }

        /**
         * This method is used to compute contact delete action visibility depending on the current project and current user
         */
        private computeDeleteActionEnable() {
            let currentProject: ap.models.projects.Project = this._mainController.currentProject();
            this._deleteContactAction.isEnabled = !this._contact.HasSuperAdminModule &&
                this._contact.User.Id !== this._Utility.UserContext.CurrentUser().Id /* cannot delete current user */ &&
                currentProject !== null &&
                currentProject.Creator.Id !== this._contact.User.Id /*cannot delete the creator project*/ &&
                ((currentProject.UserAccessRight.CanRemoveContact && this._contact.EntityCreationUser === this._Utility.UserContext.CurrentUser().Id) || currentProject.UserAccessRight.CanEditAllContact);
        }

        /**
         * This method is used to compute contact edit action visibility depending on the current project
         */
        private computeEditActionVisibility() {
            this._editContactAction.isEnabled = (this._mainController.currentProject().UserAccessRight.CanEditContact && this._contact.EntityCreationUser === (<ap.models.actors.User>this._Utility.UserContext.CurrentUser()).Id) ||
                this._mainController.currentProject().UserAccessRight.CanEditAllContact || this._contact.User.Id === (<ap.models.actors.User>this._Utility.UserContext.CurrentUser()).Id;
        }

        dispose() {
            this._contactController.off("contactsinvited", this._changeInvitationStatus, this);
            this._mainController.off("currentprojectchanged", this.computeEditActionVisibility, this);
            this._listener.clear();
        }

        /**
            * This is the constructor of ProjectContactsActionViewModel
            * @param _Utility: UtilityHelper
            * @param _contact: ContactDetails
            */
        constructor(private _Utility: ap.utility.UtilityHelper,
            private _contact: ap.models.projects.ContactDetails,
            private _contactController: ap.controllers.ContactController,
            private _mainController: ap.controllers.MainController) {

            this._listener = this._Utility.EventTool.implementsListener(["editcontactrequested"]);

            this._editContactAction = new ap.viewmodels.home.ActionViewModel(this._Utility, this._Utility.EventTool, "projectcontacts.editcontact", this._Utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit participant", false);
            this._invitecontactsAction = new ap.viewmodels.home.ActionViewModel(this._Utility, this._Utility.EventTool, "projectcontacts.invitecontacts", this._Utility.rootUrl + "Images/html/icons/ic_group_add_black_48px.svg", false, null, "Invite the participant", this._canInvite);
            this._sendmailtasksAction = new ap.viewmodels.home.ActionViewModel(this._Utility, this._Utility.EventTool, "projectcontacts.sendtasksmail", this._Utility.rootUrl + "Images/html/icons/ic_email_black_48px.svg", false, null, "Send tasks mail", true);
            this._contactinfoAction = new ap.viewmodels.home.ActionViewModel(this._Utility, this._Utility.EventTool, "projectcontacts.contactinfo", this._Utility.rootUrl + "Images/html/icons/ic_info_black_48px.svg", true, null, "Participant info", true, false, new ap.misc.Shortcut(KEY_CODE.ENTER));
            this._deleteContactAction = new ap.viewmodels.home.ActionViewModel(this._Utility, this._Utility.EventTool, "projectcontacts.delete", this._Utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete", false, false);

            this._contactController.on("contactsinvited", this._changeInvitationStatus, this);
            if (!this._mainController.currentProject()) {
                this._mainController.on("currentprojectchanged", this.computeEditActionVisibility, this);
            }
            this._actions = [this._sendmailtasksAction, this._invitecontactsAction, this._editContactAction, this._contactinfoAction, this._deleteContactAction];
            this.computeActionsVisibility();
        }

        private _canInvite: boolean = false;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _editContactAction: ap.viewmodels.home.ActionViewModel;
        private _invitecontactsAction: ap.viewmodels.home.ActionViewModel;
        private _sendmailtasksAction: ap.viewmodels.home.ActionViewModel;
        private _deleteContactAction: ap.viewmodels.home.ActionViewModel;
        private _contactinfoAction: ap.viewmodels.home.ActionViewModel;
        private _listener: ap.utility.IListenerBuilder;
        private _isOneActionVisible: boolean = false;
    }
}