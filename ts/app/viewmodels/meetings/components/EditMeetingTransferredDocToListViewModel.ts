module ap.viewmodels.meetings {
    export class EditMeetingTransferredDocToListViewModel {

        /**
        * Used to know if the user's browser is IE
        **/
        public get isIE(): boolean {
            return this.$utility.isIE();
        }

        /**
        * Return modified selected contacts
        **/
        public get selectedContacts() {
            return this._selectedContacts;
        }

        /**
        * Return "Transferred to" list instance
        **/
        public get usersToList() {
            return this._usersToList;
        }

        /**
        * Return true if changes were made to the list and user can save them
        **/
        public get canSave() {
            return this._canSave;
        }

        /**
        * Return edit transferred to list popup title, depending on the document name value
        **/
        public get editWindowTitle() {
            if (!this._documentName) {
                return this.$utility.Translator.getTranslation("app.document.noname.transferredTo");
            }
            return this.$utility.Translator.getTranslation("app.document.name.transferredTo").format(this._documentName);
        }

        /**
         * Save selected contacts and hide edit dialog window
         */
        public save() {
            let oldContactsLength = this._usersToList.contactSelectorViewModel.selectedContacts.length;
            this._usersToList.contactSelectorViewModel.selectedContacts.splice(0, oldContactsLength, ...this._selectedContacts);
            this.$mdDialog.hide();
        }

        /**
         * Cancel dialog window without saving
         */
        public cancel() {
            this.$mdDialog.cancel();
        }

        /**
         * Add transferred to contact
         * @param contact Contact entity
         */
        public addContact(contact: ap.viewmodels.projects.ContactItemViewModel) {
            if (!contact)
                return;
            let contactIndex = this._selectedContacts.indexOf(contact);
            if (contactIndex < 0) {
                this._selectedContacts.push(contact);
                this.computeCanSave();
            }
            this._usersToList.contactSelectorViewModel.searchText = "";
        }

        /**
         * Remove transferred to contact
         * @param contact Contact entity
         */
        public removeContact(contact: ap.viewmodels.projects.ContactItemViewModel) {
            let contactIndex = this._selectedContacts.indexOf(contact);
            if (contactIndex >= 0) {
                this._selectedContacts.splice(contactIndex, 1);
            }
            this.computeCanSave();
        }

        /**
         * Check if changes were made to the contact list
         */
        private computeCanSave() {
            this._canSave = false;
            if (this._selectedContacts.length !== this._usersToList.contactSelectorViewModel.selectedContacts.length) {
                this._canSave = true;
                return;
            }
            for (let i = 0; i < this._selectedContacts.length; i++) {
                if (this._usersToList.contactSelectorViewModel.selectedContacts.filter((contact: ap.viewmodels.projects.ContactItemViewModel) => {
                    return contact.userId === this._selectedContacts[i].userId;
                }).length === 0) {
                    this._canSave = true;
                    return;
                }
            }
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $mdDialog: angular.material.IDialogService, private _documentName: string, private _usersToList: ap.viewmodels.meetings.MeetingTransferredDocToListViewModel) {
            this._selectedContacts = this._usersToList.contactSelectorViewModel.selectedContacts ?
                this._usersToList.contactSelectorViewModel.selectedContacts.slice() : [];
        }

        private _selectedContacts: ap.viewmodels.projects.ContactItemViewModel[];
        private _removedContactIds: string[];
        private _canSave: boolean = false;
    }
}