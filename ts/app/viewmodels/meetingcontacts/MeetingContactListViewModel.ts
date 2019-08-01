namespace ap.viewmodels.meetingcontacts {

    export class MeetingContactListViewModel implements IDispose {

        /**
        * Getter of the public selectedAll property
        */
        public get selectedAll(): boolean {
            return this.listVm.selectedAll;
        }

        /**
        * Set of the public selectedAll property
        */
        public set selectedAll(selectedAll: boolean) {
            if (this.selectedAll !== selectedAll) {
                this.listVm.selectedAll = selectedAll;
                this.updateItemCheckState();
                if (selectedAll) {
                    this.gotoMultiActions();
                } else {
                    this.closeMultiActions();
                }
            }
        }

        /**
        * To know if we are in multi action mode or not
        */
        public get isMultiAction(): boolean {
            return this._isMultiAction;
        }

        /**
         * This is the property to represent screen of the list of contact.
         **/
        public get screenInfo(): ap.misc.ScreenInfo {
            return this._screenInfo;
        }

        /**
        * This is the property MultiActionsViewModel
        */
        public get multiActions(): ap.viewmodels.home.MultiActionsViewModel {
            return this._multiActions;
        }

        /**
       * Method used to know if the item in param is the last of the list
       * @param item the note we want to know if it is the last of the list
       **/
        public isLast(item: ap.viewmodels.meetingcontacts.MeetingContactViewModel): boolean {
            if (item && this.listVm.sourceItems[this.listVm.sourceItems.length - 1] && this.listVm.sourceItems[this.listVm.sourceItems.length - 1].originalEntity
                && this.listVm.sourceItems[this.listVm.sourceItems.length - 1].originalEntity.Id === item.originalEntity.Id) {
                return true;
            }
            return false;
        }

        /**
        * Returns true if some items are checked (not all)
        * Returns false in the other cases
        */
        public get isIndeterminate(): boolean {
            return this.listVm.isIndeterminate;
        }

        /**
         * Tells if all items should be checked or not
         */
        public toggleAll() {
            this.selectedAll = !this.selectedAll;
        }

        /**
         * Calls on `ischeckedchanged` event. Checks number of selected poinst with number of uploaded points. If it is equal - set selected = true, otherwise - false.
         */
        public checkSelectedAll() {
            this.screenInfo.checkedEntitiesId = this.listVm.listidsChecked;
            let checkedItemsLength: number = this.listVm.listidsChecked.length;
            let listLength: number = this.listVm.count;
            this.multiActions.itemsChecked = this.listVm.listidsChecked;
            if (this.listVm.isLoaded && listLength > 0) {
                this.listVm.selectedAll = listLength === checkedItemsLength;
                this.listVm.isIndeterminate = !this.selectedAll && checkedItemsLength > 0;
            }
        }

        /**
        * Method use to go to multiAction mode
        */
        public gotoMultiActions() {
            if (!this.isMultiAction) {
                this._isMultiAction = true;
                this._controllersManager.mainController.gotoMultiActionsMode(this._multiActions);
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
                this._controllersManager.mainController.closeMultiActionsMode();
                this._isMultiAction = false;
                this.listVm.uncheckAll();
            }
        }

        /**
        * Method use to know if the button is visible and enable or not
        */
        private computeMultiActionsAccessibility() {
            if (this._isMultiAction) {
                let manageButtonActive = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_VisibilityManagement);
                this._manageMultiAction.isVisible = manageButtonActive;
                this._manageMultiAction.isEnabled = manageButtonActive;
            }
        }

        /**
         * This method loads the Meeting contact of the current meeting selected.
         **/
        public load(meeting?: ap.models.meetings.Meeting, idToSelect?: string): void {
            this._meetingController.getMeetingContacts(meeting ? meeting : this._controllersManager.mainController.currentMeeting).then((meetingConcernList: ap.models.meetings.MeetingConcern[]) => {
                let results: MeetingContactViewModel[] = [];
                meetingConcernList.forEach((meetingConcernItem, index) => {
                    let meetingContactViewModelItem: MeetingContactViewModel = new MeetingContactViewModel(this.$utility, this._controllersManager);
                    meetingContactViewModelItem.init(meetingConcernItem);
                    meetingContactViewModelItem.index = index;
                    meetingContactViewModelItem.on("entitydropped", this.dropEntity, this);
                    results.push(meetingContactViewModelItem);
                });
                this._list.onLoadItems(results);
                this._list.selectEntity(idToSelect);
                this.checkDragAndDropAccess();
            });
            this.checkEditAccess();
        }

        /**
        * This method use for compute visible/enable edit actions
        **/
        private checkEditAccess() {
            let meeting = this._mainController.currentMeeting;
            if (meeting && !meeting.IsSystem && ((meeting.UserAccessRight !== null && meeting.UserAccessRight.CanEdit) || meeting.Project.UserAccessRight.CanEditAllList)) {
                this._editAction.isVisible = !this._screenInfo.isEditMode;
                this._editAction.isEnabled = !this._screenInfo.isEditMode;
            } else {
                this._editAction.isVisible = false;
                this._editAction.isEnabled = false;
            }

            this._manageAction.isVisible = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingAccessRight) && !this._screenInfo.isEditMode;
            this._manageAction.isEnabled = this.$utility.UserContext.licenseAccess.hasAccess(ap.models.licensing.Module.Module_MeetingAccessRight) && !this._screenInfo.isEditMode;

            this._saveAction.isVisible = !!meeting && this._screenInfo.isEditMode;
            this._saveAction.isEnabled = !!meeting && this._screenInfo.isEditMode;
            this._cancelAction.isVisible = !!meeting && this._screenInfo.isEditMode;
            this._cancelAction.isEnabled = !!meeting && this._screenInfo.isEditMode;
            this.computeMultiActionsAccessibility();
        }

        private checkAddAccess() {
            let meeting = this._mainController.currentMeeting;
            if (meeting) {
                let hasAddAction = !(meeting.IsSystem && meeting.IsPublic);
                this._addAction.isEnabled = hasAddAction;
                this._addAction.isVisible = hasAddAction;
            }
        }

        /**
         * This metod update sourceItems checked state then select all checkbox is clicked
         */
        private updateItemCheckState() {
            let changeIsChecked: (item: MeetingContactViewModel) => void = (item: MeetingContactViewModel) => {
                if (item && item.originalEntity) {
                    if (this.selectedAll && item.isChecked !== true) {
                        this.listVm.listidsChecked.push(item.originalEntity.Id);
                    } else {
                        this.listVm.listidsChecked.splice(0);
                    }
                    item.defaultChecked = this.selectedAll; // use default check to not raise the check event for each item
                }
            };

            this.listVm.sourceItems.forEach((item: MeetingContactViewModel) => {
                changeIsChecked(item);
            });
        }

        /**
         * This method is used to compute drag and drop disabled/enabled state
         */
        private checkDragAndDropAccess() {
            if (!this._mainController.currentMeeting.IsSystem) {
                if (this.$utility.isIE()) {
                    this.manageMoveItemsActions();
                    this._dragOptions.isEnabled = false;
                } else {
                    this._dragOptions.isEnabled = !this._screenInfo.isEditMode;
                }
            }
        }

        /**
        * Method use to manage actions
        **/
        private actionClickedHandler(action: string) {
            switch (action) {
                case "meetingcontacts.edit":
                    this._screenInfo.isEditMode = true;
                    break;
                case "meetingcontacts.save":
                    this._screenInfo.isEditMode = false;
                    this.save();
                    break;
                case "meetingcontacts.cancel":
                    this._screenInfo.isEditMode = false;
                    this.cancel();
                    break;
                case "projectcontact.manage":
                    this.goToMeetingManage();
                    break;
                case "multiaction.manage":
                    this.goToMeetingManage(true);
                    break;
            }
            this.checkEditAccess();
            this.checkDragAndDropAccess();
        }

        private goToMeetingManage(onlyCheckedContacts: boolean = false) {
            let stateParam = new ap.viewmodels.meetingcontacts.MeetingManageFlowStateParam(this.$utility);
            if (onlyCheckedContacts) {
                stateParam.meetingConcernList = (<MeetingContactViewModel[]>this.listVm.getCheckedItems()).map((item) => { return item.originalMeetingContact; });
            } else {
                stateParam.meetingConcernList = (<MeetingContactViewModel[]>this.listVm.sourceItems).map((item) => { return item.originalMeetingContact; });
            }
            this._mainController.uiStateController.changeFlowState(ap.controllers.MainFlow.MeetingManage, stateParam);
        }

        /**
        * Method use to get all the meetingConcern of the list
        **/
        private getPostChangedMeetingContactList(): ap.models.meetings.MeetingConcern[] {
            let meetingConcernList: ap.models.meetings.MeetingConcern[] = [];
            for (let i = 0; i < this.listVm.sourceItems.length; i++) {
                (<MeetingContactViewModel>this.listVm.sourceItems[i]).postChanges();
                meetingConcernList.push((<MeetingContactViewModel>this.listVm.sourceItems[i]).originalMeetingContact);
            }
            return meetingConcernList;
        }

        /**
        * Method use to save changes in the list
        **/
        public save() {
            this._meetingController.updateMeetingConcerns(this._mainController.currentMeeting, this.getPostChangedMeetingContactList());
        }

        /**
        * Method use to cancel changes in the list
        **/
        public cancel() {
            for (let i = 0; i < this.listVm.sourceItems.length; i++) {
                (<MeetingContactViewModel>this.listVm.sourceItems[i]).copySource();
            }
        }

        /**
         * This method create the screen info to define the list of project contact screen: action, addAction, how to filter...
         **/
        private buildScreen() {
            this._manageAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "projectcontact.manage", this.$utility.rootUrl + "Images/html/icons/ic_business_center_black_48px.svg", false, null, "Manage", false),
                this._editAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meetingcontacts.edit", this.$utility.rootUrl + "Images/html/icons/ic_create_black_48px.svg", false, null, "Edit participants", false);
            this._saveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meetingcontacts.save", this.$utility.rootUrl + "Images/html/icons/ic_save_black_48px.svg", false, null, "Save participants", false);
            this._cancelAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meetingcontacts.cancel", this.$utility.rootUrl + "Images/html/icons/ic_cancel_black_48px.svg", false, null, "Cancel changes", false);
            this._addAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "meetingcontacts.add", this.$utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", false, null, "Add participants", false);
            let actions = [this._manageAction, this._editAction, this._saveAction, this._cancelAction];
            this._screenInfo = new ap.misc.ScreenInfo(this.$utility, "projectcontact.list", ap.misc.ScreenInfoType.List, actions, this._addAction, null, null, false);
            this._screenInfo.on("actionclicked", this.actionClickedHandler, this);
            this._dragOptions = new ap.component.dragAndDrop.DragOptions(this.$utility, false);
            this._manageMultiAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "multiaction.manage", this.$utility.rootUrl + "Images/html/icons/ic_business_center_black_48px.svg", false, null, "Manage", false);
            this._multiActions = new ap.viewmodels.home.MultiActionsViewModel(this.$utility, [this._manageMultiAction], []); // the checked event will raise for one time so reduce one
            this._multiActions.on("actionClicked", this.actionClickedHandler, this);
            this.checkEditAccess();
            this.checkAddAccess();
        }

        /**
         * This is the list view model containing each item of the meeting's contact.
         **/
        public get listVm(): ap.viewmodels.ListEntityViewModel {
            return this._list;
        }

        /**
        * Return current drag options
        **/
        public get dragOptions(): ap.component.dragAndDrop.DragOptions {
            return this._dragOptions;
        }

        public dispose() {
            if (this._screenInfo) {
                this._screenInfo.dispose();
                this._screenInfo = null;
            }

            if (this._multiActions) {
                this._multiActions.dispose();
                this._multiActions = null;
            }

            if (this._list) {
                this._list.dispose();
                this._list = null;
            }

            this._controllersManager.mainController.off("multiactioncloserequested", this.closeMultiActions, this);
            this._controllersManager.contactController.off("deletepublicmeetingconcernsrequest", this.deleteMeetingConcernPublicList, this);
        }

        private selectedItemChangedHandler(item: MeetingContactViewModel): void {
            if (item) {
                this._screenInfo.selectedEntityId = item.originalEntity.Id;
            }
        }

        /**
         * This method will set selected entity
         * @param entity EntityViewModem The entity to select
         */
        public selectEntity(entity: EntityViewModel): boolean {
            if (!entity)
                return false;
            this._list.selectEntity(entity.originalEntity.Id);
            return true;
        }

        /**
         * Method used to update the visibility of move actions on every items of the listVm
         **/
        private manageMoveItemsActions(): void {
            for (let i = 0; i < this.listVm.sourceItems.length; i++) {
                let item = <MeetingContactViewModel>this.listVm.sourceItems[i];
                if (item) {
                    item.moveUpAvailable = item.moveDownAvailable = !this._screenInfo.isEditMode;
                    if (i === 0) {
                        item.moveUpAvailable = false;
                    }
                    if (i === this.listVm.sourceItems.length - 1) {
                        item.moveDownAvailable = false;
                    }
                }
            }
        }

        /**
         * This method use for move up/down entity and change displayOrder
         * @param moveType moveType for know what direction for move: up or down
         * @param draggedMeetingConcern moved entity
         */
        public meetingConcernMove(moveType: string, item: MeetingContactViewModel) {
            let dropped: MeetingContactViewModel = <MeetingContactViewModel>this.listVm.sourceItems[moveType === "moveup" ? item.index - 1 : item.index + 1];
            let dropEvent = new ap.component.dragAndDrop.DropEntityEvent(item, dropped);
            this.listVm.sourceItems.splice(item.index, 1);
            this.listVm.sourceItems.splice(dropped.index, 0, item);
            let draggedIndex = item.index;
            item.index = dropped.index;
            dropped.index = draggedIndex;
            let draggedDisplayOrder = item.displayOrder;
            item.displayOrder = dropped.displayOrder;
            dropped.displayOrder = draggedDisplayOrder;
            dropped.originalMeetingContact.DisplayOrder = dropped.displayOrder;
            item.originalMeetingContact.DisplayOrder = item.displayOrder;
            let entitiesToUpdate = new Array<ap.models.meetings.MeetingConcern>(this.listVm.sourceItems.length);
            this.listVm.sourceItems.forEach((sourceItem: MeetingContactViewModel, index: number) => {
                entitiesToUpdate[index] = sourceItem.originalMeetingContact;
                if (sourceItem === dropped || sourceItem === item) {
                    sourceItem.index = this.listVm.sourceItems.indexOf(sourceItem);
                }
            });
            this._meetingController.updateMeetingConcerns(this._mainController.currentMeeting, entitiesToUpdate).then((meetingConcerns: ap.models.meetings.MeetingConcern[]) => {
                meetingConcerns.forEach((meetingConcern) => {
                    meetingConcern.Meeting = this._mainController.currentMeeting;
                    if (meetingConcern.Id === dropped.originalMeetingContact.Id) {
                        dropped.init(meetingConcern);
                    }
                    if (meetingConcern.Id === item.originalMeetingContact.Id) {
                        item.init(meetingConcern);
                    }
                });
                this.manageMoveItemsActions();
            });
        }

        /**
         * Handle entity drop event
         * @param event Event object
         */
        private dropEntity(event: ap.component.dragAndDrop.DropEntityEvent) {
            this._list.sourceItems = <MeetingContactViewModel[]>ap.utility.sortDraggableEntities(<MeetingContactViewModel[]>this._list.sourceItems, event);
            let updatedEntities: ap.models.meetings.MeetingConcern[] = new Array<ap.models.meetings.MeetingConcern>(this._list.sourceItems.length);
            this._list.sourceItems.forEach((vm: MeetingContactViewModel, index: number) => {
                if (vm.originalMeetingContact.DisplayOrder !== vm.displayOrder) {
                    vm.index = this._list.sourceItems.indexOf(vm);
                    vm.originalMeetingContact.DisplayOrder = vm.displayOrder;
                }
                updatedEntities[index] = vm.originalMeetingContact;
            });
            this._meetingController.updateMeetingConcerns(this._mainController.currentMeeting, updatedEntities).then((meetingConcerns: ap.models.meetings.MeetingConcern[]) => {
                meetingConcerns.forEach((meetingConcern: ap.models.meetings.MeetingConcern) => {
                    meetingConcern.Meeting = this._mainController.currentMeeting;
                    this._list.getEntityById(meetingConcern.Id).init(meetingConcern);
                });
            });
        }

        /**
        * Event handler when there is an item checked
        * Use to go to multi action mode if there is at least one item checked or close the multi action mode if there are no item checked
        **/
        private itemCheckedChanged() {
            let checkedItems = this.listVm.getCheckedItems();
            this.multiActions.itemsChecked = checkedItems.map((entity) => { return entity.originalEntity.Id; });
            this.screenInfo.checkedEntitiesId = checkedItems.map((item) => { return item.originalEntity.Id; });

            if (checkedItems.length > 0) {
                this.gotoMultiActions();
            } else if (checkedItems.length === 0) {
                this.closeMultiActions();
            }

            if (this.isMultiAction) {
                this.computeMultiActionsAccessibility();
            }
            this.checkSelectedAll();
        }

        /*
        * Delete a meetingConcern of a Public Meeting
        */
        private deleteMeetingConcernPublicList(meetingConcernToDelete: ap.models.meetings.MeetingConcern) {
            let meetingConcerns: models.meetings.MeetingConcern[] = [];

            this.listVm.sourceItems.forEach((meetingConcernVm: MeetingContactViewModel) => {
                if (meetingConcernVm.originalMeetingContact.Id !== meetingConcernToDelete.Id) {
                    meetingConcerns.push(meetingConcernVm.originalMeetingContact);
                }
            });

            this._controllersManager.contactController.movePublicMeetingToPrivate(meetingConcerns).then((apiResponse: ap.services.apiHelper.ApiResponse) => {
                this.load(apiResponse.data, this._screenInfo.selectedEntityId);
            });
        }

        static $inject = ["Utility", "mainController", "meetingController", "$scope", "ControllersManager"];
        constructor(private $utility: ap.utility.UtilityHelper, private _mainController: ap.controllers.MainController,
            private _meetingController: ap.controllers.MeetingController, private $scope: ng.IScope,
            private _controllersManager: ap.controllers.ControllersManager) {
            this.buildScreen();
            this._list = new ap.viewmodels.ListEntityViewModel(this.$utility, "MeetingConcern", "User", null, null);
            this._list.on("selecteditemchanged", this.selectedItemChangedHandler, this);
            this._list.on("ischeckedchanged", this.itemCheckedChanged, this);
            this._controllersManager.mainController.on("multiactioncloserequested", this.closeMultiActions, this);
            this._controllersManager.contactController.on("deletepublicmeetingconcernsrequest", this.deleteMeetingConcernPublicList, this);
        }

        private _list: ap.viewmodels.ListEntityViewModel;
        private _isMultiAction: boolean;
        private _manageMultiAction: ap.viewmodels.home.ActionViewModel;
        private _multiActions: ap.viewmodels.home.MultiActionsViewModel;
        private _screenInfo: ap.misc.ScreenInfo;
        private _editAction: home.ActionViewModel;
        private _saveAction: home.ActionViewModel;
        private _cancelAction: home.ActionViewModel;
        private _addAction: home.ActionViewModel;
        private _manageAction: home.ActionViewModel;
        private _dragOptions: ap.component.dragAndDrop.DragOptions;
    }
}