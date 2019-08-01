module ap.viewmodels.notes.filters {

    export class ContactAdvancedFilterList extends ap.misc.AdvancedFilterListBuilder {

        public get countCheckedValues(): number {
            if (!!this._contactSelectorViewModel) {
                return this._contactSelectorViewModel.selectedValues.length;
            }
            return 0;
        }

        public get searchText(): string {
            return this._contactSelectorViewModel.searchText;
        }

        public set searchText(val: string) {
            if (this._contactSelectorViewModel.searchText !== val) {
                this._contactSelectorViewModel.searchText = val;
                this.search();
            }
        }

        /**
         * THis public getter is used to get contactsCompaniesListViewModel property
         */
        public get contactsCompaniesListViewModel(): ap.viewmodels.projects.ContactItemViewModel[] {
            return this._contactsCompaniesListViewModel;
        }

        /**
         * THis public getter is used to get contactsPositionsListViewModel property
         */
        public get contactsPositionsListViewModel(): ap.viewmodels.projects.ContactItemViewModel[] {
            return this._contactsPositionsListViewModel;
        }

        public createListViewModel(): ap.viewmodels.projects.ContactSelectorViewModel {
            this._contactSelectorViewModel = new ap.viewmodels.projects.ContactSelectorViewModel(this.$utility, this._api, this.$q, this.$controllersManager.mainController, this.$controllersManager.projectController, this.isExtendedFilter, this.isExtendedFilter, undefined, true);
            if (this.isExtendedFilter) {
                this._contactSelectorViewModel.on("contactsloaded", this.createCompanyAndPostionList, this);
            }
            return this._contactSelectorViewModel;
        }

        public initializedCheckedValues(list: ap.viewmodels.ListEntityViewModel, checkedIds: Dictionary<string, string[]>) {
            if (list instanceof ap.viewmodels.projects.ContactSelectorViewModel) {
                (<ap.viewmodels.projects.ContactSelectorViewModel>list).initializeSelectedValues(checkedIds);
            } else {
                throw new Error("Only the ContactSelectorViewModel type is allowed for the list parameter.");
            }
        }

        public getTextFromCheckedIds(ids: string[]): angular.IPromise<string> {
            let deferred = this.$q.defer<string>();
            let projectId = this.$controllersManager.mainController.currentProject().Id;
            let filter: string = Filter.and(Filter.in("User.Id", ids), Filter.eq("Project.Id", projectId));
            let pathToLoad: string = "Id,DisplayName";
            let option: ap.services.apiHelper.ApiOption = new ap.services.apiHelper.ApiOption();
            option.isShowBusy = false;
            option.async = true;
            option.onlyPathToLoadData = true;

            this._api.getEntityList("ContactDetails", filter, pathToLoad, null, null, option).then((apiResponse) => {
                let contactDetails: ap.models.projects.ContactDetails[] = apiResponse.data;
                let contactNames: string = "";
                if (contactDetails && contactDetails !== null && contactDetails.length > 0) {
                    let contacts: string[] = [];
                    contacts = contactDetails.map((item) => {
                        return item.DisplayName;
                    });
                    contactNames = contacts.join(", ");
                }
                deferred.resolve(contactNames);
            }, (err) => {
                deferred.reject(err);
            });

            return deferred.promise;
        }

        /**
        * Dispose the object
        */
        public dispose() {
            if (this._contactSelectorViewModel) {
                this._contactSelectorViewModel.dispose();
                this._contactSelectorViewModel = null;
            }

            if (this._contactsCompaniesListViewModel && this._contactsCompaniesListViewModel.length) {
                this._contactsCompaniesListViewModel.splice(0);
                this._contactsCompaniesListViewModel = null;
            }

            if (this._contactsPositionsListViewModel && this._contactsPositionsListViewModel.length) {
                this._contactsPositionsListViewModel.splice(0);
                this._contactsPositionsListViewModel = null;
            }

            if (this._dicContactsCompaniesViewModel) {
                this._dicContactsCompaniesViewModel.clear();
                this._dicContactsCompaniesViewModel = null;
            }

            if (this._dicContactsPositionsViewModel) {
                this._dicContactsPositionsViewModel.clear();
                this._dicContactsPositionsViewModel = null;
            }
        }

        /**
         * This public method is used to initialize contactsPositionsListViewModel and contactsCompaniesListViewModel
         */
        private createCompanyAndPostionList() {
            this._dicContactsPositionsViewModel.clear();
            this._dicContactsCompaniesViewModel.clear();
            this._contactsPositionsListViewModel = this.createListOfContacts("Role", this._dicContactsPositionsViewModel);
            this._contactsCompaniesListViewModel = this.createListOfContacts("Company", this._dicContactsCompaniesViewModel);
        }

        /**
         * This private method is used to create List of contacts
         * @param propertyName the name of property
         * @param dicSelectors dictionary
         */
        private createListOfContacts(propertyName: string, dicSelectors: Dictionary<ap.viewmodels.projects.ContactItemViewModel, ap.viewmodels.projects.ContactItemViewModel[]>): ap.viewmodels.projects.ContactItemViewModel[] {
            let propertyNameList: string[] = [];
            let dicSelectorKeyList: ap.viewmodels.projects.ContactItemViewModel[] = []; // contains all compagnies/roles 
            let dicSelectorValueList: ap.viewmodels.projects.ContactItemViewModel[] = []; // contains all users who have a compagny or role
            let result: ap.viewmodels.projects.ContactItemViewModel[] = [];
            let loadedContacts = this._contactSelectorViewModel.listContacts;
            for (let i = loadedContacts.length - 1; i >= 0; i--) {

                // check if the current item's propertyName (= Compagny or Role) has a value -> yes means it's company or role and thus the item is displayed at level 0
                if (loadedContacts[i].contactDetails && loadedContacts[i].contactDetails[propertyName]) {
                    dicSelectorValueList.push(loadedContacts[i]);
                    if (propertyNameList.indexOf(loadedContacts[i].contactDetails[propertyName]) === -1) {
                        propertyNameList.push(loadedContacts[i].contactDetails[propertyName]);
                        dicSelectorKeyList.push(new ap.viewmodels.projects.ContactItemViewModel(loadedContacts[i].contactDetails[propertyName], null, null, null, true, true, null, propertyName));
                    }
                }

                // if it's a compagny or a role, remove it from the main list of contacts
                if (!loadedContacts[i].contactDetails) {
                    loadedContacts.splice(i, 1);
                }
            }


            for (let key of dicSelectorKeyList) {
                let dicItemValue: ap.viewmodels.projects.ContactItemViewModel[] = [];
                dicSelectorValueList.forEach((item: ap.viewmodels.projects.ContactItemViewModel) => {
                    // check if the role/compagny matches the one of the contact and if yes, add it to the values
                    if (key.displayText === item.contactDetails[propertyName]) {

                        // create a copy of the item before to add it to the list
                        // to avoid to have an item alreay checked an not its parent because it's part of an other group which is checked
                        let copiedItem: ap.viewmodels.projects.ContactItemViewModel = new ap.viewmodels.projects.ContactItemViewModel(item.contactDetails.DisplayName, item.contactDetails.User.Id, item.contactDetails.User.Alias, item.contactDetails, true, false, null, "Guid");
                        dicItemValue.push(copiedItem);
                    }
                });

                // add all contact to the compagny/role
                dicSelectors.add(key, dicItemValue);
            }


            // merge all company/role and associated contact to the result array
            for (let key of dicSelectors.keys()) {
                result.push(key);
                result.push(...dicSelectors.getValue(key));
            }
            return result;
        }

        /**
         * This public method is used to handle checkbox changed
         * @param item instance of ContactItemViewModel
         */
        public checkHandler(item: ap.viewmodels.projects.ContactItemViewModel) {
            let values: ap.viewmodels.projects.ContactItemViewModel[] = [];
            if (!!item.contactDetails) {
                this._contactSelectorViewModel.toggleCheckedItem(item);
                if (!!item.contactDetails.Role) {
                    this.checkProperty(item, "Role");
                }
                if (!!item.contactDetails.Company) {
                    this.checkProperty(item, "Company");
                }
            } else {
                if (item.getPropertyName() === "Role") {
                    // add the item to the selectedContacts array of the listVm
                    // don't do it for the children because they only displayed to the user to show him what is group is composed of
                    this._contactSelectorViewModel.toggleCheckedItem(item);
                    values = this._dicContactsPositionsViewModel.getValue(item);
                    values.forEach((value: ap.viewmodels.projects.ContactItemViewModel) => {
                        value.isChecked = item.isChecked;
                    });
                } else if (item.getPropertyName() === "Company") {
                    // add the item to the selectedContacts array of the listVm
                    this._contactSelectorViewModel.toggleCheckedItem(item);
                    values = this._dicContactsCompaniesViewModel.getValue(item);
                    values.forEach((value: ap.viewmodels.projects.ContactItemViewModel) => {
                        value.isChecked = item.isChecked;
                    });
                }
            }
        }

        /**
         * This method is used to check item by property
         * @param item instance of ContactItemViewModel
         * @param property name of property which used for checking
         */
        private checkProperty(item: ap.viewmodels.projects.ContactItemViewModel, property: string) {
            let checkedItems: number = 0;
            let keys: ap.viewmodels.projects.ContactItemViewModel[] = [];
            let values: ap.viewmodels.projects.ContactItemViewModel[] = [];
            let currentKey: ap.viewmodels.projects.ContactItemViewModel;
            let currentDict: Dictionary<ap.viewmodels.projects.ContactItemViewModel, ap.viewmodels.projects.ContactItemViewModel[]>;

            if (property === "Company") {
                currentDict = this._dicContactsCompaniesViewModel;
            } else if (property === "Role") {
                currentDict = this._dicContactsPositionsViewModel;
            }

            keys = currentDict.keys();
            keys.forEach((key: ap.viewmodels.projects.ContactItemViewModel) => {
                if (key.displayText === item.contactDetails[property]) {
                    currentKey = key;
                }
            });
            if (currentKey) {
                values = currentDict.getValue(currentKey);
                values.forEach((value: ap.viewmodels.projects.ContactItemViewModel) => {
                    if (value.isChecked) {
                        checkedItems++;
                    }
                });

                if (checkedItems === values.length) {
                    currentKey.isIndeterminate = false;
                    currentKey.isChecked = true;
                } else if (checkedItems === 0) {
                    currentKey.isIndeterminate = false;
                    currentKey.isChecked = false;
                } else {
                    currentKey.isIndeterminate = true;
                    currentKey.isChecked = false;
                }
            }
        }

        public uncheckAll() {
            let checkedContacts = <ap.viewmodels.projects.ContactItemViewModel[]>this._contactSelectorViewModel.selectedValues.splice(0);
            checkedContacts.forEach((item) => {
                item.isChecked = false;
                this._contactSelectorViewModel.toggleCheckedItem(item);
                this.checkHandler(item);
            });
        }

        public search() {
            let searchText = this._contactSelectorViewModel.searchText;
            if (!StringHelper.isNullOrEmpty(searchText)) {
                this._contactSelectorViewModel.search(searchText);
            } else {
                this._contactSelectorViewModel.load();
            }
        }

        constructor($utility: utility.UtilityHelper, _api: ap.services.apiHelper.Api, $q: angular.IQService, controllersManager: controllers.ControllersManager, private $timeout: angular.ITimeoutService, isExtendedFilter: boolean = false) {
            super($utility, _api, $q, controllersManager, undefined, undefined, isExtendedFilter, true);
            this._filterListType = ap.misc.AdvancedFilterListType.ChipsSelector;
            this._dicContactsCompaniesViewModel = new Dictionary<ap.viewmodels.projects.ContactItemViewModel, ap.viewmodels.projects.ContactItemViewModel[]>();
            this._dicContactsPositionsViewModel = new Dictionary<ap.viewmodels.projects.ContactItemViewModel, ap.viewmodels.projects.ContactItemViewModel[]>();
        }

        private _contactSelectorViewModel: ap.viewmodels.projects.ContactSelectorViewModel;
        private _contactsCompaniesListViewModel: ap.viewmodels.projects.ContactItemViewModel[] = [];
        private _contactsPositionsListViewModel: ap.viewmodels.projects.ContactItemViewModel[] = [];
        private _dicContactsCompaniesViewModel: Dictionary<ap.viewmodels.projects.ContactItemViewModel, ap.viewmodels.projects.ContactItemViewModel[]>;
        private _dicContactsPositionsViewModel: Dictionary<ap.viewmodels.projects.ContactItemViewModel, ap.viewmodels.projects.ContactItemViewModel[]>;
    }
}