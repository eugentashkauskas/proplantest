namespace ap.viewmodels.meetingcontacts {

    export class AddMeetingConcernsViewModel {

        public get canImport(): boolean {
            return this._projectContactListVm.listVm.getCheckedItems().length > 0;
        }

        public get canAdd(): boolean {
            return !StringHelper.isNullOrWhiteSpace(this.email);
        }

        /**
        * This property is the email of the futur new contact
        **/
        public get email(): string {
            return this._email;
        }

        public set email(mail: string) {
            this._email = mail;
        }

        /**
        * This property for select ProjectContact
        **/
        public get projectContactListVm(): ap.viewmodels.projectcontacts.ProjectContactListViewModel {
            return this._projectContactListVm;
        }

        /**
        * This method use for add custom params for projectContactListVm
        **/
        private buildCustomParam() {
            this._projectContactListVm.excludedUserIds = this.excludedUserIds;
            this._projectContactListVm.load();
        }

        public cancel() {
            this.$mdDialog.hide();
        }

        /**
         * Add the selected contacts to the list
         *      - Load Contactdetails entity based on the selected elements
         *      - Call controller when the array of ContactDetails (they are used to initialize the meetingconcens info)
         */
        public save() {
            if (this.projectContactListVm.selectedAll || this.projectContactListVm.isIndeterminate) {
                let i: number = 0, length: number = this.projectContactListVm.listVm.count;
                let contactIdsToLoad: string[] = [];
                let checkedContactDetails: ap.models.projects.ContactDetails[] = [];
                let sourceItems: projectcontacts.ProjectContactItemViewModel[] = <projectcontacts.ProjectContactItemViewModel[]>this.projectContactListVm.listVm.sourceItems;
                let idsToLoad: string[] = this.projectContactListVm.listVm.listidsChecked.slice(0);

                for (i; i < length; i++) {
                    // the contact is checked -> add it to the array and remove the id from the checked ids to load
                    if (sourceItems[i] && sourceItems[i].isChecked) {
                        checkedContactDetails.push(sourceItems[i].originalContactItem);
                        idsToLoad.splice(idsToLoad.indexOf(sourceItems[i].originalEntity.Id), 1);
                    }
                }

                if (idsToLoad && idsToLoad.length) {
                    this.loadContactDetails(idsToLoad).then((loadedContacts: ap.models.projects.ContactDetails[]) => {
                        checkedContactDetails.push(...loadedContacts);
                        this.createMeetingConcerns(checkedContactDetails);
                    });
                } else {
                    this.createMeetingConcerns(checkedContactDetails);
                }
            }
        }

        /**
         * Load not loaded checked contactDetails
         * @param idsToLoad ContactDetails ids to load
         */
        private loadContactDetails(idsToLoad: string[]): angular.IPromise<ap.models.projects.ContactDetails[]> {
            let filter: string = Filter.eq("Project.Id", this._controllersManager.mainController.currentProject().Id);
            filter = Filter.and(filter, Filter.in("Id", idsToLoad));

            return this.Api.getEntityList("ContactDetails", filter, "User", null, idsToLoad).then((response: services.apiHelper.ApiResponse) => {
                return response.data;
            });
        }

        /**
         * Creates MeetingConcerns based on an array of ContactDetails
         * @param contactDetails ContactDetails array used to create MeetingConcerns
         */
        private createMeetingConcerns(contactDetails: ap.models.projects.ContactDetails[]) {
            this._controllersManager.meetingController.addMeetingConcerns(contactDetails).then((result) => {
                this.$mdDialog.hide();
            });
        }

        /**
         * This method will add the participant corresponding to the email field as the contact of the project and will automatically check it to let the user to add him to the meeting.
         * Cannot be call if canAdd = false.
         */
        public addParticipant() {
            // Need this in case of the user clicks several times on add button
            if (this._previousAddedContact !== this.email) {
                this._previousAddedContact = this.email;
                this._contactSelector.searchContacts(this.email).then((result: ap.viewmodels.projects.ContactItemViewModel[]) => {
                    for (let i = 0; i < result.length; i++) {
                        let index = this._contactIdOnProject.indexOf(result[i].contactDetails.User.UserId);
                        if (index !== -1) {
                            this._controllersManager.mainController.showMessage(this.Utility.Translator.getTranslation("app.contacts.participantexists_message").format(this._controllersManager.mainController.currentProject().Name), this.Utility.Translator.getTranslation("Participant already added"));
                        } else {
                            let willInvite: boolean = false;
                            if (!this.Utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectContactPrepare))
                                willInvite = true;
                            else if (!this._controllersManager.mainController.currentProject().UserAccessRight.CanConfig)
                                willInvite = true;
                            this.servicesManager.contactService.createContactDetails(result[i].contactDetails, willInvite).then((contactReturned: ap.models.projects.ContactDetails) => {
                                this._contactIdOnProject.push(contactReturned.User.UserId);
                                this.projectContactListVm.load().then(() => {
                                    for (let i = 0; i < this.projectContactListVm.listVm.sourceItems.length; i++) {
                                        let item: projectcontacts.ProjectContactItemViewModel = <projectcontacts.ProjectContactItemViewModel>this.projectContactListVm.listVm.sourceItems[i];
                                        if (item.originalContactItem.User.UserId === contactReturned.User.UserId) {
                                            item.isChecked = true;
                                        }
                                    }
                                });
                                this.email = "";
                            });
                        }
                    }
                });
            }
        }

        constructor(private Utility: ap.utility.UtilityHelper, private Api: ap.services.apiHelper.Api,
            private $q: angular.IQService, private $timeout: angular.ITimeoutService, private _controllersManager: ap.controllers.ControllersManager, private servicesManager: ap.services.ServicesManager, private $mdDialog: angular.material.IDialogService, private excludedUserIds: string[]) {
            this._contactSelector = new ap.viewmodels.projects.ContactSelectorViewModel(Utility, Api, $q, _controllersManager.mainController, _controllersManager.projectController, true, true, true);
            this._projectContactListVm = new ap.viewmodels.projectcontacts.ProjectContactListViewModel(this.Utility, $q, _controllersManager, $timeout, servicesManager, true, true);
            this.buildCustomParam();
            this._controllersManager.contactController.getContactsUsersIdsOnProject().then((idsReturned) => {
                this._contactIdOnProject = idsReturned;
            });
        }
        private _previousAddedContact: string = null;
        private _email: string;
        private _projectContactListVm: ap.viewmodels.projectcontacts.ProjectContactListViewModel;
        private _contactIdOnProject: string[];
        private _contactSelector: ap.viewmodels.projects.ContactSelectorViewModel;
    }
}