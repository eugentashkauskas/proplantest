module ap.viewmodels.projectcontacts {

    export class UserCategoryLinksListViewModel extends GenericPagedListViewModels {

        /**
        * Method use to get screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * Use to get the contactHeaderViewModel (contains the list of contacts
        **/
        public get contactHeaderViewModel(): ContactHeaderViewModel {
            return this._contactHeaderViewModel;
        }

        /**
        * To know if it is an issuetype
        **/
        private isIssueType(id: string): boolean {
            if (id.substr(id.length - 1) === "0") { // For cellHierarchy, the ids contains the real id + a char to know the real type of the item (chapter = 0, issueType = 1)
                return false;
            } else if (id.substr(id.length - 1) === "1") {
                return true;
            }
        }

        /**
         * Override getEntityById from GenericPagedListViewModel
         * This function will returns the entity corresponding to a specific Id that the list contains
         * @param id this is the searched id
         **/
        public getEntityById(id: string): IEntityViewModel {
            if (!id || !this.sourceItems)
                return null;

            for (let i: number = 0; i < this.sourceItems.length; ++i) {
                if (!!this.sourceItems[i] && !!this.sourceItems[i].originalEntity && (<ap.models.projects.ChapterHierarchy>this.sourceItems[i].originalEntity).EntityId === id)
                    return this.sourceItems[i];
            }

            return null;
        }

        /**
         * Handler method called when a new page of contacts is loaded
         */
        private contactsPageChangedHandler() {
            if (!this.isIdsLoaded || !this.contactHeaderViewModel.isIdsLoaded) {
                return;
            }

            this.initContactLinks(<ap.viewmodels.projects.ChapterHierarchyLinksItemViewModel[]>this.sourceItems);

            this.loadLinks();
        }

        /**
        * Method use to init the dictionnary which containts for each category (id  = key)
        * an array of ten CategoryLinkItemViewModel
        **/
        private categoriesPageLoadedHandler(loadedItems: ap.viewmodels.projects.ChapterHierarchyLinksItemViewModel[]) {
            if (!loadedItems) {
                return;
            }

            this.initContactLinks(loadedItems);

            let pageIndex = this.getPageIndex(loadedItems[0].originalEntity.Id);
            this.loadLinks(pageIndex);
        }

        /**
         * Checks that all contact-category links are correctly initialized. If some links are missing it'll
         * create and initialize them.
         *
         * This method initializes links only for a given subset of categories and only if it is possible.
         * So, it should be called each time a current list of categories or contacts is changed to ensure
         * that all visible links are initialized.
         *
         * @param categories a list of categories to initialize contact links for
         */
        private initContactLinks(categories: ap.viewmodels.projects.ChapterHierarchyLinksItemViewModel[]) {
            for (let i = 0, ilen = categories.length; i < ilen; i++) {
                if (!categories[i]) {
                    continue;
                }

                this.createContactLinks(categories[i]);
                this.fillCurrentContactLinks(categories[i]);

                if (this.contactHeaderViewModel.isIdsLoaded) {
                    // It is needed to wait untill contacts are loaded. Otherwice a list of current
                    // contact links will be empty
                    categories[i].currentLinksPage = this.contactHeaderViewModel.currentPageNumber;
                }
            }
        }

        /**
         * Creates missing category-contact links and initializes them with empty links
         * @param category a category to fix links for
         */
        private createContactLinks(category: ap.viewmodels.projects.ChapterHierarchyLinksItemViewModel) {
            if (!category) {
                return;
            }

            let contactsAmount = category.categoryLinksViewModel.length;
            let targetContactsAmount = this.contactHeaderViewModel.count;
            for (let contactIndex = contactsAmount; contactIndex < targetContactsAmount; contactIndex++) {
                let contactLinkVm = this.createEmptyLink(contactIndex, category.index, category);
                category.categoryLinksViewModel.push(contactLinkVm);
            }
        }

        /**
         * Creates an empty category-contact link object
         * @param colIndex a columns index of the link (contact index in the contacts list)
         * @param rowIndex a row index of the link (category index in the categories list)
         * @param category a target category the link has to be built for
         */
        private createEmptyLink(colIndex: number, rowIndex: number, category: ap.viewmodels.projects.ChapterHierarchyLinksItemViewModel): CategoryLinkItemViewModel {
            let contactLinkVm = new CategoryLinkItemViewModel(this.$utility, this.$q, this._controllersManager.mainController);
            contactLinkVm.colIndex = colIndex;
            contactLinkVm.rowIndex = rowIndex;

            let categoryModel = <ap.models.projects.ChapterHierarchy>category.originalEntity;
            contactLinkVm.isChapter = !this.isIssueType(categoryModel.Id);
            if (!contactLinkVm.isChapter) {
                let issueType = new ap.models.projects.IssueType(this.$utility);
                issueType.createByJson({ Id: categoryModel.EntityId });
                contactLinkVm.issueType = issueType;
            }

            return contactLinkVm;
        }

        /**
         * Sets contacts information for category-contact links of the given category for the
         * currently displayed subset of contacts
         * @param category a category to initialize
         */
        private fillCurrentContactLinks(category: ap.viewmodels.projects.ChapterHierarchyLinksItemViewModel) {
            if (!this.contactHeaderViewModel.currentContactList) {
                return;
            }

            for (let contact of this.contactHeaderViewModel.currentContactList) {
                if (!contact) {
                    continue;
                }

                let contactLink = category.categoryLinksViewModel[contact.index];
                if (contactLink && !contactLink.contact) {
                    contactLink.contact = <ap.models.projects.ContactDetails>contact.originalEntity;
                }
            }
        }

        /**
         * Method use to init the different CategoryLinkItemViewModels if there is a link between a contact and a category
         */
        private loadLinks(pageIndex?: number) {
            if (!this.isIdsLoaded || !this.contactHeaderViewModel.isIdsLoaded || !this.contactHeaderViewModel.currentContactList) {
                return;
            }

            let contactIds = this.contactHeaderViewModel.currentContactList.map((contact: ContactHeaderItemViewModel) => {
                return contact.originalEntity.Id;
            });

            // Need to remove the last char of the id before calling projectservice
            let issueTypeIds: string[] = [];
            if (pageIndex) {
                // get the loaded folders ids
                let startIndex = pageIndex * this.options.pageSize;
                let endIndex = Math.min(this.count, startIndex + this.options.pageSize);
                issueTypeIds = this.ids.slice(startIndex, endIndex);
            } else {
                issueTypeIds = this.getLoadedItemsIds();
            }
            issueTypeIds = issueTypeIds.map((id: string) => { return id.substr(0, id.length - 1); });

            if (!contactIds.length || !issueTypeIds.length) {
                return;
            }

            this.changeIsLoading(true);
            this._servicesManager.projectService.getCategoryContactLinks(contactIds, issueTypeIds).then((result) => {
                for (let j = 0; j < result.length; j++) {
                    let currentItem: projects.ChapterHierarchyLinksItemViewModel = (<ap.viewmodels.projects.ChapterHierarchyLinksItemViewModel>this.getEntityById(result[j].IssueTypeId));
                    if (currentItem) {
                        let contactsLinks: CategoryLinkItemViewModel[] = currentItem.currentCategoryLinks;
                        for (let k = 0; k < contactsLinks.length; k++) {

                            // set the current visibility if its the same folder and user
                            if (contactsLinks[k].contact && contactsLinks[k].contact.Id === result[j].ContactId && contactsLinks[k].issueType && contactsLinks[k].issueType.Id === result[j].IssueTypeId) {
                                contactsLinks[k].contactIssueType = result[j];
                            }
                        }
                    }
                }
            }).finally(() => {
                this.changeIsLoading(false);
            });
        }

        /**
         * Removes access information from the category-contact links
         */
        private clearLinks() {
            if (!this.sourceItems) {
                return;
            }

            this.sourceItems.forEach((item) => {
                if (item) {
                    (<projects.ChapterHierarchyLinksItemViewModel>item).clearContactIssueType();
                }
            });
        }

        /**
        * Method use to manage actions
        **/
        private actionClickedHandler(action: string) {
            switch (action) {
                case "projectmanage.edit":
                    this._editMode();
                    break;
                case "projectmanage.save":
                    let currentProject: ap.models.projects.Project = this._controllersManager.mainController.currentProject();
                    this._servicesManager.toolService.sendEvent("cli-action-save project participants project category links",
                        new Dictionary([
                            new KeyValue("cli-action-save project participants project category links-screenname", "projects"),
                            new KeyValue("cli-action-save project participants project category links-project name", currentProject.Name),
                            new KeyValue("cli-action-save project participants project category links-project id", currentProject.Id)
                        ])
                    );

                    this.save();
                    break;
                case "projectmanage.cancel":
                    this._cancel();
                    break;
            }
        }

        /**
        * This method use for go to edit mode
        **/
        private _editMode() {
            this._screenInfo.isEditMode = true;
            this.checkEditAccess();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * Reset the changes and go back to read mode
        **/
        private _cancel() {
            this.getLoadedItems().forEach((item: projects.ChapterHierarchyLinksItemViewModel) => {
                item.copySource();
            });
            this._gotoReadMode();
        }

        /**
         * This will leave the edit mode.
         */
        private _gotoReadMode() {
            this._screenInfo.isEditMode = false;
            this.checkEditAccess();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * Private method used to know if the user can edit folders visiblities
        **/
        private checkEditAccess() {
            const currentProject = this._controllersManager.mainController.currentProject();
            if (currentProject.UserAccessRight.CanEditContact || currentProject.UserAccessRight.CanEditAllContact || this._addedInvitedContactByUser > 0) {
                this._editAction.isVisible = !this._screenInfo.isEditMode;
            } else {
                this._editAction.isVisible = false;
            }
            this._saveAction.isVisible = this._screenInfo.isEditMode;
            this._saveAction.isEnabled = this._screenInfo.isEditMode;

            this._cancelAction.isVisible = this._screenInfo.isEditMode;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode;
        }

        /**
         * This method is used to initialize the screen category link screen
         */
        public initScreen() {
            this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.edit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit", true);
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.save", this.$utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.cancel", this.$utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel", false);

            let actions = [this._editAction, this._saveAction, this._cancelAction];

            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "projectmanage.categories", ap.misc.ScreenInfoType.List, actions, null, null, null, null, false);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);

            this._controllersManager.projectController.getContactAddedInvitedByUser(true).then((resp: number) => {
                this._addedInvitedContactByUser = resp;
                this.checkEditAccess();
            });
        }

        /**
         * Creates strings containing the changed data and calls the API
         */
        public save() {
            // init some values first
            let totalIssueTypeCount = this.sourceItems.length;
            let issueTypeCount = this.ids.filter((id: string) => { return this.isIssueType(id); }).length;
            let issueTypeLoadedCount = 0;
            let dirtyUsersCount = this.contactHeaderViewModel.count;
            let dirtyIssueTypesCount = 0;
            let contactCount = this.contactHeaderViewModel.sourceItems.length;

            let currentIssueType: projects.ChapterHierarchyLinksItemViewModel = null;
            let i: number;
            let j: number;

            // build the complete matrix
            let completematrix: string[][] = [];
            completematrix[0] = [""];

            // build the columns with contacts names
            for (i = 0; i < contactCount; i++) {
                completematrix[0].push(this.contactHeaderViewModel.ids[i]);
            }

            // build the row
            let rowIndx: number = 1; // first one  = empty
            for (i = 0; i < totalIssueTypeCount; i++) {
                currentIssueType = <projects.ChapterHierarchyLinksItemViewModel>this.sourceItems[i];
                if (currentIssueType && this.isIssueType(currentIssueType.originalEntity.Id)) { // do not add the chapter -> only issueType
                    completematrix[rowIndx] = [this.ids[i]];
                    issueTypeLoadedCount++;
                    // fill each cell with 1 = access; 0 = no access; 2 not changed
                    for (j = 0; j < contactCount; j++) {
                        currentIssueType.categoryLinksViewModel[j].checkHasChanged();
                        if (currentIssueType.categoryLinksViewModel[j].hasChanged) {
                            if (currentIssueType.categoryLinksViewModel[j].hasAccess) {
                                completematrix[rowIndx].push("1");
                            } else {
                                completematrix[rowIndx].push("0");
                            }
                        } else {
                            completematrix[rowIndx].push("2");
                        }
                    }

                    rowIndx++;
                }
            }
            dirtyIssueTypesCount = issueTypeLoadedCount; // only the issueType can be linked (not the chapters)
            // remove not changed columns
            let needToRemoveCol: boolean = true;
            i = 1; // 0;0 = empty cell
            while (i <= dirtyUsersCount) {

                needToRemoveCol = true;

                for (j = 1; j <= issueTypeLoadedCount; j++) {
                    if (completematrix[j][i] !== "2") {
                        needToRemoveCol = false;
                        break; // go to the next contact
                    }
                }

                if (needToRemoveCol) {
                    for (let k: number = 0; k <= issueTypeLoadedCount; k++) {
                        completematrix[k].splice(i, 1);
                    }
                    dirtyUsersCount--;
                } else {
                    i++;
                }
            }

            // remove not changed rows
            let needToRemoveRow: boolean = true;
            i = 1;
            while (i <= dirtyIssueTypesCount) {
                needToRemoveRow = true;

                for (j = 1; j <= dirtyUsersCount; j++) {
                    if (completematrix[i][j] !== "2") {
                        needToRemoveRow = false;
                        break;
                    }
                }

                if (needToRemoveRow) {
                    completematrix.splice(i, 1);
                    dirtyIssueTypesCount--;
                } else {
                    i++;
                }
            }

            let totalChanges: number = dirtyUsersCount * dirtyIssueTypesCount;
            let blockCount: number = Math.ceil(totalChanges / 500);
            let nbrCategoriesPerBlock: number = Math.floor(dirtyIssueTypesCount / blockCount);

            // build the string(s) containing the changes
            let changedData: string[] = [];

            let changedUsersString: string = completematrix[0].join(",");
            if (changedUsersString.length > 1) {
                changedUsersString = changedUsersString.substring(1, changedUsersString.length);

                i = 1; // currentIssueType index
                j = 1; // current cell for the issueType
                let n: number = 0; // current number of changes in the string
                let block: string = changedUsersString;

                while (i <= dirtyIssueTypesCount) {

                    block += "/" + completematrix[i][0].substring(0, completematrix[i][0].length - 1) + ","; // add the issue type to the block
                    while (n < 500 && j <= dirtyUsersCount) {
                        block += completematrix[i][j];
                        n++;
                        j++;
                    }

                    if (n === 500) {
                        changedData.push(block);
                        n = 0; // new block -> reset the value
                        block = changedUsersString; // new block -> reset the block value
                    } else {
                        j = 1; // reset the cell value
                        i++; // all the cell of the row have been process -> go to the next row
                    }
                }
                if (i >= dirtyIssueTypesCount) {
                    changedData.push(block); // push the last (or only) block to the changedData
                }

                this._controllersManager.projectController.updateContactIssueTypeLinks(changedData).then(() => {
                    this.clearLinks();
                    this.loadLinks();
                    this._gotoReadMode();
                });
            } else {
                this._gotoReadMode();
            }
        }

        protected _onPageLoaded(pageDesc: PageDescription, itemList: projects.ChapterHierarchyLinksItemViewModel[]): void {
            super._onPageLoaded(pageDesc, itemList);
            this.categoriesPageLoadedHandler(itemList);
        }

        public dispose() {
            super.dispose();
            this._contactHeaderViewModel.dispose();
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private _servicesManager: ap.services.ServicesManager, private _selectedContactsIds?: string[]) {
            super($utility, _controllersManager.listController, $q, new GenericPagedListOptions("ChapterHierarchy", projects.ChapterHierarchyLinksItemViewModel, null, null, 50, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true));
            this.isDeferredLoadingMode = true;
            this.addCustomParam("projectid", _controllersManager.mainController.currentProject().Id);
            this.addCustomParam("baseentityname", "IssueType");

            this._listener.addEventsName(["editmodechanged"]);

            this._contactHeaderViewModel = new ContactHeaderViewModel($utility, $q, _controllersManager, false, _selectedContactsIds);
            this._contactHeaderViewModel.on("pageChanged", this.contactsPageChangedHandler, this);

            this.initScreen();
        }

        private _contactHeaderViewModel: ContactHeaderViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: home.ActionViewModel;
        private _saveAction: home.ActionViewModel;
        private _cancelAction: home.ActionViewModel;
        private _addedInvitedContactByUser: number;
    }
}