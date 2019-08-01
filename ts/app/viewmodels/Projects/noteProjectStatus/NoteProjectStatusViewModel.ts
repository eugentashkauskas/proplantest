module ap.viewmodels.projects.noteProjectStatus {
    export class NoteProjectStatusViewModel extends ap.viewmodels.EntityViewModel implements ap.component.dragAndDrop.IDraggableEntityViewModel {

        /**
        * Indicated that if the statuts is active
        **/
        public get isActive(): boolean {
            return this._isActive;
        }

        public set isActive(value: boolean) {
            if (value !== this._isActive) {
                let oldValue = this._isActive;
                this._isActive = value;
                this._setIsBlockedAction();
                this.raisePropertyChanged("isActive", oldValue, this);
            }
        }

        /**
        * Indicated that if the stauts can only be used by meeting manager
        **/
        public get isOnlyUsedByMeetingManager(): boolean {
            return this._isOnlyUsedByMeetingManager;
        }

        public set isOnlyUsedByMeetingManager(value: boolean) {
            if (value !== this._isOnlyUsedByMeetingManager) {
                let oldValue = this._isOnlyUsedByMeetingManager;
                this._isOnlyUsedByMeetingManager = value;
                this.raisePropertyChanged("isOnlyUsedByMeetingManager", oldValue, this);
            }
        }

        /**
        * Indicated that if the statuts use by subcontractor TODO
        **/
        public get isTodo(): boolean {
            return this._isTodo;
        }

        public set isTodo(value: boolean) {
            if (value !== this._isTodo) {
                let oldValue = this._isTodo;
                this._isTodo = value;
                this.raisePropertyChanged("isOnlyUsedByMeetingManager", oldValue, this);
            }
        }

        /**
        * Indicated that if the statuts use by subcontractor DONE
        **/
        public get isDone(): boolean {
            return this._isDone;
        }

        public set isDone(value: boolean) {
            if (value !== this._isDone) {
                let oldValue = this._isDone;
                this._isDone = value;
                this.raisePropertyChanged("isDone", oldValue, this);
            }
        }

        /**
        * Indicated that if the stauts is Done action
        **/
        public get doneAction(): boolean {
            return this._doneAction;
        }

        public set doneAction(value: boolean) {
            if (value !== this._doneAction) {
                let oldValue = this._doneAction;
                this._doneAction = value;
                this.refreshActions();
                this.raisePropertyChanged("doneAction", oldValue, this);
            }
        }

        /**
        * Indicated that if the statuts use by subcontractor Blocked
        **/
        public get isBlocked(): boolean {
            return this._isBlocked;
        }

        public set isBlocked(value: boolean) {

            if (value !== this._isBlocked) {
                let oldValue = this._isBlocked;
                this._isBlocked = value;
                this._setIsBlockedAction();
                this.raisePropertyChanged("isBlocked", oldValue, this);
            }
        }

        /**
         * This method will set the correct value of isBlockedAction depending of the isActive and isblocked property 
         */
        private _setIsBlockedAction()  {
            this.isBlockedAction = this.isBlocked && this.isActive;
        }

        /**
        * Indicated that if the statuts use by subcontractor Blocked action
        **/
        public get isBlockedAction(): boolean {
            return this._isBlockedAction;
        }

        public set isBlockedAction(value: boolean) {
            if (value !== this._isBlockedAction) {
                let oldValue = this._isBlockedAction;
                this._isBlockedAction = value;
                this.refreshActions();
                this.raisePropertyChanged("isBlockedAction", oldValue, this);
            }
        }

        public get dragId() {
            return this._id;
        }

        public allowDrag(): boolean {
            return true;
        }

        public drop(dropTarget: ap.component.dragAndDrop.IDraggableEntityViewModel) {
            if (dropTarget) {
                let event = new ap.component.dragAndDrop.DropEntityEvent(this, dropTarget);
                this._listener.raise("statusdropped", event);
            }
            return false;
        }

        public get id(): string {
            return this._id;
        }

        public get name(): string {
            return this._name;
        }

        public set name(value: string) {
            if (value !== this._name) {
                let oldValue = this._name;
                this._name = value;
                this.raisePropertyChanged("name", oldValue, this);
            }
        }

        public get color(): string {
            return this._color;
        }

        public set color(value: string) {
            if (value !== this._color) {
                let oldValue = this._color;
                this._color = value;
                this.raisePropertyChanged("color", oldValue, this);
            }
        }


        public get subcontractorLabel(): string {
            return this._subcontractorLabel;
        }

        public set subcontractorLabel(value: string) {
            this._subcontractorLabel = value;
        }

        public get noteProjectStatus(): ap.models.projects.NoteProjectStatus {
            return <ap.models.projects.NoteProjectStatus>this._originalEntity;
        }

        public get displayOrder(): number {
            return this._displayOrder;
        }

        public set displayOrder(displayOrder: number) {
            if (displayOrder !== this._displayOrder) {
                let oldValue = this._displayOrder;
                this._displayOrder = displayOrder;
                this.raisePropertyChanged("displayOrder", oldValue, this);
            }
        }

        /**
        * Return true if item has general error, otherwise false
        **/
        public get hasGeneralError() {
            return this._hasGeneralError;
        }


        /**
        * Set this value to true if item has errors related to the conflicts with another item instances
        **/
        public set hasGeneralError(hasGeneralError: boolean) {
            this._hasGeneralError = hasGeneralError;
        }

        /**
        * Method use to know if the view model has changed
        **/
        public get hasChanged(): boolean {
            let color = this._color.indexOf("#") === 0 ? this._color.substring(1) : this._color;
            if (this._name !== this.noteProjectStatus.Name ||
                color !== this.noteProjectStatus.Color ||
                this.displayOrder !== this.noteProjectStatus.DisplayOrder ||
                this.noteProjectStatus.IsDisabled === this._isActive ||
                this.noteProjectStatus.IsOnlyUsedByMeetingManager !== this._isOnlyUsedByMeetingManager ||
                this.noteProjectStatus.IsTodo !== this._isTodo ||
                this.noteProjectStatus.IsDone !== this._isDone ||
                this.noteProjectStatus.DoneAction !== this._doneAction ||
                this.noteProjectStatus.IsBlocked !== this._isBlocked ||
                this.noteProjectStatus.IsBlockedAction !== this._isBlockedAction) {
                return true;
            }
            return this.computeHasChanged();
        }

        /*
        * Handle click on actions
        * @param actionName name of defined ation
        */
        public actionClick(actionName: string) {
            let action: ap.viewmodels.home.ActionViewModel;
            action = ap.viewmodels.home.ActionViewModel.getAction(this._actions, actionName);
            if (action && action.isEnabled) {
                switch (actionName) {
                    case "delete":
                        this._listener.raise("deleterowrequested", this);
                        break;
                    case "insert":
                        this._listener.raise("insertrowrequested", this);
                        break;
                    case "unactive":
                        this.isActive = false;
                        this.refreshActions();
                        break;
                    case "active":
                        this.isActive = true;
                        this.refreshActions();
                        break;
                }
            }
            if (!action)
                throw new Error("The action " + actionName + " is not available");
        }

        /**
        * Property to access the curent available actions
        **/
        public get actions(): ap.viewmodels.home.ActionViewModel[] {
            return this._actions;
        }

        /**
        * This to re-calculate actions 
        **/
        private refreshActions() {
            if (this._unActiveAction) this._unActiveAction.isEnabled = this.isActive === true;
            if (this._activeAction) this._activeAction.isEnabled = this.isActive === false;
            if (this._deleteAction) this._deleteAction.isEnabled = this.doneAction === false;
        }

        /**
        * Thie method to build available actions for one status
        **/
        private buildActions() {
            if (this.noteProjectStatus) {
                this._actions = [];
                if (this.noteProjectStatus.IsNew) {
                    this._deleteAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "delete",
                        this.$utility.rootUrl + "Images/html/icons/ic_delete_black_48px.svg", true, null, "Delete", true, false, new ap.misc.Shortcut("d", [ap.misc.SpecialKeys.ctrlKey]));
                    this._actions.push(this._deleteAction);
                } else {
                    this._unActiveAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "unactive",
                        null, false, null, "unactive", this.isActive === true, false, new ap.misc.Shortcut("d", [ap.misc.SpecialKeys.ctrlKey]));
                    this._actions.push(this._unActiveAction);

                    this._activeAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "active",
                        null, false, null, "active", this.isActive === false, false, new ap.misc.Shortcut("d", [ap.misc.SpecialKeys.ctrlKey]));
                    this._actions.push(this._activeAction);
                }

                let insertAction = new ap.viewmodels.home.ActionViewModel(this.$utility, this.$utility.EventTool, "insert",
                    this.$utility.rootUrl + "Images/html/icons/ic_add_black_48px.svg", true, null, "Add", true, false, new ap.misc.Shortcut("i", [ap.misc.SpecialKeys.ctrlKey]));
                this._actions.push(insertAction);
            }
        }

        /**
        * This method checks wethever a status hasa name and therefore is valid or not
        */
        public isValid(): boolean {
            if (StringHelper.isNullOrWhiteSpace(this._name) ||
                (this.doneAction && this.isOnlyUsedByMeetingManager) ||
                (this.isBlockedAction && this.isOnlyUsedByMeetingManager) ||
                this._hasGeneralError === true) {
                return false;
            }
            return super.isValid();
        }

        public updateViewModel(statusVm: noteProjectStatus.NoteProjectStatusViewModel) {
            this._name = statusVm.name;
            this._color = statusVm.color;
            this._isActive = statusVm._isActive;
            this._isOnlyUsedByMeetingManager = statusVm._isOnlyUsedByMeetingManager;
            this._isTodo = statusVm._isTodo;
            this._isDone = statusVm._isDone;
            this._doneAction = statusVm._doneAction;
            this._displayOrder = statusVm._displayOrder;
            this._isBlocked = statusVm._isBlocked;
            this._isBlockedAction = statusVm._isBlockedAction;
        }

        postChanges(): void {
            if (this.noteProjectStatus) {
                this.noteProjectStatus.Name = this._name;

                this.noteProjectStatus.Color = this._color.indexOf("#") === 0 ? this._color.substring(1) : this._color;
                this.noteProjectStatus.IsDisabled = this._isActive === false;
                this.noteProjectStatus.IsOnlyUsedByMeetingManager = this._isOnlyUsedByMeetingManager;
                this.noteProjectStatus.IsTodo = this._isTodo;
                this.noteProjectStatus.IsDone = this._isDone;
                this.noteProjectStatus.DoneAction = this._doneAction;
                this.noteProjectStatus.DisplayOrder = this._displayOrder;
                this.noteProjectStatus.IsBlocked = this._isBlocked;
                this.noteProjectStatus.IsBlockedAction = this._isBlockedAction;
            }
        }

        copySource(): void {
            super.copySource();

            if (this.noteProjectStatus) {
                this._name = this.noteProjectStatus.Name;
                this._color = this.noteProjectStatus.Color;
                this._isActive = !this.noteProjectStatus.IsDisabled;
                this._isOnlyUsedByMeetingManager = this.noteProjectStatus.IsOnlyUsedByMeetingManager;
                this._isTodo = this.noteProjectStatus.IsTodo;
                this._isDone = this.noteProjectStatus.IsDone;
                this._doneAction = this.noteProjectStatus.DoneAction;
                this._isBlocked = this.noteProjectStatus.IsBlocked;
                this._isBlockedAction = this.noteProjectStatus.IsBlockedAction;
                this._id = this.noteProjectStatus.Id;
                this._displayOrder = this.noteProjectStatus.DisplayOrder;
            } else {
                this._name = "";
                this._color = "FFA726"; // Orange
                this._isActive = false;
                this._isOnlyUsedByMeetingManager = false;
                this._isTodo = false;
                this._isDone = false;
                this._doneAction = false;
                this._isBlocked = false;
                this._isBlockedAction = false;
                this._id = "";
                this._displayOrder = 0;
            }
            this._isDisabled = !this._isActive;
            if (this._isDone) {
                this._subcontractorLabel = "Done";
            } else {
                if (this._isTodo) {
                    this._subcontractorLabel = "To Do";
                } else {
                    if (this._isBlocked) {
                        this._subcontractorLabel = "Blocked";
                    } else {
                        this._subcontractorLabel = "Invisible";
                    }
                }
            }

            this.buildActions();
        }

        /**
        * Return true if item can be moved up
        **/
        public get moveUpAvailable() {
            return this._moveUpAvailable;
        }

        /**
        * Set visibility of moveUp action
        **/
        public set moveUpAvailable(moveUpAvailable: boolean) {
            this._moveUpAvailable = moveUpAvailable;
        }

        /**
        * Return true if item can be moved down
        **/
        public get moveDownAvailable() {
            return this._moveDownAvailable;
        }

        /**
        * Set visibility of moveDown action
        **/
        public set moveDownAvailable(moveDownAvailable: boolean) {
            this._moveDownAvailable = moveDownAvailable;
        }

        constructor(utility: ap.utility.UtilityHelper, q?: angular.IQService, parentListVm?: BaseListEntityViewModel, itemParameters?: ItemConstructorParameter) {
            super(utility, parentListVm, itemParameters ? itemParameters.itemIndex : null);
            this._listener.addEventsName(["insertrowrequested", "deleterowrequested", "statusdropped"]);
        }


        private _moveUpAvailable: boolean = false;
        private _moveDownAvailable: boolean = false;
        private _name: string;
        private _color: string;
        private _isActive: boolean;
        private _isOnlyUsedByMeetingManager: boolean;
        private _isTodo: boolean;
        private _isDone: boolean;
        private _isBlocked: boolean;
        private _doneAction: boolean;
        private _isBlockedAction: boolean;
        private _id: string;
        private _subcontractorLabel: string;
        private _actions: ap.viewmodels.home.ActionViewModel[];
        private _deleteAction: ap.viewmodels.home.ActionViewModel;
        private _activeAction: ap.viewmodels.home.ActionViewModel;
        private _unActiveAction: ap.viewmodels.home.ActionViewModel;
        private _displayOrder: number;
        private _hasGeneralError: boolean = false;
    }
}