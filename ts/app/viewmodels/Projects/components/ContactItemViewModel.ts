module ap.viewmodels.projects {
    export class ContactItemViewModel implements ap.misc.IChipsItem {

        public isChecked: boolean = false;

        /**
        * The display text of the vm. It can be DisplayName or Company or Role of the contactdetails
        **/
        public get displayText(): string {
            return this._displayText;
        }

        /**
        * Set display text of the vm. Required in rare cases, for example change text translation
        **/
        public set displayText(displayText: string) {
            this._displayText = displayText;
        }

        /**
        * This public getter is used to get isIndeterminate property
        **/
        public get isIndeterminate(): boolean {
            return this._isIndeterminate;
        }

        /**
        * This public setter is used to set isIndeterminate property
        **/
        public set isIndeterminate(val: boolean) {
            this._isIndeterminate = val;
        }

        /**
        * The userid of the contactdetails
        **/
        public get userId(): string {
            return this._userId ? this._userId : null;
        }
        /**
        * The email of the contactdetails
        **/
        public get email(): string {
            return this._email;
        }
        /**
        * The ContactDetails entity to build this vm
        **/
        public get contactDetails(): ap.models.projects.ContactDetails {
            return this._contactDetails;
        }
        /**
        * To known that this item can not be remove
        **/
        public get canRemove(): boolean {
            return this._canRemove;
        }
        /**
        * To known that this item is the fake item
        **/
        public get isFake(): boolean {
            return this._isFake;
        }

        /**
        * The tooltip display of this item
        **/
        public get tooltip(): string {
            return this._tooltip;
        }

        /**
        * Use to get the name of the contact
        **/
        public getDisplayText(): string {
            return this.displayText;
        }

        /**
         * Use to get the id of the user or the tag
         */
        public getValue(): string {
            return this._userId || this._displayText;
        }

        /**
        * Use to get the name of the proprety
        **/
        public getPropertyName(): string {
            return this._propertyName;
        }

        constructor(displayText: string, userId?: string, email?: string, contactDetails?: ap.models.projects.ContactDetails, canRemove?: boolean, isFake?: boolean, tooltip?: string, _propertyName?: string) {
            this._displayText = displayText;
            this._userId = userId;
            this._email = email;
            this._contactDetails = contactDetails;
            if (canRemove !== undefined)
                this._canRemove = canRemove;
            if (isFake !== undefined)
                this._isFake = isFake;
            if (tooltip !== undefined)
                this._tooltip = tooltip;
            if (_propertyName !== undefined) {
                this._propertyName = _propertyName;
            }
        }
        private _displayText: string = null;
        private _userId: string = null;
        private _email: string = null;
        private _contactDetails: ap.models.projects.ContactDetails;
        private _canRemove: boolean = true;
        private _isFake: boolean = false;
        private _tooltip: string = "";
        private _propertyName: string;
        private _isIndeterminate: boolean = false;
    }
}