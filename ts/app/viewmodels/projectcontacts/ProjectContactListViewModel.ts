module ap.viewmodels.projectcontacts {

    export class ContactItemParameterBuilder implements ItemParameterBuilder {
        createItemParameter(itemIndex: number, dataSource: any, pageDesc: PageDescription, parameters: LoadPageSuccessHandlerParameter, utility: ap.utility.UtilityHelper) {
            return new ProjectContactItemParameter(itemIndex, dataSource, pageDesc, parameters, utility, this.contactController, this.mainController, this.isForImportComponent);
        }
        constructor(private contactController: ap.controllers.ContactController, private mainController: ap.controllers.MainController, private isForImportComponent: boolean = false) {

        }
    }

    /**
     * This Class is used to send specific parameter to the API to load the list of Contacts.
     * Only used when loading entities with customIds first   
     */
    export class GetContactDetailsParams {

        toJSON(): any {
            let json: any = {
                ExcludedProjectId: this._excludedProjectId,
                ProjectId: this._projectId,
                SearchText: this._searchText,
                ExcludedUserId: this._excludedUserId,
                IsInvited: this._isInvited
            };
            return json;
        }

        constructor(private _searchText: string, private _projectId: string, private _excludedProjectId: string, private _excludedUserId: string[],
            private _isInvited: string = "All") {
        }
    }

    export class ProjectContactListViewModel extends ListWorkspaceViewModel {

        /**
        * Getter of the public selectedAll property
        */
        public get selectedAll(): boolean {
            return this.listVm.selectedAll;
        }

        /**
        * Return selected contact viewmodel
        **/
        public get selectedContactVm(): ap.viewmodels.projectcontacts.ProjectContactItemViewModel {
            return <ap.viewmodels.projectcontacts.ProjectContactItemViewModel>this._listVm.selectedViewModel;
        }

        /**
        * Set of the public selectedAll property
        */
        public set selectedAll(selectedAll: boolean) {
            if (this.selectedAll !== selectedAll) {
                this.listVm.selectedAll = selectedAll;
                this.updateItemCheckState();
                if (selectedAll && !this.isForAddMeetingConcerns) {
                    this.gotoMultiActions();
                } else {
                    this.closeMultiActions();
                }
            }
        }

        /**
        * Method used to know if the item in param is the last of the list
        * @param item the note we want to know if it is the last of the list
        **/
        public isLast(item: ap.viewmodels.projectcontacts.ProjectContactItemViewModel): boolean {
            if (item && this.listVm.sourceItems[this.listVm.sourceItems.length - 1] && this.listVm.sourceItems[this.listVm.sourceItems.length - 1].originalEntity
                && this.listVm.sourceItems[this.listVm.sourceItems.length - 1].originalEntity.Id === item.originalEntity.Id) {
                return true;
            }
            return false;
        }


        /**
        * This is the property for know when this list use for ImportComponent
        **/
        public get isForImportComponent(): boolean {
            return this._isForImportComponent;
        }


        /**
        * This is the property for know when this list use for add to MeetingConcerns
        **/
        public get isForAddMeetingConcerns(): boolean {
            return this._isForAddMeetingConcerns;
        }

        /**
         * This is the property to represent screen of the list of contact.
         **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * To know if we are in multi action mode or not
        */
        public get isMultiAction(): boolean {
            return this._isMultiAction;
        }

        /**
        * This is the property MultiActionsViewModel
        */
        public get multiActions(): ap.viewmodels.home.MultiActionsViewModel {
            return this._multiActions;
        }

        /**
         * Public accessors for a search text for filtering a list of contacts
         */
        public get searchText(): string {
            return this._searchText;
        }

        public set searchText(value: string) {
            this._searchText = value;
            this.load();
        }

        public set excludedUserIds(val: string[]) {
            this._excludedUserIds = val;
        }

        /**
         * Public accessors for a selected project for filtering a list of contacts
         */
        public get selectedProject(): ap.models.projects.Project {
            return this._selectedProject;
        }

        public set selectedProject(value: ap.models.projects.Project) {
            this._selectedProject = value;
            this.selectedAll = false;
            this.load();
        }

        /**
        * Returns true if some items are checked (not all)
        * Returns false in the other cases
        */
        public get isIndeterminate(): boolean {
            return this.listVm.isIndeterminate;
        }

        protected createCustomParams() {
            if (!this.isForImportComponent) {
                return;
            }
            let selectProjectId;
            if (this.isForImportComponent && !this.isForAddMeetingConcerns) {
                selectProjectId = this._selectedProject ? this._selectedProject.Id : ap.utility.UtilityHelper.createEmptyGuid();
            } else if (this.isForAddMeetingConcerns) {
                selectProjectId = this.$controllersManager.mainController.currentProject().Id;
            }

            this._customParam = new GetContactDetailsParams(this._searchText ? this._searchText : null, selectProjectId, !this.isForAddMeetingConcerns ? this.$controllersManager.mainController.currentProject().Id : ap.utility.UtilityHelper.createEmptyGuid(), this._excludedUserIds ? this._excludedUserIds : null);
        }

        protected buildCustomFilter(): angular.IPromise<string> {
            let deferred: ng.IDeferred<string> = this.$q.defer();
            if (this.isForImportComponent) {
                deferred.resolve(undefined);
            } else {
                let filter = Filter.eq("Project.Id", this.$controllersManager.mainController.currentProject().Id);
                deferred.resolve(filter);
            }
            return deferred.promise;
        }

        public dispose() {
            super.dispose();
            if (this._screenInfo) {
                this._screenInfo.off("actionclicked", this.actionClickedHandler, this);
            }
            this._multiActions.off("actionClicked", this.actionClickedHandler, this);

            this._controllersManager.contactController.off("contactupdated", this.contactUpdatedHandler, this);
            this._controllersManager.mainController.off("multiactioncloserequested", this.closeMultiActions, this);
            this._controllersManager.contactController.off("needtobeselected", this.selectEntityHandler, this);
            this._controllersManager.contactController.off("participantdeleted", this.closeInfoPanel, this);
        }

        /**
         * This method create the screen info to define the list of project contact screen: action, addAction, how to filter...
         **/
        private buildScreen() {
            let manageButtonActive = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_VisibilityManagement);
            let actions: Array<ap.viewmodels.home.ActionViewModel> = [
                new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectcontact.manage", this.$utility.rootUrl + "Images/html/icons/ic_business_center_black_48px.svg", manageButtonActive, null, "Manage", manageButtonActive),
                new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectcontact.refresh", this.$utility.rootUrl + "Images/html/icons/ic_refresh_black_48px.svg", true, null, "Refresh list", true)
            ];
            this._addAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectcontact.add", this.$utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", true, [
                new ap.viewmodels.home.SubActionViewModel(this.$utility, this.$utility.EventTool, "projectcontact.import", this.$utility.rootUrl + "Images/html/icons/ic_import_export_black_24px.svg", true, true, false, "Import participants"),
            ], "Add participants", true);

            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "projectcontact.list", ap.misc.ScreenInfoType.List, actions, this._addAction, null, null);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);

            this._inviteMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "multiaction.invite", this.$utility.rootUrl + "Images/html/icons/ic_group_add_black_48px.svg", false, null, "Invite", false);
            this._manageMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "multiaction.manage", this.$utility.rootUrl + "Images/html/icons/ic_business_center_black_48px.svg", false, null, "Manage", false);
            this._multiActions = new ap.viewmodels.home.MultiActionsViewModel(this.$utility, [this._manageMultiAction, this._inviteMultiAction], []); // the checked event will raise for one time so reduce one
            this._multiActions.on("actionClicked", this.actionClickedHandler, this);
        }

        /**
        * Method use to removed all contact which isInvited = true
        * return an array of not invited contact
        */
        private getContactsToInvite(): ap.models.projects.ContactDetails[] {
            let notInvitedContact: ap.models.projects.ContactDetails[] = [];
            let checkedItems = this.listVm.getCheckedItems();
            for (let i = 0; i < checkedItems.length; i++) {
                let contact: ap.models.projects.ContactDetails = (<ap.viewmodels.projectcontacts.ProjectContactItemViewModel>checkedItems[i]).originalContactItem;
                if (contact && contact.IsInvited === false) {
                    notInvitedContact.push(contact);
                }
            }
            return notInvitedContact;
        }

        /**
         * When an action is clicked of the screen info, it's handled here and action will be executed
         * @param name this is the action's name clicked
         **/
        private actionClickedHandler(name: string) {
            switch (name) {
                case "projectcontact.refresh":
                    if (this.listVm.selectedViewModel && this.listVm.selectedViewModel.originalEntity.Deleted) {
                        this._screenInfo.isInfoOpened = false;
                    }
                    this.load(this._screenInfo.selectedEntityId).then(() => {
                        if (this._screenInfo.isInfoOpened) {
                            this._listener.raise("openinfopanel");
                        }
                    });
                    this._listener.raise("requestrefresher");
                    break;
                case "projectcontact.manage":
                    this.$controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.ManageContacts);
                    break;
                case "multiaction.invite":
                    // send event to Segment.IO
                    let currentProject: ap.models.projects.Project = this.$controllersManager.mainController.currentProject();
                    this.$servicesManager.toolService.sendEvent("cli-action-multi-invite project participants",
                        new Dictionary([
                            new KeyValue("cli-action-multi-invite project participants-project name", currentProject.Name),
                            new KeyValue("cli-action-multi-invite project participants-project id", currentProject.Id),
                            new KeyValue("cli-action-multi-invite project participants-screenname", "projects")
                        ])
                    );
                    this._controllersManager.contactController.requestInviteContact(this.getContactsToInvite());
                    break;
                case "multiaction.manage":
                    let idsSelected = this.listVm.getCheckedItems().map((contact) => { return contact.originalEntity.Id; });
                    let projContactManageStateParam = new ProjectContactManageFlowStateParam(this.$utility, idsSelected);
                    this.$controllersManager.uiStateController.changeFlowState(ap.controllers.MainFlow.ManageContacts, projContactManageStateParam);
                    break;
            }
        }

        /**
        * Method use to go to multiAction mode
        */
        public gotoMultiActions() {
            if (!this.isForImportComponent && !this.isMultiAction) {
                this._isMultiAction = true;
                this.$controllersManager.mainController.gotoMultiActionsMode(this._multiActions);
                this.multiActions.itemsChecked = this.listVm.listidsChecked;
                this.computeMultiActionsAccessibility();
            }
        }

        /*
        * Event handler when multiactioncloserequested event is raised
        * Use to close the multi action mode
        */
        public closeMultiActions() {
            if (this.isMultiAction) {
                this.$controllersManager.mainController.closeMultiActionsMode();
                this._isMultiAction = false;
                this.listVm.uncheckAll();
            }
        }

        /**
        * Used to open the detail panel
         */
        public openInfoPanel() {
            if (this._listVm.selectedViewModel && !this._listVm.selectedViewModel.originalEntity.Deleted) {
                this.selectedContactVm.contactActions.infoActionVisible(false);
                this._screenInfo.isInfoOpened = true;
                this._listener.raise("openinfopanel");
            }
        }

        /**
         * Used to close the detail panel
         */
        public closeInfoPanel() {
            this._screenInfo.isInfoOpened = false;
            this.selectedContactVm.contactActions.infoActionVisible(true);
        }

        /**
         * This is the handler executed when a contact is updated from controller and will update the values in the item if it is corresponds to an item loaded of the list
         * @param args this is the contactDetails just updated
         */
        private contactUpdatedHandler(args: ap.controllers.EntityUpdatedEvent<ap.models.projects.ContactDetails[]>) {
            if (args && args.entity && this._listVm && this._listVm.sourceItems) {
                args.entity.forEach((updatedContact: ap.models.projects.ContactDetails) => {
                    for (let i = 0; i < this._listVm.sourceItems.length; i++) {
                        let item = <ProjectContactItemViewModel>this._listVm.sourceItems[i];
                        if (item && item.originalEntity.Id === updatedContact.Id) {
                            if (item.originalEntity.EntityVersion !== updatedContact.EntityVersion) {
                                item.init(updatedContact);
                            }
                            break;
                        }
                    }
                });
            }
        }

        /**
        * Method use to know if the button is visible and enable or not
        */
        private computeMultiActionsAccessibility() {
            if (this.isMultiAction) {
                this.computeInviteMultiActionAccess();
                this.computeManageMultiActionAccess();
            }
        }

        /**
         * This method use for compute access of invite multi action
         */
        private computeInviteMultiActionAccess() {
            this._inviteMultiAction.isEnabled = false;
            this._inviteMultiAction.isVisible = false;
            let notInvitedCheckeditemsCount = this.listVm.getCheckedItems().filter((item: ap.viewmodels.projectcontacts.ProjectContactItemViewModel) => { return item && item.originalContactItem && item.originalContactItem.IsInvited === false; }).length;
            if (notInvitedCheckeditemsCount) {
                this._inviteMultiAction.isEnabled = true;
                this._inviteMultiAction.isVisible = true;
            }
        }

        /**
         * This method use for compute access of manage multi action
         */
        private computeManageMultiActionAccess() {
            let manageButtonActive = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_VisibilityManagement);
            this._manageMultiAction.isVisible = manageButtonActive;
            this._manageMultiAction.isEnabled = manageButtonActive;
        }

        /**
        * Methode use to know how many contact of the project are checked
        * See: AP-14825
        **/
        public getCheckedContacts(): ProjectContactItemViewModel[] {
            let checketItemsFromProject: ProjectContactItemViewModel[] = [];
            let checkedItems = this.listVm.getCheckedItems();
            for (let i = 0; i < checkedItems.length; i++) {
                checketItemsFromProject.push(<ProjectContactItemViewModel>checkedItems[i]);
            }
            return checketItemsFromProject;
        }

        /**
        * Event handler when there is an item checked
        * Use to go to multi action mode if there is at least one item checked or close the multi action mode if there are no item checked
        **/
        private itemCheckedChanged() {
            let checkedItems = this.getCheckedContacts();
            this.multiActions.itemsChecked = checkedItems.map((entity) => { return entity.originalEntity.Id; });
            this.screenInfo.checkedEntitiesId = checkedItems.map((item) => { return item.originalEntity.Id; });

            if (!this.isForAddMeetingConcerns) {
                if (checkedItems.length > 0) {
                    this.gotoMultiActions();
                } else if (checkedItems.length === 0) {
                    this.closeMultiActions();
                }
            }

            if (this.isMultiAction) {
                let checkedItems = this.getCheckedContacts();
                this._multiActions.itemsChecked = checkedItems.map((entity) => { return entity.originalEntity.Id; });
                this.computeMultiActionsAccessibility();
            }

            this.checkSelectedAll();
        }

        /**
         * Update screen info when selected entity id is changed
         * @param selectedContactVm Selected contact viewmodel
         */
        private selectedContactChangedHandler(selectedContactVm: ap.viewmodels.projectcontacts.ProjectContactItemViewModel) {
            this._screenInfo.selectedEntityId = selectedContactVm && selectedContactVm.originalContactItem ? selectedContactVm.originalContactItem.Id : null;
        }

        /**
         * Request open contact details info panel
         * @param contactId Contact's ID
         */
        public selectItem(contactId: string): angular.IPromise<ap.viewmodels.projectcontacts.ProjectContactItemViewModel> {
            if (this._listVm.selectedViewModel)
                (<ap.viewmodels.projectcontacts.ProjectContactItemViewModel>this._listVm.selectedViewModel).contactActions.infoActionVisible(true);
            return super.selectItem(contactId, false).then((selectedVm: ap.viewmodels.projectcontacts.ProjectContactItemViewModel) => {
                this.openInfoPanel();
                return selectedVm;
            });
        }

        /**
         * Method used to select a contact
         * @param contactId the contact to select
         */
        public selectEntityHandler(contactId: string) {
            this.selectItem(contactId);
        }

        /**
         * Tells if all items should be checked or not
         */
        public toggleAll() {
            this.selectedAll = !this.selectedAll;
            this.checkSelectedAll();
        }

        /**
         * This metod update sourceItems checked state then select all checkbox is clicked
         */
        private updateItemCheckState() {
            let changeIsChecked: (item: ProjectContactItemViewModel) => void = (item: ProjectContactItemViewModel) => {
                if (item && item.originalEntity) {
                    item.defaultChecked = this.selectedAll; // use default check to not raise the check event for each item
                }
            };

            this.listVm.sourceItems.forEach((item: ProjectContactItemViewModel) => {
                changeIsChecked(item);
            });
        }

        /**
         * Calls on `ischeckedchanged` event. Checks number of selected poinst with number of uploaded points. If it is equal - set selected = true, otherwise - false.
         */
        public checkSelectedAll(isPageLoaded?: boolean) {
            this.screenInfo.checkedEntitiesId = this.listVm.listidsChecked;

            let checkedItemsLength: number = this.listVm.listidsChecked.length;
            let listLength: number = this.listVm.ids.length;
            this.multiActions.itemsChecked = this.listVm.listidsChecked;
            if (this.listVm.isIdsLoaded && listLength > 0) {
                this.listVm.selectedAll = listLength === checkedItemsLength || (this.selectedAll && isPageLoaded);
                this.listVm.isIndeterminate = !this.selectedAll && checkedItemsLength > 0;
            }
        }

        /**
         * This method handle idsloaded event
         * @param idsLoaded show load ids or not
         */
        private idsLoadedHandler(idsLoaded: boolean) {
            if (idsLoaded && !!this.listVm.listidsChecked) {
                this.selectedAll = this.listVm.ids.length === this.listVm.listidsChecked.length;
            }
        }

        constructor($utility: ap.utility.UtilityHelper, $q: angular.IQService, private _controllersManager: ap.controllers.ControllersManager, $timeout: angular.ITimeoutService, private $servicesManager: ap.services.ServicesManager, private _isForImportComponent: boolean = false, private _isForAddMeetingConcerns: boolean = false) {
            super($utility, _controllersManager, $q,
                new GenericPagedListOptions("ContactDetails", ProjectContactItemViewModel,
                    "User,User.Person,Project,IsInvited,NumberPurchasedBundle,HasSuperAdminModule", undefined, undefined, undefined, false,
                    _isForImportComponent && !_isForAddMeetingConcerns ? "contactdetailsidsbyuser" : _isForAddMeetingConcerns ? "participantidsonproject" : undefined, _isForImportComponent, new ContactItemParameterBuilder(_controllersManager.contactController, _controllersManager.mainController, _isForImportComponent || _isForAddMeetingConcerns),
                    undefined, undefined, undefined, _isForImportComponent ? ap.services.apiHelper.MethodType.Post : undefined));
            this._listener.addEventsName(["openinfopanel"]);
            this._controllersManager.contactController.on("contactupdated", this.contactUpdatedHandler, this);
            this._controllersManager.contactController.on("needtobeselected", this.selectEntityHandler, this);
            this._controllersManager.contactController.on("participantdeleted", this.closeInfoPanel, this);
            this._listVm.on("ischeckedchanged", this.itemCheckedChanged, this);
            this._listVm.on("selectedItemChanged", this.selectedContactChangedHandler, this);
            this._listVm.on("idsloaded", this.idsLoadedHandler, this);
            this.$controllersManager.mainController.on("multiactioncloserequested", this.closeMultiActions, this);
            this.buildScreen();
            this._searchText = "";
            this._selectedProject = null;
        }

        private _multiActions: ap.viewmodels.home.MultiActionsViewModel;
        private _inviteMultiAction: ap.viewmodels.home.ActionViewModel;
        private _manageMultiAction: ap.viewmodels.home.ActionViewModel;
        private _isMultiAction: boolean;
        private _screenInfo: ap.misc.ScreenInfo;
        private _searchText: string;
        private _excludedUserIds: string[];
        private _selectedProject: ap.models.projects.Project;
        private _addAction: ap.viewmodels.home.ActionViewModel;
    }
}