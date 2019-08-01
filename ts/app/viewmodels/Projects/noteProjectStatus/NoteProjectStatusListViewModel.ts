module ap.viewmodels.projects.noteProjectStatus {

    import NoteProjectStatus = ap.models.projects.NoteProjectStatus;

    export interface ErrorKeyViewModel {
        displayError: boolean;
        errorKey: string;
    }

    export class NoteProjectStatuslistViewModel extends ap.viewmodels.ListEntityViewModel implements IDispose {
        /**
         * This method provides access to elements of a filtered list of project statuses
         * @param index an index of the item to retrieve
         */
        public getItemAtIndex(index: number): IEntityViewModel {
            return this._filteredItems[index];
        }

        /**
         * This method returns a length of a filtered list of project statuses.
         */
        public getLength(): number {
            return this._filteredItems.length;
        }

        /**
        * Method use to add a new status in the list
        * @param newItem: the status to add into the list
        * @param itemIndex: the index where the item should be added
        **/
        public addNewStatus(newItem: NoteProjectStatusViewModel, itemIndex: number) {
            newItem.on("deleterowrequested", this.statusDeletedRequested, this);
            newItem.on("insertrowrequested", this.statusInsertRequested, this);
            newItem.on("statusdropped", this.statusDropHandler, this);
            newItem.on("propertychanged", this.statusPropertyChanged, this);
            this.sourceItems.splice(itemIndex + 1, 0, newItem);
            this._filteredItems.splice(itemIndex + 1, 0, newItem);
            this._setCount(this.sourceItems.length);
            ap.utility.updateSortingProperties(this.sourceItems, itemIndex);
            if (this.$utility.isIE())
                this.manageMoveItemsActions();
        }

        /*
        * Property used to search in the NoteProjectStatusList
        */
        public get searchText(): string {
            return this._searchText;
        }

        public set searchText(value: string) {
            this._searchText = value;
        }

        /*
        * Property used to know if an import has been done
        */
        public get isImport(): boolean {
            return this._isImport;
        }

        public set isImport(value: boolean) {
            this._isImport = value;
        }

        /**
         * To know if there are at least on status active as defined as Blocked action
         **/
        public get hasBlockedAction(): boolean {
            return this._hasBlockedAction;
        }

        /**
         * This property is to know if the data are valid and then, if the user can save the project status configuration
         **/
        public get canSave(): boolean {
            return this._canSave && (this._hasChanged || this._isImport);
        }

        /**
         * If there are some errors, this array contains a key for each error found. To translate
         **/
        public get errorKeys(): ErrorKeyViewModel[] {
            return this._errorKeys;
        }

        /**
        * Public property to know which status is used to close a point  by a subcontractor
        * (Used in the view)
        **/
        public get closingStatusId(): string {
            return this._closingStatusId;
        }

        public set closingStatusId(value: string) {
            if (this._closingStatusId === value) return;

            // un seleted old one
            angular.forEach(this.sourceItems, (itemVM: NoteProjectStatusViewModel) => {
                if (itemVM.id === this._closingStatusId) itemVM.doneAction = false;
                if (itemVM.id === value) itemVM.doneAction = true;
            });

            this._closingStatusId = value;
        }

        /**
        * To specified that the list of status will be limmit by the access right
        **/
        public get meetingAccessRight(): ap.models.accessRights.MeetingAccessRight {
            return this._meetingAccessRight;
        }

        /**
        * Public property to know if the view is in read or write mode
        */
        public get isReadOnly(): boolean {
            return this._isReadOnly;
        }

        public set isReadOnly(readOnly: boolean) {
            if (this._isReadOnly !== readOnly) {
                this._isReadOnly = readOnly;
                this._checkCanEditNoteStatus();
            }
        }

        /**
        * Public getter to know if the status of the point can be edited
        */
        public get canEditPointStatus(): boolean {
            return this._canEditPointStatus;
        }


        private _checkCanEditNoteStatus(): void {
            this._canEditPointStatus = !this._isReadOnly && this._meetingAccessRight && this.meetingAccessRight.CanEditPointStatus &&
                (this._meetingAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Manager || (this.selectedViewModel && !(<ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>this.selectedViewModel).isOnlyUsedByMeetingManager));
        }

        /**
        * Public getter to know if the user has only access to subcontractor statuses
        */
        public get hasSubcontractorStatusOnly(): boolean {
            return this._meetingAccessRight && this._meetingAccessRight.Level === ap.models.accessRights.AccessRightLevel.Subcontractor;
        }

        /**
        * To specified that the list will only display the active status
        **/
        public get activeStatusOnly(): boolean {
            return this._activeStatusOnly;
        }

        /**
        * Return current drag options
        **/
        public get dragOptions() {
            return this._dragOptions;
        }

        /**
        * Add draggable entity to drag options
        * @param item Draggable view model
        **/
        public addDraggable(item: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel) {
            this._dragOptions.clearDraggable();
            this._dragOptions.addDraggable(item);
        }

        /**
        * To delete a row when it raise delete event
        **/
        private statusDeletedRequested(status: NoteProjectStatusViewModel) {
            let itemIndex = this.sourceItems.indexOf(status);
            if (itemIndex >= 0) {
                this.sourceItems.splice(itemIndex, 1);
                status.dispose();
                this._setCount(this.sourceItems.length);
                this.checkStatusesValidate();
            }
            ap.utility.updateSortingProperties(this.sourceItems, itemIndex);
            this.setHasChanged();
        }

        /**
        * Methode use to know if something has changed on the list to set the save button enable or disable
        * @param newValue true or false it depends if the list contains a changed element
        **/
        private setHasChanged() {
            this._hasChanged = this.getChangedItems().length > 0;
            this._listener.raise("cansavechanged");
        }

        /**
         * This method is overriden in order to handle a list of filtered items
         */
        onLoadItems(items: IEntityViewModel[], isSelectFirst?: boolean): void {
            super.onLoadItems(items, isSelectFirst);

            this._filteredItems = this.sourceItems.slice();

            this.checkStatusesValidate();
            let len = this.sourceItems.length;
            let status: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
            for (let i = 0; i < len; i++) {
                status = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>this.sourceItems[i];
                status.index = i;
                status.on("propertychanged", this.statusPropertyChanged, this);
            }
            this.checkStatusesValidate();
            if (this.$utility.isIE()) {
                this.manageMoveItemsActions();
            }
        }

        private statusPropertyChanged(args: ap.viewmodels.base.PropertyChangedEventArgs) {
            if (args.propertyName === "isChecked") {
                this._listener.raise("itemchecked", args.caller);
            }
            this.checkStatusesValidate();
            this.setHasChanged();
        }

        /**
         * This method make disable blocked status if items has one isBlocked item
         */
        public checkStatusesValidate() {
            let oldCanSave = this._canSave;

            let hasDoneAction = false, hasTodoStatus = false, hasBlockedAction = false, hasActionForManager = false, hasInvalidData = false, multipleBlockedAction = false;
            let blockedActionStatuses: NoteProjectStatusViewModel[] = [];
            if (this.sourceItems && this.sourceItems.length > 0) {
                let len = this.sourceItems.length;
                let status: ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel;
                // reset item's general error statuses
                this.sourceItems.forEach((item: NoteProjectStatusViewModel) => item.hasGeneralError = false);
                for (let i = 0; i < len; i++) {
                    status = <ap.viewmodels.projects.noteProjectStatus.NoteProjectStatusViewModel>this.sourceItems[i];
                    if (status.isActive && status.isDone && status.doneAction)
                        hasDoneAction = true;
                    if (status.isActive && status.isTodo)
                        hasTodoStatus = true;
                    if ((status.isBlockedAction || status.doneAction) && status.isOnlyUsedByMeetingManager)
                        hasActionForManager = true;
                    if (status.isBlockedAction) {
                        if (hasBlockedAction === true) {
                            multipleBlockedAction = true;
                        } else {
                            hasBlockedAction = true;
                        }
                        blockedActionStatuses.push(status);
                    }
                    if (!status.isValid())
                        hasInvalidData = true;
                }
            }
            if (multipleBlockedAction === true) {
                blockedActionStatuses.forEach((blockedStatus: NoteProjectStatusViewModel) => blockedStatus.hasGeneralError = true);
            }
            let errorKeys: string[] = [];
            this._errorKeys.forEach((item) => { errorKeys.push(item.errorKey); });

            this.manageError("app.err.status.validate_active_todo", errorKeys, hasTodoStatus);
            this.manageError("app.err.status.validate_done_and_close", errorKeys, hasDoneAction);
            this.manageError("app.err.status.validate_manager", errorKeys, !hasActionForManager);
            this.manageError("app.err.status.validate_blocked_single", errorKeys, !multipleBlockedAction);

            this._canSave = hasTodoStatus && hasDoneAction && !hasActionForManager && !hasInvalidData && !multipleBlockedAction;
            this._hasBlockedAction = hasBlockedAction;
            if (this._canSave !== oldCanSave)
                this._listener.raise("cansavechanged");
        }

        /**
         * THis method will manage the queue of error by adding the error if not yet exists or to remove it depending of the parameter
         * @param errorKey this is the errorKey to add or remove
         * @param existingErrorKeys this is the collection of errorKey already added in the _errorKeys of the class
         * @param remove to know if the error must be added or removed.
         */
        private manageError(errorKey: string, existingErrorKeys: string[], remove: boolean) {
            let idxErr = existingErrorKeys.indexOf(errorKey);
            if (!remove) { // means the error must be added
                if (idxErr < 0)
                    this._errorKeys.push({ errorKey: errorKey, displayError: true });
            }
            else {
                if (idxErr >= 0) {
                    this._errorKeys.splice(idxErr, 1);
                    existingErrorKeys.splice(idxErr, 1);
                }
            }
        }

        /**
        * To insert a row when it raise insert event
        **/
        private statusInsertRequested(status: NoteProjectStatusViewModel) {
            let itemIndex = this.sourceItems.indexOf(status);
            let newItem = new NoteProjectStatusViewModel(this.$utility);
            let newEntity = new ap.models.projects.NoteProjectStatus(this.$utility);
            newEntity.DisplayOrder = status.displayOrder + 1;

            // to increase others display order
            let indexFrom = newEntity.DisplayOrder + 1;
            newItem.init(newEntity);
            this.addNewStatus(newItem, itemIndex);
            this.checkStatusesValidate();
            // special UI logic to focus on new row
            ViewHelper.delayFocusElement(newItem.id);
        }

        /**
        * Status row drop handler function
        * @param event DropEntityEvent object
        **/
        private statusDropHandler(event: ap.component.dragAndDrop.DropEntityEvent) {
            let draggableArray: NoteProjectStatusViewModel[] = <NoteProjectStatusViewModel[]>this.sourceItems; // add array variable to escape types incompability
            this.sourceItems = <NoteProjectStatusViewModel[]>ap.utility.sortDraggableEntities(draggableArray, event);
            ap.utility.updateSortingProperties(this.sourceItems);
        }

        /**
        * Method use to create an array of NoteProjectStatusViewModel with the array of NoteProjectStatus in comment
        * @param statusList: the list of NoteProjectStatus which will be used to create the list of NoteProjectStatusViewModel
        * @param status: the current NoteProjectStatus. After get the list of NoteProjectStatus, if the @status was spefiled we will select this status on the list as default
        **/
        public createStatusListViewModel(statusList: NoteProjectStatus[], status: ap.models.projects.NoteProjectStatus): NoteProjectStatusViewModel[] {
            let statusListVm: NoteProjectStatusViewModel[] = [];
            for (let i = 0; i < statusList.length; i++) {
                let itemVm: NoteProjectStatusViewModel = new NoteProjectStatusViewModel(this.$utility);
                itemVm.init(statusList[i]);
                if (itemVm.doneAction === true)
                    this.closingStatusId = itemVm.id;
                itemVm.on("deleterowrequested", this.statusDeletedRequested, this);
                itemVm.on("insertrowrequested", this.statusInsertRequested, this);
                itemVm.on("statusdropped", this.statusDropHandler, this);

                // We do the restiction only when the meetingAccessRight was specified 
                if (this.meetingAccessRight) {
                    if (!statusList[i].IsOnlyUsedByMeetingManager
                        || this.meetingAccessRight.Level >= ap.models.accessRights.AccessRightLevel.Manager
                        || (status && status.Id === statusList[i].Id)) {
                        if (!this._activeStatusOnly || !statusList[i].IsDisabled) {
                            statusListVm.push(itemVm);
                        } else if (statusList[i].IsDisabled && this.hasSubcontractorStatusOnly && statusList[i].IsBlockedAction) {
                            // Subcontractors should see the Blocked status even if it is disabled
                            statusListVm.push(itemVm);
                        }
                    }
                }
                else {
                    if (!this._activeStatusOnly || !statusList[i].IsDisabled) {
                        statusListVm.push(itemVm);
                    }
                }
            }
            return statusListVm;
        }

        /**
         * This method will get the list of NoteProjectStatus and fill into sourceItems and select the given status on the param.
           This method  also return the  promise of the this._projectController.getNoteProjectStatusList method
         * @param status: the current NoteProjectStatus. After get the list of NoteProjectStatus, if the @status was spefiled
           we will select this status on the list as default   
        **/
        public refresh(status: ap.models.projects.NoteProjectStatus): angular.IPromise<ap.models.projects.NoteProjectStatus[]> {
            let deferred: ng.IDeferred<ap.models.projects.NoteProjectStatus[]> = this.$q.defer();
            let self = this;
            let statusListVm: NoteProjectStatusViewModel[];
            this._controllersManager.projectController.getNoteProjectStatusList(this.hasSubcontractorStatusOnly ? status : null, this.isForConfigModule).then((statusList: NoteProjectStatus[]) => {
                statusList = statusList.sort((a, b) => { return a.DisplayOrder - b.DisplayOrder; });
                deferred.resolve(statusList);
                // set the list to the item source
                if (statusList) {
                    statusListVm = this.createStatusListViewModel(statusList, status);
                }
                self.onLoadItems(statusListVm);
                if (status) {
                    self.selectEntity(status.Id);
                }
            }, (err) => {
                deferred.reject(err);
            });
            return deferred.promise;
        }

        /**
         * This method will do the filter the list on the sourceItems and return :
         * If the collection was not loaded, we call the refresh method and after that do the filter on the sourceItems and return the promise of list NoteProjectStatusViewModel
         * If the collection was loaded, we do the filter on the sourceItems and return the list of NoteProjectStatusViewModel
         * @param text: The given text to search
         **/
        public querySearch(text: string): angular.IPromise<NoteProjectStatuslistViewModel> {
            let deferred: ng.IDeferred<NoteProjectStatuslistViewModel> = this.$q.defer();

            if (this._isLoaded) {
                this._filteredItems = this.filterLocalData(text);

                if (this._filteredItems.length === 1 && text === (<NoteProjectStatusViewModel>this._filteredItems[0]).name) {
                    this.selectEntity((<NoteProjectStatusViewModel>this._filteredItems[0]).id);
                }

                deferred.resolve(this);
            }
            else {
                this.refresh(null).then((statusList: NoteProjectStatus[]) => {
                    let viewModels: NoteProjectStatusViewModel[] = [];
                    for (let i = 0; i < statusList.length; i++) {
                        let note = new NoteProjectStatusViewModel(this.utility);
                        note.init(statusList[i]);
                        viewModels.push(note);
                    }

                    this.sourceItems = viewModels;
                    this._filteredItems = this.filterLocalData(text);
                    deferred.resolve(this);
                }, (err) => {
                    deferred.reject(err);
                });
            }

            return deferred.promise;
        }

        /**
         * This method will do the filter the list on the sourceItems and return the list of NoteProjectStatusViewModel.
         * @param text: The given text to filter
       **/
        private filterLocalData(text: string): NoteProjectStatusViewModel[] {
            let result: NoteProjectStatusViewModel[] = [];
            angular.forEach(this.sourceItems, (itemVM: NoteProjectStatusViewModel, key) => {
                if (!text || itemVM.name.toLowerCase().indexOf(text.toLowerCase()) > -1) {
                    result.push(itemVM);
                }
            });
            return result;
        }

        /**
         * This method marks the given status as selected if it is present in the loaded list of statuses.
         * It is needed to select fake statuses (used by subcontractors), because these statuses may have empty ids.
         * @param status A view model of a status, which has to be selected
         */
        public selectStatus(selectedStatus: NoteProjectStatusViewModel) {
            if (selectedStatus && this.sourceItems) {
                if (this.sourceItems.indexOf(selectedStatus) !== -1) {
                    this._setSelectedViewModel(selectedStatus);
                }
            } else {
                this._setSelectedViewModel(null);
            }
        }

        /**
         * This method is overriden because fake statuses can have the same id. So, a custom verification for selection
         * of the same view model is needed.
         * @param statusVm A view model to mark as selected
         */
        protected _setSelectedViewModel(statusVm: NoteProjectStatusViewModel) {
            let selectedVm = <NoteProjectStatusViewModel>this._selectedViewModel;
            if (statusVm && selectedVm && statusVm.id === selectedVm.id && statusVm.isDone === selectedVm.isDone && statusVm.isBlocked === selectedVm.isBlocked) {
                return; // do nothing if the current selected item equals the new one
            }

            if (selectedVm) {
                selectedVm.isSelected = false;
            }
            this._selectedViewModel = statusVm;
            if (statusVm) {
                statusVm.isSelected = true;
            }

            this._listener.raise("selectedItemChanged", statusVm);
        }

        /**
        * Handler method called when a status is selected in the list
        */
        public onSelectedChanged(): void {
            if (this.selectedViewModel !== null && this.selectedViewModel !== undefined)
                this._lastSelectedStatus = this.selectedViewModel;
        }

        /**
          * This method will clear the search text when the selectedViewModel is undefined
        **/
        public validateStatus(param: string = null) {
            if (this.selectedViewModel === undefined
                || this.selectedViewModel === null) {

                if ((this._searchText && this._searchText !== null && this._searchText.length > 0)
                    || (param && param === "reset"))
                    this.selectedViewModel = this._lastSelectedStatus;

                if (this.selectedViewModel !== null)
                    this._searchText = (<NoteProjectStatusViewModel>this.selectedViewModel).name;
                else
                    this._searchText = undefined;
            }
        }

        /*
        * Dispose method
        */
        public dispose(): void {
            super.dispose();
            this._dragOptions.dispose();
        }

        /**
         * This method use for move up/down entity and change displayOrder
         * @param moveType for know what direction for move: up or down 
         * @param dragged moved entity
         */
        public statusMove(moveType: string, dragged: NoteProjectStatusViewModel) {
            let dropped = <NoteProjectStatusViewModel>super.getItemAtIndex(moveType === "moveup" ? dragged.index - 1 : dragged.index + 1);
            let dropEvent = new ap.component.dragAndDrop.DropEntityEvent(dragged, dropped);
            this.sourceItems.splice(dragged.index, 1);
            this.sourceItems.splice(dropped.index, 0, dragged);
            // update indexes after moving
            let minIndex = Math.min(dragged.index, dropped.index);
            let maxIndex = Math.max(dragged.index, dropped.index);
            if (maxIndex >= this.sourceItems.length)
                throw new Error("Element index is more than items length");
            for (let i = minIndex; i <= maxIndex; i++) {
                this.sourceItems[i].index = i;
            }
            ap.utility.updateSortingProperties(<NoteProjectStatusViewModel[]>this.sourceItems, minIndex);
            if (this.$utility.isIE())
                this.manageMoveItemsActions();
        }

        /**
        * Method used to update the visibility of move actions on every items of the list
        **/
        public manageMoveItemsActions() {
            for (let i = 0; i < this.sourceItems.length; i++) {
                let item = <NoteProjectStatusViewModel>this.sourceItems[i];
                if (item) {
                    item.moveUpAvailable = true;
                    item.moveDownAvailable = true;
                    if (i === 0) {
                        item.moveUpAvailable = false;
                    }
                    if (i === this.count - 1) {
                        item.moveDownAvailable = false;
                    }
                }
            }
        }

        constructor(private utility: ap.utility.UtilityHelper, private _controllersManager: ap.controllers.ControllersManager, private $q: angular.IQService,
            isReadOnly: boolean, meetingAccessRight: ap.models.accessRights.MeetingAccessRight, activeStatusOnly: boolean, private isForConfigModule: boolean = false) {
            super(utility, "NoteProjectStatus", "", "", "");
            this._listener.addEventsName(["cansavechanged", "itemchecked"]);

            this._meetingAccessRight = meetingAccessRight;
            this._isReadOnly = isReadOnly;
            this._activeStatusOnly = activeStatusOnly;
            this._filteredItems = [];

            this._dragOptions = new ap.component.dragAndDrop.DragOptions(this.utility, false);
            this.on("selectedItemChanged", () => {
                this._checkCanEditNoteStatus();
                this.onSelectedChanged();
            }, this);
        }

        private _meetingAccessRight: ap.models.accessRights.MeetingAccessRight;
        private _isReadOnly: boolean;
        private _canEditPointStatus: boolean;
        private _canSave: boolean = false;
        private _searchText: string;
        private _hasChanged: boolean = false;
        private _activeStatusOnly: boolean;
        private _lastSelectedStatus: IEntityViewModel = null;
        private _closingStatusId: string;
        private _filteredItems: IEntityViewModel[];
        private _hasBlockedAction: boolean = false;
        private _errorKeys: ErrorKeyViewModel[] = [];
        private _isImport: boolean = false;
        private _dragOptions: ap.component.dragAndDrop.DragOptions;
    }
}