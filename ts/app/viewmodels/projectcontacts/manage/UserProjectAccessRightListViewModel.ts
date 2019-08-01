module ap.viewmodels.projectcontacts {

    import ContactDetails = ap.models.projects.ContactDetails;

    /**
    * This class is the parameter needed to create an item ProjectAccessRight
    **/
    export class UserProjectAccessRightItemParameter extends ItemConstructorParameter {
        public get controllersManager(): ap.controllers.ControllersManager {
            return this._controllersManager;
        }

        constructor(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager) {
            super(itemIndex, dataSource, pageDesc, parameters, utility);
        }
    }

    /**
     * This class is used to create the parameter needed for each item.
     **/
    export class UserProjectAccessRightItemParameterBuilder implements ItemParameterBuilder {
        createItemParameter(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper): ItemConstructorParameter {
            return new UserProjectAccessRightItemParameter(itemIndex, dataSource, pageDesc, parameters, utility, this.controllersManager);
        }

        constructor(private controllersManager: ap.controllers.ControllersManager) { }
    }

    export class UserProjectAccessRightListViewModel extends GenericPagedListViewModels {

        /**
        * This public getter is used to get hasNextViewPage property
        **/
        public get hasNextViewPage(): boolean {
            return this._hasNextViewPage;
        }

        /**
        * This public getter is used to get hasPreviousViewPage property
        **/
        public get hasPreviousViewPage(): boolean {
            return this._hasPreviousViewPage;
        }

        /**
        * Return header access item containing contacts' names
        **/
        public get headerAccessItem() {
            return this._headerAccessItem;
        }

        /**
        * Method use to get the screenInfo
        */
        public get screenInfo() {
            return this._screenInfo;
        }

        /**
         * Load next view page
         */
        public loadNextViewPage() {
            this._viewPageNum++;
            this.updateContactList();
        }

        /**
         * Load previous view page
         */
        public loadPreviousViewPage() {
            this._viewPageNum--;
            this.updateContactList();
        }

        /**
         * This method is used to specify list's ids before it is loaded
         * @param ids
         */
        public specifyIds(ids: string[]) {
            if (!this._accessRights) {
                this._controllersManager.accessRightController.geAccessRights("Project").then((accessRights: ap.models.accessRights.ProjectAccessRight[]) => {
                    this._accessRights = accessRights;
                    super.setIds(ids);
                    this.loadPage(0);
                });
            } else {
                super.setIds(ids);
                this.loadPage(0);
            }
        }

        loadIds(filter?: string, param: any = null): angular.IPromise<ap.services.apiHelper.ApiResponse> {
            // Create custom param for ids API request
            if (!this._accessRights) {
                return this._controllersManager.accessRightController.geAccessRights("Project", true).then((accessRights: ap.models.accessRights.ProjectAccessRight[]) => {
                    this._accessRights = accessRights;
                    return super.loadIds(filter, new GetContactDetailsParams(null, this._controllersManager.mainController.currentProject().Id, null, null, "All"));
                });
            }
            return super.loadIds(filter, new GetContactDetailsParams(null, this._controllersManager.mainController.currentProject().Id, null, null, "All"));
        }

        loadPage(index: number, filter?: string, needToRefresh: boolean = false): angular.IPromise<services.apiHelper.ApiResponse> {
            // Override this method to add custom param with the ids of the loaded entities before loading entities
            this._hasRefresh = needToRefresh;
            for (let i = 1; i < this._pages.length; i++) {
                this._pages[i].isLoaded = false;
            }
            if (!this._isIdsLoaded && this._selectedContactsIds === null) {
                return this.loadIds(filter).then(() => {
                    this.addEntitiesRequestCustomParam(index);
                    return super.loadPage(index, filter);
                });
            } else {
                this.addEntitiesRequestCustomParam(index);
                return super.loadPage(index, filter);
            }
        }

        loadPageSuccessHandler(args: ap.services.apiHelper.ApiResponse, pageDesc: PageDescription,
            index: number, utility: ap.utility.UtilityHelper, q: angular.IQService,
            createItemVmHandler?: new (utility: ap.utility.UtilityHelper, q: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) => IEntityViewModel,
            pageLoadedParameters?: LoadPageSuccessHandlerParameter): ap.viewmodels.IEntityViewModel[] {
            // Override method, used co create source items from loaded entities, or update source items on the next loading
            let items = args.data;
            let arrayItem: ap.viewmodels.IEntityViewModel[] = new Array<ap.viewmodels.IEntityViewModel>();
            if (this._viewPageNum && !this._hasRefresh) {
                // Update existing items with loaded contact details
             //   if (!pageDesc.isLoaded) {
                    this._headerAccessItem.onLoadItems(index, items);
                    this.sourceItems.forEach((item: ap.viewmodels.IEntityViewModel) => {
                        (<ProjectAccessRightUserItemViewModel>item).onLoadItems(index, items, this._accessRights);
                    });
              //  }
                this._viewPageNum = index * (this.options.pageSize / 10);
            } else {
                this.sourceItems.splice(0);
                // Create new items
                this._headerAccessItem = this.initAccessRightItemVm("", null, ValueType.Header, items);
                arrayItem.push(this.initAccessRightItemVm("UserAccess", "User Access", ValueType.Selector, items));
                arrayItem.push(this.initAccessRightItemVm("Project", "Project", ValueType.Empty, items));
                arrayItem.push(this.initAccessRightItemVm("CanEdit", "Edit", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanConfig", "Configuration", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanAddMeeting", "Add list", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("Participant", "Participant", ValueType.Empty, items));
                arrayItem.push(this.initAccessRightItemVm("CanEditContact", "Edit", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanRemoveContact", "Delete", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("Folder", "Folder", ValueType.Empty, items));
                arrayItem.push(this.initAccessRightItemVm("CanAddFolder", "Add", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanEditFolder", "Edit", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanDeleteFolder", "Delete", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("Document", "Document", ValueType.Empty, items));
                arrayItem.push(this.initAccessRightItemVm("CanUploadDoc", "Upload", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanDownloadDoc", "Download", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanEditDoc", "Edit", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanArchiveDoc", "Archive", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanDeleteDoc", "Delete", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanAddVersion", "Add version", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("CanDeleteVersion", "Delete version", ValueType.Simple, items));
                arrayItem.push(this.initAccessRightItemVm("", "All", ValueType.Simple, items));
                this._viewPageNum = 0;
                this._hasRefresh = false;
            }
            this.checkHasPreviousNextViewPage();
            return arrayItem;
        }

        /**
         * This method is used to check hasNextViewPage and hasPreviousViewPage property
         */
        private checkHasPreviousNextViewPage(): void {
            this._hasNextViewPage = this._isIdsLoaded ? this.ids.length > (this._viewPageNum + 1) * 10 : false;
            this._hasPreviousViewPage = this._isIdsLoaded ? this._viewPageNum > 0 : false;
        }

        private updateList(info: ProjectContactInfoViewModel) {
            for (let i = 0; i < this.sourceItems.length; i++) {
                (<ProjectAccessRightUserItemViewModel>this.sourceItems[i]).updateInfo(info);
            }
        }

        /**
         * Initialize and return new item viewmodel object
         * @param accessName A name of access right
         * @param label A label of an access right, needed to display it as "access right name"
         * @param valueType Value type - simple, selector or empty
         * @param contactDetails An array of loaded entities
         */
        private initAccessRightItemVm(accessName: string, label: string, valueType: ValueType, contactDetails: ap.models.projects.ContactDetails[]) {
            let projectAccessRightUserItemViewModel: ProjectAccessRightUserItemViewModel = new ProjectAccessRightUserItemViewModel(this.$utility, this.$q, undefined, accessName, label, valueType, contactDetails, this._accessRights, new UserProjectAccessRightItemParameter(0, null, null, null, this.$utility, this._controllersManager));
            projectAccessRightUserItemViewModel.on("selectedaccessrightchanged", this.updateList, this);
            return projectAccessRightUserItemViewModel;
        }

        /**
         * Remove custom param "ids" to prevent adding it multiple times when request entities by its ids
         */
        private pageLoadedHandler() {
            this.removeCustomParam("ids");
        }

        /**
        * Method use to manage actions
        **/
        private actionClickedHandler(action: string) {
            switch (action) {
                case "projectAccessRight.edit":
                    this._editMode();
                    break;
                case "projectAccessRight.save":
                    let currentProject: ap.models.projects.Project = this._controllersManager.mainController.currentProject();
                    this.$servicesManager.toolService.sendEvent("cli-action-save project participants project list rights",
                        new Dictionary([
                            new KeyValue("cli-action-save project participants project list rights-screenname", "projects"),
                            new KeyValue("cli-action-save project participants project list rights-project name", currentProject.Name),
                            new KeyValue("cli-action-save project participants project list rights-project id", currentProject.Id)
                        ])
                    );

                    this.save();
                    break;
                case "projectAccessRight.cancel":
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
        * This method use for go to read mode
        **/
        private _cancel() {
            this.goToReadMode();
        }

        /**
         * Make the view go to read mode
         */
        private goToReadMode() {
            this._screenInfo.isEditMode = false;
            this.checkEditAccess();
            this.loadPage(0, null, true);
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
         * This method is used to update current contacts info data, and load it from the API if it is needed
         */
        private updateContactList() {
            let currentListPage = Math.floor(this._viewPageNum / 5);
            if (currentListPage >= this.nbPages)
                throw new Error("Not existing page requested - " + currentListPage);
            if (!this._pages[currentListPage].isLoaded) {
                this.loadPage(currentListPage).then(() => {
                    this._headerAccessItem.initCurrentPageInfoList(this._viewPageNum, currentListPage);
                    this.sourceItems.forEach((item: ProjectAccessRightUserItemViewModel) => {
                        item.initCurrentPageInfoList(this._viewPageNum, currentListPage);
                    });
                    this.checkHasPreviousNextViewPage();
                });
            } else {
                this._headerAccessItem.initCurrentPageInfoList(this._viewPageNum, currentListPage);
                this.sourceItems.forEach((item: ProjectAccessRightUserItemViewModel) => {
                    item.initCurrentPageInfoList(this._viewPageNum, currentListPage);
                });
                this.checkHasPreviousNextViewPage();
            }
        }

        /**
         * Add request param to the entities request with the entities' ids
         * @param index List page index
         */
        private addEntitiesRequestCustomParam(index: number) {
            let pageItemsStartIndex = index * this.options.pageSize;
            let pageItemsEndIndex = pageItemsStartIndex + this.options.pageSize;
            if (pageItemsEndIndex >= this.ids.length)
                pageItemsEndIndex = this.ids.length;
            // Got start and end items' indexes for the view
            this.addCustomParam("ids", this.ids.slice(pageItemsStartIndex, pageItemsEndIndex).join(","));
        }

        /**
       * Private method used to know if the user can edit projectAccessRight
       **/
        private checkEditAccess() {
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_VisibilityManagement)) {
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
         * Save the changes
         */
        private save() {
            this._controllersManager.contactController.updateContactDetails(this.postChanges()).then(() => {
                // go back to read mode
                this.goToReadMode();
                this._listener.raise("saveexecuted");
            });
        }

        private postChanges(): ContactDetails[] {
            let dirtyItems: ContactDetails[] = [];

            let pagesCount: number = Math.ceil(this.ids.length / 50);
            for (let i: number = 0; i < pagesCount; i++) {
                let contactsPage = (<ProjectAccessRightUserItemViewModel>this.sourceItems[0]).getContactsData(i);
                if (contactsPage) {
                    // this page may not be loaded from the server yet
                    contactsPage.values().forEach((item: ProjectContactInfoViewModel) => {
                        // get the edited contactdetails
                        if (item.hasChanged) {
                            item.postChanges();
                            dirtyItems.push(item.contact);
                        }
                    });
                }
            }

            return dirtyItems;
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, private $mdDialog: angular.material.IDialogService, private _controllersManager: ap.controllers.ControllersManager,
            private $servicesManager: ap.services.ServicesManager, private _selectedContactsIds?: string[]) {
            super($utility, _controllersManager.listController, $q, new ap.viewmodels.GenericPagedListOptions("ContactDetails", ProjectAccessRightUserItemViewModel,
                "User", null, 50, false, false, "contactdetailsidsonproject",
                true, new UserProjectAccessRightItemParameterBuilder(_controllersManager), null, null, null, services.apiHelper.MethodType.Post, true));
            this.on("pageloaded", this.pageLoadedHandler, this);
            this._editAction = new ap.viewmodels.home.ActionViewModel($utility, $utility.EventTool, "projectAccessRight.edit", $utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit", true);
            this._saveAction = new ap.viewmodels.home.ActionViewModel($utility, $utility.EventTool, "projectAccessRight.save", $utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel($utility, $utility.EventTool, "projectAccessRight.cancel", $utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel", false);

            if (this._selectedContactsIds === undefined || this._selectedContactsIds === null) {
                this._selectedContactsIds = null;
            }

            let actions = [this._editAction, this._saveAction, this._cancelAction];
            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "projectAccessRight.list", ap.misc.ScreenInfoType.List, actions, null, null, null, false);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);

            this.checkEditAccess();

            this._controllersManager.projectController.getContactAddedInvitedByUser(true).then((num: number) => {
                this._addedInvitedContactByUser = num;
                if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_ProjectAccessRight) && (this._controllersManager.mainController.currentProject().UserAccessRight.Level === ap.models.accessRights.AccessRightLevel.Admin || this._addedInvitedContactByUser > 0)) {
                    this.screenInfo.actions[0].isEnabled = true;
                }
            });
            this._listener.addEventsName(["editmodechanged", "saveexecuted"]);
        }

        private _editAction: ap.viewmodels.home.ActionViewModel;
        private _saveAction: ap.viewmodels.home.ActionViewModel;
        private _cancelAction: ap.viewmodels.home.ActionViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _itemsCreated: boolean = false;
        private _viewPageNum: number;
        private _headerAccessItem: ProjectAccessRightUserItemViewModel;
        private _accessRights: ap.models.accessRights.AccessRight[];
        private _addedInvitedContactByUser: number;
        private _listOfAccess: KeyValue<String, boolean>[][] = [[], [], [], [], []];
        private _hasNextViewPage: boolean = false;
        private _hasPreviousViewPage: boolean = false;
        private _hasRefresh: boolean = true;
    }
}