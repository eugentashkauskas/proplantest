module ap.viewmodels.projectcontacts {

    export class InviteContactsViewModel implements ap.utility.IListener, IDispose {
        /**
        * Return ContactDetails list
        */
        public get contacts(): ap.models.projects.ContactDetails[] {
            return this._contacts;
        }

        /**
        * Return private string contain displayName of contacts
        */
        public get nameContacts(): string {
            return this._nameContacts;
        }

        /**
        * Cast "originalEntity" to ap.models.identFiles.Language
        */
        public get selectedLanguage(): ap.models.identFiles.Language {
            return <ap.models.identFiles.Language>this.languageSelector.selectedViewModel.originalEntity;
        }

        public on(eventName: string, callback: (args: any) => void, caller: any) {
            this._listener.on(eventName, callback, caller);
        }

        public off(eventName: string, callback: (args: any) => void, caller: any) {
            this._listener.off(eventName, callback, caller);
        }

        dispose() {
            this.languageSelector.dispose();
            this._listener.clear();
        }

        /**
        * This method will cancel mdDialog
        */
        public cancel(): void {
            this.$mdDialog.cancel();
        }

        /**
        * This method will collect all contacts id and hide $mdDialog at callback of contactController.inviteProjectContacts
        */
        public invite() {
            let contactsIds = [];

            // collect each contact id
            this.contacts.forEach((contact) => contactsIds.push(contact.Id));

            this._contactController.inviteProjectContacts(contactsIds, this.selectedLanguage).then((contactDetails: models.projects.ContactDetails[]) => {
                for (let i = 0; i < this._contacts.length; i++) {
                    this._contacts[i].IsInvited = true;
                }
                this.$mdDialog.hide();
                this._listener.raise("contactsinvited", contactDetails);
            });
        }

        /**
        * Constructor of InviteContactsViewModel
        * @param $scope
        * @param Utility
        * @param $mdDialog
        * @param _contacts
        * @param _contactController
        * @param $q
        * @param _mainController
        */
        constructor(
            private Utility: ap.utility.UtilityHelper,
            private $mdDialog: angular.material.IDialogService,
            private _contacts: ap.models.projects.ContactDetails[],
            private _contactController: ap.controllers.ContactController,
            private $q: angular.IQService,
            private _mainController: ap.controllers.MainController,
            private _selectedLanguage?: ap.models.identFiles.Language
        ) {
            this._listener = this.Utility.EventTool.implementsListener(["contactsinvited"]);
            this.languageSelector = new ap.viewmodels.identificationfiles.languages.LanguageListViewModel(this.Utility, this.$q, this._mainController);
            this.languageSelector.selectByCode(this._selectedLanguage ? this._selectedLanguage.Code : Utility.UserContext.LanguageCode());

            this._contacts.forEach((contact, i) => {
                this._nameContacts += contact.DisplayName;

                if (i !== (this._contacts.length - 1)) {
                    this._nameContacts += ", ";
                }
            });
        }

        public languageSelector: ap.viewmodels.identificationfiles.languages.LanguageListViewModel;
        private _nameContacts: string = "";
        private _listener: ap.utility.IListenerBuilder;
    }
}