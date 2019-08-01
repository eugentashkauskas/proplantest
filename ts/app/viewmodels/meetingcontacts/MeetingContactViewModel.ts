namespace ap.viewmodels.meetingcontacts {

    export class MeetingContactViewModel extends EntityViewModel implements ap.component.dragAndDrop.IDraggableEntityViewModel {

        /**
        * The access right of the contact
        **/
        public get accessRight(): ap.models.accessRights.AccessRightBase {
            return this._accessRight;
        }

        public set accessRight(value: ap.models.accessRights.AccessRightBase) {
            this._accessRight = value;
        }

        /**
         * This is the name of the meeting's contact 
         **/
        public get name(): string {
            return this._name;
        }

        /**
         * This is the company of the meeting's contact 
         **/
        public get company(): string {
            return this._company;
        }

        /**
         * This is the role of the meeting's contact 
         **/
        public get role(): string {
            return this._role;
        }

        /**
         * This is the access rigth level of the meeting's contact 
         **/
        public get level(): string {
            return this._level;
        }

        public get translatedLevel(): string {
            return this.$utility.Translator.getTranslation(this._level);
        }

        public set level(l: string) {
            this._level = l;
        }

        /**
        * This is presence Statuses for select
        **/
        public get presenceStatuses(): KeyValue<ap.models.meetings.MeetingPresenceStatus, string>[] {
            return this._presenceStatuses;
        }

        /**
        * This is presence Status of the meeting's contact
        **/
        public get presenceStatus(): KeyValue<ap.models.meetings.MeetingPresenceStatus, string> {
            return this._presenceStatus;
        }

        public set presenceStatus(val: KeyValue<ap.models.meetings.MeetingPresenceStatus, string>) {
            this._presenceStatus = val;
        }

        /**
         * To know if the contact's is already invited at the project level
         **/
        public get isInvited(): boolean {
            return this._isInvited;
        }

        /**
         * To set if the contact is invited or not
         **/
        public set isInvited(val: boolean) {
            this._isInvited = val;
        }

        /**
         * This is the email of the meeting's contact 
         **/
        public get email(): string {
            return this._email;
        }

        /**
         * This is the phone of the meeting's contact 
         **/
        public get phone(): string {
            return this._phone;
        }

        /**
         * This is the misc info of the meeting's contact 
         **/
        public get misc(): string {
            return this._misc;
        }

        /**
        * This is the drag entity ID, used to identify draggable entity via interface method
        **/
        public get dragId() {
            return this.originalMeetingContact.Id;
        }

        /**
        * This is the display order number of the entity
        **/
        public get displayOrder() {
            return this._displayOrder;
        }

        /**
        * Set the display order of the entity
        **/
        public set displayOrder(displayOrder: number) {
            this._displayOrder = displayOrder;
        }

        /**
        * Public getter to know id the MeetingContact is the one of the connected user
        */
        public get isCurrentUser(): boolean {
            return !!this.originalMeetingContact && !!this.$utility.UserContext && !!this.$utility.UserContext.CurrentUser() &&
                this.originalMeetingContact.User.Id === this.$utility.UserContext.CurrentUser().Id;
        }

        public get actionVm(): ap.viewmodels.meetingcontacts.MeetingContactsActionViewModel {
            return this._actionVm;
        }

        public allowDrag() {
            return true;
        }

        public drop(dropTarget: ap.component.dragAndDrop.IDraggableEntityViewModel) {
            this._listener.raise("entitydropped", new ap.component.dragAndDrop.DropEntityEvent(this, dropTarget));
            return false;
        }

        public copySource(): void {
            super.copySource();

            if (this.originalEntity !== null) {
                this._name = this.originalMeetingContact.DisplayName;
                this._company = this.originalMeetingContact.Company;
                this._role = this.originalMeetingContact.Role;

                this._level = ap.models.accessRights.AccessRightLevel[this.originalMeetingContact.AccessRightLevel];
                let status = ap.models.meetings.MeetingPresenceStatus[this.originalMeetingContact.PresenceStatus];
                this._presenceStatus = this._presenceStatuses.filter((item) => { return item.key === this.originalMeetingContact.PresenceStatus; })[0];

                this._isInvited = this.originalMeetingContact.IsInvited;

                if (this.originalMeetingContact.User.Person.Email) {
                    this._email = this.originalMeetingContact.User.Person.Email;
                } else {
                    this._email = this.originalMeetingContact.User.DefaultEmail;
                }

                this._phone = this.originalMeetingContact.Phone;
                this._misc = this.originalMeetingContact.Miscellaneous;
                this._displayOrder = this.originalMeetingContact.DisplayOrder;
            }

            this.buildActions();
        }

        public postChanges(): void {
            super.postChanges();
            this.originalMeetingContact.PresenceStatus = this._presenceStatus.key;
            this.originalMeetingContact.IsInvited = this.isInvited;
            this.originalMeetingContact.DisplayOrder = this._displayOrder;
        }

        dispose() {
            super.dispose();
            this._Utility.Translator.off("languagechanged", this.translatePresenceStatuses, this);
        }

        public get originalMeetingContact(): ap.models.meetings.MeetingConcern {
            return <ap.models.meetings.MeetingConcern>this.originalEntity;
        }

        /**
        * Public getter to get value of moveUpAvailable property
        */
        public get moveUpAvailable(): boolean {
            return this._moveUpAvailable;
        }

        /**
        * Public setter to set value of moveUpAvailable property
        */
        public set moveUpAvailable(value: boolean) {
            this._moveUpAvailable = value;
        }

        /**
        * Public getter to get value of moveDownAvailable property
        */
        public get moveDownAvailable(): boolean {
            return this._moveDownAvailable;
        }

        /**
        * Public setter to set value of moveDownAvailable property
        */
        public set moveDownAvailable(value: boolean) {
            this._moveDownAvailable = value;
        }

        /**
         * Instantiates the actions view model
         */
        private buildActions() {
            this._actionVm = new ap.viewmodels.meetingcontacts.MeetingContactsActionViewModel(this.$utility, this.originalMeetingContact, this._controllersManager.contactController, this._controllersManager.mainController);
        }

        /**
         * Translate presence statuses' values if app language was changed
         */
        private translatePresenceStatuses() {
            this._presenceStatuses[0].value = this.$utility.Translator.getTranslation("Absent");
            this._presenceStatuses[1].value = this.$utility.Translator.getTranslation("Present");
            this._presenceStatuses[2].value = this.$utility.Translator.getTranslation("Excused");
        }

        static $inject = ["Utility", "mainController", "meetingController"];

        constructor(private _Utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager) {
            super(_Utility);
            this._listener.addEventsName(["entitydropped"]);
            this._presenceStatuses = [
                new KeyValue<ap.models.meetings.MeetingPresenceStatus, string>(ap.models.meetings.MeetingPresenceStatus.Absent, this.$utility.Translator.getTranslation("Absent")),
                new KeyValue<ap.models.meetings.MeetingPresenceStatus, string>(ap.models.meetings.MeetingPresenceStatus.Present, this.$utility.Translator.getTranslation("Present")),
                new KeyValue<ap.models.meetings.MeetingPresenceStatus, string>(ap.models.meetings.MeetingPresenceStatus.Excused, this.$utility.Translator.getTranslation("Excused")),
            ];
            this._Utility.Translator.on("languagechanged", this.translatePresenceStatuses, this);

            this._moveUpAvailable = false;
            this._moveDownAvailable = false;
        }

        private _name: string;
        private _company: string;
        private _role: string;
        private _level: string;
        private _presenceStatuses: KeyValue<ap.models.meetings.MeetingPresenceStatus, string>[] = [];
        private _presenceStatus: KeyValue<ap.models.meetings.MeetingPresenceStatus, string>;
        private _isInvited: boolean;
        private _email: string;
        private _phone: string;
        private _misc: string;
        private _accessRight: ap.models.accessRights.AccessRightBase;
        private _actionVm: ap.viewmodels.meetingcontacts.MeetingContactsActionViewModel;
        private _displayOrder: number;
        private _moveUpAvailable: boolean;
        private _moveDownAvailable: boolean;
    }
}