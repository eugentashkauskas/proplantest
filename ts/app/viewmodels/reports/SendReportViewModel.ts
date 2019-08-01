module ap.viewmodels.reports {

    export class SendReportViewModel implements IDispose {
        /**
        * The title of the mail
        **/
        public get subject() {
            return this._subject;
        }
        public set subject(val: string) {
            this._subject = val;
        }
        /**
        * The body of the mail
        **/
        public get body() {
            return this._body;
        }
        public set body(val: string) {
            this._body = val;
        }

        /**
        * The name of the pdf file attach on the mail
        **/
        public get pdfName(): string {
            return this._pdfName;
        }

        public set pdfName(val: string) {
            this._pdfName = val;
        }

        /**
        * The name of the excel file attach on the mail
        **/
        public get excelName(): string {
            return this._excelName;
        }

        public set excelName(val: string) {
            this._excelName = val;
        }

        /**
        * To know the mail has excel attachment or not 
        **/
        public get hasExcelAttachment(): boolean {
            return this._hasExcelAttachment;
        }

        public set hasExcelAttachment(val: boolean) {
            this._hasExcelAttachment = val;
        }

        /**
        * The vm to select participants to send report
        **/
        public get recipientsSelector(): ap.viewmodels.projects.ContactSelectorViewModel {
            return this._recipientsSelector;
        }

        /**
        * To know can send the report or not
        **/
        public get maySend(): boolean {
            return !StringHelper.isNullOrEmpty(this._subject)
                && !StringHelper.isNullOrEmpty(this._body)
                && this._recipientsSelector.selectedContacts.length > 0;
        }

        /**
        * This method is used to check that the user have removed the not removeable contact and add again
        * @param removedcontact is the contact have been removed
        **/
        public onRecipientRemoved(removedcontact: ap.viewmodels.projects.ContactItemViewModel) {
            if (!removedcontact.canRemove)
                this._recipientsSelector.addItem(removedcontact);
        }

        /**
        * This method is used to check that the user have added duplicate the contact or not
        * @param addedcontact is the contact added by the user
        **/
        public onRecipientAdded(addedcontact: ap.viewmodels.projects.ContactItemViewModel) {
            let count = 0;
            let lastIndex = 0;
            if (this._recipientsSelector.selectedContacts) {
                for (let i = 0; i < this._recipientsSelector.selectedContacts.length; i++) {
                    let contactItem = this._recipientsSelector.selectedContacts[i];
                    if (contactItem.userId === addedcontact.userId) {
                        count++;
                        lastIndex = i;
                    }
                }
                if (count > 1)
                    this._recipientsSelector.selectedContacts.splice(lastIndex, 1);
            }
        }

        /**
        * This method is used to post value of the vm into the ReportParams object
        * @pointReportParams is the ReportParams object used to generate the report
        **/
        initReportParams(reportParams: ap.misc.ReportParamsBase) {
            reportParams.mailSubject = this._subject;
            reportParams.mailBody = this._body;
            if (this._recipientsSelector.selectedContacts !== null && this._recipientsSelector.selectedContacts.length > 0) {
                if (reportParams.recipientIds === undefined || reportParams.recipientIds === null)
                    reportParams.recipientIds = [];
                angular.forEach(this._recipientsSelector.selectedContacts, (contact, key) => {
                    if (!contact.isFake)
                        reportParams.recipientIds.push(contact.userId);
                });
            }
        }

        /**
        * This method is used to check and call the service to create new contacts from the selectedContacts
        **/
        createNewContacts(): angular.IPromise<ap.models.projects.ContactDetails[]> {
            let self = this;
            let deferred: ng.IDeferred<ap.models.projects.ContactDetails[]> = this.$q.defer();
            let listNewContacts: ap.models.projects.ContactDetails[] = [];
            if (this.recipientsSelector.selectedContacts && this.recipientsSelector.selectedContacts !== null) {
                angular.forEach(this.recipientsSelector.selectedContacts, (contactItem, key) => {
                    if (contactItem.contactDetails !== undefined && contactItem.contactDetails !== null && contactItem.contactDetails.IsNew)
                        listNewContacts.push(contactItem.contactDetails);
                });
            }
            if (listNewContacts.length > 0) {
                // When the current user doesn't have the Module_ProjectContactPrepare, Invite the contact 
                // bool willInvite = !MainController.LicenseAccess.HasAccess(LicenseAccess.Module_ProjectContactPrepare);
                let willInvite: boolean = false;
                if (!this.utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectContactPrepare))
                    willInvite = true;
                else if (!this.mainController.currentProject().UserAccessRight.CanConfig)
                    willInvite = true;
                this.contactService.createListContactDetails(listNewContacts, willInvite, this.utility.UserContext.LanguageCode(), null).then((resultList) => {
                    if (resultList && resultList !== null) {
                        angular.forEach(resultList, (savedContact, key) => {
                            let messageKey = "app.contacts.participantadded_message";
                            if (savedContact.IsInvited)
                                messageKey = "app.contacts.participantinvited_message";
                            this.mainController.showToast(messageKey, null, null, [savedContact.DisplayName]);
                        });
                    }
                    deferred.resolve(resultList);
                }, (error) => {
                    deferred.reject(error);
                });
            }
            else
                deferred.resolve(null);

            return deferred.promise;
        }

        /**
        * @implements Implementation of IDispose interface
        */
        public dispose() {
            if (this._recipientsSelector) {
                this._recipientsSelector.dispose();
                this._recipientsSelector = null;
            }
        }

        constructor(private utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService,
            private _projectController: ap.controllers.ProjectController,
            private reportController: ap.controllers.ReportController, private mainController: ap.controllers.MainController, private contactService: ap.services.ContactService) {

            this._recipientsSelector = new ap.viewmodels.projects.ContactSelectorViewModel(utility, _api, $q, mainController, _projectController, false, false, true);
        }

        private _subject: string = null;
        private _body: string = null;
        private _pdfName: string = null;
        private _excelName: string = null;
        private _hasExcelAttachment: boolean = false;
        private _recipientsSelector: ap.viewmodels.projects.ContactSelectorViewModel = null;
    }
}