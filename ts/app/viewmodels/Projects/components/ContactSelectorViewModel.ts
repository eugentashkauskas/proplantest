module ap.viewmodels.projects {
    export class ContactSelectorViewModel extends ListEntityViewModel implements ap.misc.IAdvancedFilterChipsSelector {

        /**
        * The different items selected
        **/
        public get selectedValues(): ap.misc.IChipsItem[] {
            return this.selectedContacts;
        }

        public set selectedValues(s: ap.misc.IChipsItem[]) {
            this._selectedContacts = <ContactItemViewModel[]>s;
        }

        public get listContacts(): ContactItemViewModel[] {
            return this._listContacts;
        }

        /**
        * The different items selected
        **/
        public get displayValues(): string {
            let values: string = "";
            if (this.selectedValues && this.selectedValues.length > 0) {
                values = this.selectedValues[0].getDisplayText() + ";";
            }
            for (let i = 1; i < this.selectedValues.length; i++) {
                values = values + " " + this.selectedValues[i].getDisplayText() + ";";
            }
            return values;
        }

        /**
        * The text input by the user to search contacts
        **/
        public get searchText(): string {
            return this._searchText;
        }

        public set searchText(val: string) {
            this._searchText = val;
        }

        /**
        * The list of selected contacts items make by the user
        **/
        public get selectedContacts(): ap.viewmodels.projects.ContactItemViewModel[] {
            return this._selectedContacts;
        }

        /**
        * Use to get the name of the proprety
        **/
        public getPropretyName(): string {
            return this._propertyName;
        }

        /**
        * This method is used to init the contact item list from the list users
        * @param users is the list User
        **/
        public initUsers(items: ap.models.actors.IContact[]) {
            if (items && items !== null) {
                this._selectedContacts = [];
                items.forEach((item) => {
                    let contactItem: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel(item.DisplayName, item.UserId);
                    this.selectedContacts.push(contactItem);
                });
            }
        }

        /**
        * Method use to get the entities corresponding to the keys into the dictionary
        * @param dic is a dictionary with string keys which contains string values
        **/
        public initializeSelectedValues(dic: Dictionary<string, string[]>): angular.IPromise<ap.misc.IChipsItem[]> {
            let deferred: ng.IDeferred<ap.misc.IChipsItem[]> = this.$q.defer();
            let keys = dic.keys();
            let chipsItems2: ap.misc.IChipsItem[] = [];
            if (dic.containsKey("Guid")) {
                this.initializeSelectedValuesWithGuid(dic.getValue("Guid")).then((chipsItems) => {
                    for (let i = 0; i < keys.length; i++) {
                        if (keys[i] !== "Guid") {
                            chipsItems2 = this.initializeSelectedValuesWithoutGuid(dic.getValue(keys[i]), keys[i]);
                        }
                    }
                    deferred.resolve(chipsItems.concat(chipsItems2));
                });
            } else {
                for (let i = 0; i < keys.length; i++) {
                    let tmp = this.initializeSelectedValuesWithoutGuid(dic.getValue(keys[i]), keys[i]);
                    chipsItems2 = chipsItems2.concat(tmp);
                }
                deferred.resolve(chipsItems2);
            }
            return deferred.promise;
        }

        /**
        * Method use to get the entities from 'Guid' key
        * @param dic is a dictionary with string keys which contains at least one key = "Guid"
        **/
        private initializeSelectedValuesWithGuid(values: string[]): angular.IPromise<ap.misc.IChipsItem[]> {
            let computedText: string = "";
            let contactItem: ContactItemViewModel;
            let chipsItems: ap.misc.IChipsItem[] = [];
            let deferred: ng.IDeferred<ap.misc.IChipsItem[]> = this.$q.defer();
            computedText = values[0];

            if (values.length > 1) {
                for (let j = 1; j < values.length; j++) {
                    computedText = computedText + ", " + values[j];
                }
            }
            let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            option.isShowBusy = false;
            option.async = true;
            let filter: string = Filter.eq("ProjectId", this._mainController.currentProject().Id);
            let searchFilter: string = Filter.contains("User.Id", "\"" + computedText + "\"");
            this._propertyName = "User.Id";
            filter = Filter.and(filter, searchFilter);

            this._api.getEntityList("ContactDetails", filter, this.pathToLoad, null, null, option).then((apiResponse) => {

                let contactDetails: ap.models.projects.ContactDetails[] = apiResponse.data;
                let companyAdded: string[] = [];
                let roleAdded: string[] = [];
                if (contactDetails && contactDetails !== null && contactDetails.length > 0) {
                    contactDetails.forEach((contact: ap.models.projects.ContactDetails) => {
                        contactItem = new ContactItemViewModel(contact.DisplayName, contact.User.Id, contact.User.Alias, null, false, false, null, this._propertyName);
                        chipsItems.push(contactItem);
                    });
                }
                else {
                    throw new Error("No data found");
                }
                deferred.resolve(chipsItems);
            }, (err) => {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        /**
        * Method use to get the entities corresponding to the dictionary
        * @param dic is a dictionary with no "Guid" keys
        **/
        private initializeSelectedValuesWithoutGuid(values: string[], key: string): ap.misc.IChipsItem[] {
            let contactItem: ContactItemViewModel;
            let chipsItems: ap.misc.IChipsItem[] = [];

            for (let j = 0; j < values.length; j++) {
                contactItem = new ContactItemViewModel(values[j], null, null, null, false, false, null, key);
                chipsItems.push(contactItem);
            }
            return chipsItems;
        }

        /**
        * This method will do the searching and return the promise of list IChipsItem
        **/
        public search(s: string): angular.IPromise<ap.misc.IChipsItem[]> {
            return this.searchContacts(s);
        }

        /**
         * This method will do the searching of ContactDetails having displayName or company or Role correctponse with the given text
           and return the promise of list ContactItemViewModel
         * @param searchText The given text to search
        **/
        public searchContacts(searchText: string): any {
            let self = this;
            let propretyName: string;
            this._listContacts = [];
            let deferred = this.$q.defer();
            if (searchText === undefined || StringHelper.isNullOrEmpty(searchText)) {
                // Reset the _currentSearchEmail
                self._currentSearchEmail = null;
                return this._listContacts;
            }
            else {
                let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
                option.isShowBusy = false;
                option.async = true;
                let query = searchText;
                if (self._canCreateNew && self._currentSearchEmail !== null && query.indexOf(self._currentSearchEmail) >= 0) {
                    self.checkCreateNewContact(query, this._listContacts, deferred);
                }
                else {
                    let filter: string = Filter.eq("ProjectId", this._mainController.currentProject().Id);
                    let searchFilter: string = Filter.contains("DisplayName", "\"" + query + "\"");
                    searchFilter = Filter.or(searchFilter, Filter.eq("User.Alias", "\"" + query + "\""));
                    if (this._checkCompany) {
                        searchFilter = Filter.or(searchFilter, Filter.contains("Company", "\"" + query + "\""));
                    }
                    if (this._checkRole) {
                        searchFilter = Filter.or(searchFilter, Filter.contains("Role", "\"" + query + "\""));
                    }
                    filter = Filter.and(filter, searchFilter);
                    this._api.getEntityList("ContactDetails", filter, self.pathToLoad, null, null, option).then((apiResponse) => {
                        let contactDetails: ap.models.projects.ContactDetails[] = apiResponse.data;
                        let companyAdded: string[] = [];
                        let roleAdded: string[] = [];
                        let selectedUsers: string[] = [];
                        if (contactDetails && contactDetails !== null && contactDetails.length > 0) {
                            // Reset the _currentSearchEmail
                            self._currentSearchEmail = null;
                            self.selectedContacts.forEach((user: ContactItemViewModel) => {
                                selectedUsers.push(user.userId);
                            });
                            angular.forEach(contactDetails, (contact, key) => {
                                if (selectedUsers.indexOf(contact.User.Id) < 0 || this._isForAdvancedFilter) {
                                    if ((contact.DisplayName && contact.DisplayName !== null && contact.DisplayName.toLowerCase().indexOf(searchText.toLowerCase()) >= 0)
                                        || (contact.User && contact.User !== null && contact.User.Alias.toLowerCase().indexOf(searchText.toLowerCase()) >= 0)
                                    ) {
                                        let vm: ContactItemViewModel = new ContactItemViewModel(contact.DisplayName, contact.User.Id, contact.User.Alias, contact, true, false, null, "Guid");
                                        this._listContacts.push(vm);
                                        if (selectedUsers.indexOf(contact.User.Id) >= 0) {
                                            vm.isChecked = true;
                                        }
                                    }
                                    if (self._checkCompany && contact.Company && contact.Company !== null && contact.Company.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 && companyAdded.indexOf(contact.Company) < 0) {
                                        let vm: ContactItemViewModel = new ContactItemViewModel(contact.Company, null, null, null, true, false, null, "Companies");
                                        this._listContacts.push(vm);
                                        companyAdded.push(contact.Company);
                                    }
                                    if (self._checkRole && contact.Role && contact.Role !== null && contact.Role.toLowerCase().indexOf(searchText.toLowerCase()) >= 0 && roleAdded.indexOf(contact.Role) < 0) {
                                        let vm: ContactItemViewModel = new ContactItemViewModel(contact.Role, null, null, null, true, false, null, "Roles");
                                        this._listContacts.push(vm);
                                        roleAdded.push(contact.Role);
                                    }
                                }
                            });
                            deferred.resolve(this._listContacts);
                        }
                        else
                            self.checkCreateNewContact(query, this._listContacts, deferred);
                        this._listener.raise("contactsloaded");
                    }, (err) => {
                        deferred.reject(err);
                    });
                }
            }
            return deferred.promise;
        }

        /**
        * This method is used to check and create the new user/contact when the user searching the contact by email
        * @param searchEmail is the search make by the user
        * @param resultList is the result for the searchContacts method
        * @param deferred is the defer for the searchContacts method
        **/
        private checkCreateNewContact(searchEmail: string, resultList: ContactItemViewModel[], deferred: any) {
            let self = this;
            if (self._canCreateNew) {
                self._currentSearchEmail = searchEmail;
                if (StringHelper.checkValidEmail(searchEmail)) {
                    self._mainController.checkUserExists(searchEmail).then((userfound: ap.models.actors.User) => {
                        let user: ap.models.actors.User = userfound;
                        if (user === null) {
                            user = new ap.models.actors.User(self.$utility);
                            user.initFromEmail(searchEmail);
                        }
                        let contact: ap.models.projects.ContactDetails = new ap.models.projects.ContactDetails(self.$utility);
                        let suffix = " (" + self.$utility.Translator.getTranslation("New") + ")";

                        contact.initFromUser(user, self._mainController.currentProject());
                        let newItem: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel(contact.DisplayName + suffix, user.Id, user.DefaultEmail, contact);

                        resultList.push(newItem);
                        deferred.resolve(resultList);

                    }, (error) => { deferred.reject(error); }
                    );
                }
                else
                    deferred.resolve(resultList);
            }
            else
                deferred.resolve(resultList);
        }

        /**
         * This method will get all contactdetails which linked to the selected issuetype then fill them to the incharge of the point
         * https://aproplan.atlassian.net/wiki/display/APBDD/Create+a+new+point#Createanewpoint-FieldUserinchargeautomaticallycompletedwhenacategoryisinput
         * Input category is not linked to a user -> Then the content of the field User in charge is emptied
         * Category is linked to participants -> THen the content of the field User in charge is replaced with all the names of the participants linked to the selected category
         * Participant of linked category belongs to a company -> Then the name of the company of the participant is put in the User in charge field instead of the name of the participant
         * Field category emptied -> Then nothing happens in the In charge field	
         * @param issueTypeId The given issueTypeId
        **/
        public handleIssueTypeChanged(issueTypeId: string) {
            if (issueTypeId === undefined || StringHelper.isNullOrEmpty(issueTypeId))
                return;
            let self = this;
            this._projectController.getIssueTypeLinkedContactDetails(issueTypeId).then((contacts: ap.models.projects.ContactDetails[]) => {
                // We always clear the current incharge list
                if (contacts.length > 0) {
                    self.selectedContacts.splice(0, self.selectedContacts.length);
                    let companyAdded: string[] = [];
                    contacts.forEach((contact: ap.models.projects.ContactDetails) => {
                        let contactItem: ap.viewmodels.projects.ContactItemViewModel = null;
                        if (!contact.Company) {
                            contactItem = new ap.viewmodels.projects.ContactItemViewModel(contact.DisplayName, contact.User.Id, contact.User.Alias);
                            self.selectedContacts.push(contactItem);
                        } else {
                            if (companyAdded.indexOf(contact.Company) < 0) {
                                contactItem = new ap.viewmodels.projects.ContactItemViewModel(contact.Company);
                                self.selectedContacts.push(contactItem);
                                companyAdded.push(contact.Company);
                            }
                        }
                    });
                }
            });
        }


        /**
         * THis method use for load list of contacts
         */
        public load() {
            this._listContacts = [];
            let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            option.isShowBusy = false;
            option.async = true;
            let filter: string = Filter.eq("ProjectId", this._mainController.currentProject().Id);
            this._api.getEntityList("ContactDetails", filter, this.pathToLoad, null, null, option).then((apiResponse) => {
                let contactDetails: ap.models.projects.ContactDetails[] = apiResponse.data;
                let companyAdded: string[] = [];
                let roleAdded: string[] = [];
                if (contactDetails && contactDetails !== null && contactDetails.length > 0) {
                    angular.forEach(contactDetails, (contact, key) => {
                        if ((contact.DisplayName && contact.DisplayName !== null) || (contact.User && contact.User !== null)) {
                            let vm: ContactItemViewModel = new ContactItemViewModel(contact.DisplayName, contact.User.Id, contact.User.Alias, contact, true, false, null, "Guid");
                            this._listContacts.push(vm);
                        }
                        if (this._checkCompany && contact.Company && contact.Company !== null && companyAdded.indexOf(contact.Company) < 0) {
                            let vm: ContactItemViewModel = new ContactItemViewModel(contact.Company, null, null, null, true, false, null, "Companies");
                            this._listContacts.push(vm);
                            companyAdded.push(contact.Company);
                        }
                        if (this._checkRole && contact.Role && contact.Role !== null && roleAdded.indexOf(contact.Role) < 0) {
                            let vm: ContactItemViewModel = new ContactItemViewModel(contact.Role, null, null, null, true, false, null, "Roles");
                            this._listContacts.push(vm);
                            roleAdded.push(contact.Role);
                        }
                    });
                }
                this.checkDefaultItems(this._listContacts);
                this._listener.raise("contactsloaded");
            });
        }

        /**
         * Check contacts by default if their ids is in the 'listidsChecked'
         * @param loadedItems The array in which we look at the items
         */
        private checkDefaultItems(loadedItems: ContactItemViewModel[]) {
            if (this.listidsChecked && this.listidsChecked.length && loadedItems) {
                loadedItems.forEach((item: ContactItemViewModel) => {
                    if (item.getPropertyName() === "Guid" && this.listidsChecked.indexOf(item.userId) >= 0) {
                        item.isChecked = true;
                    }
                });
            }
        }

        /**
         * Returns the list of checked items 
         */
        public getCheckedContacts(): ContactItemViewModel[] {
            let checkedItems: ContactItemViewModel[] = new Array<ContactItemViewModel>();
            let i: number, length: number = this.listContacts.length;

            for (i = 0; i < length; i++) {
                if (this.listContacts[i] && this.listContacts[i].isChecked) {
                    checkedItems.push(this.listContacts[i]);
                }
            }

            return checkedItems;
        }

        /**
         * Unchecks all items in the list
         * @override
         */
        public uncheckAll() {
            let checkedItems = this.getCheckedContacts();

            for (let i = 0; i < checkedItems.length; i++) {
                checkedItems[i].isChecked = false;
            }

            this.selectedValues.splice(0);
        }

        /**
        * This method is used to add the specifiled item into the selected list
        * @param item is the ContactItemViewModel need to add
        * @param index is the specifiled the index to add the item
        **/
        addItem(item: ContactItemViewModel, index?: number) {
            if (index !== undefined && index >= 0) {
                this._selectedContacts.splice(index, 0, item);
            }
            else {
                this._selectedContacts.push(item);
                this.listidsChecked.push(item.userId);
            }
        }

        /**
         * This handler use for add or remove contacts from selected contacts when toggled checkbox
         * @param item
         */
        toggleCheckedItem(item: ContactItemViewModel) {
            if (item.isChecked) {
                this.addItem(item);
            } else {
                let index = this._selectedContacts.indexOf(item);
                this._selectedContacts.splice(index, 1);
                this.listidsChecked.splice(index, 1);
            }
        }

        /**
        * @param _checkRole to specified make the search on Role field of the ContactDetails
        * @param _checkCompany to specified make the search on company field of the ContactDetails
        * @param _canCreateNew to soecified that if the contact doesn't exists, we can create a new one.
        **/
        constructor($utility: ap.utility.UtilityHelper, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private _mainController: ap.controllers.MainController,
            private _projectController: ap.controllers.ProjectController, private _checkRole: boolean = true, private _checkCompany: boolean = true, private _canCreateNew: boolean = false, private _isForAdvancedFilter: boolean = false) {

            super($utility, "ContactDetails", "User", "", "");
            this._listener.addEventsName(["contactsloaded"]);
            this._selectedContacts = [];
            // Problem : When i search the contacts and then enter into an item -> the chips will be auto add one empty item
            // Workaround : before push an item into the _selectedContacts, check this is valid item
            this._selectedContacts.push = function (item): number {
                if (item && item.displayText && !StringHelper.isNullOrEmpty(item.displayText)) {
                    return Array.prototype.push.call(this, item);
                }
                return -1;
            };
        }

        private _selectedContacts: ap.viewmodels.projects.ContactItemViewModel[];
        private _currentSearchEmail: string = null; // The current text search make by the user and there is no contact found
        private _searchText: string = null;
        private _propertyName: string;
        private _listContacts: ap.viewmodels.projects.ContactItemViewModel[] = [];
    }
}