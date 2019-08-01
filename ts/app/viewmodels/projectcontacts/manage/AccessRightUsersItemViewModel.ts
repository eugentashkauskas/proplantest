module ap.viewmodels.projectcontacts {

    export enum ValueType {
        Header, Empty, Simple, Selector
    }

    export abstract class ContactInfoViewModel {

        /**
        * Use to know the value of the selector
        */
        public get value(): any {
            return this._itemValue;
        }

        public set value(v: any) {
            if (this._type === ValueType.Simple) {
                this._value = v;
                this.checkValue();
            }
        }

        /**
        * Use to know the type of the cell (selector, simple, etc)
        */
        public get type() {
            return this._type;
        }

        /**
        * use to know if the contact can be edit
        */
        public get canEdit(): boolean {
            return this._canEdit;
        }

        /**
        * Use to know the accessRightLevel of the list
        */
        public get availableAccessRights(): KeyValue<any, String>[] {
            return this._availableAccessRights;
        }

        /**
        * Use to know the selected accessright (dropdown)
        */
        public get selectedAccessRight(): any {
            return this._selectedAccessRight;
        }

        /**
        * To know if the ViewModel has been modified or not
        */
        public get hasChanged(): boolean {
            return this._hasChanged;
        }

        private setHasChanged(newValue: boolean) {
            if (newValue !== this._hasChanged) {
                this._hasChanged = newValue;
                this._listener.raise("haschangedchanged", this);
            }
        }

        /**
        * When the value of the dropdown change
        * Need to raise haschanged to manage the visibility of the save button
        */
        public set selectedAccessRight(access: any) {
            this._selectedAccessRight = access;
            this.setHasChanged(this.computeHasChanged());
            this._listener.raise("selectedaccessrightchanged", this);
        }

        /**
         * Set the access right of an item and reset the hasChanged property to false
         * @param access
         */
        public resetSelectedAccessRight(access: any) {
            this._selectedAccessRight = access;
            this._hasChanged = false;
        }

        /**
         * This method is used to check value of selector
         */
        public checkValue(): void {
            if (this._type === ValueType.Selector) {
                this._itemValue = ap.models.accessRights.AccessRightLevel[this._value];
            } else {
                this._itemValue = this._value;
            }
        }

        /**
        * Use to know if the value of the dropdown has changed
        */
        public abstract computeHasChanged(): boolean;

        /**
         * Update the entity with the new access right and add AccessRightLevel to the modifiedProperties array
         */
        public abstract postChanges();

        /**
        * Initialize the available access right for the item
        */
        protected abstract initializeAccessRight();

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        constructor(protected $utility: ap.utility.UtilityHelper, protected _type: ValueType, protected _value: any, protected _currentProject: ap.models.projects.Project) {
            this._listener = this.$utility.EventTool.implementsListener(["selectedaccessrightchanged", "haschangedchanged"]);
            this.checkValue();
        }

        protected _canEdit: boolean;
        protected _selectedAccessRight: any;
        protected _availableAccessRights: KeyValue<any, String>[] = [];
        protected _hasChanged: boolean = false;
        private _listener: ap.utility.IListenerBuilder;
        private _itemValue: any;
    }

    export class MeetingContactInfoViewModel extends ContactInfoViewModel {

        /**
        * use to know the contact
        */
        public get contact(): ap.models.meetings.MeetingConcern {
            return <ap.models.meetings.MeetingConcern>this._contact;
        }

        /**
        * Method use to know if the access right has changed
        **/
        public computeHasChanged(): boolean {
            if ((<ap.models.meetings.MeetingConcern>this.contact).AccessRightLevel !== this._selectedAccessRight) {
                return true;
            } else {
                return false;
            }
        }

        protected initializeAccessRight() {
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingSubcontractor))
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Subcontractor, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Subcontractor]));
            this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Guest, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Guest]));
            if (this._currentProject.UserAccessRight.CanEditAllList || this.currentMeeting.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Contributor)
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Contributor, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Contributor]));
            if (this._currentProject.UserAccessRight.CanEditAllList || this.currentMeeting.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Manager)
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Manager, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Manager]));
            if (this._currentProject.UserAccessRight.CanEditAllList || this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingAdminAccess) && this.currentMeeting.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Admin)
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Admin, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Admin]));
        }

        public postChanges() {
            this.contact.AccessRightLevel = this.selectedAccessRight;
            this.contact.ModifiedProperties.push("AccessRightLevel");
        }

        constructor($utility: ap.utility.UtilityHelper, type: ValueType, value: any, private _contact: ap.models.meetings.MeetingConcern, currentProject: ap.models.projects.Project, private currentMeeting: ap.models.meetings.Meeting) {
            super($utility, type, value, currentProject);
            this.initializeAccessRight();
            this._currentUser = this.$utility.UserContext.CurrentUser();

            this._canEdit = this._contact && this._contact.User.Id !== this._currentUser.Id && !this._contact.HasSuperAdminModule;
            if (this._contact.AccessRightLevel > currentMeeting.UserAccessRight.Level && !currentProject.UserAccessRight.CanEditAllList)
                this._canEdit = false;
        }

        private _currentUser: ap.models.actors.User;
    }

    export class ProjectContactInfoInMeetingViewModel extends ContactInfoViewModel {

        /**
        * Use to set the value of the selector
        */
        public set value(v: any) {
            this._value = v;
        }

        /**
        * Use to know the value of the selector
        */
        public get value(): any {
            return ap.models.accessRights.AccessRightLevel[this._value];
        }

        /**
        * Use to get the value to send to the API
        **/
        public get valueToSave(): number {
            return this._valueToSave;
        }

        /**
        * use to know the contact
        */
        public get meetingConcern(): ap.models.meetings.MeetingConcern {
            return this._meetingConcern;
        }

        public set meetingConcern(newContact: models.meetings.MeetingConcern) {
            this._meetingConcern = newContact;

            this.init();
        }

        public get contact(): models.projects.ContactDetails {
            return this._contact;
        }

        public set contact(newContact: models.projects.ContactDetails) {
            this._contact = newContact;
        }

        public set meeting(newMeeting: models.meetings.Meeting) {
            this._currentMeeting = newMeeting;

            this.init();
        }

        /**
        * Method use to know if the access right has changed
        **/
        public computeHasChanged(): boolean {
            this.checkValueToSave();
            if ((<ap.models.meetings.MeetingConcern>this._meetingConcern).AccessRightLevel !== this._selectedAccessRight) {
                return true;
            } else {
                return false;
            }
        }

        public init() {
            if (this._currentMeeting && this._meetingConcern) {
                this.initializeAccessRight();
                this.checkValueToSave();
                this._canEdit = this._meetingConcern && this._meetingConcern.User.Id !== this._currentUser.Id && !this._meetingConcern.HasSuperAdminModule;
                if (this._meetingConcern.AccessRightLevel > this._currentMeeting.UserAccessRight.Level && !this._currentProject.UserAccessRight.CanEditAllList)
                    this._canEdit = false;
            }
        }

        /**
         * This method is used to check valueToSave property
         */
        private checkValueToSave(): void {
            if ((this.selectedAccessRight === 6) && (this.meetingConcern.AccessRightLevel !== null)) {
                this._valueToSave = 0;
            }
            else if ((this.selectedAccessRight === ap.models.accessRights.AccessRightLevel.Guest) && (this.meetingConcern.AccessRightLevel !== ap.models.accessRights.AccessRightLevel.Guest)) {
                this._valueToSave = 2;
            }
            else if ((this.selectedAccessRight === ap.models.accessRights.AccessRightLevel.Subcontractor) && (this.meetingConcern.AccessRightLevel !== ap.models.accessRights.AccessRightLevel.Subcontractor)) {
                this._valueToSave = 1;
            }
            else if ((this.selectedAccessRight === ap.models.accessRights.AccessRightLevel.Contributor) && (this.meetingConcern.AccessRightLevel !== ap.models.accessRights.AccessRightLevel.Contributor)) {
                this._valueToSave = 3;
            }
            else if ((this.selectedAccessRight === ap.models.accessRights.AccessRightLevel.Manager) && (this.meetingConcern.AccessRightLevel !== ap.models.accessRights.AccessRightLevel.Manager)) {
                this._valueToSave = 4;
            }
            else if ((this.selectedAccessRight === ap.models.accessRights.AccessRightLevel.Admin) && (this.meetingConcern.AccessRightLevel !== ap.models.accessRights.AccessRightLevel.Admin)) {
                this._valueToSave = 5;
            }
            else {
                this._valueToSave = 6;
            }
        }

        protected initializeAccessRight() {
            this._availableAccessRights.splice(0);
            this._availableAccessRights.push(new KeyValue(6, "Not invited"));
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingSubcontractor))
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Subcontractor, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Subcontractor]));
            this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Guest, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Guest]));
            if (this._currentProject.UserAccessRight.CanEditAllList || this._currentMeeting.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Contributor)
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Contributor, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Contributor]));
            if (this._currentProject.UserAccessRight.CanEditAllList || this._currentMeeting.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Manager)
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Manager, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Manager]));
            if (this._currentProject.UserAccessRight.CanEditAllList || this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingAdminAccess) && this._currentMeeting.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Admin)
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Admin, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Admin]));
        }

        public postChanges() {
            this._meetingConcern.AccessRightLevel = this.selectedAccessRight;
            this._meetingConcern.ModifiedProperties.push("AccessRightLevel");
        }

        constructor($utility: ap.utility.UtilityHelper, type: ValueType, value: any, currentProject: ap.models.projects.Project) {
            super($utility, type, value, currentProject);
            this._currentProject = currentProject;
            this._currentUser = this.$utility.UserContext.CurrentUser();
        }

        protected _value: any;
        private _meetingConcern: ap.models.meetings.MeetingConcern;
        private _currentMeeting: ap.models.meetings.Meeting;
        private _currentUser: ap.models.actors.User;
        private _contact: models.projects.ContactDetails;
        private _valueToSave: number;
    }

    export class ProjectContactInfoViewModel extends ContactInfoViewModel {

        /**
        * use to know the contact
        */
        public get contact(): ap.models.projects.ContactDetails {
            return <ap.models.projects.ContactDetails>this._contact;
        }

        /**
        * Use to know if the accessright level has been changed
        **/
        public computeHasChanged(): boolean {
            if ((<ap.models.projects.ContactDetails>this.contact).AccessRightLevel !== this._selectedAccessRight) {
                return true;
            } else {
                return false;
            }
        }

        /**
         * Update the entity with the new access right and add AccessRightLevel to the modifiedProperties array
         */
        public postChanges() {
            this.contact.AccessRightLevel = this.selectedAccessRight;
            this.contact.ModifiedProperties.push("AccessRightLevel");
        }

        protected initializeAccessRight() {
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectGuestAccess)) {
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Guest, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Guest]));
            }
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectContributorAccess) && this._currentProject && this._currentProject.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Contributor) {
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Contributor, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Contributor]));
            }
            if (this._currentProject && this._currentProject.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Manager) {
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Manager, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Manager]));
            }
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectAdminAccess) && this._currentProject && this._currentProject.UserAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Admin) {
                this._availableAccessRights.push(new KeyValue(ap.models.accessRights.AccessRightLevel.Admin, ap.models.accessRights.AccessRightLevel[ap.models.accessRights.AccessRightLevel.Admin]));
            }
        }

        constructor($utility: ap.utility.UtilityHelper, type: ValueType, value: any, private _contact: ap.models.projects.ContactDetails, currentProject: ap.models.projects.Project) {
            super($utility, type, value, currentProject);
            this.initializeAccessRight();
            this._canEdit = this._currentProject && this._currentProject.UserAccessRight.Level === ap.models.accessRights.AccessRightLevel.Admin;

            if ((<ap.models.projects.ContactDetails>this._contact).IsInvited)
                this._canEdit = this._canEdit || (<ap.models.projects.ContactDetails>this._contact).InviterId === this.$utility.UserContext.CurrentUser().Id;
            else
                this._canEdit = this._canEdit || (<ap.models.projects.ContactDetails>this._contact).EntityCreationUser === this.$utility.UserContext.CurrentUser().Id;

            this._canEdit = this._canEdit && (<ap.models.projects.ContactDetails>this._contact) && !(<ap.models.projects.ContactDetails>this._contact).HasSuperAdminModule;

            if (this._currentProject && this._currentProject.Creator.Id === this.$utility.UserContext.CurrentUser().Id && (<ap.models.projects.ContactDetails>this._contact).User.UserId === this.$utility.UserContext.CurrentUser().Id)
                this._canEdit = false; // cannot edit his own access
            else if ((<ap.models.projects.ContactDetails>this._contact).AccessRightLevel > this._currentProject.UserAccessRight.Level)
                this._canEdit = false; // cannot edit someone with higher access
        }
    }

    /**
     * ViewModel of one row of the access rights
     * Each ViewModel represents a specific access right and thus contains all the users and boolean values for each to tell if the user
     * has the access right or not
     */
    export class AccessRightUsersItemViewModel extends EntityViewModel {

        /**
        * Return current item's name
        **/
        public get name() {
            return this._name;
        }

        /**
        * Return current item's type string value
        **/
        public get type() {
            return ValueType[this._type];
        }

        /**
        * Return current item's type enum value
        **/
        public get typeEnum() {
            return this._type;
        }

        /**
        * 
        * @param pageIndex Page index
        **/
        public getContactsData(pageIndex: number) {
            if (!this._contactsData)
                return null;
            return this._contactsData.getValue(pageIndex);
        }

        /**
         * 
         * @param pageIndex
         * @param value
         */
        public setContactsData(pageIndex: number, value: Dictionary<string, ContactInfoViewModel>) {
            if (this._contactsData)
                this._contactsData.add(pageIndex, value);
        }

        constructor(Utility: ap.utility.UtilityHelper, $q: angular.IQService, name: string, type: ValueType) {
            super(Utility);
            this._name = name;
            this._type = type;
            this._contactsData = new Dictionary<number, Dictionary<string, ContactInfoViewModel>>();
        }

        private _name: string;
        private _type: ValueType;
        private _contactsData: Dictionary<number, Dictionary<string, ContactInfoViewModel>>; // pageNumber; contactId,ContactInfo
    }
}