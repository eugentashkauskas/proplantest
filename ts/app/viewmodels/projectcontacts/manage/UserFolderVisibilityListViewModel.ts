module ap.viewmodels.projectcontacts {

    /**
     * UserFolderVisibilityListViewModel is the class managing the load of links between users and folders to know which user has access to which folder.
     */
    export class UserFolderVisibilityListViewModel implements IDispose, utility.IListener {

        public listVm: ap.viewmodels.folders.FoldersPagedListViewModel = null;

        /**
        * Method use to get screenInfo
        **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * Property to get the contacts list
        **/
        public get contactHeaderViewModel(): ContactHeaderViewModel {
            return this._contactHeaderViewModel;
        }

        /**
         * This method is used to initialize the screen folder visibility screen
         */
        public initScreen() {
            this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.edit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit folders visiblity", true);
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.save", this.$utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectmanage.cancel", this.$utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel", false);

            let actions = [this._editAction, this._saveAction, this._cancelAction];

            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "projectmanage.folders", ap.misc.ScreenInfoType.List, actions, null, null, null, null, false);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            this.checkEditAccess();
        }

        /*
        * Dispose the  object
        */
        public dispose() {
            if (this.listVm) {
                this.listVm.dispose();
            }
            if (this.contactHeaderViewModel) {
                this.contactHeaderViewModel.dispose();
            }
            this._screenInfo.off("actionclicked", this.actionClickedHandler, this);
        }

        /**
        * postChanges method
        **/
        public postChanges() {
            let foldersChangedVm = this.listVm.getChangedVisibilityFolders(true);
            let folderVisibilities: FolderVisibilityViewModel[] = [];
            let changedContacts: ap.models.projects.ContactDetails[] = [];
            foldersChangedVm.forEach((item) => { // get changed folder visibilities
                folderVisibilities.push(...item.getChangedFolderVisibilities());
            });
            folderVisibilities.forEach((item) => { // get changed contacts
                if (changedContacts.indexOf(item.contact) === -1) {
                    changedContacts.push(item.contact);
                }
            });
            let changesFolderVisibilities = {};
            folderVisibilities.forEach((item) => {
                if (!changesFolderVisibilities[item.contact.Id]) {
                    changesFolderVisibilities[item.contact.Id] = {};
                }
                if (!changesFolderVisibilities[item.contact.Id][item.folder.Id]) {
                    changesFolderVisibilities[item.contact.Id][item.folder.Id] = item;
                }
            });
            let changedFoldersCount: number = foldersChangedVm.length; // count changed folders
            let changedUsersCount: number = changedContacts.length; // count changed users
            let totalChanges = changedFoldersCount * changedUsersCount; // count total changed
            let blockCount = Math.round(totalChanges / 500 + 1); // count blocks (each blocks has max 500 changes)
            let nbrFolderPerBlock = Math.round(changedFoldersCount / blockCount); // count folders in blocks
            let arrayChanges = [];
            let stringUsers = changedContacts.map(item => item.User.Id).join(",");
            for (let b = 0; b < blockCount; b++) { // blocks 
                let arrayFoldersLength = changedFoldersCount - b * nbrFolderPerBlock < nbrFolderPerBlock ? changedFoldersCount - b * nbrFolderPerBlock : nbrFolderPerBlock;
                let stringFolders: string = "";
                for (let r = b * nbrFolderPerBlock; r < arrayFoldersLength + nbrFolderPerBlock * b; r++) { // folders
                    let folder = foldersChangedVm[r];
                    stringFolders += "/" + folder.originalFolder.Id + ",";
                    for (let c = 0; c < changedContacts.length; c++) { // contacts
                        let contact = changedContacts[c];
                        if (!changesFolderVisibilities[contact.Id][folder.originalFolder.Id]) {
                            stringFolders += 2; // if folder for contact (changedContacts[c]) is not changed
                        } else if (changesFolderVisibilities[contact.Id][folder.originalFolder.Id]) {
                            let folderVisibl = <FolderVisibilityViewModel>changesFolderVisibilities[contact.Id][folder.originalFolder.Id];
                            stringFolders += folderVisibl.hasAccess && !folderVisibl.folderVisibility ? 1 : 0; // if access folder for contact (changedContacts[c]) is changed: 1 - has access, 0 - hasn`t access
                        }
                    }
                }
                arrayChanges.push(stringUsers + stringFolders);
            }
            return arrayChanges;
        }

        /**
        * Handler method called when a list of folders is loaded
        * What it does:
        *   - Create a list (length = lenght of contacts) of FolderVisibilityViewModel per folder
        *       - Assign the list to each folder
        *   - Assign a contact to each FolderVisibilityViewModel (for each folder)
        *   - Call the method to get the FolderVisibility entities
        * @param loadedFolders FolderItemViewModel[] The loaded folders
        **/
        private initFoldersVisibility(loadedFolders: ap.viewmodels.folders.FolderItemViewModel[]) {
            if (!loadedFolders)
                return;

            // get the page number
            let pageIndex: number = this.listVm.getPageIndex(loadedFolders[0].originalEntity.Id);
            let rowStartIndex: number = pageIndex * this.listVm.options.pageSize;
            for (let i: number = 0; i < loadedFolders.length; i++) {

                // create the visibilityViewModel list for each folder
                for (let j = 0; j < this.contactHeaderViewModel.count; j++) { // already create Vm for all columns
                    let folderVisibilityVm: FolderVisibilityViewModel = new FolderVisibilityViewModel(this.$utility, this.$q, undefined, this._controllersManager.mainController.currentProject());
                    folderVisibilityVm.colIndex = j;
                    folderVisibilityVm.rowIndex = rowStartIndex;
                    folderVisibilityVm.folder = loadedFolders[i].originalFolder;
                    folderVisibilityVm.on("propertychanged", this.visibilityPropChangedHandler, this);
                    loadedFolders[i].foldersVisibilityViewModel.push(folderVisibilityVm);
                }
                rowStartIndex++;

                // After all the visibilityViewModel are created for for a folder, assign the contacts to each visibilityViewModel
                let currentPage: number = this.contactHeaderViewModel.currentPageNumber;
                let startIndex: number = currentPage * this.contactHeaderViewModel.pageSize;
                let endIndex: number = startIndex + this.contactHeaderViewModel.pageSize < this.contactHeaderViewModel.count ? startIndex + this.contactHeaderViewModel.pageSize : this.contactHeaderViewModel.count;
                let foldersVisibility: ap.viewmodels.projectcontacts.FolderVisibilityViewModel[] = loadedFolders[i].foldersVisibilityViewModel.slice(startIndex, endIndex);

                // todo -> improve to get all the loaded contacts
                this.setContactsToFoldersVisibility(foldersVisibility, this.contactHeaderViewModel.currentContactList);
                loadedFolders[i].currentVisibilityPage = currentPage;
            }
            this.loadFoldersVisibility(pageIndex);
        }

        /**
        * Loads the list of FolderVisibility entity and assign them to the corresponding FolderVisibilityViewModel
        * A FolderVisibility is the link between:
        *   - a user
        *   - a folder (isPublic = false)
        * @param pageIndex To know which page of folders is loaded
        * @param pageIndex number To know which page of folders was just loaded
        **/
        private loadFoldersVisibility(pageIndex?: number, refresh: boolean = false) {
            if (this.listVm.isIdsLoaded === true && this.contactHeaderViewModel.isIdsLoaded === true && this.contactHeaderViewModel.currentContactList) {
                // first get the current contacts lists
                let contactIdsList: string[] = [];
                for (let i = 0; i < this.contactHeaderViewModel.currentContactList.length; i++) {
                    contactIdsList.push((<ap.models.projects.ContactDetails>this.contactHeaderViewModel.currentContactList[i].originalEntity).User.Id);
                }

                // then get the list of loaded folders
                let ids: string[] = [];
                if (pageIndex) {
                    // get the loaded folders ids
                    let startIndex: number = pageIndex * this.listVm.options.pageSize;
                    let endIndex: number = this.listVm.count < startIndex + 50 ? this.listVm.count : startIndex + 50;
                    ids = this.listVm.ids.slice(startIndex, endIndex);
                } else {
                    // get the ids of the loaded folders
                    ids = this.listVm.getLoadedItemsIds();
                }
                // get the visibilities
                this.$servicesManager.projectService.getFolderUserVisibilities(ids, contactIdsList).then((result: ap.models.projects.FolderVisibility[]) => {
                    for (let i = 0; i < result.length; i++) {
                        let folderVisiblVms: FolderVisibilityViewModel[] = (<ap.viewmodels.folders.FolderItemViewModel>this.listVm.getEntityById(result[i].FolderId)).currentFoldersVisibility;
                        for (let j = 0; j < folderVisiblVms.length; j++) {

                            // set the current visibility if its the same folder and user
                            if (folderVisiblVms[j].contact && folderVisiblVms[j].contact.User.Id === result[i].InvitedUser.Id && folderVisiblVms[j].folder && folderVisiblVms[j].folder.Id === result[i].FolderId) {
                                folderVisiblVms[j].folderVisibility = result[i];
                            }
                        }
                    }
                });
            }
        }

        /**
         * Handler method called when a new page of contacts is loaded
         */
        private contactPageChangedHandler() {
            if (this.listVm.isIdsLoaded && this.contactHeaderViewModel.isIdsLoaded) {
                let currentPage: number = this.contactHeaderViewModel.currentPageNumber;
                let startIndex: number = currentPage * this.contactHeaderViewModel.pageSize;
                let endIndex: number = startIndex + this.contactHeaderViewModel.pageSize < this.contactHeaderViewModel.count ? startIndex + this.contactHeaderViewModel.pageSize : this.contactHeaderViewModel.count;
                let contactsList: ContactHeaderItemViewModel[] = <ContactHeaderItemViewModel[]>this.contactHeaderViewModel.sourceItems.slice(startIndex, endIndex);

                this.listVm.sourceItems.forEach((folderItemVm: ap.viewmodels.folders.FolderItemViewModel) => {
                    if (folderItemVm) {
                        // Set the page of the Vm to force it to update the current visibility list
                        folderItemVm.currentVisibilityPage = currentPage;

                        this.setContactsToFoldersVisibility(folderItemVm.currentFoldersVisibility, contactsList);
                    }
                });
                this.loadFoldersVisibility();
            } else {
                this.listVm.loadNextPage();
            }
        }

        /**
         * Set each contact to each folderVisibility of the folder
         * Because we need to have the user id to load the links, we have to set the contact to each ViewModel.  Then when the links are loaded, we can check which links is corresponding to which ViewModel
         * @param foldersVisibility FolderVisibilityViewModel[] The list od 
         * @param contacts ContactHeaderItemViewModel[] The list of contacts to assign to each FolderVisibilityViewModel
         */
        private setContactsToFoldersVisibility(foldersVisibility: ap.viewmodels.projectcontacts.FolderVisibilityViewModel[], contacts: ContactHeaderItemViewModel[]) {
            let i: number = 0;
            foldersVisibility.forEach((visibilityVm: ap.viewmodels.projectcontacts.FolderVisibilityViewModel) => {
                if (!visibilityVm.contact) {
                    if (contacts[i]) {
                        visibilityVm.contact = <ap.models.projects.ContactDetails>contacts[i].originalEntity;
                    }
                }
                i++; // take the next contact
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
                    this.$servicesManager.toolService.sendEvent("cli-action-save project participants project folder visibility",
                        new Dictionary([
                            new KeyValue("cli-action-save project participants project folder visibility-screenname", "projects"),
                            new KeyValue("cli-action-save project participants project folder visibility-project name", currentProject.Name),
                            new KeyValue("cli-action-save project participants project folder visibility-project id", currentProject.Id)
                        ])
                    );

                    this._save();
                    break;
                case "projectmanage.cancel":
                    this.listVm.getChangedVisibilityFolders().forEach(item => {
                        item.foldersVisibilityViewModel.filter(folderVisibilityVm => {
                            return folderVisibilityVm.hasChanged;
                        }).forEach(changedFolderVisibilityVm => {
                            changedFolderVisibilityVm.setDefaultAccess();
                        });
                    });
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

        private _save() {
            let changes: string[] = this.postChanges();
            let isSomethingToSave: boolean = false;
            for (let i = 0; i < changes.length; i++) {
                if (!StringHelper.isNullOrEmpty(changes[i])) {
                    isSomethingToSave = true;
                    break;
                }
            }
            if (isSomethingToSave) {
                this._controllersManager.projectController.updateContactFoldersVisibility(changes).then(() => {
                    this._cancel();
                    this.listVm.refresh();
                });
            } else {
                this._cancel();
            }
        }

        /**
        * This method use for go to read mode
        **/
        private _cancel() {
            this._screenInfo.isEditMode = false;
            this.checkEditAccess();
            this._listener.raise("editmodechanged", new base.EditModeEvent(this));
        }

        /**
        * Private method used to know if the user can edit folders visiblities
        **/
        private checkEditAccess() {
            if (this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_VisibilityManagement)) {
                this._editAction.isVisible = !this._screenInfo.isEditMode;
            } else {
                this._editAction.isVisible = false;
            }
            this._saveAction.isVisible = this._screenInfo.isEditMode;
            this._saveAction.isEnabled = this._screenInfo.isEditMode && this.listVm.getChangedVisibilityFolders().length > 0;
            this._cancelAction.isVisible = this._screenInfo.isEditMode;
            this._cancelAction.isEnabled = this._screenInfo.isEditMode;
        }

        private visibilityPropChangedHandler(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            let folderVisiblVm = <projectcontacts.FolderVisibilityViewModel>args.caller;
            if (args.propertyName === "hasAccess") {
                let folderVm = <ap.viewmodels.folders.FolderItemViewModel>this.listVm.getEntityById(folderVisiblVm.folder.Id);
                folderVm.isChecked = folderVisiblVm.hasAccess;
                if (folderVm.hasChildren) {
                    this.listVm.sourceItems.forEach((item: folders.FolderItemViewModel) => {
                        if (item.originalFolder.ParentFolderId === folderVisiblVm.folder.Id) {
                            item.setHasAccessFolderVisibility(folderVisiblVm.contact.Id, folderVisiblVm.hasAccess);
                            item.isChecked = folderVisiblVm.hasAccess;
                        }
                    });
                }
                if (!!folderVm.originalFolder.ParentFolderId) {
                    let parentFolderId = folderVm.originalFolder.ParentFolderId;
                    let hasParentFolder = true;
                    let atLeastOneChildChecked: boolean = false;
                    while (hasParentFolder === true) {
                        let parentFolderVm = <ap.viewmodels.folders.FolderItemViewModel>this.listVm.getEntityById(parentFolderId);
                        let checkedChildren = (<ap.viewmodels.folders.FolderItemViewModel[]>this.listVm.sourceItems).filter((item: ap.viewmodels.folders.FolderItemViewModel) => {
                            return item.originalFolder.ParentFolderId === parentFolderId && item.isChecked === true;
                        });
                        if (checkedChildren && checkedChildren.length > 0) {
                            atLeastOneChildChecked = true;
                        }
                        if (folderVisiblVm.hasAccess) {
                            parentFolderVm.currentFoldersVisibility.filter(item => item.contact.Id === folderVisiblVm.contact.Id)[0].setHasAccess(true);
                        }
                        else {
                            if (!atLeastOneChildChecked) {
                                parentFolderVm.currentFoldersVisibility.filter(item => item.contact.Id === folderVisiblVm.contact.Id)[0].setHasAccess(false);
                            }
                        }
                        if (parentFolderVm.originalFolder.IsPublic) {
                            hasParentFolder = false;
                        }
                        parentFolderId = parentFolderVm.originalFolder.ParentFolderId;
                    }
                }
                this.checkEditAccess();
            }
        }

        on(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.on(eventName, callback, caller);
        }
        off(eventName: string, callback: { (args?): void; }, caller: any): void {
            this._listener.off(eventName, callback, caller);
        }

        /**
         * Refresh the list
         */
        private loadList(refresh: boolean = false) {
            if (this.contactHeaderViewModel.currentContactList && this.contactHeaderViewModel.currentContactList.length) {
                this.listVm.loadNextPage();
            } else {
                this.contactHeaderViewModel.on("pageChanged", this.contactPageChangedHandler, this);
            }
        }

        constructor(private $utility: ap.utility.UtilityHelper, private $timeout: angular.ITimeoutService, private _api: ap.services.apiHelper.Api, private $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, private $servicesManager: ap.services.ServicesManager, private _selectedContactsIds?: string[]) {
            this._listener = this.$utility.EventTool.implementsListener(["editmodechanged"]);
            this.listVm = new ap.viewmodels.folders.FoldersPagedListViewModel(this.$utility, _api, this.$q, $timeout, $servicesManager, this._controllersManager, false, ap.viewmodels.folders.FolderItemViewModel, "Creator,FolderVisibilityNumber,VAL", null, null, true, undefined, true);
            this.listVm.addCustomParam("projectid", this._controllersManager.mainController.currentProject().Id);

            this._contactHeaderViewModel = new ContactHeaderViewModel($utility, $q, _controllersManager, false, this._selectedContactsIds);

            this.initScreen();

            this.loadList();
            this.listVm.on("pageloaded", this.initFoldersVisibility, this);
        }

        private _contactHeaderViewModel: ContactHeaderViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: home.ActionViewModel;
        private _saveAction: home.ActionViewModel;
        private _cancelAction: home.ActionViewModel;
        private _listener: ap.utility.IListenerBuilder;
    }
}