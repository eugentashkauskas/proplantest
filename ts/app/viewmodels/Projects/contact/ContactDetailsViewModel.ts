module ap.viewmodels.projects {

    export class ContactDetailsViewModel extends EntityViewModel {
        /**
        * displayName of the contact
        */
        public get displayName(): string {
            return this._displayName;
        }

        /**
        * company name of the contact
        */
        public get company(): string {
            return this._company;
        }

        /**
        * Role of the contact
        */
        public get role(): string {
            return this._role;
        }

        /**
        * city of the contact
        */
        public get city(): string {
            return this._city;
        }

        /**
        * phone of the contact
        */
        public get phone(): string {
            return this._phone;
        }

        /**
        * zip of the address of the contact
        */
        public get zip(): string {
            return this._zip;
        }

        /**
        * street of the address of the contact
        */
        public get street(): string {
            return this._street;
        }

        /**
        * vat numer of the contact
        */
        public get vat(): string {
            return this._vat;
        }

        /**
        * email of the contact
        */
        public get email(): string {
            return this._email;
        }

        /**
        * Second email of the contact
        */
        public get partyEmail(): string {
            return this._partyEmail;
        }

        /**
        * country of the contact
        */
        public get country(): ap.models.identFiles.Country {
            return this._country;
        }

        /**
        * Access right of the contact
        */
        public get accessRightLevel(): ap.models.accessRights.AccessRightLevel {
            return this._accessRightLevel;
        }

        /**
        * Can the contact be invited
        */
        public get canInvite() {
            return this._canInvite;
        }

        /**
        * Property to be able to link the contact to one or several issueType
        */
        public get issueTypesSelector() {
            return this._issueTypesSelector;
        }

        /**
        * Property to be able to select the country of the contact
        */
        public get countrySelector() {
            return this._countrySelector;
        }

        /**
        * Property to get the language of contact
        */
        public get languageSelector() {
            return this._languageSelector;
        }

        public set displayName(displayName: string) {
            if (this._displayName !== displayName) {
                let oldValue = this._displayName;
                this._displayName = displayName;
                this.checkIsValid();
                this.raisePropertyChanged("DisplayName", oldValue, this);
            }
        }

        public set company(company: string) {
            if (this._company !== company) {
                let oldValue = this._company;
                this._company = company;
                this.raisePropertyChanged("Company", oldValue, this);
            }
        }

        public set role(role: string) {
            if (this._role !== role) {
                let oldValue = this._role;
                this._role = role;
                this.raisePropertyChanged("Role", oldValue, this);
            }
        }

        public set city(city: string) {
            if (this._city !== city) {
                let oldValue = this._city;
                this._city = city;
                this.raisePropertyChanged("City", oldValue, this);
            }
        }

        public set phone(phone: string) {
            if (this._phone !== phone) {
                let oldValue = this._phone;
                this._phone = phone;
                this.raisePropertyChanged("Phone", oldValue, this);
            }
        }

        public set zip(zip: string) {
            if (this._zip !== zip) {
                let oldValue = this._zip;
                this._zip = zip;
                this.raisePropertyChanged("Zip", oldValue, this);
            }
        }

        public set street(street: string) {
            if (this._street !== street) {
                let oldValue = this._street;
                this._street = street;
                this.raisePropertyChanged("Street", oldValue, this);
            }
        }

        public set vat(vat: string) {
            if (this._vat !== vat) {
                let oldValue = this._vat;
                this._vat = vat;
                this.raisePropertyChanged("Vat", oldValue, this);
            }
        }

        public set email(email: string) {
            if (this._email !== email) {
                let oldValue = this._email;
                this._email = email;
                this.raisePropertyChanged("Email", oldValue, this);
            }
        }

        public set partyEmail(partyEmail: string) {
            if (this._partyEmail !== partyEmail) {
                let oldValue = this._partyEmail;
                this._partyEmail = partyEmail;
                this.raisePropertyChanged("PartyEmail", oldValue, this);
            }

        }

        public get contactDetails(): ap.models.projects.ContactDetails {
            return <ap.models.projects.ContactDetails>this._originalEntity;
        }

        /**
         * Compute if data are ok and then, can be saved
         */
        protected checkIsValid() {
            super.checkIsValid();
            this.setIsValid = this.isValid && !StringHelper.isNullOrWhiteSpace(this._displayName);
        }

        postChanges(): void {
            if (!this.contactDetails)
                throw new Error("Can not post changes - original entity not defined");
            this.contactDetails.DisplayName = this._displayName;
            this.contactDetails.Company = this._company;
            this.contactDetails.Role = this._role;
            this.contactDetails.Street = this._street;
            this.contactDetails.City = this._city;
            this.contactDetails.Vat = this._vat;
            this.contactDetails.Zip = this._zip;
            this.contactDetails.Phone = this._phone;

            if (this.contactDetails.User) {
                this.contactDetails.User.Alias = this._email;
                // update contact language
                this.contactDetails.User.LanguageCode = (<ap.viewmodels.identificationfiles.languages.LanguageViewModel>this._languageSelector.selectedViewModel).originalLanguage.Code;
                if (this.contactDetails.User.Person) {
                    this.contactDetails.User.Person.Email = this._partyEmail;
                }
            }
            // get edited contact issue types' ids
            let issueTypesIds = [];
            this._issueTypesSelector.getCheckedItems().forEach((item: ap.viewmodels.projects.ChapterHierarchyItemViewModel, index: number) => {
                if (item.level > 0) {
                    issueTypesIds.push(item.chapterHierarchy.EntityId);
                }
            });
            if (!this.contactDetails.LinkedIssueTypes) {
                this.contactDetails.LinkedIssueTypes = [];
            } else {
                // keep already saved entities, and remove deleted entities from array
                let removedIssueTypes = [];
                this.contactDetails.LinkedIssueTypes.forEach((issueType: ap.models.projects.ContactIssueType, index: number) => {
                    let issueTypeIndex = issueTypesIds.indexOf(issueType.IssueTypeId);
                    if (issueTypeIndex < 0) {
                        removedIssueTypes.push(issueType.Id);
                    } else {
                        issueTypesIds.splice(issueTypeIndex, 1);
                    }
                });
                if (removedIssueTypes.length > 0) {
                    this.contactDetails.LinkedIssueTypes = this.contactDetails.LinkedIssueTypes.filter((issueType: ap.models.projects.ContactIssueType) => {
                        return removedIssueTypes.indexOf(issueType.Id) < 0;
                    });
                }
            }
            // add new saved entites
            for (let issueTypeId of issueTypesIds) {
                let contactIssueType = new ap.models.projects.ContactIssueType(this.utility);
                contactIssueType.ContactId = this.contactDetails.Id;
                contactIssueType.IssueTypeId = issueTypeId;
                let checkItems = this.issueTypesSelector.getCheckedItems().filter((item: ap.viewmodels.projects.ChapterHierarchyItemViewModel) => {
                    return (<ap.models.projects.ChapterHierarchy>item.originalEntity).EntityId === issueTypeId;
                });
                let json: any = checkItems[0].originalEntity.toJSON();
                json.Id = json.EntityId;
                let issueType: ap.models.projects.IssueType = new ap.models.projects.IssueType(this.$utility);
                issueType.createByJson(json);
                contactIssueType.IssueType = issueType;
                this.contactDetails.LinkedIssueTypes.push(contactIssueType);
            }
            // save contact details country
            if (this._countrySelector.selectedViewModel) {
                this.contactDetails.Country = <ap.models.identFiles.Country>this._countrySelector.selectedViewModel.originalEntity;
            } else {
                this.contactDetails.Country = null;
            }
        }

        copySource(): void {
            super.copySource();
            if (this.contactDetails && this.contactDetails !== null) {
                this._displayName = this.contactDetails.DisplayName;
                this._company = this.contactDetails.Company;
                this._role = this.contactDetails.Role;
                this._street = this.contactDetails.Street;
                this._city = this.contactDetails.City;
                this._vat = this.contactDetails.Vat;
                this._zip = this.contactDetails.Zip;
                this._phone = this.contactDetails.Phone;
                this._country = this.contactDetails.Country;
                this._accessRightLevel = this.contactDetails.AccessRightLevel;
                this._canInvite = !this.contactDetails.IsInvited && this.utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectContactPrepare);
                if (this.contactDetails.User && this.contactDetails.User !== null) {
                    this._email = this.contactDetails.User.Alias;
                    if (this.contactDetails.User.Person && this.contactDetails.User.Person !== null) {
                        this._partyEmail = this.contactDetails.User.Person.Email;
                    }
                    this._languageSelector = new ap.viewmodels.identificationfiles.languages.LanguageListViewModel(this.utility, this.$q, this.$controllersManager.mainController);
                    this._languageSelector.selectByCode(this.contactDetails.User.LanguageCode);
                }
                this._issueTypesSelector = new IssueTypeMultiSelectorViewModel(this.utility, this.$api, this.$q, this.$controllersManager);
                this._issueTypesSelector.setInitCheckedValueText(this.contactDetails.LinkedIssueTypes.map((item) => { return item.IssueType.Description; }));
                this._issueTypesSelector.on("idsloaded", this.setSelectedCategoriesIds, this);
                this.issueTypesSelector.load();
                this._countrySelector = new ap.viewmodels.identificationfiles.country.CountryListViewModel(this.utility, this.$q, this.$controllersManager.mainController);
                this._countrySelector.load(this.contactDetails.Country ? this.contactDetails.Country.Id : null);
            }
        }

        dispose() {
            super.dispose();
            if (this._issueTypesSelector)
                this._issueTypesSelector.dispose();
            if (this._countrySelector)
                this._countrySelector.dispose();
            if (this._languageSelector)
                this._languageSelector.dispose();
        }

        /**
         * This method is used to save viewmodel's changes to the entity
         * @param invite A flag indicating that an invitation dialog should be shown
         */
        public save(invite: boolean = false) {
            this.$controllersManager.mainController.showBusy();
            this.postChanges();
            let willInvite = !this.contactDetails.IsInvited && (invite === true || !this.utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectContactPrepare));
            if (willInvite === true) {

                let inviteController = ($scope: angular.IScope, $timeout: angular.ITimeoutService) => {
                    let selectedLanguage = <ap.models.identFiles.Language>this.languageSelector.selectedViewModel.originalEntity;
                    let inviteContactVm = new ap.viewmodels.projectcontacts.InviteContactsViewModel(this.utility, this.$mdDialog, [this.contactDetails], this.$controllersManager.contactController, this.$q, this.$controllersManager.mainController, selectedLanguage);
                    inviteContactVm.on("contactsinvited", this.inviteContactDetailsHandler, this);
                    $scope["vm"] = inviteContactVm;
                    this.$controllersManager.mainController.hideBusy();
                    $scope.$on("$destroy", () => {
                        inviteContactVm.dispose();
                        inviteContactVm = null;
                    });
                };
                inviteController.$inject = ["$scope", "$timeout"];
                this.$mdDialog.show({
                    skipHide: true,
                    clickOutsideToClose: false,
                    preserveScope: true,
                    templateUrl: "me/PartialView?module=ProjectContacts&name=InviteContactsDialog",
                    fullscreen: true,
                    controller: inviteController
                }).then(() => {
                    this.$controllersManager.contactController.updateContactDetails([this.contactDetails]).then((updatedContactDetails: ap.models.projects.ContactDetails[]) => {
                        this.$controllersManager.contactController.requestUpdateContact(this.contactDetails);
                    });
                });
            } else {
                this.$controllersManager.contactController.updateContactDetails([this.contactDetails]).then((updatedContactDetails: ap.models.projects.ContactDetails[]) => {
                    this.$controllersManager.mainController.hideBusy();
                    this.$mdDialog.hide(updatedContactDetails && updatedContactDetails.length ? updatedContactDetails[0] : null);
                });
            }
        }

        /**
         * This method is used to raise event on closing popup window
         * @param updatedContact Updated entity, null if changes were cancelled
         */
        public cancel() {
            super.cancel();
            this.$mdDialog.cancel();
        }

        private setSelectedCategoriesIds() {
            if (this.contactDetails.LinkedIssueTypes) {
                let issueTypeIds: Array<string> = new Array<string>(this.contactDetails.LinkedIssueTypes.length);
                this.contactDetails.LinkedIssueTypes.forEach((contactIssueType: ap.models.projects.ContactIssueType, index: number) => {
                    issueTypeIds[index] = contactIssueType.IssueTypeId + "1";
                });
                if (this._issueTypesSelector.isIdsLoaded)
                    this._issueTypesSelector.checkedIds = issueTypeIds;
            }
        }

        /**
         * Contact's invitation handler function
         * @param contactDetails Invited contact details
         */
        private inviteContactDetailsHandler(contactDetails: ap.models.projects.ContactDetails[]) {
            if (contactDetails && contactDetails.length === 1) {
                this.$mdDialog.hide(contactDetails[0]);
            }
        }

        constructor(private utility: ap.utility.UtilityHelper, private $api: ap.services.apiHelper.Api, private $q: angular.IQService, private $controllersManager: ap.controllers.ControllersManager, private $mdDialog: angular.material.IDialogService) {
            super(utility);
        }

        private _displayName: string = null;
        private _company: string = null;
        private _role: string = null;
        private _city: string = null;
        private _phone: string = null;
        private _zip: string = null;
        private _street: string = null;
        private _vat: string = null;
        private _email: string = null;
        private _languageCode: string = null;
        private _partyEmail: string = null;
        private _country: ap.models.identFiles.Country = null;
        private _accessRightLevel: ap.models.accessRights.AccessRightLevel = ap.models.accessRights.AccessRightLevel.Guest;
        private _issueTypesSelector: ap.viewmodels.projects.IssueTypeMultiSelectorViewModel;
        private _countrySelector: ap.viewmodels.identificationfiles.country.CountryListViewModel;
        private _languageSelector: ap.viewmodels.identificationfiles.languages.LanguageListViewModel;
        private _canInvite: boolean = false;
    }
}