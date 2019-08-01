module ap.viewmodels.projectcontacts {
    export class AddProjectContactViewModel {

        /**
         * A public accessor for a contact selector model
         */
        get contactSelector(): ap.viewmodels.projects.ContactSelectorViewModel {
            return this._contactSelector;
        }

        /**
         * A public accessor for a search query
         */
        get searchText(): string {
            return this._searchText;
        }

        set searchText(value: string) {
            this._searchText = value;
        }

        /**
         * Adds a new user to the current project
         */
        addParticipant() {
            // Need this in case of the user clicks several times on add button
            if (this._previousAddedContact !== this._searchText) {
                this._previousAddedContact = this._searchText;
                let contactsLoader = this.$q.when(this._contactSelector.searchContacts(this._searchText));
                this.$q.all([contactsLoader, this._existingUsersLoader]).then((results: any[]) => {
                    let foundContacts = <ap.viewmodels.projects.ContactItemViewModel[]>results[0];
                    let addedContact = foundContacts[0]; // At least one contact will be found, because we allow creation of new entries
                    let mainController = this._controllersManager.mainController;

                    if (this._existingUserIds.indexOf(addedContact.userId) >= 0) {
                        let projectName = mainController.currentProject().Name;
                        let errorMessage = this.$utility.Translator.getTranslation("app.contacts.participantexists_message").format(projectName);
                        mainController.showError(errorMessage, this.$utility.Translator.getTranslation("User already in project"), null, null);
                        return;
                    }

                    let willInvite = false;
                    if (!this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectContactPrepare)) {
                        willInvite = true;
                    } else if (!mainController.currentProject().UserAccessRight.CanConfig) {
                        willInvite = true;
                    }

                    this._contactService.createContactDetails(addedContact.contactDetails, willInvite).then(() => {
                        if (willInvite) {
                            mainController.showToast("app.contacts.participantaddedandinvited_message", null, null, [addedContact.contactDetails.User.DisplayName]);
                        } else {
                            mainController.showToast("app.contacts.participantadded_message", null, null, [addedContact.contactDetails.User.DisplayName]);
                        }
                        this.$mdDialog.hide();
                    });
                });
            }
        }

        /**
         * Cancels addition of a new participant
         */
        public cancel() {
            this.$mdDialog.cancel();
        }

        constructor(private $utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private $timeout: angular.ITimeoutService, private $mdDialog: angular.material.IDialogService, private _controllersManager: ap.controllers.ControllersManager, private _contactService: ap.services.ContactService) {
            this._contactSelector = new ap.viewmodels.projects.ContactSelectorViewModel($utility, _api, $q, _controllersManager.mainController, _controllersManager.projectController, true, true, true);
            this._searchText = "";
            this._existingUserIds = [];

            this._existingUsersLoader = _controllersManager.contactController.getContactsUsersIdsOnProject().then((existingUserIds: string[]) => {
                this._existingUserIds = existingUserIds;
            });
        }
        private _previousAddedContact: string = null;
        private _contactSelector: ap.viewmodels.projects.ContactSelectorViewModel;
        private _searchText: string;
        private _existingUsersLoader: angular.IPromise<any>;
        private _existingUserIds: string[];
    }
}
